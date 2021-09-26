require('dotenv').config()
const express = require('express')
const http = require('http')
const app = express()

const server = http.createServer(app)
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

app.set("socketio", io)

io.on("connection", socket => {
  socket.emit("socket connected")
  socket.on("request", () => {
    io.emit("request received")
  })
})

const SOCKET_PORT = process.env.SOCKET_PORT || 4000
server.listen(SOCKET_PORT, () => {
  console.log(`Socket server running on port ${SOCKET_PORT}`)
})