import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const nativeRoot=path.resolve(here,'..');
const target=process.argv[2];

if(!['customer','technician'].includes(target)){
  throw new Error('Usage: node native/scripts/patch-ios.mjs customer|technician');
}

const appRoot=path.join(nativeRoot,target,'ios','App','App');
const delegatePath=path.join(appRoot,'AppDelegate.swift');
const plistPath=path.join(appRoot,'Info.plist');

let delegate=await readFile(delegatePath,'utf8');
if(!delegate.includes('capacitorDidRegisterForRemoteNotifications')){
  const marker='\n}';
  const pos=delegate.lastIndexOf(marker);
  if(pos<0)throw new Error('Could not find AppDelegate class closing brace');
  const methods=`

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }
`;
  delegate=delegate.slice(0,pos)+methods+delegate.slice(pos);
  await writeFile(delegatePath,delegate);
}

let plist=await readFile(plistPath,'utf8');
const entries=target==='customer'
  ? [
      ['NSCameraUsageDescription','iRepair uses the camera when you choose the device identification scanner.'],
      ['NSLocationWhenInUseUsageDescription','iRepair uses your location only when you choose location-based services such as Nearby repair alerts.']
    ]
  : [
      ['NSLocationWhenInUseUsageDescription','iRepair Technician uses your location for live repair journeys and technician-controlled nearby availability while the app is in use.']
    ];

for(const [key,value] of entries){
  if(plist.includes(`<key>${key}</key>`))continue;
  const insertion=`\t<key>${key}</key>\n\t<string>${value}</string>\n`;
  const pos=plist.lastIndexOf('</dict>');
  if(pos<0)throw new Error('Could not find Info.plist dictionary');
  plist=plist.slice(0,pos)+insertion+plist.slice(pos);
}
await writeFile(plistPath,plist);

console.log(`Patched ${target} iOS AppDelegate and permission descriptions`);
