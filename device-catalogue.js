/* Capability rules shared by customer selection and independent catalogue tests.
   Manufacturer facts and sold parts are separate. No global part/colour defaults. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./data/device-catalogue.json'));
  else root.IRepairDeviceRules = factory(root.IRepairDeviceCatalogueData);
})(globalThis, function (data) {
  'use strict';
  const models = new Map((data?.models || []).map(model => [model.id, model]));
  const find = id => models.get(id) || null;
  const confirmed = id => find(id)?.identityStatus === 'verified';
  const brandModels = manufacturer => [...models.values()].filter(model => model.manufacturer === manufacturer && confirmed(model.id));
  const faultLabel = (id, fault, fallback) => fault === 'rear' && find(id)?.rear.hasGlass !== true ? 'Rear / cosmetic damage' : fallback;
  const assessment = (id, label, note) => ({id, label, note, price: null, partType: null, technology: null, assessment: true});
  const finitePrice = value => Number.isFinite(value) && value >= 0 ? value : null;

  function screenOptions(id, prices = {}) {
    const model = find(id);
    if (!confirmed(id)) return [assessment('screen-assessment', 'Screen assessment', 'I’ll identify the exact model and confirm a suitable part and price.')];
    if (model.repairs.screen.applicable !== true) return [];
    const options = model.repairs.screen.soldOptions.filter(option => {
      const panel = model.originalDisplay.panels.find(panel => panel.id === option.panelId);
      if (!panel || !option.sourceIds?.length || option.partType === 'apple-original') return false;
      // An originally LCD panel never acquires an OLED option through pricing or a generic family rule.
      if (panel.technology === 'LCD' && option.technology !== 'LCD') return false;
      return ['LCD', 'OLED'].includes(option.technology);
    }).map(option => ({
      id: option.id, label: 'Screen replacement — ' + option.technology,
      technology: option.technology, partType: option.partType, panelId: option.panelId,
      price: finitePrice(prices.screen?.[option.priceKey]), assessment: false,
      note: model.originalDisplay.technology === 'LCD'
        ? 'Price and live stock will be confirmed for your exact model.'
        : option.technology === 'LCD'
          ? 'Lower-cost replacement; may use more battery than OLED. Refresh rate and features depend on the fitted part.'
          : 'Closer to the original display technology. Refresh rate, responsiveness and features depend on the fitted part.'
    }));
    return options.length ? options : [assessment('screen-assessment', 'Screen assessment', 'I’ll confirm the suitable replacement, price and live stock for this model.')];
  }

  function repairOptions(id, fault, prices = {}) {
    const model = find(id);
    if (!confirmed(id)) return [assessment(fault + '-assessment', 'Device assessment', 'I’ll verify the exact model before confirming a repair or ordering a part.')];
    if (fault === 'screen') return screenOptions(id, prices);
    if (fault === 'rear') {
      if (model.rear.hasGlass === false) return [assessment('housing-assessment', 'Rear housing assessment', 'I’ll assess the rear casing and confirm the repair at the Killay office.')];
      if (model.rear.hasGlass === true && model.rear.sold === true) return [{id: 'rear-glass', label: 'Rear glass replacement', price: finitePrice(prices.rear), note: 'Killay office. I’ll confirm the matching finish, repair method and live stock.', assessment: false, partType: 'rear-glass'}];
      return [assessment('rear-assessment', 'Rear panel assessment', 'I’ll check the rear panel and confirm the suitable repair at the Killay office.')];
    }
    if (fault === 'battery') {
      if (model.repairs.battery.applicable !== true) return [];
      if (model.repairs.battery.sold === true) return [{id: 'battery', label: 'Battery replacement', price: finitePrice(prices.battery), note: 'I’ll check the battery, exact part and live stock before your appointment.', assessment: false, partType: 'battery'}];
      return [assessment('battery-assessment', 'Battery assessment', 'I’ll test the battery and confirm the suitable repair and price.')];
    }
    if (fault === 'charging') {
      if (model.repairs.charging.applicable !== true) return [assessment('charging-assessment', 'Charging assessment', 'I’ll confirm the connector and cause of the charging problem.')];
      return [{id:'charging-clean', label:'Microscope cleaning', price:40, note:'£40, normally 30 minutes, if cleaning is appropriate. Includes a current-draw test.', assessment:true, partType:null}, assessment('charging-diagnosis','Charging-port diagnosis','A replacement is quoted after inspection. You pay for cleaning or replacement, never both.')];
    }
    if (fault === 'camera') return model.repairs.camera.applicable === true ? [assessment('camera-assessment', 'Camera diagnosis', 'I’ll check the camera, lens and focus before confirming the repair.')] : [];
    const labels = {power:'Power / no-power diagnosis', audio:'Audio diagnosis', liquid:'Liquid-damage assessment', other:'Device assessment'};
    return labels[fault] ? [assessment(fault + '-assessment', labels[fault], 'I’ll inspect the device and confirm the repair and price.')] : [];
  }

  function faultAllowed(id, fault) {
    if (!confirmed(id)) return fault === 'other';
    const model = find(id);
    if (fault === 'screen') return model.repairs.screen.applicable === true;
    if (fault === 'battery') return model.repairs.battery.applicable === true;
    if (fault === 'camera') return model.repairs.camera.applicable === true;
    // Rear-glass service is not shown for a verified metal/composite rear.
    // Cosmetic damage remains reportable through Other problem -> housing assessment.
    if (fault === 'rear') return model.rear.hasGlass !== false;
    return ['charging','power','audio','liquid','other'].includes(fault);
  }

  function validateRepair(device, repair, prices = {}) {
    if (!device || !repair || !faultAllowed(device.model, repair.fault)) return 'This repair needs an exact model check.';
    const expectedName=find(device.model)?.model||(device.custom||'').trim();
    if(repair.model&&repair.model!==expectedName) return 'The repair belongs to a different device model.';
    const options = repairOptions(device.model, repair.fault, prices);
    const selected = options.find(option => option.label === repair.option);
    if (!selected) return 'Please choose a current repair option for this model.';
    if (selected.price !== repair.price) return 'The repair price needs to be checked again.';
    if (repair.fault === 'rear') {
      const colour = repair.diagnostic?.colour;
      const model = find(device.model);
      if (!colour || (colour !== 'Not sure' && !model?.officialColours.includes(colour))) return 'Please choose a finish listed for this exact model.';
    }
    const panels = find(device.model)?.originalDisplay.panels || [];
    if (repair.fault === 'screen' && panels.length > 1 && !panels.some(panel => panel.id === repair.diagnostic?.panel)) return 'Please choose which screen needs attention.';
    return null;
  }

  function canCallOut(id, fault) {
    const model = find(id);
    if (!confirmed(id) || !['screen','battery'].includes(fault) || model.serviceRestrictions.includes('office-only')) return false;
    return repairOptions(id, fault).some(option => !option.assessment);
  }

  return Object.freeze({data, find, confirmed, brandModels, faultLabel, screenOptions, repairOptions, faultAllowed, validateRepair, canCallOut});
});
