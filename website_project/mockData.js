// mockData.js - Static datasets, simulation configurations, and AI outputs

const DISASTER_PRESETS = {
  normal: {
    name: "Normal / Stable Weather",
    rainfall: 12,      // mm
    temperature: 28,  // °C
    humidity: 55,     // %
    windSpeed: 10,    // km/h
    soilMoisture: 35, // %
    riverLevel: 1.2,   // meters
    atmosphericPressure: 1013 // hPa
  },
  monsoon: {
    name: "Heavy Monsoon Rain",
    rainfall: 185,
    temperature: 24,
    humidity: 95,
    windSpeed: 28,
    soilMoisture: 85,
    riverLevel: 5.4,
    atmosphericPressure: 1004
  },
  heatwave: {
    name: "Dry Summer Heatwave",
    rainfall: 0,
    temperature: 44,
    humidity: 15,
    windSpeed: 22,
    soilMoisture: 8,
    riverLevel: 0.5,
    atmosphericPressure: 1008
  },
  cyclone: {
    name: "Tropical Cyclone Alert",
    rainfall: 220,
    temperature: 26,
    humidity: 90,
    windSpeed: 85,
    soilMoisture: 75,
    riverLevel: 4.1,
    atmosphericPressure: 985
  },
  drought: {
    name: "Prolonged Drought Conditions",
    rainfall: 2,
    temperature: 39,
    humidity: 20,
    windSpeed: 15,
    soilMoisture: 5,
    riverLevel: 0.2,
    atmosphericPressure: 1012
  }
};

const CNN_DAMAGE_SCENARIOS = {
  flood: {
    imagePath: "https://files.catbox.moe/yj64r4.jpg",
    locationName: "LB Nagar & Musi River Basin, Hyderabad",
    capturedTime: "08 May 2026, 09:48 AM",
    overallDamage: "Severe",
    confidenceScore: 0.92,
    totalArea: 12.64, // km²
    severelyDamagedArea: 4.31, // km² (34.1%)
    moderatelyDamagedArea: 5.76, // km² (45.6%)
    lowDamageArea: 2.57, // km² (20.3%)
    noDamageArea: 0.58, // km² (4.6%)
    statistics: {
      floodedBuildings: 485,
      blockedRoads: 14,
      submergedVehicles: 850,
      activeSheltersNeeded: 4
    },
    damageCoordinates: [
      { lat: 17.3620, lng: 78.5320, radius: 250, severity: 'severe', label: 'Musi River Overflow Zone' },
      { lat: 17.3550, lng: 78.5450, radius: 180, severity: 'severe', label: 'Chaitanyapuri Residential Flood' },
      { lat: 17.3710, lng: 78.5200, radius: 300, severity: 'moderate', label: 'Kothapet Waterlogging' },
      { lat: 17.3480, lng: 78.5580, radius: 150, severity: 'low', label: 'Saroornagar Margin Runoff' }
    ]
  },
  wildfire: {
    imagePath: "https://files.catbox.moe/df4n8z.jpg",
    locationName: "Vikharabad Forest Reserves, Telangana Margins",
    capturedTime: "12 May 2026, 02:15 PM",
    overallDamage: "Severe",
    confidenceScore: 0.89,
    totalArea: 24.15, // km²
    severelyDamagedArea: 13.76, // km² (57.0%)
    moderatelyDamagedArea: 5.43, // km² (22.5%)
    lowDamageArea: 2.97, // km² (12.3%)
    noDamageArea: 1.99, // km² (8.2%)
    statistics: {
      burnedForestArea: "18.2 km²",
      destroyedStructures: 12,
      activeFireFronts: 3,
      containmentLevel: "15%"
    },
    damageCoordinates: [
      { lat: 17.3310, lng: 77.9120, radius: 450, severity: 'severe', label: 'Active Fire Core' },
      { lat: 17.3420, lng: 77.9250, radius: 350, severity: 'severe', label: 'Spreading Fire Front' },
      { lat: 17.3200, lng: 77.8980, radius: 500, severity: 'moderate', label: 'Smoldering Zone' },
      { lat: 17.3550, lng: 77.9400, radius: 200, severity: 'low', label: 'Buffer/Ash Fallout Zone' }
    ]
  }
};

