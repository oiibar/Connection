const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const PORT = 10000;
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins
    credentials: true,
    methods: ["GET", "POST"],
  },
});

const users = [];

io.on("connection", (socket) => {
  socket.on("adduser", (username) => {
    socket.user = username;
    users.push(username);
    io.sockets.emit("users", users);

    io.to(socket.id).emit("private", {
      id: socket.id,
      name: socket.user,
      msg: "secret message",
    });
  });

  socket.on("message", (message) => {
    io.sockets.emit("message", {
      message,
      user: socket.user,
      id: socket.id,
    });
  });

  socket.on("disconnect", () => {
    console.log(`user ${socket.user} is disconnected`);
    if (socket.user) {
      users.splice(users.indexOf(socket.user), 1);
      io.sockets.emit("users", users); // Corrected event name
      console.log("remaining users:", users);
    }
  });
});

server.listen(PORT, () => {
  console.log("listening on PORT:", PORT);
});
