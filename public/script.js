const socket = io();

socket.on("connect", () => {
  console.log("Display connected to server");
});

socket.on("scoreboardUpdate", (data) => {
  console.log("Display received scoreboard update:", data);

  document.getElementById("homeTeam").textContent = data.homeTeam;
  document.getElementById("awayTeam").textContent = data.awayTeam;
  document.getElementById("homeScore").textContent = data.homeScore;
  document.getElementById("awayScore").textContent = data.awayScore;
  document.getElementById("timer").textContent = data.timer;
  document.getElementById("period").textContent = data.period;

  document.getElementById("homeBar").style.background = data.homeColor || "#2563eb";
  document.getElementById("awayBar").style.background = data.awayColor || "#dc2626";

  const homeLogo = document.getElementById("homeLogo");
  const awayLogo = document.getElementById("awayLogo");
  const homePlaceholder = document.getElementById("homeLogoPlaceholder");
  const awayPlaceholder = document.getElementById("awayLogoPlaceholder");

  if (data.homeLogo) {
    homeLogo.src = data.homeLogo;
    homeLogo.style.display = "block";
    homePlaceholder.style.display = "none";
  } else {
    homeLogo.style.display = "none";
    homePlaceholder.style.display = "block";
  }

  if (data.awayLogo) {
    awayLogo.src = data.awayLogo;
    awayLogo.style.display = "block";
    awayPlaceholder.style.display = "none";
  } else {
    awayLogo.style.display = "none";
    awayPlaceholder.style.display = "block";
  }
});