const EMERGENCY_MESSAGES = [
  {
    id: "MSG-001",
    timestamp: "10:32 AM",
    source: "Twitter / X",
    user: "@karthik_hyd",
    text: "Water level is rising incredibly fast near Chaitanyapuri bridge! The ground floor of our apartment is completely submerged, please send help! #HyderabadFloods",
    parsed: {
      disasterType: "Flood",
      severity: "Critical",
      location: "Chaitanyapuri, LB Nagar",
      urgency: "High",
      needs: "Evacuation / Boat Rescue"
    }
  },
  {
    id: "MSG-002",
    timestamp: "10:28 AM",
    source: "SMS Portal",
    user: "+91 98480 XXXXX",
    text: "URGENT: A power line snapped and fell onto dry bushes near Vikharabad reserve, a massive fire is breaking out and moving towards houses. Send fire units immediately!",
    parsed: {
      disasterType: "Wildfire",
      severity: "High",
      location: "Vikharabad Margin",
      urgency: "High",
      needs: "Firefighters / Evacuation"
    }
  },
  {
    id: "MSG-003",
    timestamp: "10:25 AM",
    source: "App Report",
    user: "Srinivas Reddy",
    text: "Musi river overflow has flooded the main connecting road. Road blockages spotted. Cars are getting stuck in the flow near Nagole.",
    parsed: {
      disasterType: "Flood",
      severity: "Moderate",
      location: "Nagole Main Road",
      urgency: "Medium",
      needs: "Road Clearance / Traffic Divert"
    }
  },
  {
    id: "MSG-004",
    timestamp: "10:14 AM",
    source: "Twitter / X",
    user: "@NGO_HydAlert",
    text: "Setting up a temporary relief center at LB Nagar Government School. We have drinking water and dry food packets ready. Need volunteers to coordinate distributions.",
    parsed: {
      disasterType: "Resource Alert",
      severity: "Low",
      location: "LB Nagar Govt School",
      urgency: "Low",
      needs: "Volunteers / Coordination"
    }
  },
  {
    id: "MSG-005",
    timestamp: "09:50 AM",
    source: "SMS Portal",
    user: "+91 91005 XXXXX",
    text: "Landslide on Vikharabad hills roads! Large boulder blocks the single lane. Traffic completely halted on both sides.",
    parsed: {
      disasterType: "Landslide",
      severity: "High",
      location: "Ananthagiri Hills Rd",
      urgency: "High",
      needs: "Heavy Machinery / Road Clearance"
    }
  }
];

const DISASTER_RESOURCES = [
  { id: "RES-01", name: "NDRF Rescue Squad A", type: "Rescue Team", status: "Active", location: "Musi Basin", size: 15, contact: "9876543210" },
  { id: "RES-02", name: "NDRF Rescue Squad B", type: "Rescue Team", status: "Standby", location: "Gachibowli Base", size: 15, contact: "9876543211" },
  { id: "RES-03", name: "State Fire Rescue unit 4", type: "Fire Engine", status: "Active", location: "Vikharabad Margins", size: 8, contact: "9876543212" },
  { id: "RES-04", name: "State Fire Rescue unit 9", type: "Fire Engine", status: "Standby", location: "Secunderabad Station", size: 6, contact: "9876543213" },
  { id: "RES-05", name: "Rapid Ambulance Squad 1", type: "Medical Unit", status: "Active", location: "Kothapet Hospital Hub", size: 4, contact: "9876543214" },
  { id: "RES-06", name: "Rapid Ambulance Squad 3", type: "Medical Unit", status: "Standby", location: "LB Nagar Hub", size: 4, contact: "9876543215" },
  { id: "RES-07", name: "LB Nagar Sports Complex Shelter", type: "Shelter", status: "Operating", capacity: "250/500", location: "LB Nagar", size: 0, contact: "9876543216" },
  { id: "RES-08", name: "Miyapur Relief Center", type: "Shelter", status: "Standby", capacity: "0/300", location: "Miyapur", size: 0, contact: "9876543217" },
  { id: "RES-09", name: "Emergency Food Dispatch Hub", type: "Food Supply", status: "Active", location: "Uppal Depot", size: 10, contact: "9876543218" }
];

