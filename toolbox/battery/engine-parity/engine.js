(function () {
  "use strict";

  const $ = id => document.getElementById(id);
  const TEST_STEPS = 4;
  const choices = {
    charging: "UNABLE TO TEST",
    stability: "UNABLE TO TEST",
    shutdown: "UNKNOWN",
    safety: "UNKNOWN"
  };
  let step = 1;
  let clipboardReport = "";
  let logData = { cycle: null, capacity: null, cycleKey: "", capacityKey: "", ambiguous: false, imported: false };
  let readingsFromLog = { cycle: false, capacity: false };
  let timerStart = null;
  let browserBattery = null;

  function clean(value) {
    return String(value).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
  }
  function showView(name) {
    document.querySelectorAll(".view").forEach(view => {
      view.classList.toggle("active", view.id === name);
    });
    if (typeof scrollTo === "function") scrollTo({ top: 0, behavior: "instant" });
  }
  function modelName(family) {
    if (family === "18") return "iPhone 18 Pro series";
    if (family === "Duo") return "iPhone Duo";
    if (family === "Air") return "iPhone Air";
    if (family === "SE") return "iPhone SE / earlier";
    if (!family || family === "unknown") return "Model not identified";
    return "iPhone " + family + " series";
  }
  function hasOlderBatteryPage(family) {
    return family === "SE" || (/^\d+$/.test(family) && Number(family) <= 14);
  }
  function stage(n) {
    if (n < 1 || n > TEST_STEPS) return;
    step = n;
    const names = [
      "Identify your iPhone.",
      "Review battery health.",
      "Observe charging behaviour.",
      "Analyse diagnostics."
    ];
    const subtitles = [
      "Select the device so the guidance matches its battery system.",
      "Record the figures Apple shows in Settings, not guesses.",
      "Check charging, stability and warning symptoms safely.",
      "Optionally import local analytics data, then review the report."
    ];
    $("stepLabel").textContent = "Step " + n + " of " + TEST_STEPS;
    $("stepTitle").textContent = names[n - 1];
    $("stepSubtitle").textContent = subtitles[n - 1];
    $("progressFill").style.width = (100 * n / TEST_STEPS) + "%";
    for (let i = 1; i <= TEST_STEPS; i++) {
      $("step" + i).classList.toggle("active", i === n);
    }
    $("back").textContent = n === 1 ? "← Home" : "← Back";
    $("next").textContent = n === TEST_STEPS ? "Review results →" : "Continue →";
    const family = $("generation").value;
    if (n === 2) {
      $("settingsGuide").innerHTML = "<b>Read battery information in Settings</b>Open <strong>Settings → Battery → " +
        (hasOlderBatteryPage(family) ? "Battery Health &amp; Charging" : "Battery Health") +
        "</strong>. Enter only values displayed by iOS." +
        (family === "Duo" ? " <strong>iPhone Duo has two battery entries:</strong> record both when available." : "");
      $("cycleGroup").hidden = hasOlderBatteryPage(family);
      $("dualBatteryFields").hidden = family !== "Duo";
    }
    if (n === 3) updateSafety();
    showView("wizard");
  }
  function numberOrNull(id, min, max) {
    const input = $(id);
    const raw = input.value.trim();
    if (!raw) { input.setCustomValidity(""); return null; }
    const n = Number(raw);
    if (!Number.isInteger(n) || n < min || n > max) {
      input.setCustomValidity("Enter a whole number between " + min + " and " + max);
      input.reportValidity();
      return false;
    }
    input.setCustomValidity("");
    return n;
  }
  function readValues() {
    const capacity = numberOrNull("capacity", 1, 100);
    const cycles = $("cycleGroup").hidden ? null : numberOrNull("cycleCount", 0, 50000);
    const currentLevel = numberOrNull("currentCharge", 0, 100);
    const startLevel = numberOrNull("startLevel", 0, 100);
    const endLevel = numberOrNull("endLevel", 0, 100);
    const minutes = numberOrNull("elapsedMinutes", 1, 1440);
    const duo = $("generation").value === "Duo";
    const secondCapacity = duo ? numberOrNull("secondCapacity", 1, 100) : null;
    const secondCycles = duo ? numberOrNull("secondCycleCount", 0, 50000) : null;
    if ([capacity, cycles, currentLevel, startLevel, endLevel, minutes, secondCapacity, secondCycles].some(v => v === false)) return null;
    return {
      family: $("generation").value,
      name: $("modelName").value.trim().slice(0, 60),
      capacity, cycles, secondCapacity, secondCycles, currentLevel,
      startLevel, endLevel, minutes,
      condition: $("condition").value,
      charging: choices.charging,
      stability: choices.stability,
      shutdown: choices.shutdown,
      safety: choices.safety,
      notes: $("notes").value.trim().slice(0, 500)
    };
  }
  function trend(v) {
    if (v.startLevel === null && v.endLevel === null && v.minutes === null) {
      return { complete: false, label: "Not observed", detail: "No charge trend entered." };
    }
    if (v.startLevel === null || v.endLevel === null || v.minutes === null) {
      return { complete: false, label: "Incomplete", detail: "Start, end and elapsed minutes are all needed." };
    }
    const change = v.endLevel - v.startLevel;
    const perHour = Math.round(change * 600 / v.minutes) / 10;
    return {
      complete: true,
      change,
      perHour,
      label: (change > 0 ? "+" : "") + change + " percentage points / " + v.minutes + " min",
      detail: (perHour > 0 ? "+" : "") + perHour.toFixed(1) +
        " percentage points per hour. Observed battery indicator change only; not charging current." +
        (v.minutes < 10 ? " Short observations are particularly unreliable." : "")
    };
  }
  function appleDesignReference(family) {
    if (!family || family === "unknown") return "Model unknown — no cycle benchmark assigned";
    return hasOlderBatteryPage(family) ?
      "iPhone 14 or earlier: Apple design reference 80% at 500 cycles under ideal conditions" :
      "iPhone 15 or later: Apple design reference 80% at 1,000 cycles under ideal conditions";
  }
  function assessment(v, tr) {
    if (v.safety === "YES") {
      return {
        title: "Stop and seek inspection.",
        detail: "Battery swelling, damage or unusually high heat was reported. Stop using or charging the device until professionally inspected.",
        className: "bad"
      };
    }
    if (v.condition === "SERVICE") {
      return {
        title: "Battery service indicated.",
        detail: "The customer reports that iOS recommends battery service. Arrange a qualified inspection and consider replacement.",
        className: "bad"
      };
    }
    if (v.charging === "FAIL" || v.stability === "FAIL" || v.shutdown === "YES") {
      return {
        title: "Further assessment advised.",
        detail: "Charging or shutdown symptoms were reported. A browser cannot distinguish battery faults from cables, ports, software or board-level problems.",
        className: "bad"
      };
    }
    if (v.capacity !== null && v.capacity <= 80 ||
        v.secondCapacity !== null && v.secondCapacity <= 80) {
      return {
        title: "Battery service worth reviewing.",
        detail: "A customer-entered maximum-capacity value is at or below 80%. Consider symptoms and Apple's service guidance; this is not independently measured.",
        className: "neutral"
      };
    }
    if (v.family === "Duo" && (v.capacity === null || v.secondCapacity === null)) {
      return {
        title: "Two-battery review incomplete.",
        detail: "iPhone Duo has two batteries. Record both batteries' maximum-capacity information before assessing the complete battery system.",
        className: "neutral"
      };
    }
    if (tr.complete && tr.change < 0 && v.charging === "PASS") {
      return {
        title: "Observed charging trend needs review.",
        detail: "The manually observed percentage decreased while charging was reportedly indicated. Verify use, time, cable, port and adapter before drawing conclusions.",
        className: "neutral"
      };
    }
    if (v.capacity !== null && v.capacity < 90) {
      return {
        title: "Monitor battery condition.",
        detail: "Some age-related wear is reported. Confirm runtime and performance rather than treating capacity alone as evidence of a fault.",
        className: "neutral"
      };
    }
    if (v.capacity !== null && v.condition === "NORMAL" && v.charging === "PASS" &&
        v.stability === "PASS" && v.shutdown === "NO" && v.safety === "NO") {
      return {
        title: "No immediate concern reported.",
        detail: "No major issue appears in the entered observations. This does not prove the battery or charging hardware is fault-free.",
        className: "good"
      };
    }
    return {
      title: "Battery review incomplete.",
      detail: "Some information was unavailable. Record available Settings readings, charging symptoms and optional analytics data before making a hardware judgement.",
      className: "neutral"
    };
  }
  function readLog(text) {
    const cycleRe = /["']?(last_value_CycleCount|BatteryCycleCount|battery_cycle_count|cycle_count|cycleCount|CycleCount)["']?\s*[:=]\s*["']?(\d{1,5})/gi;
    const capacityRe = /["']?(last_value_MaximumCapacityPercent|BatteryMaximumCapacityPercent|MaximumCapacityPercent|battery_maximum_capacity_percent|maximum_capacity_percent)["']?\s*[:=]\s*["']?(\d{1,3})/gi;
    function scan(regex, min, max) {
      const readings = [];
      let m;
      while ((m = regex.exec(text)) !== null) {
        const value = Number(m[2]);
        if (value >= min && value <= max) readings.push({ key: m[1], value });
        if (readings.length >= 100) break;
      }
      return readings;
    }
    const cycleReadings = scan(cycleRe, 0, 50000);
    const capacityReadings = scan(capacityRe, 1, 100);
    const uniqueCycle = new Set(cycleReadings.map(x => x.value));
    const uniqueCapacity = new Set(capacityReadings.map(x => x.value));
    const selectedCycle = cycleReadings.length ? cycleReadings[cycleReadings.length - 1] : null;
    const selectedCapacity = capacityReadings.length ? capacityReadings[capacityReadings.length - 1] : null;
    return {
      cycle: selectedCycle ? selectedCycle.value : null,
      cycleKey: selectedCycle ? selectedCycle.key : "",
      capacity: selectedCapacity ? selectedCapacity.value : null,
      capacityKey: selectedCapacity ? selectedCapacity.key : "",
      ambiguous: uniqueCycle.size > 1 || uniqueCapacity.size > 1,
      imported: true
    };
  }
  function updateLogSummary() {
    const sum = $("logSummary");
    if (!logData.imported) {
      sum.innerHTML = "<b>Analytics</b>No analytics file selected. You can continue without one.";
      $("useLogValues").hidden = true;
      return;
    }
    if (logData.cycle === null && logData.capacity === null) {
      sum.innerHTML = "<b>No recognised battery fields found</b>The file was read locally, but no supported cycle-count or maximum-capacity-percentage keys were found. That does not indicate an issue.";
      $("useLogValues").hidden = true;
      return;
    }
    const items = [];
    if (logData.cycle !== null) items.push("<strong>Cycle count:</strong> " + logData.cycle + " (field: " + clean(logData.cycleKey) + ")");
    if (logData.capacity !== null) items.push("<strong>Maximum capacity:</strong> " + logData.capacity + "% (field: " + clean(logData.capacityKey) + ")");
    sum.innerHTML = "<b>Recognised log fields — not verified</b>" + items.join("<br>") +
      (logData.ambiguous ?
        "<br><strong>Warning:</strong> Multiple different readings appeared. Do not auto-apply; check the source and Settings." :
        "<br>Use the button below only if these readings are relevant to the selected battery.");
    $("useLogValues").hidden = logData.ambiguous;
  }
  function row(label, value, type) {
    return '<div class="reportRow"><span>' + clean(label) + '</span><b class="' +
      (type || "neutral") + '">' + clean(value) + '</b></div>';
  }
  let cachedResult = null;
  function results() {
    const v = readValues();
    if (!v) return;
    const tr = trend(v);
    const a = assessment(v, tr);
    const device = v.name || modelName(v.family);
    const logCap = readingsFromLog.capacity ? " (unverified imported analytics field)" : " (user-entered iOS reading)";
    const logCyc = readingsFromLog.cycle ? " (unverified imported analytics field)" : " (user-entered iOS reading)";
    const capText = v.capacity === null ? "Not supplied" : v.capacity + "%" + logCap;
    const cycText = v.cycles === null ? "Not supplied" : v.cycles + logCyc;
    const health = v.condition === "SERVICE" ? "Service recommended" :
      v.condition === "NORMAL" ? "No service warning reported" : "Not supplied";
    $("resultTitle").textContent = a.title;
    $("resultLead").textContent = "Apple-reported values, manual observations and optional local analytics.";
    let html = row("Device", device);
    html += row("Maximum capacity", capText);
    html += row("Battery health message", health);
    html += row("Cycle count", cycText);
    if (v.family === "Duo") {
      html += row("Second battery capacity", v.secondCapacity === null ? "Not supplied" : v.secondCapacity + "% (entered)");
      html += row("Second battery cycles", v.secondCycles === null ? "Not supplied" : v.secondCycles + " (entered)");
    }
    html += row("Current charge level", v.currentLevel === null ? "Not supplied" : v.currentLevel + "% (manual)");
    html += row("Charging indication", v.charging, v.charging === "PASS" ? "good" : v.charging === "FAIL" ? "bad" : "neutral");
    html += row("Charging stability", v.stability, v.stability === "PASS" ? "good" : v.stability === "FAIL" ? "bad" : "neutral");
    html += row("Observed charging trend", tr.label);
    html += row("Unexpected shutdowns", v.shutdown === "YES" ? "Reported" : v.shutdown === "NO" ? "Not reported" : "Not sure", v.shutdown === "YES" ? "bad" : "neutral");
    html += row("Heat, swelling or damage", v.safety === "YES" ? "Reported" : v.safety === "NO" ? "Not reported" : "Not sure", v.safety === "YES" ? "bad" : "neutral");
    html += row("Analytics extraction", logData.imported ?
      (logData.capacity !== null || logData.cycle !== null ? "Recognised fields (unverified)" : "No recognised fields") :
      "Not imported");
    $("reportRows").innerHTML = html;
    $("resultNote").textContent = a.detail + (tr.complete ? " " + tr.detail : "");
    clipboardReport = [
      "iREPAIR TOOLBOX — BATTERY DIAGNOSTICS ENGINE REVIEW",
      "Date: " + new Date().toLocaleString("en-GB"),
      "Device: " + device,
      "Source: Apple Settings readings and customer/technician observations",
      "Maximum capacity: " + capText,
      "Battery condition: " + health,
      "Cycle count: " + cycText,
      ...(v.family === "Duo" ? [
        "Second battery maximum capacity: " + (v.secondCapacity === null ? "Not supplied" : v.secondCapacity + "% user-entered"),
        "Second battery cycle count: " + (v.secondCycles === null ? "Not supplied" : v.secondCycles + " user-entered")
      ] : []),
      "Current charge level: " + (v.currentLevel === null ? "Not supplied" : v.currentLevel + "% user-entered"),
      "Charging indicator: " + v.charging,
      "Charging stability: " + v.stability,
      "Observed charge trend: " + tr.label,
      "Observed trend interpretation: " + tr.detail,
      "Unexpected shutdowns: " + v.shutdown,
      "Heat / swelling / damage: " + v.safety,
      "Analytics fields: " + (!logData.imported ? "Not imported" :
        (logData.capacity !== null || logData.cycle !== null ?
          "Keys recognised, user must confirm against iOS Settings" : "None recognised")),
      "Apple design guidance: " + appleDesignReference(v.family),
      "Assessment: " + a.title,
      "Notes: " + (v.notes || "None"),
      "",
      "Interpretation: " + a.detail,
      "Limitations: Safari cannot read iPhone battery health, cycle count, charge level, charge state or temperature. Manual trend is percentage-indicator change, not current/voltage or an electrical measurement. Imported logs were parsed locally, and field names do not establish current accuracy. No hardware fault is definitively identified."
    ].join("\n");
    $("copyReport").textContent = "Copy diagnostic report";
    cachedResult = { v, tr, a };
    showView("results");
  }
  function updateSafety() {
    const warning = choices.safety === "YES";
    $("safetyNotice").hidden = !warning;
    $("observationStart").disabled = warning;
    if (warning) {
      $("observationStatus").textContent = "Safety concern recorded: do not carry out a charging observation. Stop using or charging the device and arrange inspection.";
      timerStart = null;
      $("observationStop").disabled = true;
    }
  }
  function elapsedObservation() {
    if (timerStart === null) return;
    const minutes = Math.max(1, Math.ceil((Date.now() - timerStart) / 60000));
    $("elapsedMinutes").value = Math.min(1440, minutes);
    timerStart = null;
    $("observationStart").disabled = choices.safety === "YES";
    $("observationStop").disabled = true;
    $("observationStatus").textContent =
      "Timed interval saved: " + minutes + " minute(s) from the browser clock. Enter starting and ending iOS percentages to calculate the observed trend.";
  }
  function reset() {
    ["generation","modelName","capacity","cycleCount","secondCapacity","secondCycleCount",
      "currentCharge","startLevel","endLevel","elapsedMinutes","notes"].forEach(id => { $(id).value = ""; $(id).setCustomValidity(""); });
    $("condition").value = "UNKNOWN";
    choices.charging = "UNABLE TO TEST"; choices.stability = "UNABLE TO TEST";
    choices.shutdown = "UNKNOWN"; choices.safety = "UNKNOWN";
    document.querySelectorAll("[data-choice]").forEach(group => {
      const selected = choices[group.dataset.choice];
      group.querySelectorAll("[data-value]").forEach(button => {
        button.setAttribute("aria-pressed", String(button.dataset.value === selected));
      });
    });
    $("analyticsFile").value = "";
    logData = { cycle: null, capacity: null, cycleKey: "", capacityKey: "", ambiguous: false, imported: false };
    readingsFromLog = { cycle: false, capacity: false };
    updateLogSummary();
    $("safetyNotice").hidden = true;
    $("cycleGroup").hidden = false;
    $("dualBatteryFields").hidden = true;
    $("observationStart").disabled = false;
    $("observationStop").disabled = true;
    $("observationStatus").textContent = "Optional: a timer can fill the elapsed duration. The start/end percentages are always entered manually on iPhone Safari.";
    timerStart = null;
    clipboardReport = "";
    cachedResult = null;
    showView("home");
  }
  $("begin").addEventListener("click", () => stage(1));
  $("next").addEventListener("click", () => {
    if ((step === 2 || step === 3 || step === TEST_STEPS) && !readValues()) return;
    if (step === TEST_STEPS) results(); else stage(step + 1);
  });
  $("back").addEventListener("click", () => {
    if (step === 1) showView("home"); else stage(step - 1);
  });
  $("generation").addEventListener("change", () => {
    const family = $("generation").value;
    $("cycleGroup").hidden = hasOlderBatteryPage(family);
    $("dualBatteryFields").hidden = family !== "Duo";
  });
  for (const group of document.querySelectorAll("[data-choice]")) {
    for (const button of group.querySelectorAll("[data-value]")) {
      button.addEventListener("click", () => {
        const field = group.dataset.choice;
        choices[field] = button.dataset.value;
        for (const other of group.querySelectorAll("[data-value]")) {
          other.setAttribute("aria-pressed", String(other === button));
        }
        if (field === "safety") updateSafety();
      });
    }
  }
  $("observationStart").addEventListener("click", () => {
    if (choices.safety === "YES") return;
    timerStart = Date.now();
    $("observationStart").disabled = true;
    $("observationStop").disabled = false;
    $("observationStatus").textContent =
      "Observation started. Read the iOS battery percentage now; after a safe interval, finish the timer and enter the ending percentage.";
  });
  $("observationStop").addEventListener("click", elapsedObservation);
  $("analyticsFile").addEventListener("change", async event => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      $("logSummary").innerHTML = "<b>File too large</b>Choose an analytics file smaller than 8 MB. Nothing was uploaded.";
      $("useLogValues").hidden = true;
      logData = { cycle: null, capacity: null, cycleKey: "", capacityKey: "", ambiguous: false, imported: false };
      return;
    }
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!["ips", "json", "log", "txt"].includes(ext)) {
      $("logSummary").innerHTML = "<b>Unsupported file type</b>Select an .ips, .json, .txt or .log file.";
      $("useLogValues").hidden = true;
      return;
    }
    $("logSummary").innerHTML = "<b>Reading analytics locally…</b>No data leaves your device.";
    try {
      const text = await file.text();
      logData = readLog(text);
      readingsFromLog = { cycle: false, capacity: false };
      updateLogSummary();
    } catch (_) {
      logData = { cycle: null, capacity: null, cycleKey: "", capacityKey: "", ambiguous: false, imported: false };
      $("logSummary").innerHTML = "<b>Unable to read file</b>Try another analytics export.";
      $("useLogValues").hidden = true;
    }
  });
  $("useLogValues").addEventListener("click", () => {
    if (logData.ambiguous) return;
    if (logData.capacity !== null) {
      $("capacity").value = String(logData.capacity);
      readingsFromLog.capacity = true;
    }
    if (logData.cycle !== null && !$("cycleGroup").hidden) {
      $("cycleCount").value = String(logData.cycle);
      readingsFromLog.cycle = true;
    }
    $("useLogValues").textContent = "Applied to health review ✓";
    $("useLogValues").disabled = true;
  });
  $("copyReport").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(clipboardReport);
      $("copyReport").textContent = "Report copied ✓";
    } catch (_) {
      const textarea = document.createElement("textarea");
      textarea.value = clipboardReport;
      textarea.style.cssText = "position:fixed;opacity:0;left:-5000px";
      document.body.append(textarea);textarea.select();
      let copied = false;
      try { copied = document.execCommand("copy"); } catch (_) {}
      textarea.remove();
      if (copied) $("copyReport").textContent = "Report copied ✓";
      else prompt("Copy the report below:", clipboardReport);
    }
  });
  $("again").addEventListener("click", reset);
  // Battery API is not exposed on iPhone Safari. Use only if the browser genuinely supports it.
  if (typeof navigator.getBattery !== "function") {
    $("liveStatus").innerHTML = "<b>Automatic battery readings unavailable</b>iPhone Safari does not expose battery percentage, charging state, cycle count or health to websites. Use the iOS Settings guide above.";
  } else {
    Promise.resolve().then(() => navigator.getBattery()).then(b => {
      browserBattery = b;
      function show() {
        const level = Number.isFinite(b.level) ? Math.round(b.level * 100) + "%" : "unknown";
        $("liveStatus").innerHTML = "<b>Browser-provided battery status (when supported)</b>Battery indicator: " + level +
          " · Charging: " + (b.charging ? "Yes" : "No") +
          "<br><small>Browser API data; not battery health, temperature, cycle count or electrical testing. May describe the computer running this page, not an iPhone.</small>";
      }
      show();
      b.addEventListener("levelchange", show);
      b.addEventListener("chargingchange", show);
    }).catch(() => {
      $("liveStatus").innerHTML = "<b>Automatic reading denied</b>This browser has not exposed live battery data. Guided checks remain available.";
    });
  }
})();
