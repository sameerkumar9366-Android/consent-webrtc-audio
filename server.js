const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", socket => {
  socket.on("join", room => {
    room = String(room || "").trim().slice(0, 64);
    if (!room) return;
    socket.join(room);
    socket.to(room).emit("peer-joined");
  });

  socket.on("signal", ({ room, data }) => {
    if (room) socket.to(room).emit("signal", data);
  });

  socket.on("leave", room => {
    if (room) socket.leave(room);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
