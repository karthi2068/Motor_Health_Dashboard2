
const $ = (id) => document.getElementById(id);

const MAX_TEMP = 80;
const MAX_CURRENT = 20;

// Demo readings only. Replace these with real sensor data later.
let temperature = 38.6;
let vibration = 0;
let current = 5.42;

const history = {
  labels: [],
  temperature: [],
  vibration: [],
  current: []
};

function updateClock() {
  $("clock").textContent = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
}

function setStatus(id, text, level) {
  const el = $(id);
  el.textContent = "● " + text;
  el.classList.remove("warning", "critical");

  if (level === "warning" || level === "critical") {
    el.classList.add(level);
  }
}

function updateDashboard() {
  // Temperature
  $("temp-value").textContent = temperature.toFixed(1);
  $("temp-gauge").style.setProperty(
    "--progress",
    Math.min(temperature / MAX_TEMP, 1) * 75 + "%"
  );

  if (temperature >= 70) {
    setStatus("temp-status", "Critical", "critical");
    $("temp-message").textContent = "High temperature detected";
  } else if (temperature >= 60) {
    setStatus("temp-status", "Warning", "warning");
    $("temp-message").textContent = "Temperature rising";
  } else {
    setStatus("temp-status", "Normal", "normal");
    $("temp-message").textContent = "Stable temperature";
  }

  // Digital vibration: 0 or 1
  $("vib-value").textContent = vibration;
  $("vib-gauge").classList.toggle("alert", vibration === 1);

  if (vibration === 1) {
    setStatus("vib-status", "Vibration Detected", "critical");
    $("vib-message").textContent = "Check motor for vibration";
  } else {
    setStatus("vib-status", "No Vibration", "normal");
    $("vib-message").textContent = "No vibration signal detected";
  }

  // Current
  $("current-value").textContent = current.toFixed(2);
  $("current-gauge").style.setProperty(
    "--progress",
    Math.min(current / MAX_CURRENT, 1) * 75 + "%"
  );

  if (current >= 18) {
    setStatus("current-status", "Critical", "critical");
    $("current-message").textContent = "High current detected";
  } else if (current >= 15) {
    setStatus("current-status", "Warning", "warning");
    $("current-message").textContent = "Current is elevated";
  } else {
    setStatus("current-status", "Normal", "normal");
    $("current-message").textContent = "Current within configured range";
  }

  // Overall display status. These thresholds are examples only.
  const health = $("health-text");
  const detail = $("health-detail");

  if (temperature >= 70 || current >= 18 || vibration === 1) {
    health.textContent = "Warning";
    health.style.color = "#ff5368";
    detail.textContent = "Abnormal sensor reading";
  } else if (temperature >= 60 || current >= 15) {
    health.textContent = "Attention";
    health.style.color = "#ffc247";
    detail.textContent = "Check motor parameters";
  } else {
    health.textContent = "Normal";
    health.style.color = "#00f58a";
    detail.textContent = "No threshold exceeded";
  }
}

const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 250 },
  interaction: {
    intersect: false,
    mode: "index"
  },
  plugins: {
    legend: { display: false }
  },
  scales: {
    x: {
      ticks: {
        color: "#9bb9da",
        maxTicksLimit: 6,
        maxRotation: 0
      },
      grid: { color: "#15304a" },
      border: { color: "#28445f" }
    },
    y: {
      beginAtZero: true,
      ticks: { color: "#9bb9da" },
      grid: { color: "#15304a" },
      border: { color: "#28445f" }
    }
  }
};

function makeChart(id, label, color, max) {
  const ctx = $(id).getContext("2d");

  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label,
        data: [],
        borderColor: color,
        backgroundColor: color + "25",
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 4
      }]
    },
    options: {
      ...commonChartOptions,
      scales: {
        ...commonChartOptions.scales,
        y: {
          ...commonChartOptions.scales.y,
          max,
          ...(label === "Vibration" ? {
            min: 0,
            max: 1,
            ticks: {
              stepSize: 1,
              color: "#9bb9da"
            }
          } : {})
        }
      }
    }
  });
}

const tempChart = makeChart("tempChart", "Temperature", "#ff414e", 100);
const vibChart = makeChart("vibChart", "Vibration", "#008eff", 1.5);
const currentChart = makeChart("currentChart", "Current", "#bd26ff", 20);

function updateCharts() {
  const time = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  history.labels.push(time);
  history.temperature.push(temperature);
  history.vibration.push(vibration);
  history.current.push(current);

  // Keep the latest 12 readings
  if (history.labels.length > 12) {
    Object.keys(history).forEach(key => history[key].shift());
  }

  [
    [tempChart, history.temperature],
    [vibChart, history.vibration],
    [currentChart, history.current]
  ].forEach(([chart, values]) => {
    chart.data.labels = [...history.labels];
    chart.data.datasets[0].data = [...values];
    chart.update("none");
  });

  $("last-update").textContent = new Date().toLocaleTimeString();
}

// Simulate changing sensor readings for design testing.
function simulateReadings() {
  temperature = Math.max(
    20, Math.min(85, temperature + (Math.random() - 0.48) * 3)
  );

  current = Math.max(
    0, Math.min(20, current + (Math.random() - 0.5) * 0.8)
  );

  // Demo only: randomly simulate a vibration detection.
  vibration = Math.random() < 0.12 ? 1 : 0;

  updateDashboard();
  updateCharts();
}

updateClock();
updateDashboard();
updateCharts();

setInterval(updateClock, 1000);
setInterval(simulateReadings, 3000);
