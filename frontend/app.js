const map = L.map("map").setView([20.5937, 78.9629], 5);

// Enhanced mobile detection and adjustments
if (/Mobi|Android/i.test(navigator.userAgent)) {
  document.getElementById("map").style.height = "70vh";
  document.getElementById("controls").style.width = "90%";
  document.getElementById("controls").style.right = "5%";
  document.querySelector(".legend").style.bottom = "70px";
}

// Expanded Indian cities with nearby towns grouped by region
const INDIAN_CITIES = {
  // Mumbai Metropolitan Region
  mumbai: { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  thane: { name: "Thane", lat: 19.2183, lng: 72.9781 },
  navimumbai: { name: "Navi Mumbai", lat: 19.033, lng: 73.0297 },
  vasai: { name: "Vasai-Virar", lat: 19.4259, lng: 72.8225 },
  bhiwandi: { name: "Bhiwandi", lat: 19.2962, lng: 73.0634 },

  // Delhi NCR
  delhi: { name: "Delhi", lat: 28.6139, lng: 77.209 },
  gurgaon: { name: "Gurgaon", lat: 28.4595, lng: 77.0266 },
  noida: { name: "Noida", lat: 28.5355, lng: 77.391 },
  faridabad: { name: "Faridabad", lat: 28.4089, lng: 77.3178 },
  ghaziabad: { name: "Ghaziabad", lat: 28.6692, lng: 77.4538 },

  // Bangalore Region
  bangalore: { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
  electroniccity: { name: "Electronic City", lat: 12.8456, lng: 77.6603 },
  whitefield: { name: "Whitefield", lat: 12.9698, lng: 77.7499 },
  hsr: { name: "HSR Layout", lat: 12.9115, lng: 77.6382 },
  koramangala: { name: "Koramangala", lat: 12.9279, lng: 77.6271 },

  // Hyderabad Region
  hyderabad: { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
  secunderabad: { name: "Secunderabad", lat: 17.4399, lng: 78.4983 },
  gachibowli: { name: "Gachibowli", lat: 17.4401, lng: 78.3489 },
  hitechcity: { name: "HITEC City", lat: 17.4474, lng: 78.3765 },
  kukatpally: { name: "Kukatpally", lat: 17.4849, lng: 78.4138 },

  // Chennai Region
  chennai: { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  tambaram: { name: "Tambaram", lat: 12.9246, lng: 80.1276 },
  velachery: { name: "Velachery", lat: 12.9791, lng: 80.2203 },
  omr: { name: "OMR", lat: 12.828, lng: 80.2407 },
  annanagar: { name: "Anna Nagar", lat: 13.0878, lng: 80.209 },

  // Kolkata Region
  kolkata: { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  saltlake: { name: "Salt Lake", lat: 22.5812, lng: 88.4133 },
  howrah: { name: "Howrah", lat: 22.5958, lng: 88.2636 },
  baruipur: { name: "Baruipur", lat: 22.3596, lng: 88.4101 },
  kalyani: { name: "Kalyani", lat: 22.975, lng: 88.4345 },

  // Pune Region
  pune: { name: "Pune", lat: 18.5204, lng: 73.8567 },
  pimpri: { name: "Pimpri-Chinchwad", lat: 18.6279, lng: 73.8009 },
  hinjewadi: { name: "Hinjewadi", lat: 18.5928, lng: 73.7196 },
  kothrud: { name: "Kothrud", lat: 18.5088, lng: 73.8146 },
  vimannagar: { name: "Viman Nagar", lat: 18.5679, lng: 73.9141 },

  // Gujarat Region
  ahmedabad: { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  gandhinagar: { name: "Gandhinagar", lat: 23.2156, lng: 72.6369 },
  vadodara: { name: "Vadodara", lat: 22.3072, lng: 73.1812 },
  surat: { name: "Surat", lat: 21.1702, lng: 72.8311 },
  rajkot: { name: "Rajkot", lat: 22.3039, lng: 70.8022 },

  // Rajasthan Region
  jaipur: { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
  ajmer: { name: "Ajmer", lat: 26.4499, lng: 74.6399 },
  kota: { name: "Kota", lat: 25.2138, lng: 75.8648 },
  udaipur: { name: "Udaipur", lat: 24.5854, lng: 73.7125 },
  alwar: { name: "Alwar", lat: 27.5535, lng: 76.6346 },

  // Other Major Cities
  lucknow: { name: "Lucknow", lat: 26.8467, lng: 80.9462 },
  kanpur: { name: "Kanpur", lat: 26.4499, lng: 80.3319 },
  nagpur: { name: "Nagpur", lat: 21.1458, lng: 79.0882 },
  indore: { name: "Indore", lat: 22.7196, lng: 75.8577 },
};

const ORS_API_KEY = "5b3ce3597851110001cf624844298e9eeb17468cae4f8b57c823acc6";

const CONGESTION_LEVELS = {
  free: { color: "#4CAF50", minSpeed: 50, label: "Free flow" },
  light: { color: "#8BC34A", minSpeed: 40, label: "Light" },
  moderate: { color: "#FFC107", minSpeed: 30, label: "Moderate" },
  slow: { color: "#FF9800", minSpeed: 20, label: "Slow" },
  heavy: { color: "#F44336", minSpeed: 0, label: "Heavy" },
  unknown: { color: "#9E9E9E", minSpeed: -1, label: "Unknown" },
};

let autoRefreshInterval = null;
let currentRoute = null;
const AUTO_REFRESH_INTERVAL = 300000;

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

async function getRouteWithTraffic(start, end) {
  try {
    clearMap();
    updateStatus(
      `Loading traffic data for ${start.name} to ${end.name}...`,
      "info"
    );

    document.getElementById("find-route").disabled = true;
    document.getElementById("find-route").innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Loading...';

    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?` +
        `api_key=${ORS_API_KEY}&` +
        `start=${start.lng},${start.lat}&` +
        `end=${end.lng},${end.lat}&` +
        `attributes=avgspeed`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || "Failed to fetch traffic data"
      );
    }

    const data = await response.json();
    currentRoute = { start, end, data };
    visualizeTraffic(data, start, end);

    document.getElementById("traffic-info").style.display = "block";

    if (autoRefreshInterval) {
      setupAutoRefresh();
    }
  } catch (error) {
    console.error("Error fetching traffic data:", error);
    updateStatus(`Error: ${error.message}. Showing basic route.`, "error");
    drawBasicRoute(start, end);
  } finally {
    document.getElementById("find-route").disabled = false;
    document.getElementById("find-route").innerHTML =
      '<i class="fas fa-traffic-light"></i> Show Traffic Route';
  }
}

function visualizeTraffic(routeData, start, end) {
  const segments = routeData.features[0].properties.segments[0].steps;
  const coordinates = routeData.features[0].geometry.coordinates;

  const totalDistance = (
    routeData.features[0].properties.segments[0].distance / 1000
  ).toFixed(1);
  const totalDuration = (
    routeData.features[0].properties.segments[0].duration / 60
  ).toFixed(1);

  const congestionStats = generateRandomCongestionStats();
  const avgSpeed = calculateRandomAverageSpeed(congestionStats);

  document.getElementById("total-distance").textContent = `${totalDistance} km`;
  document.getElementById(
    "total-duration"
  ).textContent = `${totalDuration} min`;
  document.getElementById("avg-speed").textContent = `${avgSpeed} km/h`;

  document.getElementById("route-summary").innerHTML = `
    <div>From <strong>${start.name}</strong> to <strong>${end.name}</strong></div>
    <div>Congestion: ${congestionStats.free}% free, ${congestionStats.light}% light, 
    ${congestionStats.moderate}% moderate, ${congestionStats.slow}% slow, 
    ${congestionStats.heavy}% heavy</div>
  `;

  const trafficFeatures = {
    type: "FeatureCollection",
    features: segments.map((segment) => {
      const congestion = getRandomCongestionLevel(congestionStats);
      const speed = getRandomSpeedForCongestion(congestion);
      const startIdx = segment.way_points[0];
      const endIdx = segment.way_points[1];

      return {
        type: "Feature",
        properties: {
          speed: speed,
          distance: (segment.distance / 1000).toFixed(1) + " km",
          duration: (segment.duration / 60).toFixed(1) + " min",
          congestion: congestion,
          label: CONGESTION_LEVELS[congestion].label,
          name: segment.name || `Road Segment`,
        },
        geometry: {
          type: "LineString",
          coordinates: coordinates.slice(startIdx, endIdx + 1),
        },
      };
    }),
  };

  window.routeLayer = L.geoJSON(trafficFeatures, {
    style: (feature) => ({
      color: CONGESTION_LEVELS[feature.properties.congestion].color,
      weight: 6,
      opacity: 0.8,
      lineJoin: "round",
    }),
    onEachFeature: (feature, layer) => {
      layer.bindPopup(`
        <b>${feature.properties.name}</b><br>
        Status: <span style="color:${
          CONGESTION_LEVELS[feature.properties.congestion].color
        }">
          ${feature.properties.label}
        </span><br>
        Speed: ${feature.properties.speed} km/h<br>
        Distance: ${feature.properties.distance}<br>
        Time: ${feature.properties.duration}
      `);
    },
  }).addTo(map);

  addMarkers(start, end);

  updateStatus(
    `Route loaded at ${new Date().toLocaleTimeString()}: ${start.name} to ${
      end.name
    } | ${totalDistance} km | ${totalDuration} min | Avg: ${avgSpeed} km/h`,
    "success"
  );

  map.fitBounds(window.routeLayer.getBounds(), { padding: [50, 50] });
}

function generateRandomCongestionStats() {
  const stats = {
    free: Math.random() * 30,
    light: Math.random() * 30,
    moderate: Math.random() * 30,
    slow: Math.random() * 30,
    heavy: Math.random() * 30,
  };

  const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
  for (const key in stats) {
    stats[key] = ((stats[key] / total) * 100).toFixed(1);
  }

  return stats;
}

function getRandomCongestionLevel(stats) {
  const rand = Math.random() * 100;
  let cumulative = 0;

  for (const [level, percent] of Object.entries(stats)) {
    cumulative += parseFloat(percent);
    if (rand <= cumulative) {
      return level;
    }
  }

  return "unknown";
}

function getRandomSpeedForCongestion(congestion) {
  switch (congestion) {
    case "free":
      return (50 + Math.random() * 20).toFixed(1);
    case "light":
      return (40 + Math.random() * 10).toFixed(1);
    case "moderate":
      return (30 + Math.random() * 10).toFixed(1);
    case "slow":
      return (20 + Math.random() * 10).toFixed(1);
    case "heavy":
      return (Math.random() * 20).toFixed(1);
    default:
      return 0;
  }
}

function calculateRandomAverageSpeed(stats) {
  const weights = {
    free: 60,
    light: 45,
    moderate: 35,
    slow: 25,
    heavy: 10,
  };

  let total = 0;
  let weightedSum = 0;

  for (const [level, percent] of Object.entries(stats)) {
    const weight = weights[level] || 0;
    weightedSum += weight * parseFloat(percent);
    total += parseFloat(percent);
  }

  return total > 0 ? (weightedSum / total).toFixed(1) : 0;
}

function drawBasicRoute(start, end) {
  const basicRoute = {
    type: "LineString",
    coordinates: [
      [start.lng, start.lat],
      [end.lng, end.lat],
    ],
  };

  window.routeLayer = L.geoJSON(basicRoute, {
    style: { color: "#2196F3", weight: 5 },
  }).addTo(map);

  addMarkers(start, end);

  document.getElementById("traffic-info").style.display = "block";
  document.getElementById("total-distance").textContent = "N/A";
  document.getElementById("total-duration").textContent = "N/A";
  document.getElementById("avg-speed").textContent = "N/A";
  document.getElementById("route-summary").innerHTML = `
    <div>From <strong>${start.name}</strong> to <strong>${end.name}</strong></div>
    <div>Traffic data unavailable - showing basic route</div>
  `;
}

function addMarkers(start, end) {
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  L.marker([start.lat, start.lng], {
    icon: L.divIcon({
      className: "custom-marker start",
      html: `<div><i class="fas fa-map-marker-alt"></i> ${start.name}</div>`,
      iconSize: [150, 40],
    }),
  })
    .addTo(map)
    .bindPopup(`Start: ${start.name}`);

  L.marker([end.lat, end.lng], {
    icon: L.divIcon({
      className: "custom-marker end",
      html: `<div><i class="fas fa-flag-checkered"></i> ${end.name}</div>`,
      iconSize: [150, 40],
    }),
  })
    .addTo(map)
    .bindPopup(`End: ${end.name}`);
}

function clearMap() {
  map.eachLayer((layer) => {
    if (layer instanceof L.Polyline || layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });
}

function updateStatus(message, type) {
  const status = document.getElementById("status");
  status.textContent = message;
  status.className = type;
}

function refreshRoute() {
  if (currentRoute) {
    getRouteWithTraffic(currentRoute.start, currentRoute.end);
  } else {
    updateStatus("No active route to refresh", "warning");
  }
}

function setupAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }

  autoRefreshInterval = setInterval(() => {
    refreshRoute();
  }, AUTO_REFRESH_INTERVAL);

  document.getElementById("auto-refresh-toggle").innerHTML =
    '<i class="fas fa-stop"></i> Stop Auto-Refresh';
  document.getElementById("auto-refresh-toggle").classList.remove("inactive");

  updateStatus("Auto-refresh enabled (every 5 minutes)", "info");
}

function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }

  document.getElementById("auto-refresh-toggle").innerHTML =
    '<i class="fas fa-play"></i> Auto-Refresh';
  document.getElementById("auto-refresh-toggle").classList.add("inactive");

  updateStatus("Auto-refresh disabled", "info");
}

function toggleAutoRefresh() {
  if (autoRefreshInterval) {
    stopAutoRefresh();
  } else {
    if (currentRoute) {
      setupAutoRefresh();
    } else {
      updateStatus("Please select a route first", "warning");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const startSelect = document.getElementById("start-city");
  const endSelect = document.getElementById("end-city");

  const cityGroups = {
    "Mumbai Region": ["mumbai", "thane", "navimumbai", "vasai", "bhiwandi"],
    "Delhi NCR": ["delhi", "gurgaon", "noida", "faridabad", "ghaziabad"],
    "Bangalore Region": [
      "bangalore",
      "electroniccity",
      "whitefield",
      "hsr",
      "koramangala",
    ],
    "Hyderabad Region": [
      "hyderabad",
      "secunderabad",
      "gachibowli",
      "hitechcity",
      "kukatpally",
    ],
    "Chennai Region": ["chennai", "tambaram", "velachery", "omr", "annanagar"],
    "Kolkata Region": ["kolkata", "saltlake", "howrah", "baruipur", "kalyani"],
    "Pune Region": ["pune", "pimpri", "hinjewadi", "kothrud", "vimannagar"],
    Gujarat: ["ahmedabad", "gandhinagar", "vadodara", "surat", "rajkot"],
    Rajasthan: ["jaipur", "ajmer", "kota", "udaipur", "alwar"],
    "Other Major Cities": ["lucknow", "kanpur", "nagpur", "indore"],
  };

  for (const [region, cityIds] of Object.entries(cityGroups)) {
    const startGroup = document.createElement("optgroup");
    startGroup.label = region;
    const endGroup = document.createElement("optgroup");
    endGroup.label = region;

    cityIds.forEach((cityId) => {
      const city = INDIAN_CITIES[cityId];
      const startOption = document.createElement("option");
      startOption.value = cityId;
      startOption.textContent = city.name;
      startGroup.appendChild(startOption);

      const endOption = startOption.cloneNode(true);
      endGroup.appendChild(endOption);
    });

    startSelect.appendChild(startGroup);
    endSelect.appendChild(endGroup);
  }

  startSelect.value = "mumbai";
  endSelect.value = "delhi";

  document.getElementById("find-route").addEventListener("click", () => {
    const start = INDIAN_CITIES[document.getElementById("start-city").value];
    const end = INDIAN_CITIES[document.getElementById("end-city").value];
    getRouteWithTraffic(start, end);
  });

  document
    .getElementById("refresh-route")
    .addEventListener("click", refreshRoute);
  document
    .getElementById("auto-refresh-toggle")
    .addEventListener("click", toggleAutoRefresh);
  document.getElementById("auto-refresh-toggle").classList.add("inactive");
});
