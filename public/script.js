const socket = io();
let celebrationTimeout = null;

socket.on("connect", () => {
  console.log("Display connected to server");
});

socket.on("scoreboardUpdate", (data) => {
  console.log("Display received scoreboard update:", data);

  const homeTeam = document.getElementById("homeTeam");
  const awayTeam = document.getElementById("awayTeam");
  const homeScore = document.getElementById("homeScore");
  const awayScore = document.getElementById("awayScore");
  const timer = document.getElementById("timer");
  const period = document.getElementById("period");
  const homeLogo = document.getElementById("homeLogo");
  const awayLogo = document.getElementById("awayLogo");

  if (homeTeam) homeTeam.textContent = (data.homeTeam || "HOME").toUpperCase();
  if (awayTeam) awayTeam.textContent = (data.awayTeam || "AWAY").toUpperCase();

  if (homeScore) homeScore.textContent = String(data.homeScore ?? 0).padStart(2, "0");
  if (awayScore) awayScore.textContent = String(data.awayScore ?? 0).padStart(2, "0");

  if (timer) timer.textContent = data.timer || "20:00";
  if (period) period.textContent = (data.period || "1st Half").toUpperCase();

  if (homeLogo && data.homeLogo) homeLogo.src = data.homeLogo;
  if (awayLogo && data.awayLogo) awayLogo.src = data.awayLogo;

  if (data.homeColor) {
    document.documentElement.style.setProperty("--home-color", data.homeColor);
  }

  if (data.awayColor) {
    document.documentElement.style.setProperty("--away-color", data.awayColor);
  }
});

socket.on("showCelebration", (data) => {
  const overlay = document.getElementById("celebrationOverlay");
  const text = document.getElementById("celebrationText");

  if (!overlay || !text) return;

  text.textContent = (data.text || "TRY!").toUpperCase();

  if (data.color) {
    text.style.textShadow = `
      0 0 12px #fff,
      0 0 24px ${data.color},
      0 0 40px ${data.color}
    `;
  } else {
    text.style.textShadow = `
      0 0 12px #fff,
      0 0 24px #facc15,
      0 0 40px #f97316
    `;
  }

  overlay.classList.remove("hidden");

  if (celebrationTimeout) {
    clearTimeout(celebrationTimeout);
  }

  celebrationTimeout = setTimeout(() => {
    overlay.classList.add("hidden");
  }, data.duration || 3000);
});