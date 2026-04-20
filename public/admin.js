const socket = io();

let currentData = {
  homeTeam: "Home",
  awayTeam: "Away",
  homeScore: 0,
  awayScore: 0,
  timer: "20:00",
  period: "1st Half",
  homeColor: "#2563eb",
  awayColor: "#dc2626",
  homeLogo: "",
  awayLogo: ""
};

let countdownInterval = null;
let remainingSeconds = 0;

socket.on("connect", () => {
  console.log("Admin connected to server");
});

socket.on("scoreboardUpdate", (data) => {
  console.log("Received scoreboard update:", data);
  currentData = data;
  updateAdminPreview();
  syncFormFields();
});

function updateAdminPreview() {
  const homeNameEl = document.getElementById("homePreviewName");
  const awayNameEl = document.getElementById("awayPreviewName");
  const homeScoreEl = document.getElementById("homePreviewScore");
  const awayScoreEl = document.getElementById("awayPreviewScore");
  const timerEl = document.getElementById("timerPreview");
  const periodEl = document.getElementById("periodPreview");

  if (homeNameEl) homeNameEl.textContent = currentData.homeTeam;
  if (awayNameEl) awayNameEl.textContent = currentData.awayTeam;
  if (homeScoreEl) homeScoreEl.textContent = currentData.homeScore;
  if (awayScoreEl) awayScoreEl.textContent = currentData.awayScore;
  if (timerEl) timerEl.textContent = currentData.timer;
  if (periodEl) periodEl.textContent = currentData.period;
}

function syncFormFields() {
  const homeColorInput = document.getElementById("homeColorInput");
  const awayColorInput = document.getElementById("awayColorInput");

  if (homeColorInput && currentData.homeColor) {
    homeColorInput.value = currentData.homeColor;
  }

  if (awayColorInput && currentData.awayColor) {
    awayColorInput.value = currentData.awayColor;
  }
}

function emitUpdate() {
  updateAdminPreview();
  console.log("Sending updateScoreboard:", currentData);
  socket.emit("updateScoreboard", currentData);
}

function addScore(team, points) {
  if (team === "home") {
    currentData.homeScore += points;
  } else {
    currentData.awayScore += points;
  }

  emitUpdate();
}

function updateNames() {
  currentData.homeTeam = document.getElementById("homeTeamInput").value;
  currentData.awayTeam = document.getElementById("awayTeamInput").value;
  currentData.period = document.getElementById("periodInput").value;
  currentData.homeColor = document.getElementById("homeColorInput").value;
  currentData.awayColor = document.getElementById("awayColorInput").value;

  emitUpdate();
}

function setTimer() {
  const timeValue = document.getElementById("timerInput").value.trim();
  const parts = timeValue.split(":");

  if (parts.length !== 2) {
    alert("Please use mm:ss format, for example 20:00");
    return;
  }

  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);

  if (isNaN(minutes) || isNaN(seconds) || seconds > 59 || minutes < 0 || seconds < 0) {
    alert("Invalid time format. Use mm:ss");
    return;
  }

  remainingSeconds = minutes * 60 + seconds;
  currentData.timer = formatTime(remainingSeconds);

  emitUpdate();
}

function startGame() {
  if (countdownInterval) return;

  const timeValue = document.getElementById("timerInput").value.trim();
  const parts = timeValue.split(":");

  if (remainingSeconds <= 0) {
    if (parts.length !== 2) {
      alert("Please use mm:ss format, for example 20:00");
      return;
    }

    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);

    if (isNaN(minutes) || isNaN(seconds) || seconds > 59 || minutes < 0 || seconds < 0) {
      alert("Invalid time format. Use mm:ss");
      return;
    }

    remainingSeconds = minutes * 60 + seconds;
  }

  currentData.timer = formatTime(remainingSeconds);
  emitUpdate();

  countdownInterval = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      currentData.timer = formatTime(remainingSeconds);
      emitUpdate();
    } else {
      clearInterval(countdownInterval);
      countdownInterval = null;
      currentData.timer = "00:00";
      emitUpdate();
      alert("Game over");
    }
  }, 1000);
}

function stopGame() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

function resetScores() {
  stopGame();
  currentData.homeScore = 0;
  currentData.awayScore = 0;
  currentData.timer = "20:00";
  remainingSeconds = 20 * 60;
  document.getElementById("timerInput").value = "20:00";
  emitUpdate();
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function fileToDataUrl(file, callback) {
  const reader = new FileReader();
  reader.onload = function (event) {
    callback(event.target.result);
  };
  reader.readAsDataURL(file);
}

document.getElementById("homeLogoInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  fileToDataUrl(file, (dataUrl) => {
    currentData.homeLogo = dataUrl;
    emitUpdate();
  });
});

document.getElementById("awayLogoInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  fileToDataUrl(file, (dataUrl) => {
    currentData.awayLogo = dataUrl;
    emitUpdate();
  });
});

window.addScore = addScore;
window.updateNames = updateNames;
window.setTimer = setTimer;
window.startGame = startGame;
window.stopGame = stopGame;
window.resetScores = resetScores;