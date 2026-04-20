const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json({ limit: "10mb" }));

let scoreboard = {
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

io.on("connection", (socket) => {
  console.log("User connected");

  socket.emit("scoreboardUpdate", scoreboard);

  socket.on("updateScoreboard", (data) => {
    console.log("updateScoreboard received:", data);
    scoreboard = { ...scoreboard, ...data };
    io.emit("scoreboardUpdate", scoreboard);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Running on port ${PORT}`);
});