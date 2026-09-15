/* SmartFlow AI Frontend
   Connected to the Python/FastAPI backend.
*/

(() => {
  const API_BASE = "http://127.0.0.1:8000";

  const APPROACHES = ["N", "S", "E", "W"];

  const elR = document.getElementById("r");
  const elA = document.getElementById("a");
  const elG = document.getElementById("g");
  const phaseLabel = document.getElementById("phase-label");
  const approachLabel = document.getElementById("approach-label");
  const greenTimer = document.getElementById("green-timer");
  const timerSub = document.getElementById("timer-sub");
  const aiLog = document.getElementById("ai-log");
  const congPct = document.getElementById("cong-pct");
  const congBar = document.getElementById("cong-bar");
  const mQueue = document.getElementById("m-queue");
  const mWait = document.getElementById("m-wait");
  const mVcnt = document.getElementById("m-vcnt");
  const mGreen = document.getElementById("m-green");
  const laneGrid = document.getElementById("lane-grid");
  const incList = document.getElementById("inc-list");
  const incCount = document.getElementById("inc-count");
  const hsV = document.getElementById("hs-v");
  const hsD = document.getElementById("hs-d");
  const hsI = document.getElementById("hs-i");
  const toastWrap = document.getElementById("toast-wrap");

  let decisions = 0;
  let totalVehiclesSeen = 0;
  let incidentsHandled = 0;
  let countdownTimer = null;

  laneGrid.innerHTML = APPROACHES.map(d => `
    <div class="lane-col">
      <div class="lane-dir">${d}</div>
      <div class="lane-bar-wrap">
        <div class="lane-bar" id="b${d}1" style="height:10%;background:var(--green)"></div>
        <div class="lane-bar" id="b${d}2" style="height:10%;background:var(--green)"></div>
      </div>
      <div class="lane-count" id="lc${d}">—</div>
      <div class="lane-speed" id="ls${d}">— km/h</div>
    </div>
  `).join("");

  function fmt(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return Math.round(n).toString();
  }

  function setPhase(phase, approach, duration) {
    elR.className = "light";
    elA.className = "light";
    elG.className = "light";
    clearInterval(countdownTimer);

    if (phase === "GREEN") {
      elG.className = "light green-on";
      phaseLabel.textContent = "GREEN";
      phaseLabel.style.color = "var(--green)";
      greenTimer.style.display = "block";
      timerSub.style.display = "block";

      let remaining = duration;
      greenTimer.textContent = remaining;

      countdownTimer = setInterval(() => {
        remaining -= 1;
        greenTimer.textContent = Math.max(remaining, 0);
        if (remaining <= 0) clearInterval(countdownTimer);
      }, 1000);

    } else if (phase === "AMBER") {
      elA.className = "light amber-on";
      phaseLabel.textContent = "AMBER";
      phaseLabel.style.color = "var(--amber)";
      greenTimer.style.display = "none";
      timerSub.style.display = "none";

    } else {
      elR.className = "light red-on";
      phaseLabel.textContent = "RED";
      phaseLabel.style.color = "var(--red)";
      greenTimer.style.display = "none";
      timerSub.style.display = "none";
    }

    approachLabel.textContent = `Active approach: ${approach} corridor`;
  }

  function updateLanes(approaches) {
    let total = 0;
    let maxQueue = 0;

    for (const d of APPROACHES) {
      const a = approaches[d];
      if (!a) continue;

      total += a.vehicleCount;
      maxQueue = Math.max(maxQueue, a.vehicleCount);

      const p1 = Math.round((a.lane1 / 40) * 100);
      const p2 = Math.round((a.lane2 / 40) * 100);

      const col =
        a.occupancy > 0.75 ? "var(--red)" :
        a.occupancy > 0.50 ? "var(--amber)" :
        "var(--green)";

      const b1 = document.getElementById("b" + d + "1");
      const b2 = document.getElementById("b" + d + "2");

      if (b1) {
        b1.style.height = p1 + "%";
        b1.style.background = col;
      }

      if (b2) {
        b2.style.height = p2 + "%";
        b2.style.background = col;
      }

      const lc = document.getElementById("lc" + d);
      const ls = document.getElementById("ls" + d);

      if (lc) lc.textContent = a.vehicleCount;
      if (ls) ls.textContent = a.avgSpeedKmh + " km/h";
    }

    mQueue.textContent = maxQueue;
    mVcnt.textContent = total;
    mWait.textContent = Math.round(maxQueue * 1.8 + 5) + "s";

    totalVehiclesSeen += total;
    hsV.textContent = fmt(totalVehiclesSeen);
  }

  function updateDecision(decision, congestion) {
    decisions += 1;
    mGreen.textContent = decision.greenDuration + "s";

    congPct.textContent = congestion + "%";
    congBar.style.width = congestion + "%";
    congBar.style.background =
      congestion > 75 ? "var(--red)" :
      congestion > 45 ? "var(--amber)" :
      "var(--green)";

    aiLog.innerHTML = decision.reasoning.map((line, i) => {
      const last = i === decision.reasoning.length - 1;
      return `<div class="log-line${last ? " log-highlight" : ""}">${line}</div>`;
    }).join("");

    aiLog.scrollTop = aiLog.scrollHeight;
    hsD.textContent = fmt(decisions);

    setPhase("GREEN", decision.approach, decision.greenDuration);
  }

  function renderIncidents(active) {
    incCount.textContent = active.length;

    if (!active.length) {
      incList.innerHTML =
        '<div class="inc-empty">✅ No active incidents — all clear</div>';
      return;
    }

    const icons = {
      CRASH: "🚗💥",
      STALL: "🛑",
      DEBRIS: "⚠️",
      PEDESTRIAN_EMERGENCY: "🚶"
    };

    incList.innerHTML = active.map(inc => `
      <div class="inc-item sev-${inc.severity}">
        <div class="inc-icon">${icons[inc.type] || "⚠️"}</div>
        <div class="inc-body">
          <div class="inc-title">
            ${inc.type.replace(/_/g, " ")} · Approach ${inc.approach}
          </div>
          <div class="inc-meta">
            ${inc.intersectionId} · ${inc.detectedAt}
          </div>
          <div class="inc-units">
            Dispatching emergency response…
          </div>
          <span class="inc-sev-badge sb-${inc.severity}">
            ${inc.severity}
          </span>
        </div>
      </div>
    `).join("");
  }

  function toast(title, body, cls = "") {
    const el = document.createElement("div");
    el.className = `toast ${cls}`;
    el.innerHTML =
      `<div class="toast-title">${title}</div>` +
      `<div class="toast-body">${body}</div>`;

    toastWrap.appendChild(el);

    setTimeout(() => {
      el.style.opacity = "0";
    }, 4200);

    setTimeout(() => el.remove(), 4700);
  }

  async function fetchDashboard() {
    try {
      const response = await fetch(`${API_BASE}/api/dashboard`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      updateLanes(data.approaches);
      updateDecision(data.decision, data.congestion);
      renderIncidents(data.activeIncidents || []);

      if (data.incident) {
        incidentsHandled += 1;
        hsI.textContent = incidentsHandled;

        toast(
          "🚨 Incident Detected",
          `${data.incident.type.replace(/_/g, " ")} at ${data.incident.intersectionId} · Approach ${data.incident.approach}`,
          "t-red"
        );
      }
    } catch (error) {
      console.error("SmartFlow API error:", error);
      phaseLabel.textContent = "BACKEND OFFLINE";
      phaseLabel.style.color = "var(--red)";
      approachLabel.textContent =
        "Start the FastAPI server on port 8000";

      congPct.textContent = "—%";
    }
  }

  async function checkBackend() {
    try {
      const response = await fetch(`${API_BASE}/api/health`);
      if (!response.ok) throw new Error("Backend unavailable");
      await fetchDashboard();
    } catch (error) {
      phaseLabel.textContent = "BACKEND OFFLINE";
      phaseLabel.style.color = "var(--red)";
      approachLabel.textContent =
        "Run: python -m uvicorn main:app --reload";
    }
  }

  hsV.textContent = "0";
  hsD.textContent = "0";
  hsI.textContent = "0";

  checkBackend();
  setInterval(fetchDashboard, 2000);
})();
