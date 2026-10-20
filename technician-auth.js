/* iRepair technician sign-in — staging only; Supabase email OTP.
   API authorisation MUST be enforced independently on the server. */
(function(g){
  const url='https://psswyljihufyxiieqziu.supabase.co';
  // Supabase legacy anon key from existing public frontend, never a service-role key.
  const key=(g.IRepairAuthConfig&&g.IRepairAuthConfig.anonKey)||'';
  let client=null;
  function getClient(){
    if(client)return client;
    if(!g.supabase||!g.supabase.createClient||!key)throw Error('Supabase Auth not configured');
    client=g.supabase.createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    return client;
  }
  async function signIn(email){
    const address=String(email||'').trim();
    if(!/^\S+@\S+\.\S+$/.test(address))throw Error('Valid email required');
    const {error}=await getClient().auth.signInWithOtp({email:address,options:{shouldCreateUser:false}});
    if(error)throw error;
    return true;
  }
  async function verify(email,code){
    const {data,error}=await getClient().auth.verifyOtp({email:String(email||'').trim(),token:String(code||'').trim(),type:'email'});
    if(error)throw error;
    return data.session;
  }
  async function token(){const {data,error}=await getClient().auth.getSession();if(error)throw error;return data.session?.access_token||null}
  async function signOut(){const {error}=await getClient().auth.signOut();if(error)throw error}
  g.IRepairTechnicianAuth={signIn,verify,token,signOut};
})(window);
