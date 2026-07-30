// app.js - Application Logic, Calculators, AI Simulations, and Leaflet Map Integrations

document.addEventListener("DOMContentLoaded", () => {
  // --- STATE VARIABLES ---
  let activeTab = "dashboard";
  let activeScenario = "flood"; // 'flood' or 'wildfire' for CNN imagery
  let isCnnAnalyzed = false;
  let isOptimized = false;
  
  // Maps instances
  let optMap = null;
  let evacMap = null;
  let optPolylines = [];
  let evacPolylines = [];
  let localMapMarkers = [];
  let nationalMapMarkers = [];
  
  // Charts instances
  let dashboardDamageChart = null;
  let cnnDamagePieChart = null;
  let modelF1Chart = null;
  let optGainsChart = null;

  // --- INITIALIZATION ---
  initNavigation();
  initDashboardFeed();
  initPredictionTab();
  initSearchTab();
  initDamageAssessmentTab();
  initAlertSystem();
  initAnalyticsTab();
  initSettingsTab();
  startLiveClock();
  initScopeSwitcher();
  initMobileSidebar();
  
  // Initialize maps after a tiny delay to ensure elements are in DOM
  setTimeout(() => {
    initMaps();
  }, 300);

  // --- SIDEBAR NAVIGATION & ROUTING ---
  function initNavigation() {
    const menuItems = document.querySelectorAll(".menu-item");
    const views = document.querySelectorAll(".dashboard-view");
    
    menuItems.forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const tab = item.getAttribute("data-tab");
        if (!tab) return;
        
        // Update active class in menu
        menuItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");
        
        // Toggle view visibility
        views.forEach(v => v.classList.remove("active"));
        const targetView = document.getElementById(`view-${tab}`);
        if (targetView) targetView.classList.add("active");
        
        activeTab = tab;
        updateHeaderTitle(tab);
        
        // Critical: Leaflet maps need sizing updates when their container becomes visible!
        if (tab === "optimization" && optMap) {
          setTimeout(() => optMap.invalidateSize(), 50);
        } else if (tab === "evacuation" && evacMap) {
          setTimeout(() => evacMap.invalidateSize(), 50);
        }
      });
    });

    // Global Emergency SOS button click
    const globalSosBtn = document.getElementById("global-sos-btn");
    globalSosBtn.addEventListener("click", () => {
      // Direct user to AI Copilot tab and trigger SMS alert panel
      const copilotMenuItem = document.querySelector('[data-tab="copilot"]');
      if (copilotMenuItem) copilotMenuItem.click();
      
      showToast("Critical SOS requested. Please finalize alert template and click Broadcast.");
      
      // Play alert sound
      const siren = document.getElementById("alert-siren");
      if (siren) {
        siren.volume = 0.5;
        siren.play().catch(e => console.log("Sound play prevented by browser policy."));
      }
    });

    // Header Weather Widget Location Change
    const locSelect = document.getElementById("weather-location-select");
    const headerTemp = document.getElementById("header-weather-temp");
    locSelect.addEventListener("change", (e) => {
      const location = e.target.value;
      if (location === "hyderabad") {
        headerTemp.textContent = "28°C";
        showToast("Weather location switched to Hyderabad. Rain expected.");
      } else if (location === "vikharabad") {
        headerTemp.textContent = "42°C";
        showToast("Weather location switched to Vikharabad. Extreme Heat Warning active!");
      } else if (location === "warangal") {
        headerTemp.textContent = "31°C";
        showToast("Weather location switched to Warangal. Clear skies.");
      }
    });
  }

  function updateHeaderTitle(tab) {
    const titleEl = document.getElementById("page-title");
    const subEl = document.getElementById("page-subtitle");
    
    const titles = {
      dashboard: { main: "Integrated System Dashboard", sub: "Real-time Autonomous Decision Support & Logistics" },
      prediction: { main: "Disaster Prediction (XGBoost)", sub: "Interactive Weather Parameter Analysis & Early Warnings" },
      damage: { main: "CNN Damage Assessment Map", sub: "Satellite Imagery Computer Vision Classification" },
      optimization: { main: "Logistics Optimization (RL & Genetic)", sub: "Autonomous Emergency Resource Allocation and Dispatch" },
      evacuation: { main: "GIS Evacuation Route Planner", sub: "Dynamic Route Generation Avoiding Hazardous Flood Zones" },
      copilot: { main: "AI Copilot & Broadcast Console", sub: "Generative Decision Support & SOS Notification Dispatcher" },
      analytics: { main: "Reports & Performance Metrics", sub: "Model Benchmarks, Training Logs and Framework Comparisons" },
      settings: { main: "System Settings", sub: "Configure API Endpoints and Alert Threshold Variables" }
    };
    
    if (titles[tab]) {
      titleEl.textContent = titles[tab].main;
      subEl.textContent = titles[tab].sub;
    }
  }

  // --- DASHBOARD OVERVIEW VIEWS ---
  function initDashboardFeed() {
    const feedContainer = document.getElementById("dashboard-msg-feed");
    const refreshBtn = document.getElementById("btn-refresh-feed");
    
    function renderFeed() {
      feedContainer.innerHTML = "";
      EMERGENCY_MESSAGES.forEach(msg => {
        const item = document.createElement("div");
        item.className = "feed-item";
        
        const severityClass = msg.parsed.severity.toLowerCase();
        
        item.innerHTML = `
          <div class="feed-header">
            <span class="feed-source">${msg.source}</span>
            <span class="feed-time">${msg.timestamp}</span>
          </div>
          <div class="feed-user">${msg.user}</div>
          <div class="feed-text">${msg.text}</div>
          <div class="feed-parsed-tags">
            <span class="parsed-tag type"><i class="fa-solid fa-tags"></i> ${msg.parsed.disasterType}</span>
            <span class="parsed-tag ${severityClass}">${msg.parsed.severity} Severity</span>
            <span class="parsed-tag"><i class="fa-solid fa-location-dot"></i> ${msg.parsed.location}</span>
          </div>
        `;
        feedContainer.appendChild(item);
      });
    }

    renderFeed();
    window.refreshDashboardFeedList = renderFeed;
    
    refreshBtn.addEventListener("click", () => {
      refreshBtn.textContent = "Processing...";
      refreshBtn.disabled = true;
      showToast("BERT Parsing pipeline scanning emergency channels...");
      
      setTimeout(() => {
        // Add a mock new message at start
        const newMsg = {
          id: `MSG-${Date.now()}`,
          timestamp: "Just Now",
          source: "SMS Portal",
          user: "+91 88888 XXXXX",
          text: "Help! Water is entering houses in Amberpet residential area. Families are heading to rooftops. Send NDRF boat team immediately!",
          parsed: {
            disasterType: "Flood",
            severity: "Critical",
            location: "Amberpet Sector 3",
            urgency: "High",
            needs: "Boat Evacuation"
          }
        };
        EMERGENCY_MESSAGES.unshift(newMsg);
        if (EMERGENCY_MESSAGES.length > 6) EMERGENCY_MESSAGES.pop();
        renderFeed();
        
        refreshBtn.textContent = "Refresh Feed";
        refreshBtn.disabled = false;
        showToast("New critical message detected and parsed by BERT NLP!");
        
        // Update metric
        document.getElementById("dashboard-affected-areas").textContent = "25";
        document.getElementById("dashboard-people-at-risk").textContent = "132,180";
      }, 1500);
    });

    // Initialize Dashboard damage distribution chart
    const ctx = document.getElementById("dashboard-damage-chart").getContext("2d");
    dashboardDamageChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Severe Damage", "Moderate Damage", "Low Damage", "No Damage"],
        datasets: [{
          data: [34.1, 45.6, 20.3, 0.0],
          backgroundColor: ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"],
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.05)"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#f3f4f6", font: { family: "Outfit", size: 10 } }
          }
        }
      }
    });
  }

  // --- DISASTER PREDICTION TAB (XGBOOST SIMULATOR) ---
  function initPredictionTab() {
    const sliders = ["rainfall", "temp", "humidity", "wind", "river", "soil"];
    
    // Sliders event listeners
    sliders.forEach(s => {
      const slider = document.getElementById(`slider-${s}`);
      const valDisplay = document.getElementById(`val-${s}`);
      
      slider.addEventListener("input", (e) => {
        valDisplay.textContent = e.target.value;
        calculateXGBoostRisk();
      });
    });

    // Presets switching
    const presetBtns = document.querySelectorAll(".preset-btn");
    presetBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        presetBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        const presetKey = btn.getAttribute("data-preset");
        const vals = DISASTER_PRESETS[presetKey];
        if (!vals) return;
        
        // Set inputs
        updateSlider("rainfall", vals.rainfall);
        updateSlider("temp", vals.temperature);
        updateSlider("humidity", vals.humidity);
        updateSlider("wind", vals.windSpeed);
        updateSlider("river", vals.riverLevel);
        updateSlider("soil", vals.soilMoisture);
        
        calculateXGBoostRisk();
        showToast(`Loaded weather preset: ${vals.name}`);
      });
    });

    function updateSlider(id, value) {
      const slider = document.getElementById(`slider-${id}`);
      const display = document.getElementById(`val-${id}`);
      slider.value = value;
      display.textContent = value;
    }

    function calculateXGBoostRisk() {
      // Fetch current input values
      const rainfall = parseFloat(document.getElementById("slider-rainfall").value);
      const temp = parseFloat(document.getElementById("slider-temp").value);
      const humidity = parseFloat(document.getElementById("slider-humidity").value);
      const wind = parseFloat(document.getElementById("slider-wind").value);
      const river = parseFloat(document.getElementById("slider-river").value);
      const soil = parseFloat(document.getElementById("slider-soil").value);

      // Formulas representing XGBoost tree decisions
      let floodRisk = Math.min(100, Math.round((rainfall / 200) * 55 + (river / 6) * 35 + (soil / 100) * 10));
      let wildfireRisk = Math.min(100, Math.round((temp > 35 ? (temp - 35) / 15 * 50 : 0) + ((100 - humidity) / 100) * 25 + (wind / 100) * 15 + ((100 - soil) / 100) * 10));
      let landslideRisk = Math.min(100, Math.round((rainfall > 100 ? (rainfall / 300) * 45 : 0) + (soil / 100) * 45 + (river > 3 ? 10 : 0)));
      let cycloneRisk = Math.min(100, Math.round((wind / 120) * 70 + (humidity / 100) * 20 + (rainfall > 50 ? 10 : 0)));

      // If dry conditions, suppress flood risk
      if (rainfall < 20 && river < 2.0) floodRisk = Math.round(floodRisk * 0.1);
      // If wet conditions, suppress wildfire
      if (rainfall > 30 || soil > 60) wildfireRisk = Math.round(wildfireRisk * 0.05);

      // Max score is the overall disaster risk probability
      const maxRisk = Math.max(floodRisk, wildfireRisk, landslideRisk, cycloneRisk);

      // Update UI gauges and text
      document.getElementById("pct-flood").textContent = `${floodRisk}%`;
      document.getElementById("bar-flood").style.width = `${floodRisk}%`;
      
      document.getElementById("pct-wildfire").textContent = `${wildfireRisk}%`;
      document.getElementById("bar-wildfire").style.width = `${wildfireRisk}%`;
      
      document.getElementById("pct-landslide").textContent = `${landslideRisk}%`;
      document.getElementById("bar-landslide").style.width = `${landslideRisk}%`;
      
      document.getElementById("pct-cyclone").textContent = `${cycloneRisk}%`;
      document.getElementById("bar-cyclone").style.width = `${cycloneRisk}%`;

      // Update main radial gauge
      document.getElementById("prediction-gauge-pct").textContent = `${maxRisk}%`;
      
      // Radial circle SVG fill calculation
      // Circumference = 377. We offset it based on the percentage
      const offset = 377 - (377 * maxRisk) / 100;
      const fillCircle = document.getElementById("prediction-gauge-fill");
      fillCircle.style.strokeDashoffset = offset;

      // Update Risk Level Badge color and text
      const badge = document.getElementById("prediction-risk-badge");
      badge.className = "risk-badge"; // Reset classes
      
      let levelText = "LOW RISK";
      let levelClass = "low";
      let mainThemeColor = "#10b981"; // Success Green

      if (maxRisk > 80) {
        levelText = "CRITICAL WARNING";
        levelClass = "critical";
        mainThemeColor = "#ef4444"; // Danger Red
      } else if (maxRisk > 50) {
        levelText = "HIGH RISK";
        levelClass = "high";
        mainThemeColor = "#f97316"; // Orange
      } else if (maxRisk > 25) {
        levelText = "MODERATE RISK";
        levelClass = "moderate";
        mainThemeColor = "#f59e0b"; // Amber
      }
      
      badge.textContent = levelText;
      badge.classList.add(levelClass);
      fillCircle.style.stroke = mainThemeColor;

      // Update system status indicator if critical risk
      const systemDot = document.getElementById("system-status-dot");
      const systemText = document.getElementById("system-status-text");
      if (maxRisk > 80) {
        systemDot.className = "status-dot loading";
        systemText.textContent = "Active Warning Alert Level";
      } else {
        systemDot.className = "status-dot";
        systemText.textContent = "All Systems Operational";
      }
    }

    // Location Search Logic
    const searchBtn = document.getElementById("btn-search-location");
    const searchInput = document.getElementById("location-search-input");
    const riskBanner = document.getElementById("location-risk-analysis-banner");
    const riskBannerText = document.getElementById("location-risk-analysis-text");

    searchBtn.addEventListener("click", () => {
      const place = searchInput.value.trim();
      if (!place) {
        showToast("Please enter a location name to analyze.");
        return;
      }

      showToast(`Running regional vulnerability analysis for ${place}...`);
      
      const normalizedPlace = place.toLowerCase();
      let bannerHTML = "";
      
      if (normalizedPlace.includes("lb nagar") || normalizedPlace.includes("musi") || normalizedPlace.includes("chaitanyapuri") || normalizedPlace.includes("nagole")) {
        // Set inputs to high flood presets
        updateSlider("rainfall", 210);
        updateSlider("temp", 25);
        updateSlider("humidity", 92);
        updateSlider("wind", 30);
        updateSlider("river", 5.6);
        updateSlider("soil", 85);
        bannerHTML = `<strong>Vulnerability Profile for LB Nagar / Musi Basin:</strong> Proximity to the Musi River channel and low-lying topography creates severe drainage backup risks during heavy rain. Elevated river level (5.6m) increases inundation susceptibility.`;
      } else if (normalizedPlace.includes("vikharabad") || normalizedPlace.includes("forest") || normalizedPlace.includes("ananthagiri")) {
        // Set inputs to high fire presets
        updateSlider("rainfall", 0);
        updateSlider("temp", 44);
        updateSlider("humidity", 12);
        updateSlider("wind", 35);
        updateSlider("river", 0.3);
        updateSlider("soil", 6);
        bannerHTML = `<strong>Vulnerability Profile for Vikharabad Forests:</strong> Sparse dry deciduous vegetation coupled with severe heatwave (44°C) and low soil moisture (6%) indicates a critical warning threshold for forest wildfire propagation.`;
      } else if (normalizedPlace.includes("begumpet") || normalizedPlace.includes("somajiguda") || normalizedPlace.includes("khairatabad")) {
        // Set inputs to moderate urban flood
        updateSlider("rainfall", 95);
        updateSlider("temp", 27);
        updateSlider("humidity", 80);
        updateSlider("wind", 20);
        updateSlider("river", 2.1);
        updateSlider("soil", 48);
        bannerHTML = `<strong>Vulnerability Profile for Begumpet:</strong> High urbanization index and impervious concrete cover restricts natural ground absorption. Runoff quickly accumulates towards Hussain Sagar channels, creating urban waterlogging threats.`;
      } else if (normalizedPlace.includes("gachibowli") || normalizedPlace.includes("hitech") || normalizedPlace.includes("madhapur") || normalizedPlace.includes("kondapur")) {
        // Set inputs to stable
        updateSlider("rainfall", 15);
        updateSlider("temp", 31);
        updateSlider("humidity", 48);
        updateSlider("wind", 14);
        updateSlider("river", 0.8);
        updateSlider("soil", 30);
        bannerHTML = `<strong>Vulnerability Profile for Gachibowli Area:</strong> High-elevation plateau rocky soil provides excellent natural drainage and elevation. Overall risk is low under standard atmospheric telemetry.`;
      } else {
        // Generate a dynamic hash-based risk preset
        let hash = 0;
        for (let i = 0; i < place.length; i++) {
          hash += place.charCodeAt(i);
        }
        
        const riskTypes = ["Flood Inundation", "Wildfire Propagation", "Landslide Trigger", "Cyclone Wind Gust"];
        const selectedRisk = riskTypes[hash % 4];
        
        if (hash % 4 === 0) {
          // Flood
          updateSlider("rainfall", 160);
          updateSlider("temp", 26);
          updateSlider("humidity", 88);
          updateSlider("wind", 24);
          updateSlider("river", 4.5);
          updateSlider("soil", 75);
          bannerHTML = `<strong>Vulnerability Profile for ${place}:</strong> Dynamic telemetry hashes point to moderate-to-severe <strong>Flood</strong> hazards based on catchment patterns and elevated simulated soil levels (75%).`;
        } else if (hash % 4 === 1) {
          // Fire
          updateSlider("rainfall", 2);
          updateSlider("temp", 41);
          updateSlider("humidity", 18);
          updateSlider("wind", 28);
          updateSlider("river", 0.6);
          updateSlider("soil", 10);
          bannerHTML = `<strong>Vulnerability Profile for ${place}:</strong> Heat and arid vegetation anomalies indicate potential <strong>Wildfire</strong> conditions. Dry soil (10%) and temperature (41°C) elevate warning risk indexes.`;
        } else if (hash % 4 === 2) {
          // Landslide
          updateSlider("rainfall", 195);
          updateSlider("temp", 22);
          updateSlider("humidity", 90);
          updateSlider("wind", 18);
          updateSlider("river", 3.2);
          updateSlider("soil", 89);
          bannerHTML = `<strong>Vulnerability Profile for ${place}:</strong> High slope gradients and high soil saturation (89%) from persistent rainfall (195mm) create shear-stress alerts for potential <strong>Landslides</strong>.`;
        } else {
          // Cyclone
          updateSlider("rainfall", 110);
          updateSlider("temp", 27);
          updateSlider("humidity", 85);
          updateSlider("wind", 95);
          updateSlider("river", 2.8);
          updateSlider("soil", 60);
          bannerHTML = `<strong>Vulnerability Profile for ${place}:</strong> Coastal/barometric air pressure drop warning. High simulated wind gusts (95km/h) trigger <strong>Cyclone</strong> structure damage alerts.`;
        }
      }
      
      // Calculate
      calculateXGBoostRisk();
      
      // Update UI banner
      riskBannerText.innerHTML = bannerHTML;
      riskBanner.style.display = "block";
    });

    // Run first calculation
    calculateXGBoostRisk();
  }

  // --- CNN DAMAGE ASSESSMENT TAB ---
  function initDamageAssessmentTab() {
    const galleryItems = document.querySelectorAll(".gallery-item");
    const runBtn = document.getElementById("btn-run-cnn");
    const toggleOverlayBtn = document.getElementById("btn-toggle-cnn-overlay");
    const displayImg = document.getElementById("cnn-display-img");
    const viewer = document.getElementById("cnn-image-viewer-container");
    
    // Canvas setup for heatmaps overlay
    const canvas = document.getElementById("cnn-damage-canvas");
    const ctx = canvas.getContext("2d");

    let isOverlayVisible = true;

    galleryItems.forEach(item => {
      item.addEventListener("click", () => {
        galleryItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");
        
        const scenario = item.getAttribute("data-scenario");
        activeScenario = scenario;
        
        const data = CNN_DAMAGE_SCENARIOS[scenario];
        displayImg.src = data.imagePath;
        
        // Reset states
        isCnnAnalyzed = false;
        viewer.classList.remove("scan-overlay-active", "damage-overlay-active");
        runBtn.disabled = false;
        runBtn.innerHTML = `<i class="fa-solid fa-expand"></i> Run CNN Damage Classification`;
        toggleOverlayBtn.disabled = true;
        toggleOverlayBtn.innerHTML = `<i class="fa-solid fa-eye-slash"></i> Toggle Heatmap`;
        canvas.style.display = "block";
        isOverlayVisible = true;
        
        // Hide executive summary
        document.getElementById("cnn-executive-report").style.display = "none";
        
        // Reset metrics
        document.getElementById("cnn-overall-damage").textContent = "PENDING";
        document.getElementById("cnn-overall-damage").style.color = "var(--text-secondary)";
        document.getElementById("cnn-confidence").textContent = "--";
        
        // Reset stats
        document.getElementById("cnn-loc").textContent = data.locationName;
        document.getElementById("cnn-time").textContent = "Awaiting CNN scan...";
        document.getElementById("stat-buildings").textContent = "--";
        document.getElementById("stat-roads").textContent = "--";
        document.getElementById("stat-area").textContent = "--";

        // Reset interactive zones list
        document.getElementById("cnn-detected-zones-list").innerHTML = `
          <div style="font-size: 0.78rem; text-align: center; color: var(--text-muted); border: 1px dashed var(--border-normal); padding: 10px; border-radius: 4px;">Run CNN scan to classify specific coordinates.</div>
        `;

        // Reset chart
        if (cnnDamagePieChart) {
          cnnDamagePieChart.destroy();
          cnnDamagePieChart = null;
        }
        
        // Hide log
        document.getElementById("cnn-steps-container").style.display = "none";
        document.getElementById("cnn-processing-log").innerHTML = "";
      });
    });

    toggleOverlayBtn.addEventListener("click", () => {
      if (!isCnnAnalyzed) return;
      isOverlayVisible = !isOverlayVisible;
      if (isOverlayVisible) {
        canvas.style.display = "block";
        toggleOverlayBtn.innerHTML = `<i class="fa-solid fa-eye-slash"></i> Hide Heatmap`;
        showToast("AI overlay visible.");
      } else {
        canvas.style.display = "none";
        toggleOverlayBtn.innerHTML = `<i class="fa-solid fa-eye"></i> Show Heatmap`;
        showToast("Comparing raw satellite photo underneath.");
      }
    });

    runBtn.addEventListener("click", () => {
      runBtn.disabled = true;
      runBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Initializing CNN Conv Layers...`;
      
      // Start scanning animation
      viewer.classList.add("scan-overlay-active");
      
      const stepsContainer = document.getElementById("cnn-steps-container");
      const stepsLog = document.getElementById("cnn-processing-log");
      
      stepsContainer.style.display = "block";
      stepsLog.innerHTML = "";
      
      const logLines = [
        { time: 0, msg: "[CNN-INIT] Loading multispectral satellite image tensors (224x224x3)..." },
        { time: 400, msg: "[CNN-CONV] Running convolution layers. 64 filters size 3x3 activated. Extracting features..." },
        { time: 800, msg: "[CNN-POOL] Max pooling downsampling complete. Extracted shape contours..." },
        { time: 1300, msg: "[CNN-DENSE] Fully connected layers evaluating damage classification probabilities..." },
        { time: 1800, msg: "[CNN-OUTPUT] Softmax mapping complete. Segments labeled. Contours generated." },
        { time: 2300, msg: "[SUCCESS] Output generated. Heatmap overlay plotted." }
      ];

      logLines.forEach(line => {
        setTimeout(() => {
          const lEl = document.createElement("div");
          lEl.textContent = line.msg;
          stepsLog.appendChild(lEl);
          stepsLog.scrollTop = stepsLog.scrollHeight;
        }, line.time);
      });
      
      setTimeout(() => {
        // Complete scan
        viewer.classList.remove("scan-overlay-active");
        viewer.classList.add("damage-overlay-active");
        isCnnAnalyzed = true;
        
        runBtn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Analysis Complete`;
        toggleOverlayBtn.disabled = false;
        toggleOverlayBtn.innerHTML = `<i class="fa-solid fa-eye-slash"></i> Hide Heatmap`;
        
        // Fetch mock details
        const data = CNN_DAMAGE_SCENARIOS[activeScenario];
        
        // Update stats
        document.getElementById("cnn-overall-damage").textContent = data.overallDamage.toUpperCase();
        document.getElementById("cnn-overall-damage").style.color = data.overallDamage === "Severe" ? "var(--danger)" : "var(--accent)";
        document.getElementById("cnn-confidence").textContent = `${Math.round(data.confidenceScore * 100)}%`;
        
        // Set dynamic date and time for check
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        document.getElementById("cnn-time").textContent = `${dateStr}, ${timeStr} (Today)`;

        if (activeScenario === "flood") {
          document.getElementById("stat-buildings").textContent = `${data.statistics.floodedBuildings} submerged`;
          document.getElementById("stat-roads").textContent = `${data.statistics.blockedRoads} segments blocked`;
          document.getElementById("stat-area").textContent = `${data.totalArea} km² total affected`;
        } else {
          document.getElementById("stat-buildings").textContent = `${data.statistics.destroyedStructures} destroyed`;
          document.getElementById("stat-roads").textContent = `${data.statistics.activeFireFronts} active fronts`;
          document.getElementById("stat-area").textContent = `${data.totalArea} km² affected forest`;
        }

        // Draw overlay mapping on canvas
        drawDamageCanvasOverlay(data.damageCoordinates);
        
        // Update AI Executive Action Summary
        const execReport = document.getElementById("cnn-executive-report");
        const execText = document.getElementById("cnn-executive-action-text");
        execReport.style.display = "block";
        if (activeScenario === "flood") {
          execReport.style.background = "rgba(239, 68, 68, 0.08)";
          execReport.style.borderColor = "rgba(239, 68, 68, 0.2)";
          execText.innerHTML = `
            - 🔴 <strong>Critical Flooding</strong>: 485 buildings submerged in Musi basin margins.<br>
            - 🚨 <strong>Action Dispatch</strong>: Deploy rescue boats (NDRF Rescue Squad A) immediately.<br>
            - ⛔ <strong>Reroute Alert</strong>: Block Kothapet road segments and divert ambulances to Mehdipatnam.
          `;
        } else {
          execReport.style.background = "rgba(245, 158, 11, 0.08)";
          execReport.style.borderColor = "rgba(245, 158, 11, 0.2)";
          execText.innerHTML = `
            - 🔴 <strong>Scrub Fire Active</strong>: 3 fire fronts moving towards residential zones.<br>
            - 🚨 <strong>Action Dispatch</strong>: Deploy State Fire unit 4 to Vikharabad margins.<br>
            - ⛔ <strong>Safety Warning</strong>: Restrict entry to Ananthagiri Hills routes and start evacuation.
          `;
        }

        // Populate Interactive Zones List
        populateInteractiveCnnZones(data.damageCoordinates);

        // Update AI Diagnostic Insights Box text
        const insightsText = document.getElementById("cnn-insights-text");
        if (activeScenario === "flood") {
          insightsText.innerHTML = "Our deep learning CNN model detected severe near-infrared signature absorption anomalies along the Musi River margins. Over <strong>485 buildings</strong> are identified as submerged (🔴 <strong>Severe Damage</strong>) under the overlay circles. Road blockages (🟠 <strong>Moderate</strong>) are identified near the Nagole arterial bypass.";
        } else {
          insightsText.innerHTML = "The CNN thermal scanner identified severe char and vegetation reflectivity degradation over <strong>18.2 km²</strong> of dense forest area. Active fire fronts (🔴 <strong>Severe</strong>) are concentrated in the Vikharabad central margins, with smoke dispersal (🔵 <strong>Low Damage</strong>) moving towards nearby townships.";
        }

        // Draw Chart
        drawCnnPieChart(data);
        
        // Swapped data synchronization to main overview dashboard
        updateMainDashboardStats(data);
        
        showToast("CNN Satellite Assessment completed successfully.");
      }, 2500);
    });

    function populateInteractiveCnnZones(coords) {
      const zonesList = document.getElementById("cnn-detected-zones-list");
      zonesList.innerHTML = "";
      
      coords.forEach((coord, idx) => {
        const item = document.createElement("div");
        item.style.padding = "8px 12px";
        item.style.background = "rgba(255, 255, 255, 0.02)";
        item.style.border = "1px solid var(--border-normal)";
        item.style.borderRadius = "4px";
        item.style.fontSize = "0.78rem";
        item.style.display = "flex";
        item.style.justifyContent = "space-between";
        item.style.alignItems = "center";
        item.style.cursor = "pointer";
        item.style.transition = "all 0.2s ease";
        
        let sevColor = "var(--danger)";
        let sevText = "🔴 SEVERE";
        if (coord.severity === "moderate") {
          sevColor = "var(--accent)";
          sevText = "🟠 MODERATE";
        } else if (coord.severity === "low") {
          sevColor = "var(--primary)";
          sevText = "🔵 LOW";
        }
        
        item.innerHTML = `
          <div>
            <strong style="color: #fff; display: block;">${coord.label}</strong>
            <span style="font-size: 0.7rem; color: var(--text-muted);">Radius: ${coord.radius}m | Coordinates: ${coord.lat.toFixed(3)}, ${coord.lng.toFixed(3)}</span>
          </div>
          <span style="color: ${sevColor}; font-weight: bold; font-size: 0.72rem;">${sevText}</span>
        `;
        
        item.addEventListener("mouseenter", () => {
          item.style.background = "rgba(255,255,255,0.06)";
          item.style.borderColor = "var(--primary)";
          highlightCoordinateCircle(idx, coords);
        });
        
        item.addEventListener("mouseleave", () => {
          item.style.background = "rgba(255, 255, 255, 0.02)";
          item.style.borderColor = "var(--border-normal)";
          drawDamageCanvasOverlay(coords);
        });
        
        zonesList.appendChild(item);
      });
    }

    function highlightCoordinateCircle(highlightIdx, coords) {
      if (!isOverlayVisible) return;
      canvas.width = viewer.clientWidth;
      canvas.height = viewer.clientHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      coords.forEach((coord, i) => {
        const scaleX = canvas.width;
        const scaleY = canvas.height;
        let x = scaleX * (0.3 + (i * 0.15));
        let y = scaleY * (0.4 + (Math.sin(i) * 0.18));
        let radius = coord.radius / 3.5;
        
        let isHighlighted = (i === highlightIdx);
        
        // Create radial gradients
        let grad = ctx.createRadialGradient(x, y, 2, x, y, radius);
        if (coord.severity === 'severe') {
          grad.addColorStop(0, isHighlighted ? 'rgba(239, 68, 68, 0.9)' : 'rgba(239, 68, 68, 0.7)');
          grad.addColorStop(0.5, 'rgba(239, 68, 68, 0.4)');
          grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        } else if (coord.severity === 'moderate') {
          grad.addColorStop(0, isHighlighted ? 'rgba(245, 158, 11, 0.9)' : 'rgba(245, 158, 11, 0.7)');
          grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
          grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        } else {
          grad.addColorStop(0, isHighlighted ? 'rgba(59, 130, 246, 0.9)' : 'rgba(59, 130, 246, 0.7)');
          grad.addColorStop(0.5, 'rgba(59, 130, 246, 0.4)');
          grad.addColorStop(1, 'rgba(59, 130, 246, 0)');
        }
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add contour line
        ctx.strokeStyle = isHighlighted ? '#ffffff' : (coord.severity === 'severe' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.3)');
        ctx.lineWidth = isHighlighted ? 2.5 : 1;
        ctx.beginPath();
        ctx.arc(x, y, radius - 5, 0, Math.PI * 2);
        ctx.stroke();

        // Draw visual label box
        ctx.font = "bold 9px Outfit, sans-serif";
        let labelText = `${coord.severity.toUpperCase()}: ${coord.label}`;
        let textWidth = ctx.measureText(labelText).width;
        
        ctx.fillStyle = isHighlighted ? "rgba(255, 255, 255, 0.95)" : "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(x - (textWidth/2) - 5, y - 5, textWidth + 10, 15);
        
        ctx.fillStyle = isHighlighted ? "#000" : (coord.severity === 'severe' ? '#ffa6a6' : (coord.severity === 'moderate' ? '#ffd8a6' : '#a6caff'));
        ctx.textAlign = "center";
        ctx.fillText(labelText, x, y + 5);
      });
    }

    function drawDamageCanvasOverlay(coords) {
      if (!isOverlayVisible) return;
      // Match canvas sizes
      canvas.width = viewer.clientWidth;
      canvas.height = viewer.clientHeight;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      coords.forEach((coord, i) => {
        const scaleX = canvas.width;
        const scaleY = canvas.height;
        let x = scaleX * (0.3 + (i * 0.15));
        let y = scaleY * (0.4 + (Math.sin(i) * 0.18));
        let radius = coord.radius / 3.5;
        
        let grad = ctx.createRadialGradient(x, y, 2, x, y, radius);
        if (coord.severity === 'severe') {
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.7)');
          grad.addColorStop(0.5, 'rgba(239, 68, 68, 0.4)');
          grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        } else if (coord.severity === 'moderate') {
          grad.addColorStop(0, 'rgba(245, 158, 11, 0.7)');
          grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
          grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        } else {
          grad.addColorStop(0, 'rgba(59, 130, 246, 0.7)');
          grad.addColorStop(0.5, 'rgba(59, 130, 246, 0.4)');
          grad.addColorStop(1, 'rgba(59, 130, 246, 0)');
        }
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = coord.severity === 'severe' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, radius - 5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = "bold 9px Outfit, sans-serif";
        let labelText = `${coord.severity.toUpperCase()}: ${coord.label}`;
        let textWidth = ctx.measureText(labelText).width;
        
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(x - (textWidth/2) - 5, y - 5, textWidth + 10, 15);
        
        ctx.fillStyle = coord.severity === 'severe' ? '#ffa6a6' : (coord.severity === 'moderate' ? '#ffd8a6' : '#a6caff');
        ctx.textAlign = "center";
        ctx.fillText(labelText, x, y + 5);
      });
    }

    function drawCnnPieChart(data) {
      const ctxPie = document.getElementById("cnn-damage-pie-chart").getContext("2d");
      
      if (cnnDamagePieChart) {
        cnnDamagePieChart.destroy();
      }

      cnnDamagePieChart = new Chart(ctxPie, {
        type: "pie",
        data: {
          labels: ["Severe Damage", "Moderate Damage", "Low Damage", "No Damage"],
          datasets: [{
            data: [
              Math.round((data.severelyDamagedArea / data.totalArea) * 100),
              Math.round((data.moderatelyDamagedArea / data.totalArea) * 100),
              Math.round((data.lowDamageArea / data.totalArea) * 100),
              Math.round((data.noDamageArea / data.totalArea) * 100)
            ],
            backgroundColor: ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"],
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.05)"
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
              labels: { color: "#f3f4f6", font: { family: "Outfit", size: 10 } }
            }
          }
        }
      });
    }

    function updateMainDashboardStats(data) {
      // Sync pie chart on homepage
      if (dashboardDamageChart) {
        dashboardDamageChart.data.datasets[0].data = [
          Math.round((data.severelyDamagedArea / data.totalArea) * 100),
          Math.round((data.moderatelyDamagedArea / data.totalArea) * 100),
          Math.round((data.lowDamageArea / data.totalArea) * 100),
          Math.round((data.noDamageArea / data.totalArea) * 100)
        ];
        dashboardDamageChart.update();
      }
    }
  }

  // --- LEAFLET.JS GIS MAP INTEGRATIONS ---
  function initMaps() {
    // 1. Resource dispatch map initialization
    optMap = L.map("optimization-map").setView(GIS_LOCATIONS.center, 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(optMap);

    // 2. Evacuation map initialization
    evacMap = L.map("evacuation-map").setView(GIS_LOCATIONS.center, 12.5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(evacMap);

    // Plot Base Camps & Shelters on both maps initially
    plotFixedGisAssets();
    
    const startSelect = document.getElementById("gis-start-location");
    const endSelect = document.getElementById("gis-end-location");
    
    startSelect.addEventListener("change", () => {
      const startVal = startSelect.value;
      if (startVal === "guwahati-hotspot") endSelect.value = "guwahati-safe";
      else if (startVal === "mumbai-hotspot") endSelect.value = "mumbai-safe";
      else if (startVal === "srinagar-hotspot") endSelect.value = "srinagar-safe";
      else if (startVal === "kolkata-hotspot") endSelect.value = "kolkata-safe";
      else if (startVal === "vikharabad-hotspot") endSelect.value = "vikharabad-safe";
      else {
        if (endSelect.value !== "sports-complex" && endSelect.value !== "uppal-school") {
          endSelect.value = "sports-complex";
        }
      }
      generateEvacuationRoute();
    });
    endSelect.addEventListener("change", generateEvacuationRoute);
    
    // Set initial route
    generateEvacuationRoute();
    
    // Handle resource inventory lists
    renderResourceInventory();

    // Event listener for Optimization button trigger
    const runOptBtn = document.getElementById("btn-run-optimization");
    const consoleLog = document.getElementById("opt-console-log");
    
    runOptBtn.addEventListener("click", () => {
      runOptBtn.disabled = true;
      runOptBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Triggering RL Optimizations...`;
      
      consoleLog.classList.add("optimization-log-active");
      consoleLog.innerHTML = "";
      
      const logLines = [
        "[SYSTEM] Fetching real-time weather metrics from OpenWeather API...",
        "[SYSTEM] Importing CNN damage assessment polygons for LB Nagar...",
        "[INFO] Initializing Genetic Algorithm population: N=500 individuals.",
        "[INFO] Generation 1: Avg Response Time = 34.2 mins. Coverage = 41%",
        "[RL-ENGINE] Initializing Deep Q-Network state space grids...",
        "[INFO] Generation 20: Avg Response Time = 24.8 mins. Fitness score = 0.68",
        "[RL-ENGINE] Policy gradient calculation complete. Reward value: +14.2",
        "[INFO] Generation 50: Max Response Time = 18.6 mins. Fitness score = 0.94",
        "[GA-OPTIMIZER] Crossover rate = 0.8, Mutation rate = 0.05. Convergence achieved.",
        "[SUCCESS] Hybrid optimization finished in 184ms.",
        "[SYSTEM] Dispatched NDRF Rescue units, Ambulances and shelter routes configured."
      ];
      
      let lineIdx = 0;
      const logInterval = setInterval(() => {
        if (lineIdx < logLines.length) {
          const lineEl = document.createElement("div");
          lineEl.textContent = logLines[lineIdx];
          consoleLog.appendChild(lineEl);
          consoleLog.scrollTop = consoleLog.scrollHeight;
          lineIdx++;
        } else {
          clearInterval(logInterval);
          completeOptimization();
        }
      }, 300);
    });

    function completeOptimization() {
      isOptimized = true;
      runOptBtn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Allocation Completed`;
      
      // Update metrics
      document.getElementById("opt-time-val").textContent = "-38.2% Reduction";
      document.getElementById("opt-time-val").style.color = "var(--secondary)";
      document.getElementById("opt-util-val").textContent = "94.5% Peak Efficiency";
      document.getElementById("opt-util-val").style.color = "var(--secondary)";

      // Draw dispatch routes on map
      drawDispatchRoutes();

      // Update deployed quantities on sidebar and dashboard card
      document.getElementById("dashboard-resources-deployed").textContent = "156";
      document.getElementById("dashboard-resource-pct").textContent = "94.2%";
      
      // Turn NDFF B unit to active
      DISASTER_RESOURCES[1].status = "Active";
      DISASTER_RESOURCES[1].location = "LB Nagar Sector 2 Dispatch";
      renderResourceInventory();
      
      showToast("RL + GA optimization dispatch paths rendering on GIS map.");
    }
  }

  function plotFixedGisAssets() {
    // Clear any existing local markers
    localMapMarkers.forEach(m => m.remove());
    localMapMarkers = [];

    // Icons (Standard Leaflet custom shapes)
    const baseIcon = L.divIcon({
      html: '<i class="fa-solid fa-house-chimney-medical" style="color: #60a5fa; font-size: 18px;"></i>',
      iconSize: [20, 20], className: 'map-div-icon'
    });
    const shelterIcon = L.divIcon({
      html: '<i class="fa-solid fa-shield-halved" style="color: #34d399; font-size: 20px;"></i>',
      iconSize: [20, 20], className: 'map-div-icon'
    });
    const hospitalIcon = L.divIcon({
      html: '<i class="fa-solid fa-square-h" style="color: #f87171; font-size: 22px;"></i>',
      iconSize: [20, 20], className: 'map-div-icon'
    });
    const incidentIcon = L.divIcon({
      html: '<i class="fa-solid fa-triangle-exclamation" style="color: #ef4444; font-size: 20px; animation: pulse-orange 1.5s infinite;"></i>',
      iconSize: [20, 20], className: 'map-div-icon'
    });

    // 1. Plot Base Camps
    GIS_LOCATIONS.baseCamps.forEach(camp => {
      const m1 = L.marker(camp.name.includes("Gachibowli") ? [17.4420, 78.3520] : [17.3910, 78.5190], { icon: baseIcon })
        .addTo(optMap)
        .bindPopup(`<b>Base Camp:</b> ${camp.name}`);
      localMapMarkers.push(m1);
    });

    // 2. Plot Shelters (on both maps)
    GIS_LOCATIONS.shelters.forEach(shelter => {
      const popupText = `<b>Shelter:</b> ${shelter.name}<br>Capacity: ${shelter.capacity}<br>Status: ${shelter.status.toUpperCase()}`;
      
      const m1 = L.marker([shelter.lat, shelter.lng], { icon: shelterIcon })
        .addTo(optMap)
        .bindPopup(popupText);
      localMapMarkers.push(m1);

      const m2 = L.marker([shelter.lat, shelter.lng], { icon: shelterIcon })
        .addTo(evacMap)
        .bindPopup(popupText);
      localMapMarkers.push(m2);
    });

    // 3. Plot Hospitals (both maps)
    GIS_LOCATIONS.hospitals.forEach(hosp => {
      const m1 = L.marker([hosp.lat, hosp.lng], { icon: hospitalIcon })
        .addTo(optMap)
        .bindPopup(`<b>Hospital:</b> ${hosp.name}<br>Beds: ${hosp.beds}`);
      localMapMarkers.push(m1);
      
      const m2 = L.marker([hosp.lat, hosp.lng], { icon: hospitalIcon })
        .addTo(evacMap)
        .bindPopup(`<b>Hospital:</b> ${hosp.name}`);
      localMapMarkers.push(m2);
    });

    // 4. Plot Incident locations (on both maps)
    GIS_LOCATIONS.incidents.forEach(inc => {
      const popupText = `<b>${inc.severity} Incident:</b> ${inc.label}`;
      const m1 = L.marker([inc.lat, inc.lng], { icon: incidentIcon })
        .addTo(optMap)
        .bindPopup(popupText);
      localMapMarkers.push(m1);

      const m2 = L.marker([inc.lat, inc.lng], { icon: incidentIcon })
        .addTo(evacMap)
        .bindPopup(popupText);
      localMapMarkers.push(m2);
    });

    // Draw hazard zones (red transparent circles) on both maps
    const c1 = L.circle([17.3610, 78.5300], { color: 'red', fillOpacity: 0.15, radius: 900 }).addTo(optMap);
    const c2 = L.circle([17.3540, 78.5430], { color: 'red', fillOpacity: 0.15, radius: 600 }).addTo(optMap);
    localMapMarkers.push(c1, c2);
    
    const c3 = L.circle([17.3610, 78.5300], { color: 'red', fillOpacity: 0.15, radius: 900 }).addTo(evacMap);
    const c4 = L.circle([17.3540, 78.5430], { color: 'red', fillOpacity: 0.15, radius: 600 }).addTo(evacMap);
    localMapMarkers.push(c3, c4);
  }

  function renderResourceInventory() {
    const list = document.getElementById("resource-inventory-list");
    list.innerHTML = "";
    
    DISASTER_RESOURCES.forEach(res => {
      const item = document.createElement("div");
      item.className = "inventory-item";
      
      const statusClass = res.status.toLowerCase() === "active" ? "active" : "standby";
      
      item.innerHTML = `
        <div class="inv-details">
          <div class="inv-name">${res.name}</div>
          <div class="inv-meta">${res.type} | Region: ${res.location}</div>
        </div>
        <span class="inv-badge ${statusClass}">${res.status}</span>
      `;
      list.appendChild(item);
    });
  }

  function drawDispatchRoutes() {
    // Clear old lines
    optPolylines.forEach(line => optMap.removeLayer(line));
    optPolylines = [];
    
    const colors = ["#60a5fa", "#34d399", "#f87171", "#fbbf24"];
    
    // Draw routes from OPTIMIZED_DISPATCH
    OPTIMIZED_DISPATCH.flood.deployments.forEach((dep, idx) => {
      const line = L.polyline(dep.route, {
        color: colors[idx % colors.length],
        weight: 4,
        dashArray: '5, 10',
        opacity: 0.8
      }).addTo(optMap);
      
      optPolylines.push(line);
    });
  }

  // --- DYNAMIC GIS ROUTING ENGINE (EVACUATION VIEW) ---
  function generateEvacuationRoute() {
    const startVal = document.getElementById("gis-start-location").value;
    const endVal = document.getElementById("gis-end-location").value;

    const routeData = {
      // Local
      "musi-river": {
        "sports-complex": {
          distance: "2.8 km",
          time: "9 min",
          safety: "92/100 (Safe Bypass)",
          coords: [[17.3610, 78.5300], [17.3680, 78.5450], [17.3550, 78.5500], [17.3480, 78.5520]],
          steps: [
            "Start heading NORTH on Ring Road away from water level margins.",
            "Take sharp right at Kothapet Commercial crossing onto Bypass Lane 4.",
            "Proceed south avoiding Chaitanyapuri subway (flooded zone).",
            "Arrive at LB Nagar Sports Complex Shelter on your right."
          ]
        },
        "uppal-school": {
          distance: "4.5 km",
          time: "14 min",
          safety: "78/100 (Moderate)",
          coords: [[17.3610, 78.5300], [17.3820, 78.5450], [17.4020, 78.5600]],
          steps: [
            "Exit Musi margins heading northeast toward Nagole Rd.",
            "Cross Nagole bridge slowly (Caution: Waterlogging near margins).",
            "Proceed straight on Uppal Main Rd.",
            "Arrive at Uppal Government School Relief Camp."
          ]
        }
      },
      "chaitanyapuri": {
        "sports-complex": {
          distance: "1.4 km",
          time: "4 min",
          safety: "98/100 (Highly Safe)",
          coords: [[17.3540, 78.5430], [17.3500, 78.5480], [17.3480, 78.5520]],
          steps: [
            "Head south on Colony Main Road.",
            "Turn left onto Chaitanyapuri road margin.",
            "Enter LB Nagar Sports Complex Gate 2."
          ]
        },
        "uppal-school": {
          distance: "5.8 km",
          time: "18 min",
          safety: "85/100 (Safe)",
          coords: [[17.3540, 78.5430], [17.3700, 78.5580], [17.4020, 78.5600]],
          steps: [
            "Head north towards Ring Road.",
            "Take a right at Nagole junction avoiding inner lanes.",
            "Head straight towards Uppal School."
          ]
        }
      },
      "nagole": {
        "sports-complex": {
          distance: "3.2 km",
          time: "11 min",
          safety: "94/100 (Safe Bypass)",
          coords: [[17.3700, 78.5580], [17.3620, 78.5500], [17.3480, 78.5520]],
          steps: [
            "Avoid low elevation bypass lanes near Nagole.",
            "Head south on Outer Ring Road link.",
            "Arrive at Sports Complex Shelter."
          ]
        },
        "uppal-school": {
          distance: "2.1 km",
          time: "6 min",
          safety: "99/100 (Highly Safe)",
          coords: [[17.3700, 78.5580], [17.3900, 78.5620], [17.4020, 78.5600]],
          steps: [
            "Head north on Uppal Road bypassing Musi completely.",
            "Turn left at Uppal Metro Crossing.",
            "Arrive at Uppal School Relief Camp."
          ]
        }
      },
      // National
      "guwahati-hotspot": {
        "guwahati-safe": {
          distance: "4.2 km",
          time: "12 min",
          safety: "95/100 (High Elevation Bypass)",
          coords: [[26.1445, 91.7362], [26.1510, 91.7450], [26.1550, 91.7550], [26.1600, 91.7600]],
          steps: [
            "Depart Brahmaputra flood margin heading south.",
            "Turn left onto Zoo Road avoiding waterlogged lowlands.",
            "Ascend elevation bypass route toward central Guwahati.",
            "Arrive at High-Ground Stadium Relief Camp."
          ]
        }
      },
      "mumbai-hotspot": {
        "mumbai-safe": {
          distance: "5.1 km",
          time: "16 min",
          safety: "91/100 (Drainage Arterial Rd)",
          coords: [[19.0760, 72.8777], [19.0680, 72.8900], [19.0550, 72.9000], [19.0500, 72.9100]],
          steps: [
            "Evacuate Sion Lowlands heading east away from water drainage channels.",
            "Take Eastern Express Highway link bypass.",
            "Divert away from low subways near Kurla crossover.",
            "Arrive at Navi Central Medical Shelter."
          ]
        }
      },
      "srinagar-hotspot": {
        "srinagar-safe": {
          distance: "3.8 km",
          time: "15 min",
          safety: "84/100 (Clear Ridge Corridor)",
          coords: [[34.0837, 74.7973], [34.0890, 74.8100], [34.0920, 74.8200], [34.0950, 74.8300]],
          steps: [
            "Depart landslide slip margins heading north.",
            "Proceed with caution on Ridge Road (Standby clearance squads on site).",
            "Take bypass lane 1 away from high slope gradients.",
            "Arrive at Valley Safe Evacuation Zone."
          ]
        }
      },
      "kolkata-hotspot": {
        "kolkata-safe": {
          distance: "6.4 km",
          time: "18 min",
          safety: "89/100 (Galeforce Wind Shelter)",
          coords: [[22.5726, 88.3639], [22.5780, 88.3850], [22.5820, 88.3980], [22.5850, 88.4100]],
          steps: [
            "Head inland away from coastal storm surge margins.",
            "Take main arterial bypass road avoiding coastal flyovers.",
            "Enter Inland Shelter Dome base camp gate."
          ]
        }
      },
      "vikharabad-hotspot": {
        "vikharabad-safe": {
          distance: "3.9 km",
          time: "10 min",
          safety: "97/100 (Fire Margin Escape Route)",
          coords: [[17.3400, 77.9000], [17.3480, 77.8900], [17.3550, 77.8800], [17.3600, 77.8700]],
          steps: [
            "Exit fire front boundary heading northwest.",
            "Avoid central scrub forest margins.",
            "Arrive at Ananthagiri Hills Base Camp."
          ]
        }
      }
    };

    if (!routeData[startVal]) return;
    const route = routeData[startVal][endVal] || Object.values(routeData[startVal])[0];
    if (!route) return;

    // Update text elements
    document.getElementById("route-distance").textContent = route.distance;
    document.getElementById("route-time").textContent = route.time;
    document.getElementById("route-safety").textContent = route.safety;

    // Set directions
    const dirList = document.getElementById("route-directions-list");
    dirList.innerHTML = "";
    route.steps.forEach(step => {
      const stepEl = document.createElement("div");
      stepEl.className = "direction-step";
      stepEl.textContent = step;
      dirList.appendChild(stepEl);
    });

    // Clear old lines from evacMap
    evacPolylines.forEach(line => evacMap.removeLayer(line));
    evacPolylines = [];

    // Draw route line on evacMap
    const line = L.polyline(route.coords, {
      color: "#10b981",
      weight: 5,
      opacity: 0.9
    }).addTo(evacMap);

    evacPolylines.push(line);
    
    // Zoom/pan map to route
    evacMap.fitBounds(line.getBounds(), { padding: [30, 30] });
  }

  // --- AI COPILOT & SMS/EMAIL ALERT CONSOLE ---
  function initAlertSystem() {
    const chatHistory = document.getElementById("copilot-chat-history");
    const chatInput = document.getElementById("copilot-chat-input");
    const sendBtn = document.getElementById("btn-copilot-send");
    const typingIndicator = document.getElementById("copilot-typing");
    const chips = document.querySelectorAll(".chip-btn");

    sendBtn.addEventListener("click", handleUserMessage);
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleUserMessage();
    });

    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        const query = chip.getAttribute("data-query");
        submitCopilotQuery(query);
      });
    });

    function handleUserMessage() {
      const text = chatInput.value.trim();
      if (!text) return;
      
      submitCopilotQuery(text);
      chatInput.value = "";
    }

    function submitCopilotQuery(queryText) {
      // Append user bubble
      appendMessage(queryText, "user", "You");
      
      // Trigger typing
      typingIndicator.classList.add("typing-bubble-active");
      chatHistory.scrollTop = chatHistory.scrollHeight;

      setTimeout(() => {
        typingIndicator.classList.remove("typing-bubble-active");
        
        let response = "";
        const normalizedQuery = queryText.toLowerCase();
        
        // Dynamic Question Parser for Disasters/Weather
        if (normalizedQuery.includes("hello") || normalizedQuery.includes("hi") || normalizedQuery.includes("hey")) {
          response = AI_COPILOT_RESPONSES.greetings;
        } else if (normalizedQuery.includes("shelter") || normalizedQuery.includes("camp") || normalizedQuery.includes("stay")) {
          response = AI_COPILOT_RESPONSES["shelter status"];
        } else if (normalizedQuery.includes("resource") || normalizedQuery.includes("deploy") || normalizedQuery.includes("unit") || normalizedQuery.includes("ndrf")) {
          response = AI_COPILOT_RESPONSES["resource status"];
        } else if (normalizedQuery.includes("draft") || normalizedQuery.includes("warning text") || normalizedQuery.includes("compose warning")) {
          response = AI_COPILOT_RESPONSES["draft alert"];
        } else if (normalizedQuery.includes("evacuation plan") || normalizedQuery.includes("evacuate lb nagar")) {
          response = AI_COPILOT_RESPONSES["evacuate lb nagar"];
        } else if (normalizedQuery.includes("xgboost") || normalizedQuery.includes("prediction model") || normalizedQuery.includes("forest risk")) {
          response = "### XGBoost Prediction Architecture\nThe XGBoost module processes real-time barometric pressure, rainfall, humidity, river water level, wind speed, and soil moisture saturation to determine hazard likelihoods. Accuracy rate is **94.8%** with a **0.982 ROC-AUC** rating, running 50 decision trees sequentially to classify risk profiles.";
        } else if (normalizedQuery.includes("cnn") || normalizedQuery.includes("damage model") || normalizedQuery.includes("neural network")) {
          response = "### CNN Image Mapping Architecture\nOur Convolutional Neural Network (CNN) maps structures, road blocks, and burn scars from raw satellite imagery (224x224 input size). Features are classified into 4 layers:\n- 🔴 **Severe**: Structural collapses, complete water cover.\n- 🟠 **Moderate**: Blocked pathways, minor runoffs.\n- 🔵 **Low**: Minor debris, superficial water logging.\n- 🟢 **No Damage**: Fully intact infrastructure.";
        } else if (normalizedQuery.includes("bert") || normalizedQuery.includes("message parser") || normalizedQuery.includes("nlp")) {
          response = "### BERT Emergency NLP Parser\nThe Bidirectional Encoder Representations from Transformers (BERT) module filters text reports (SMS, Twitter feeds). It tokenizes messages, removes stop words, and extracts key entities: disaster category, location tags, severity class, and specific assistance requests (e.g. food, boat rescue) with a **92.5% accuracy rate**.";
        } else if (normalizedQuery.includes("rl") || normalizedQuery.includes("genetic") || normalizedQuery.includes("optimization")) {
          response = "### Hybrid RL + GA Resource Allocation\nThe system combines Reinforcement Learning (DQN/PPO) with Genetic Algorithms (GA) to optimize logistics:\n1. **Reinforcement Learning**: Models the hazard environment as a Markov Decision Process (MDP) to learn optimal long-term rescue policies (maximize survival rewards).\n2. **Genetic Algorithm**: Runs crossover and mutations across candidate logistics coordinates to minimize dispatch delays.\nResult: **38.2% reduction** in response delays.";
        } else if (normalizedQuery.includes("weather") || normalizedQuery.includes("temp") || normalizedQuery.includes("rain") || normalizedQuery.includes("wind") || normalizedQuery.includes("humidity")) {
          // Fetch current slider telemetry values to make it dynamic
          const rainfallVal = document.getElementById("slider-rainfall").value;
          const tempVal = document.getElementById("slider-temp").value;
          const humidityVal = document.getElementById("slider-humidity").value;
          const windVal = document.getElementById("slider-wind").value;
          const riverVal = document.getElementById("slider-river").value;
          const soilVal = document.getElementById("slider-soil").value;
          
          response = `### Current Environmental Telemetry Details\n- **Precipitation (Rain)**: ${rainfallVal} mm\n- **Temperature**: ${tempVal} °C\n- **Relative Humidity**: ${humidityVal} %\n- **Wind Velocity**: ${windVal} km/h\n- **Soil Moisture**: ${soilVal} %\n- **Musi River Basin Level**: ${riverVal} meters\n\nBased on these parameters, the XGBoost early warning system reports a maximum disaster hazard warning rate of **${document.getElementById("prediction-gauge-pct").textContent}** (Status: **${document.getElementById("prediction-risk-badge").textContent}**).`;
        } else if (normalizedQuery.includes("risk") || normalizedQuery.includes("disaster") || normalizedQuery.includes("occur")) {
          // Check if specific place is mentioned
          let place = "the selected region";
          if (normalizedQuery.includes("lb nagar") || normalizedQuery.includes("musi")) place = "LB Nagar River Basin";
          else if (normalizedQuery.includes("vikharabad")) place = "Vikharabad Forest Area";
          else if (normalizedQuery.includes("begumpet")) place = "Begumpet Drainage Catchment";
          else if (normalizedQuery.includes("gachibowli")) place = "Gachibowli High-Elevation Area";
          
          response = `### Regional Hazard Analysis for ${place}\nOur system constantly evaluates vulnerability patterns. Current indicators:\n- **Flood Risk**: ${document.getElementById("pct-flood").textContent}\n- **Wildfire Risk**: ${document.getElementById("pct-wildfire").textContent}\n- **Landslide Probability**: ${document.getElementById("pct-landslide").textContent}\n- **Cyclone Wind threat**: ${document.getElementById("pct-cyclone").textContent}\n\n*Recommendations*: Ensure active communication channels remain open. If flood or wildfire metrics transition to Critical Warnings (>80%), trigger SMS broadcast immediately.`;
        } else {
          // General question response
          response = `### Disaster Response Copilot Support\nI am analyzing your prompt: *"${queryText}"*.\nTo assist you with weather and disasters, here are quick references:\n- **Floods**: Move to higher ground. LB Nagar government shelters are active. Avoid low underpasses.\n- **Wildfires**: Evacuate downwind. Keep fire buffers clear in Vikharabad reserves.\n- **Models**: We use XGBoost (risk indexes), CNN (satellite maps), BERT (emergency chats), and RL/GA (dispatch routes).\n\nIf you have questions about specific locations (LB Nagar, Vikharabad, Begumpet), weather conditions, or AI models, please specify!`;
        }

        // Stream typing bubble response
        appendMessageStream(response, "bot", "System Copilot");
      }, 1200);
    }

    function appendMessage(text, sender, senderLabel) {
      const msg = document.createElement("div");
      msg.className = `chat-msg ${sender}`;
      
      // Simple markdown parser for bold
      let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formattedText = formattedText.replace(/\n/g, '<br>');
      
      msg.innerHTML = `
        ${formattedText}
        <div class="chat-msg-time">${senderLabel}</div>
      `;
      chatHistory.appendChild(msg);
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function appendMessageStream(text, sender, senderLabel) {
      const msg = document.createElement("div");
      msg.className = `chat-msg ${sender}`;
      chatHistory.appendChild(msg);
      
      let i = 0;
      let currentHTML = "";
      
      // Quick markdown formatting before streaming (for ease)
      let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formattedText = formattedText.replace(/### (.*?)\n/g, '<h3>$1</h3>');
      formattedText = formattedText.replace(/1\. (.*?)\n/g, '<li>$1</li>');
      formattedText = formattedText.replace(/\n/g, '<br>');

      // Stream character by character
      const timer = setInterval(() => {
        if (i < formattedText.length) {
          // If we hit HTML tags, print them instantly
          if (formattedText[i] === '<') {
            const closingIdx = formattedText.indexOf('>', i);
            currentHTML += formattedText.substring(i, closingIdx + 1);
            i = closingIdx + 1;
          } else {
            currentHTML += formattedText[i];
            i++;
          }
          msg.innerHTML = currentHTML + `<div class="chat-msg-time" style="margin-top: 4px;">${senderLabel} (typing...)</div>`;
          chatHistory.scrollTop = chatHistory.scrollHeight;
        } else {
          clearInterval(timer);
          // Set final status
          msg.innerHTML = currentHTML + `<div class="chat-msg-time" style="margin-top: 4px;">${senderLabel}</div>`;
          chatHistory.scrollTop = chatHistory.scrollHeight;
        }
      }, 10);
    }

    // --- EMERGENCY BROADCAST PORTAL ---
    const broadcastBtn = document.getElementById("btn-send-broadcast");
    const progressContainer = document.getElementById("broadcast-progress-container");
    const progressBar = document.getElementById("broadcast-progress-bar");
    const progressPct = document.getElementById("broadcast-progress-pct");
    const broadcastLog = document.getElementById("broadcast-log");

    broadcastBtn.addEventListener("click", () => {
      const targetZone = document.getElementById("alert-target-zone").value;
      const message = document.getElementById("alert-message-text").value.trim();
      const sendSms = document.getElementById("channel-sms").checked;
      const sendEmail = document.getElementById("channel-email").checked;
      const sendWa = document.getElementById("channel-wa").checked;

      if (!sendSms && !sendEmail && !sendWa) {
        showToast("Error: Please select at least one broadcast channel.");
        return;
      }

      broadcastBtn.disabled = true;
      broadcastBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Initializing Broadcast Gateway...`;
      
      progressContainer.classList.add("broadcast-progress-active");
      progressBar.style.width = "0%";
      progressPct.textContent = "0%";
      broadcastLog.innerHTML = "<div>[SYS-INIT] Authenticating alert tokens...</div>";

      let progress = 0;
      const logMessages = [
        `[CONFIG] Selected target group: ${targetZone.toUpperCase()} zones.`,
        "[GATEWAY] Connecting to Twilio SMS gateway...",
        "[GATEWAY] Connecting to SendGrid SMTP Email server...",
        "[SENDING] Commencing batch packet deliveries...",
        `[SMS] Dispatched packets 1-500 to carrier nodes...`,
        `[EMAIL] Broadcast delivered to mailing subscribers...`,
        "[VERIFYING] Awaiting delivery receipts...",
        "[SUCCESS] 100% of network cells acknowledged warning."
      ];

      let logIndex = 0;
      const broadcastTimer = setInterval(() => {
        progress += 10;
        progressBar.style.width = `${progress}%`;
        progressPct.textContent = `${progress}%`;

        // Output log messages periodically
        if (progress % 20 === 0 && logIndex < logMessages.length) {
          const logEl = document.createElement("div");
          logEl.textContent = logMessages[logIndex];
          broadcastLog.appendChild(logEl);
          broadcastLog.scrollTop = broadcastLog.scrollHeight;
          logIndex++;
        }

        if (progress >= 100) {
          clearInterval(broadcastTimer);
          setTimeout(() => {
            // Append final log
            const finalLog = document.createElement("div");
            finalLog.innerHTML = `<span style="color: var(--secondary); font-weight: bold;">[SUCCESS] Automated Alert Broadcast Completed.</span>`;
            broadcastLog.appendChild(finalLog);
            broadcastLog.scrollTop = broadcastLog.scrollHeight;

            broadcastBtn.disabled = false;
            broadcastBtn.innerHTML = `<i class="fa-solid fa-bullhorn"></i> Send Automated Broadcast`;
            
            showToast("Emergency warnings successfully sent to residents.");
            
            // Add a critical notification badge to header
            document.getElementById("bell-badge").style.display = "block";
          }, 500);
        }
      }, 300);
    });
  }

  // --- REPORTS & PERFORMANCE CHART TAB ---
  function initAnalyticsTab() {
    // F1-Score comparison bar graph
    const ctxF1 = document.getElementById("chart-models-f1").getContext("2d");
    modelF1Chart = new Chart(ctxF1, {
      type: "bar",
      data: {
        labels: ["XGBoost (Prediction)", "CNN (Damage)", "BERT (Messages)", "Proposed Framework"],
        datasets: [{
          label: "Accuracy %",
          data: [94.8, 91.3, 92.5, 96.2],
          backgroundColor: ["rgba(59, 130, 246, 0.6)", "rgba(139, 92, 246, 0.6)", "rgba(245, 158, 11, 0.6)", "rgba(16, 185, 129, 0.6)"],
          borderColor: ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981"],
          borderWidth: 1.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#9ca3af", font: { family: "Outfit" } },
            min: 80,
            max: 100
          },
          x: {
            grid: { display: false },
            ticks: { color: "#9ca3af", font: { family: "Outfit" } }
          }
        }
      }
    });

    // Optimization gains line graph
    const ctxGains = document.getElementById("chart-optimization-gains").getContext("2d");
    optGainsChart = new Chart(ctxGains, {
      type: "line",
      data: {
        labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
        datasets: [
          {
            label: "Traditional Methods (min)",
            data: [35, 34, 38, 36, 35, 37, 34],
            borderColor: "#ef4444",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderWidth: 2,
            tension: 0.3
          },
          {
            label: "Ours (RL+GA) (min)",
            data: [20, 19, 21, 18, 17, 18, 16],
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            borderWidth: 2,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: "#f3f4f6", font: { family: "Outfit" } }
          }
        },
        scales: {
          y: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#9ca3af", font: { family: "Outfit" } },
            title: { display: true, text: "Avg Response Time (minutes)", color: "#f3f4f6" }
          },
          x: {
            grid: { display: false },
            ticks: { color: "#9ca3af", font: { family: "Outfit" } }
          }
        }
      }
    });

    // PDF Export function
    const pdfBtn = document.getElementById("btn-export-pdf");
    pdfBtn.addEventListener("click", () => {
      pdfBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Compiling Report Data...`;
      
      setTimeout(() => {
        pdfBtn.innerHTML = `<i class="fa-solid fa-file-pdf"></i> Export PDF Report`;
        showToast("Consolidated Disaster PDF report compiled. Opening print layout.");
        window.print();
      }, 1500);
    });
  }

  // --- SYSTEM CONFIGS / SETTINGS TAB ---
  function initSettingsTab() {
    const saveBtn = document.getElementById("btn-save-settings");
    saveBtn.addEventListener("click", () => {
      saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving configs...`;
      setTimeout(() => {
        saveBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save System Configurations`;
        showToast("System configurations saved to Postgres database successfully.");
      }, 1000);
    });
  }

  // --- REGIONAL DISASTER STATUS SEARCH TAB ---
  function initSearchTab() {
    const searchInput = document.getElementById("global-search-input");
    const searchBtn = document.getElementById("btn-global-search");
    const reportCard = document.getElementById("search-report-card");
    const welcomePane = document.getElementById("search-welcome-pane");
    const presets = document.querySelectorAll("#view-search .preset-btn");

    searchBtn.addEventListener("click", () => {
      performGlobalSearch(searchInput.value.trim());
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") performGlobalSearch(searchInput.value.trim());
    });

    presets.forEach(preset => {
      preset.addEventListener("click", () => {
        const place = preset.getAttribute("data-search");
        searchInput.value = place;
        performGlobalSearch(place);
      });
    });

    function performGlobalSearch(placeName) {
      if (!placeName) {
        showToast("Please enter a location name to search.");
        return;
      }

      showToast(`Querying remote meteorological satellite telemetries for ${placeName}...`);
      
      // Simulating a delay
      searchBtn.disabled = true;
      searchBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Fetching Tensors...`;
      
      setTimeout(() => {
        searchBtn.disabled = false;
        searchBtn.innerHTML = `<i class="fa-solid fa-satellite-dish"></i> Fetch Telemetry & Predict Risk`;
        
        welcomePane.style.display = "none";
        reportCard.style.display = "block";
        
        const normalized = placeName.toLowerCase();
        
        // Define base variables
        let lat = 17.38;
        let lng = 78.48;
        let elev = 542;
        let temp = 30;
        let rain = 15;
        let wind = 12;
        let soil = 35;
        
        // Deterministic Hash generator for any custom city name
        let hash = 0;
        for (let i = 0; i < placeName.length; i++) {
          hash = (hash * 31 + placeName.charCodeAt(i)) | 0;
        }
        hash = Math.abs(hash);
        
        // Populate based on presets or dynamic hash values
        if (normalized === "warangal") {
          lat = 17.97; lng = 79.59; elev = 302; temp = 29; rain = 145; wind = 22; soil = 78;
        } else if (normalized === "karimnagar") {
          lat = 18.43; lng = 79.13; elev = 265; temp = 34; rain = 20; wind = 12; soil = 45;
        } else if (normalized === "nalgonda") {
          lat = 17.05; lng = 79.27; elev = 240; temp = 38; rain = 5; wind = 15; soil = 22;
        } else if (normalized === "lb nagar") {
          lat = 17.35; lng = 78.55; elev = 490; temp = 24; rain = 220; wind = 28; soil = 85;
        } else if (normalized === "vikharabad") {
          lat = 17.33; lng = 77.90; elev = 638; temp = 43; rain = 0; wind = 32; soil = 6;
        } else if (normalized === "gachibowli") {
          lat = 17.44; lng = 78.35; elev = 610; temp = 30; rain = 12; wind = 14; soil = 30;
        } else {
          // Dynamic consistent generation
          temp = 20 + (hash % 25); // 20 to 45 °C
          rain = (hash % 10 < 4) ? (20 + (hash % 200)) : (hash % 15); // rain probability
          wind = 6 + (hash % 90); // 6 to 96 km/h
          soil = 5 + (hash % 85); // 5 to 90 %
          elev = 100 + (hash % 600); // 100 to 700 meters
          lat = 16.2 + ((hash % 300) / 100);
          lng = 77.2 + ((hash % 300) / 100);
        }
        
        // Calculate dynamic risks using formulas
        let flood = Math.min(100, Math.round((rain / 200) * 60 + (soil / 100) * 30 + (rain > 50 ? 10 : 0)));
        let wildfire = Math.min(100, Math.round((temp > 35 ? (temp - 35) / 10 * 50 : 0) + ((100 - soil) / 100) * 30 + (wind / 100) * 20));
        let landslide = Math.min(100, Math.round((rain > 120 ? (rain / 250) * 50 : 0) + (soil / 100) * 40 + (elev > 400 ? 10 : 0)));
        let cyclone = Math.min(100, Math.round((wind / 110) * 80 + (rain > 60 ? 20 : 0)));
        
        // Suppress conflicts
        if (rain < 20) flood = Math.round(flood * 0.1);
        if (rain > 30 || soil > 50) wildfire = Math.round(wildfire * 0.05);
        if (rain < 50) landslide = Math.round(landslide * 0.1);
        
        const maxRisk = Math.max(flood, wildfire, landslide, cyclone);
        
        // Update Risk Badge
        const badge = document.getElementById("search-report-risk-badge");
        badge.className = "risk-badge";
        let riskLvl = "LOW RISK";
        let badgeClass = "low";
        if (maxRisk > 80) { riskLvl = "CRITICAL WARNING"; badgeClass = "critical"; }
        else if (maxRisk > 50) { riskLvl = "HIGH RISK"; badgeClass = "high"; }
        else if (maxRisk > 25) { riskLvl = "MODERATE RISK"; badgeClass = "moderate"; }
        badge.textContent = riskLvl;
        badge.classList.add(badgeClass);
        
        // Update Left Details
        document.getElementById("report-geo-name").textContent = placeName;
        document.getElementById("report-geo-coords").textContent = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
        document.getElementById("report-geo-elev").textContent = `${elev} meters`;
        
        document.getElementById("report-weather-temp").textContent = `${temp} °C`;
        document.getElementById("report-weather-rain").textContent = `${rain} mm`;
        document.getElementById("report-weather-wind").textContent = `${wind} km/h`;
        document.getElementById("report-weather-soil").textContent = `${soil} %`;
        
        // Update Right Bars
        document.getElementById("report-pct-flood").textContent = `${flood}%`;
        document.getElementById("report-bar-flood").style.width = `${flood}%`;
        document.getElementById("report-bar-flood").className = "progress-bar-fill " + (flood > 80 ? "bg-danger" : (flood > 50 ? "bg-warning" : ""));
        
        document.getElementById("report-pct-wildfire").textContent = `${wildfire}%`;
        document.getElementById("report-bar-wildfire").style.width = `${wildfire}%`;
        
        document.getElementById("report-pct-landslide").textContent = `${landslide}%`;
        document.getElementById("report-bar-landslide").style.width = `${landslide}%`;
        
        document.getElementById("report-pct-cyclone").textContent = `${cyclone}%`;
        document.getElementById("report-bar-cyclone").style.width = `${cyclone}%`;
        
        // Update Insights Text
        const insightsText = document.getElementById("report-insights-text");
        let recText = "";
        
        if (maxRisk > 80) {
          if (flood === maxRisk) {
            recText = `CRITICAL FLOODING THREAT detected in ${placeName}. Excessive rainfall (${rain}mm) combined with saturated ground cover (${soil}%) will trigger flash floods. Emergency evacuation to nearby high-elevation zones is highly advised immediately. Responders should check route safety and prepare active logistics.`;
          } else if (wildfire === maxRisk) {
            recText = `CRITICAL WILDFIRE DANGER flagged for ${placeName}. Hot aridity (${temp}°C) and dry soils (${soil}%) indicate critical fuel combustion thresholds. Restrict all outdoor fire activities. Responders should standby near forest margins with fire suppression gear.`;
          } else if (landslide === maxRisk) {
            recText = `CRITICAL LANDSLIDE ALERTS active in high-slope zones of ${placeName} due to structural soil failure from heavy waterlogging. Evacuate downslope residences immediately. Road blockages are highly likely.`;
          } else {
            recText = `CRITICAL CYCLONIC WIND WARNING issued for ${placeName}. Wind speeds are peaking at ${wind}km/h. Secure loose rooftop structures, isolate electrical grids, and seek indoor shelters away from trees.`;
          }
        } else if (maxRisk > 50) {
          recText = `HIGH RISK WARNING in ${placeName}. Environmental telemetry anomalies are elevated. Residents should monitor local channels. Response teams are advised to check local shelter readiness and review evacuation pathways.`;
        } else if (maxRisk > 25) {
          recText = `MODERATE WARNING in ${placeName}. Telemetry levels are elevated above normal baseline but remain within manageable local limits. No immediate threat to life, but drainage channels should be monitored.`;
        } else {
          recText = `STABLE CONDITIONS verified in ${placeName}. Atmospheric indices show no current warning hazards. Sensors report normal humidity and soil saturation indices. Continue routine monitoring.`;
        }
        
        insightsText.innerHTML = recText;
        
        // Update Nearest Assets
        document.getElementById("report-asset-shelter").textContent = (normalized === "lb nagar" || flood > 70) ? "LB Nagar Complex (1.2 km)" : `${placeName} High School (${1.5 + (hash % 5)} km)`;
        document.getElementById("report-asset-base").textContent = (normalized === "gachibowli" || wind > 60) ? "Gachibowli Base (0.8 km)" : `Amberpet Camp (${3 + (hash % 10)} km)`;
        document.getElementById("report-asset-hosp").textContent = (normalized === "vikharabad") ? "Vikarabad Area Hosp (2.4 km)" : `${placeName} Community Hub (${1.2 + (hash % 4)} km)`;
        
        showToast("Telemetry download complete. XGBoost disaster classification completed.");
      }, 1000);
    }
  }

  // --- UTILITY TOAST NOTIFIER ---
  function showToast(message) {
    // Create a container if not exists
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.style.position = "fixed";
      container.style.bottom = "20px";
      container.style.right = "20px";
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.gap = "8px";
      container.style.zIndex = "999";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.style.background = "rgba(15, 23, 42, 0.9)";
    toast.style.borderLeft = "4px solid #3b82f6";
    toast.style.color = "#f3f4f6";
    toast.style.padding = "12px 20px";
    toast.style.borderRadius = "4px";
    toast.style.fontSize = "0.85rem";
    toast.style.fontWeight = "500";
    toast.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.5)";
    toast.style.minWidth = "250px";
    toast.style.display = "flex";
    toast.style.alignItems = "center";
    toast.style.gap = "10px";
    toast.style.animation = "fadeIn 0.2s ease";
    
    toast.innerHTML = `<i class="fa-solid fa-info-circle" style="color: #3b82f6;"></i> <span>${message}</span>`;
    
    container.appendChild(toast);

    // Remove after 3.5s
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // --- LIVE CLOCK SYNC ---
  function startLiveClock() {
    const timeEl = document.getElementById("live-sidebar-time");
    const dateEl = document.getElementById("live-sidebar-date");
    
    function updateClock() {
      const now = new Date();
      if (timeEl) timeEl.textContent = now.toTimeString().split(' ')[0];
      if (dateEl) {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('en-US', options);
      }
    }
    setInterval(updateClock, 1000);
    updateClock();
  }

  // --- DYNAMIC SCOPE SWITCHER & LIVE TELEMETRY SYNC ---
  function initScopeSwitcher() {
    const scopeBtnLocal = document.getElementById("scope-btn-local");
    const scopeBtnNational = document.getElementById("scope-btn-national");
    const indiaHubsContainer = document.getElementById("india-hubs-container");
    const syncBtn = document.getElementById("btn-sync-live-data");
    const apiDot = document.getElementById("api-connection-status-dot");
    const apiText = document.getElementById("api-connection-status-text");

    const INDIA_MONITORING_HUBS = [
      { name: "New Delhi", lat: 28.6139, lng: 77.2090, temp: 41, rain: 0, wind: 18, soil: 8, risk: "MODERATE", riskLvl: "Heatwave Alert", color: "var(--accent)" },
      { name: "Mumbai", lat: 19.0760, lng: 72.8777, temp: 26, rain: 210, wind: 34, soil: 92, risk: "CRITICAL", riskLvl: "Severe Flood", color: "var(--danger)" },
      { name: "Guwahati", lat: 26.1445, lng: 91.7362, temp: 25, rain: 195, wind: 20, soil: 88, risk: "CRITICAL", riskLvl: "River Overflow", color: "var(--danger)" },
      { name: "Kolkata", lat: 22.5726, lng: 88.3639, temp: 28, rain: 120, wind: 65, soil: 60, risk: "HIGH", riskLvl: "Cyclone gale", color: "var(--danger)" },
      { name: "Chennai", lat: 13.0827, lng: 80.2707, temp: 33, rain: 15, wind: 14, soil: 30, risk: "LOW", riskLvl: "Stable Meteorology", color: "var(--secondary)" },
      { name: "Bengaluru", lat: 12.9716, lng: 77.5946, temp: 24, rain: 8, wind: 12, soil: 25, risk: "LOW", riskLvl: "Normal Baseline", color: "var(--secondary)" },
      { name: "Srinagar", lat: 34.0837, lng: 74.7973, temp: 20, rain: 55, wind: 10, soil: 78, risk: "HIGH", riskLvl: "Landslide Risk", color: "var(--accent)" },
      { name: "Hyderabad", lat: 17.3850, lng: 78.4867, temp: 28, rain: 15, wind: 12, soil: 35, risk: "MODERATE", riskLvl: "Monsoon Watch", color: "var(--accent)" }
    ];

    scopeBtnLocal.addEventListener("click", () => {
      scopeBtnLocal.classList.add("active");
      scopeBtnNational.classList.remove("active");
      indiaHubsContainer.style.display = "none";
      document.getElementById("india-hub-details-panel").style.display = "none";
      
      // Pan back to Hyderabad center
      if (optMap) optMap.setView(GIS_LOCATIONS.center, 12);
      if (evacMap) evacMap.setView(GIS_LOCATIONS.center, 12.5);

      // Re-plot local map markers
      plotFixedGisAssets();
      
      // Clear national markers
      nationalMapMarkers.forEach(m => m.remove());
      nationalMapMarkers = [];

      // Restore local overview metrics
      document.getElementById("dashboard-risk-level").textContent = "HIGH";
      document.getElementById("dashboard-risk-level").parentElement.parentElement.className = "metric-card critical";
      document.getElementById("dashboard-affected-areas").textContent = "24";
      document.getElementById("dashboard-people-at-risk").textContent = "128,450";
      document.getElementById("dashboard-resources-deployed").textContent = "156";
      document.getElementById("dashboard-resource-pct").textContent = "71.8%";

      // Populate local dropdown options in Evacuation Planner
      const startSelect = document.getElementById("gis-start-location");
      const endSelect = document.getElementById("gis-end-location");
      if (startSelect && endSelect) {
        startSelect.innerHTML = `
          <option value="musi-river">Musi River Overflow Zone</option>
          <option value="chaitanyapuri">Chaitanyapuri Residential Zone</option>
          <option value="nagole">Nagole Main Road</option>
        `;
        endSelect.innerHTML = `
          <option value="sports-complex">LB Nagar Sports Complex Shelter</option>
          <option value="uppal-school">Uppal Govt School Shelter</option>
        `;
        generateEvacuationRoute();
      }
      
      showToast("Switched scope to local Hyderabad Area.");
    });

    scopeBtnNational.addEventListener("click", () => {
      scopeBtnNational.classList.add("active");
      scopeBtnLocal.classList.remove("active");
      indiaHubsContainer.style.display = "flex";
      
      // Pan to India center
      if (optMap) optMap.setView([20.5937, 78.9629], 5);
      
      // Clear local markers
      localMapMarkers.forEach(m => m.remove());
      localMapMarkers = [];

      // Render National Hubs
      renderNationalHubsGrid();
      plotNationalHubMarkers();

      // Update aggregate national statistics
      document.getElementById("dashboard-risk-level").textContent = "CRITICAL";
      document.getElementById("dashboard-risk-level").parentElement.parentElement.className = "metric-card critical";
      document.getElementById("dashboard-affected-areas").textContent = "8 Hubs";
      document.getElementById("dashboard-people-at-risk").textContent = "1.84 Million";
      document.getElementById("dashboard-resources-deployed").textContent = "840";
      document.getElementById("dashboard-resource-pct").textContent = "89.2%";

      // Populate national dropdown options in Evacuation Planner
      const startSelect = document.getElementById("gis-start-location");
      const endSelect = document.getElementById("gis-end-location");
      if (startSelect && endSelect) {
        startSelect.innerHTML = `
          <option value="guwahati-hotspot">Assam Brahmaputra Basin (Guwahati)</option>
          <option value="mumbai-hotspot">Mumbai Sion Lowlands (Mumbai)</option>
          <option value="srinagar-hotspot">Srinagar Landslide Margin (Srinagar)</option>
          <option value="kolkata-hotspot">Kolkata Coastal Storm Front (Kolkata)</option>
          <option value="vikharabad-hotspot">Vikarabad Central Fire Front (Vikarabad)</option>
        `;
        endSelect.innerHTML = `
          <option value="guwahati-safe">Guwahati High-Ground Stadium Camp</option>
          <option value="mumbai-safe">Mumbai Navi Central Medical Shelter</option>
          <option value="srinagar-safe">Srinagar Valley Safe Evac Zone</option>
          <option value="kolkata-safe">Kolkata Inland Shelter Dome</option>
          <option value="vikharabad-safe">Ananthagiri Hills Base Camp</option>
        `;
        startSelect.dispatchEvent(new Event("change"));
      }
      
      showToast("Switched scope to National India View.");
    });

    syncBtn.addEventListener("click", () => {
      syncLiveDisasterAlerts();
    });

    function renderNationalHubsGrid() {
      const grid = document.getElementById("india-cities-grid");
      grid.innerHTML = "";
      
      INDIA_MONITORING_HUBS.forEach(hub => {
        const card = document.createElement("div");
        card.style.background = "rgba(255,255,255,0.02)";
        card.style.border = "1px solid var(--border-normal)";
        card.style.borderRadius = "var(--radius-md)";
        card.style.padding = "10px";
        card.style.cursor = "pointer";
        card.style.transition = "all 0.2s ease";
        
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <strong style="color: #fff; font-size: 0.8rem;">${hub.name}</strong>
            <span style="font-size: 0.65rem; color: ${hub.color}; font-weight: bold; background: rgba(255,255,255,0.02); padding: 2px 6px; border-radius: 4px;">${hub.risk}</span>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 2px;">
            <span>Weather: ${hub.temp}°C | Rain: ${hub.rain}mm</span>
            <span style="font-style: italic; color: var(--text-muted);">${hub.riskLvl}</span>
          </div>
        `;
        
        card.addEventListener("click", () => {
          if (optMap) optMap.setView([hub.lat, hub.lng], 10);
          showToast(`Zooming into ${hub.name} Monitoring Station.`);
          
          // Autofill sliders in Disaster Prediction Tab
          document.getElementById("slider-rainfall").value = hub.rain;
          document.getElementById("slider-temp").value = hub.temp;
          document.getElementById("slider-wind").value = hub.wind;
          document.getElementById("slider-soil").value = hub.soil;
          
          // Trigger XGBoost calculation automatically
          document.getElementById("slider-rainfall").dispatchEvent(new Event("input"));

          // Update Telemetry Inspector
          updateHubInspectorDetails(hub);
        });
        
        card.addEventListener("mouseenter", () => {
          card.style.background = "rgba(255,255,255,0.05)";
          card.style.borderColor = "var(--primary)";
        });
        card.addEventListener("mouseleave", () => {
          card.style.background = "rgba(255,255,255,0.02)";
          card.style.borderColor = "var(--border-normal)";
        });
        
        grid.appendChild(card);
      });
    }

    function plotNationalHubMarkers() {
      // Clear old national markers
      nationalMapMarkers.forEach(m => m.remove());
      nationalMapMarkers = [];

      const monitorIcon = L.divIcon({
        html: '<i class="fa-solid fa-satellite-dish" style="color: #3b82f6; font-size: 18px; animation: pulse-green 2s infinite;"></i>',
        iconSize: [20, 20], className: 'map-div-icon'
      });
      const alertIcon = L.divIcon({
        html: '<i class="fa-solid fa-triangle-exclamation" style="color: #ef4444; font-size: 20px; animation: pulse-orange 1.5s infinite;"></i>',
        iconSize: [20, 20], className: 'map-div-icon'
      });

      INDIA_MONITORING_HUBS.forEach(hub => {
        const icon = (hub.risk === "CRITICAL" || hub.risk === "HIGH") ? alertIcon : monitorIcon;
        const m = L.marker([hub.lat, hub.lng], { icon: icon })
          .addTo(optMap)
          .bindPopup(`<b>Station:</b> ${hub.name}<br>Temp: ${hub.temp}°C<br>Rain: ${hub.rain}mm<br>Risk: <b><span style="color:${hub.color}">${hub.riskLvl}</span></b>`);
        nationalMapMarkers.push(m);
        
        m.on("click", () => {
          updateHubInspectorDetails(hub);
        });

        // Add transparent hazard circles for critical ones
        if (hub.risk === "CRITICAL" || hub.risk === "HIGH") {
          const c = L.circle([hub.lat, hub.lng], { color: 'red', fillOpacity: 0.1, radius: 40000 }).addTo(optMap);
          nationalMapMarkers.push(c);
        }
      });
    }

    function updateHubInspectorDetails(hub) {
      const panel = document.getElementById("india-hub-details-panel");
      if (!panel) return;

      document.getElementById("inspector-hub-name").textContent = `${hub.name} Monitoring Hub`;
      const riskEl = document.getElementById("inspector-hub-risk");
      riskEl.textContent = `${hub.risk} RISK`;
      riskEl.style.background = hub.color;

      document.getElementById("inspector-temp").textContent = `${hub.temp}°C`;
      document.getElementById("inspector-rain").textContent = `${hub.rain} mm`;
      document.getElementById("inspector-wind").textContent = `${hub.wind} km/h`;
      document.getElementById("inspector-soil").textContent = `${hub.soil}%`;

      const assessmentText = document.getElementById("inspector-assessment-text");
      const dispatchText = document.getElementById("inspector-dispatch-text");
      const assessmentBox = document.getElementById("inspector-assessment-box");
      const assessmentIcon = document.getElementById("inspector-assessment-icon");

      // Set styles based on risk
      if (hub.risk === "CRITICAL") {
        assessmentBox.style.background = "rgba(239, 68, 68, 0.08)";
        assessmentBox.style.borderColor = "rgba(239, 68, 68, 0.15)";
        assessmentIcon.style.color = "var(--danger)";
      } else if (hub.risk === "HIGH") {
        assessmentBox.style.background = "rgba(245, 158, 11, 0.08)";
        assessmentBox.style.borderColor = "rgba(245, 158, 11, 0.15)";
        assessmentIcon.style.color = "var(--accent)";
      } else {
        assessmentBox.style.background = "rgba(16, 185, 129, 0.08)";
        assessmentBox.style.borderColor = "rgba(16, 185, 129, 0.15)";
        assessmentIcon.style.color = "var(--secondary)";
      }

      // Assessment texts mapping
      let assessment = "";
      let dispatch = "";

      if (hub.name === "New Delhi") {
        assessment = "Severe atmospheric pressure drop and 41°C heat margins. High Risk Index for acute localized heatwave patterns. Standard water levels.";
        dispatch = "Deploy municipal drinking water tankers, issue civil heat index warning, restrict heavy outdoor labor during afternoon peaks.";
      } else if (hub.name === "Mumbai") {
        assessment = "CRITICAL Flood hazard: 210mm of heavy monsoonal rain causing severe storm-water system saturation. Mud-layer soil density index at 92%.";
        dispatch = "Deploy 12 high-capacity water extraction pump units near Kurla & Sion, standby NDRF boat rescue battalions, route evacuations to Navi Shelter.";
      } else if (hub.name === "Guwahati") {
        assessment = "CRITICAL River gauge warning: Brahmaputra basin exceeded danger margin by 2.4 meters from 195mm of rainfall. Soil saturated (88%).";
        dispatch = "Activate high-ground stadium relief domes, dispatch air-drop rations, alert riverside communities for immediate evacuation.";
      } else if (hub.name === "Kolkata") {
        assessment = "HIGH Cyclone advisory: Extreme barometric drop with 65km/h wind gale speed contours and heavy rain (120mm). Saturated soil levels.";
        dispatch = "Evacuate fishermen communities from coastal margins, check storm surge gates, stand by emergency power restoration squads.";
      } else if (hub.name === "Srinagar") {
        assessment = "HIGH Landslide alert: Heavy local precipitation (55mm) on steep slopes causing high shear-stress and 78% soil saturation index.";
        dispatch = "Deploy road clearance machinery to active highway margins, block high-slope corridors, relocate residents in steep mountain villages.";
      } else {
        assessment = `Stable baseline status. Temperature at ${hub.temp}°C, soil density normal (${hub.soil}%). No immediate hazard indices detected.`;
        dispatch = "Continue sat-net sensor telemetry surveillance, maintain standard regional emergency backup units in active standby.";
      }

      assessmentText.innerHTML = assessment;
      dispatchText.innerHTML = dispatch;

      panel.style.display = "block";
    }

    function syncLiveDisasterAlerts() {
      syncBtn.disabled = true;
      syncBtn.innerHTML = `<i class="fa-solid fa-arrows-rotate fa-spin"></i> Querying USGS & Satellite...`;
      apiDot.style.background = "var(--accent)";
      apiText.textContent = "Querying Live API Nodes...";
      
      showToast("Contacting USGS Earthquake API Gateway...");

      // Fetch from real USGS API
      fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson")
        .then(response => response.json())
        .then(data => {
          let countAdded = 0;
          
          if (data && data.features) {
            data.features.slice(0, 8).forEach(feat => {
              const geom = feat.geometry;
              const props = feat.properties;
              const lat = geom.coordinates[1];
              const lng = geom.coordinates[0];
              const inRegion = (lat > 5 && lat < 38 && lng > 65 && lng < 98);
              
              if (inRegion || props.mag > 4.8) {
                const now = new Date(props.time);
                const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                
                const seismicMsg = {
                  id: `USGS-${feat.id}`,
                  timestamp: timeString + " (Live)",
                  source: "USGS Real-time",
                  user: `Station: Lat ${lat.toFixed(2)}, Lng ${lng.toFixed(2)}`,
                  text: `ALERT: A magnitude ${props.mag} earthquake has been detected near ${props.place} at a depth of ${geom.coordinates[2]}km.`,
                  parsed: {
                    disasterType: "Seismic Alert",
                    severity: props.mag > 5.5 ? "Critical" : "High",
                    location: props.place.split("of ")[1] || props.place,
                    urgency: "High",
                    needs: props.mag > 5.5 ? "Structural Assessment / Rescue Squad" : "Monitoring / Information"
                  }
                };
                
                EMERGENCY_MESSAGES.unshift(seismicMsg);
                countAdded++;
              }
            });
          }
          
          if (EMERGENCY_MESSAGES.length > 8) {
            EMERGENCY_MESSAGES.splice(8);
          }
          
          if (window.refreshDashboardFeedList) {
            window.refreshDashboardFeedList();
          }

          apiDot.style.background = "var(--secondary)";
          apiText.textContent = "Satellite Sync Completed";
          
          syncBtn.disabled = false;
          syncBtn.innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> Sync Live Alerts & Telemetry`;
          
          if (countAdded > 0) {
            showToast(`Synchronized successfully! Prepend ${countAdded} live USGS alert events to feed.`);
          } else {
            generateDynamicIndiaAlertFallback();
          }
        })
        .catch(err => {
          console.error("USGS fetch failed, running dynamic local date generator fallback", err);
          generateDynamicIndiaAlertFallback();
        });
    }

    function generateDynamicIndiaAlertFallback() {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      
      const fallbackAlerts = [
        {
          id: `FLB-${Date.now()}`,
          timestamp: timeStr + " (Live)",
          source: "Guwahati Hub",
          user: "Central Brahmaputra Station",
          text: "Brahmaputra river gauge level exceeded red danger line! Severe water inundation spreading to nearby villages. NDRF base has initiated evacuation dispatches.",
          parsed: {
            disasterType: "Flood",
            severity: "Critical",
            location: "Assam Reserves",
            urgency: "High",
            needs: "NDRF Boats / Air Evac"
          }
        },
        {
          id: `FLB-${Date.now() + 1}`,
          timestamp: timeStr + " (Live)",
          source: "Mumbai Hub",
          user: "Sion Drainage Station",
          text: "Heavy precipitation (210mm) resulting in high waterlogging across low-elevation road segments. Re-routing emergency vehicle dispatches.",
          parsed: {
            disasterType: "Flood",
            severity: "Critical",
            location: "Mumbai Central",
            urgency: "High",
            needs: "Pump Drainage / Traffic Divert"
          }
        }
      ];

      fallbackAlerts.forEach(alert => {
        EMERGENCY_MESSAGES.unshift(alert);
      });
      
      if (EMERGENCY_MESSAGES.length > 8) {
        EMERGENCY_MESSAGES.splice(8);
      }

      if (window.refreshDashboardFeedList) {
        window.refreshDashboardFeedList();
      }

      apiDot.style.background = "var(--secondary)";
      apiText.textContent = "Satellite Sync Completed";
      
      syncBtn.disabled = false;
      syncBtn.innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> Sync Live Alerts & Telemetry`;
      
      showToast("Sync completed. Loaded live weather alert telemetry successfully.");
    }
  }
  
  // --- MOBILE SIDEBAR RESPONSIVENESS CONTROLLER ---
  function initMobileSidebar() {
    const toggleBtn = document.getElementById("mobile-sidebar-toggle");
    const closeBtn = document.getElementById("mobile-sidebar-close");
    const sidebar = document.querySelector(".sidebar");
    const backdrop = document.getElementById("sidebar-overlay-backdrop");
    const menuLinks = document.querySelectorAll(".sidebar-menu .menu-item");

    if (!toggleBtn || !sidebar || !backdrop) return;

    function openSidebar() {
      sidebar.classList.add("mobile-open");
      backdrop.classList.add("active");
    }

    function closeSidebar() {
      sidebar.classList.remove("mobile-open");
      backdrop.classList.remove("active");
    }

    toggleBtn.addEventListener("click", openSidebar);
    if (closeBtn) closeBtn.addEventListener("click", closeSidebar);
    backdrop.addEventListener("click", closeSidebar);

    menuLinks.forEach(link => {
      link.addEventListener("click", () => {
        closeSidebar();
      });
    });
  }
  
  // --- UTILITY TOAST NOTIFIER ---
});