const GIS_LOCATIONS = {
  center: [17.3850, 78.4867], // Hyderabad center
  shelters: [
    { name: "LB Nagar Sports Complex (Active)", lat: 17.3480, lng: 78.5520, capacity: 500, current: 250, phone: "+91 99999 11111", status: "active" },
    { name: "Uppal Govt High School (Active)", lat: 17.4020, lng: 78.5600, capacity: 300, current: 180, phone: "+91 99999 22222", status: "active" },
    { name: "Miyapur Indoor Stadium (Standby)", lat: 17.4980, lng: 78.3580, capacity: 400, current: 0, phone: "+91 99999 33333", status: "standby" },
    { name: "Mehdipatnam Community Hall (Standby)", lat: 17.3980, lng: 78.4350, capacity: 250, current: 0, phone: "+91 99999 44444", status: "standby" }
  ],
  hospitals: [
    { name: "Kamineni Hospital", lat: 17.3520, lng: 78.5470, beds: 85, phone: "+91 99999 55555" },
    { name: "Yashoda Hospital Malakpet", lat: 17.3750, lng: 78.5020, beds: 120, phone: "+91 99999 66666" },
    { name: "Apollo Hospitals Jubilee Hills", lat: 17.4150, lng: 78.4060, beds: 250, phone: "+91 99999 77777" }
  ],
  incidents: [
    { type: "Flood", severity: "Critical", label: "Musi River Overflow", lat: 17.3610, lng: 78.5300 },
    { type: "Flood", severity: "High", label: "Chaitanyapuri Colony Flooding", lat: 17.3540, lng: 78.5430 },
    { type: "Road Blockage", severity: "Moderate", label: "Nagole Main Rd Waterlogging", lat: 17.3700, lng: 78.5580 }
  ],
  baseCamps: [
    { name: "Gachibowli NDRF Base Camp", lat: 17.4420, lng: 78.3520 },
    { name: "Amberpet Police Training Center Hub", lat: 17.3910, lng: 78.5190 }
  ]
};

// Simulated RL + GA optimized allocations (Pre-calculated for the presets to make dispatch instant and beautiful)
const OPTIMIZED_DISPATCH = {
  flood: {
    totalUnits: 156,
    deployedCount: 112,
    efficiency: "94.2%",
    responseTime: "18.6 min",
    deployments: [
      { resource: "NDRF Rescue Squad A", destination: "Musi River Overflow", route: [[17.3910, 78.5190], [17.3800, 78.5250], [17.3610, 78.5300]], time: "12 min" },
      { resource: "NDRF Rescue Squad B", destination: "Chaitanyapuri Colony Flooding", route: [[17.4420, 78.3520], [17.4100, 78.4500], [17.3540, 78.5430]], time: "26 min" },
      { resource: "Rapid Ambulance Squad 3", destination: "Chaitanyapuri Colony Flooding", route: [[17.3480, 78.5520], [17.3540, 78.5430]], time: "5 min" },
      { resource: "Emergency Food Dispatch Hub", destination: "LB Nagar Sports Complex", route: [[17.4020, 78.5600], [17.3480, 78.5520]], time: "15 min" }
    ]
  },
  wildfire: {
    totalUnits: 84,
    deployedCount: 68,
    efficiency: "89.5%",
    responseTime: "22.3 min",
    deployments: [
      { resource: "State Fire Rescue unit 4", destination: "Vikharabad Core", route: [[17.3910, 78.5190], [17.3500, 78.2000], [17.3310, 77.9120]], time: "38 min" },
      { resource: "NDRF Rescue Squad A", destination: "Vikharabad Spreading Front", route: [[17.3910, 78.5190], [17.3500, 78.1000], [17.3420, 77.9250]], time: "42 min" },
      { resource: "Rapid Ambulance Squad 1", destination: "Vikharabad Margins", route: [[17.3750, 78.5020], [17.3500, 78.0000], [17.3200, 77.8980]], time: "45 min" }
    ]
  }
};

