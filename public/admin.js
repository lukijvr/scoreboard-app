const socket = io();

let currentData = {
  homeTeam: "Home",
  awayTeam: "Away",
  homeScore: 0,
  awayScore: 0,
  timer: "20:00",
  period: "1st Half",
  homeLogo: "/assets/logos/home.png",
  awayLogo: "/assets/logos/away.png",
  homeColor: "#1d4ed8",
  awayColor: "#dc2626"
};

let countdownInterval = null;
let remainingSeconds = 0;

socket.on("connect", () => {
  console.log("Admin connected to server");
});

socket.on("scoreboardUpdate", (data) => {
  console.log("Received scoreboard update:", data);
  currentData = { ...currentData, ...data };
  updateAdminPreview();
});

function updateAdminPreview() {
  const homePreviewName = document.getElementById("homePreviewName");
  const awayPreviewName = document.getElementById("awayPreviewName");
  const homePreviewScore = document.getElementById("homePreviewScore");
  const awayPreviewScore = document.getElementById("awayPreviewScore");
  const timerPreview = document.getElementById("timerPreview");
  const periodPreview = document.getElementById("periodPreview");

  if (homePreviewName) {
    homePreviewName.textContent = currentData.homeTeam || "Home";
  }

  if (awayPreviewName) {
    awayPreviewName.textContent = currentData.awayTeam || "Away";
  }

  if (homePreviewScore) {
    homePreviewScore.textContent = currentData.homeScore ?? 0;
  }

  if (awayPreviewScore) {
    awayPreviewScore.textContent = currentData.awayScore ?? 0;
  }

  if (timerPreview) {
    timerPreview.textContent = currentData.timer || "20:00";
  }

  if (periodPreview) {
    periodPreview.textContent = currentData.period || "1st Half";
  }
}

function addScore(team, points) {
  console.log("Button clicked:", team, points);

  if (team === "home") {
    currentData.homeScore += points;
  } else {
    currentData.awayScore += points;
  }

  updateAdminPreview();
  console.log("Sending updateScoreboard:", currentData);
  socket.emit("updateScoreboard", currentData);

  if (points === 5) {
    socket.emit("triggerCelebration", {
      text: "TRY!",
      duration: 3000,
      color:
        team === "home"
          ? currentData.homeColor || "#1d4ed8"
          : currentData.awayColor || "#dc2626"
    });
  }
}

function updateNames() {
  const homeTeamInput = document.getElementById("homeTeamInput");
  const awayTeamInput = document.getElementById("awayTeamInput");
  const periodInput = document.getElementById("periodInput");
  const timerInput = document.getElementById("timerInput");

  if (homeTeamInput) {
    currentData.homeTeam = homeTeamInput.value || "Home";
  }

  if (awayTeamInput) {
    currentData.awayTeam = awayTeamInput.value || "Away";
  }

  if (periodInput) {
    currentData.period = periodInput.value || "1st Half";
  }

  if (timerInput && timerInput.value.trim()) {
    currentData.timer = timerInput.value.trim();
  }

  updateAdminPreview();
  console.log("Sending updateScoreboard:", currentData);
  socket.emit("updateScoreboard", currentData);
}

function setTimer() {
  const timerInput = document.getElementById("timerInput");

  if (!timerInput) return;

  const timeValue = timerInput.value.trim();
  const parts = timeValue.split(":");

  if (parts.length !== 2) {
    alert("Please use mm:ss format, for example 20:00");
    return;
  }

  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);

  if (
    Number.isNaN(minutes) ||
    Number.isNaN(seconds) ||
    minutes < 0 ||
    seconds < 0 ||
    seconds > 59
  ) {
    alert("Invalid time format. Use mm:ss");
    return;
  }

  remainingSeconds = minutes * 60 + seconds;
  currentData.timer = formatTime(remainingSeconds);

  updateAdminPreview();
  console.log("Sending updateScoreboard:", currentData);
  socket.emit("updateScoreboard", currentData);
}

function startGame() {
  if (countdownInterval) return;

  const timerInput = document.getElementById("timerInput");

  if (remainingSeconds <= 0) {
    if (!timerInput) return;

    const timeValue = timerInput.value.trim();
    const parts = timeValue.split(":");

    if (parts.length !== 2) {
      alert("Please use mm:ss format, for example 20:00");
      return;
    }

    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);

    if (
      Number.isNaN(minutes) ||
      Number.isNaN(seconds) ||
      minutes < 0 ||
      seconds < 0 ||
      seconds > 59
    ) {
      alert("Invalid time format. Use mm:ss");
      return;
    }

    remainingSeconds = minutes * 60 + seconds;
  }

  currentData.timer = formatTime(remainingSeconds);
  updateAdminPreview();
  socket.emit("updateScoreboard", currentData);

  countdownInterval = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      currentData.timer = formatTime(remainingSeconds);
      updateAdminPreview();
      socket.emit("updateScoreboard", currentData);
    } else {
      clearInterval(countdownInterval);
      countdownInterval = null;
      currentData.timer = "00:00";
      updateAdminPreview();
      socket.emit("updateScoreboard", currentData);
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
  currentData.period = "1st Half";

  remainingSeconds = 20 * 60;

  const timerInput = document.getElementById("timerInput");
  const periodInput = document.getElementById("periodInput");

  if (timerInput) {
    timerInput.value = "20:00";
  }

  if (periodInput) {
    periodInput.value = "1st Half";
  }

  updateAdminPreview();
  console.log("Sending updateScoreboard:", currentData);
  socket.emit("updateScoreboard", currentData);
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

window.addScore = addScore;
window.updateNames = updateNames;
window.setTimer = setTimer;
window.startGame = startGame;
window.stopGame = stopGame;
window.resetScores = resetScores;