const AI_COPILOT_RESPONSES = {
  greetings: "Hello! I am the AI Copilot for the autonomous disaster response system. I can help you analyze risk predictions, damage assessments, coordinate resources, and draft evacuation plans. How can I assist you today?",
  "weather alert": "Based on current weather trends: Rainfall has peaked at 185mm. River water levels at Musi gauge are at 5.4m (Danger Level: 5.0m). Our XGBoost model predicts a **95% Flood Risk** in low-lying areas. It is recommended to deploy NDRF units to critical zones.",
  "shelter status": "Currently, we have two active shelters:\n1. **LB Nagar Sports Complex**: Capacity 250/500. Currently has medical supplies, dry food, and power backup.\n2. **Uppal Govt High School**: Capacity 180/300.\nMiyapur Indoor Stadium is on Standby (Capacity 400) and can be activated immediately if capacity at LB Nagar exceeds 80%.",
  "resource status": "We have 156 total rescue units. Currently, **112 units (71.8%)** are actively deployed. **44 units (28.2%)** are on standby. Standby units include NDRF Squad B (Gachibowli Base) and Rapid Ambulance Squad 3 (LB Nagar Hub).",
  "draft alert": "Here is a draft alert message for the LB Nagar residents:\n\n**EMERGENCY EMERGENCY WARNING (Musi River Flooding)**\n*Issued by Disaster Management Authority*\nSevere flooding is imminent in low-lying zones of LB Nagar. Residents are advised to evacuate immediately to the LB Nagar Sports Complex Shelter. Avoid walking or driving through water. Pack essential medication, documents, and warm clothes.\n\n*Type 'Send SMS' to initiate broadcast to 128,450 residents.*",
  "evacuate lb nagar": "### Evacuation Plan: LB Nagar Zone\n1. **Primary Route**: Take Inner Ring Road north away from Musi River basin towards L.B. Nagar Metro Station, then proceed to the **LB Nagar Sports Complex Shelter** (safe elevation).\n2. **Secondary Route**: If Chaitanyapuri road is submerged, route via Kothapet main road.\n3. **Hazards**: Avoid Musi River margins, Chaitanyapuri underpasses, and low-elevation sectors.\n4. **Shelter Coordinator**: Ph: +91 99999 11111 (Sports Complex). Capacity is green (50% filled).",
  "default": "I apologize, I didn't quite catch that. I am trained on the disaster management guidelines. You can ask me:\n- 'Show weather alert details'\n- 'Get current shelter status'\n- 'Draft evacuation warning for LB Nagar'\n- 'Draft an SMS warning for residents'\n- 'Check resource deployment status'"
};

const MODEL_PERFORMANCE_METRICS = {
  xgboost: {
    accuracy: 94.8,
    precision: 93.5,
    recall: 95.1,
    f1Score: 94.3,
    rocAuc: 0.982,
    logLoss: 0.125
  },
  cnn: {
    accuracy: 91.3,
    precision: 90.5,
    recall: 92.0,
    f1Score: 91.2,
    rocAuc: 0.954,
    logLoss: 0.220
  },
  bert: {
    accuracy: 92.5,
    precision: 91.8,
    recall: 93.1,
    f1Score: 92.4,
    rocAuc: 0.968,
    logLoss: 0.185
  },
  rlGa: {
    responseTimeReduction: "38.2%",
    resourceUtilizationEfficiency: "94.5%",
    coverageRatio: "91.8%",
    survivalRateIncrease: "14.2%"
  }
};
