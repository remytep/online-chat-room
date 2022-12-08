const express = require("express");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "random";
const http = require("http");
const socketio = require("socket.io");
const app = express();
const httpServer = http.createServer(app);
const io = new socketio.Server(httpServer);

const CHAT_BOT = "ANNOUNCEMENT";
let users = [];
let rooms = [{ name: "general", owner: "" }];
let lastMsg = [];

io.on("connection", (socket) => {
  console.log("User connected to the server. Socket ID : " + socket.id);

  socket.onAny(() => {
    if (lastMsg) {
      lastMsg.map((msg) => {
        let diff = Math.abs(new Date() - msg.timestamp) / 1000;
        // let timeLastMsg = diff % 60;
        let timeLastMsg = Math.floor(diff / 86400);
        console.log(timeLastMsg)
        //si personne n'y a écrit depuis 2 jours on supprime le channel
        if (timeLastMsg >= 2) {
          let timestamp = Date.now();
          rooms = rooms.filter(
            (room) => room.name !== msg.room
          );
          lastMsg = lastMsg.filter(
            (message) => msg.room !== message.room
          )
          io.sockets.emit("updateRooms", rooms, null)
          io.sockets.emit("updateChat", {
            private: false,
            message: "The channel #" + msg.room + " has been automatically deleted.",
            to: null,
            nickname: CHAT_BOT,
            timestamp,
          });
        }
      })
    }
  })


  socket.on("checkUser", (nickname) => {
    let sameUser = users.find((user) => user.nickname === nickname);
    socket.emit("userChecked", sameUser);
  });

  // User creation
  socket.on("createUser", (nickname) => {
    socket.nickname = nickname;
    let timestamp = Date.now();
    if (!users.find((user) => user.nickname === nickname)) {
      users.push({ id: socket.id, nickname: nickname });
      console.log(`User ${nickname} has been succesfully created.`);
      socket.emit("updateChat", {
        private: false,
        message: "You have joined general.",
        to: null,
        nickname: CHAT_BOT,
        timestamp,
      });
      socket.broadcast.to("general").emit("updateChat", {
        private: false,
        message: nickname + " has joined general.",
        to: null,
        nickname: CHAT_BOT,
        timestamp,
      });
    }
    socket.currentRoom = "general";
    socket.join(socket.currentRoom);
    io.sockets.emit("updateUsers", users);
    socket.emit("updateRooms", rooms, "general");
  });

  // Envoi de message
  socket.on("sendMessage", (data) => {
    if (lastMsg.find(msg => msg.room === socket.currentRoom)) {
      lastMsg.map((msg) => {
        if (msg.room === socket.currentRoom) {
          msg.timestamp = data.timestamp;
        }
      })
    }
    else {
      lastMsg.push({ room: socket.currentRoom, timestamp: data.timestamp });
    }
    io.sockets.to(socket.currentRoom).emit("updateChat", data);
  });

  // Creation de room
  socket.on("createRoom", (room) => {
    let timestamp = Date.now();
    let roomExists = rooms.find((obj) => obj.name === room);
    console.log(roomExists);
    if (room != null && !roomExists) {
      rooms.push({ name: room, owner: socket.nickname });
      io.sockets.emit("updateRooms", rooms, null);
      socket.emit("updateChat", {
        private: false,
        message: "You have created #" + room + ".",
        to: null,
        nickname: CHAT_BOT,
        timestamp,
      });
      socket.broadcast.emit("updateChat", {
        private: false,
        message: socket.nickname + " has created #" + room + ".",
        to: null,
        nickname: CHAT_BOT,
        timestamp,
      });
      console.log(`User ${socket.nickname} has created #${room}.`);
    } else if (roomExists) {
      io.to(socket.id).emit("updateChat", {
        private: false,
        message: "The channel #" + room + ` already exists.`,
        to: null,
        nickname: CHAT_BOT,
        timestamp,
      });
    }
  });

  socket.on("deleteRoom", (room) => {
    let timestamp = Date.now();
    let roomExists = rooms.find((obj) => obj.name === room);
    if (room != null && roomExists && roomExists.owner === socket.nickname) {
      rooms = rooms.filter(
        (obj) => obj.name !== room
      );
      io.sockets.emit("updateRooms", rooms, null);
      console.log(`User ${socket.nickname} has deleted #${room}.`);
      socket.emit("updateChat", {
        private: false,
        message: "You have deleted #" + room + ".",
        to: null,
        nickname: CHAT_BOT,
        timestamp,
      });
      socket.broadcast.emit("updateChat", {
        private: false,
        message: socket.nickname + " has deleted #" + room + ".",
        to: null,
        nickname: CHAT_BOT,
        timestamp,
      });
    } else if (roomExists) {
      io.to(socket.id).emit("updateChat", {
        private: false,
        message: "You cannot delete #" + room + ".",
        to: null,
        nickname: CHAT_BOT,
        timestamp,
      });
    } else if (!roomExists) {
      io.to(socket.id).emit("updateChat", {
        private: false,
        message: "#" + room + " doesn't exist.",
        to: null,
        nickname: CHAT_BOT,
        timestamp,
      });
    }
  });

  // Changement de room
  socket.on("updateRooms", (room) => {
    let timestamp = Date.now();
    if (socket.currentRoom !== "") {
      socket.broadcast.to(socket.currentRoom).emit("updateChat", {
        private: false,
        message: socket.nickname + " left the room",
        nickname: CHAT_BOT,
        timestamp,
      });
      socket.leave(socket.currentRoom);
    }
    socket.currentRoom = room;
    socket.join(room);
    socket.emit("updateChat", {
      private: false,
      message: "You have joined " + room + ".",
      to: null,
      nickname: CHAT_BOT,
      timestamp,
    });
    socket.broadcast.to(room).emit("updateChat", {
      private: false,
      message: socket.nickname + " has joined " + room + ".",
      to: null,
      nickname: CHAT_BOT,
      timestamp,
    });
  });

  // /join Rejoint un channel
  socket.on("joinRoom", (room) => {
    let timestamp = Date.now();
    let roomExists = rooms.find((obj) => obj.name === room);
    if (roomExists) {
      if (socket.currentRoom !== "") {
        socket.emit("updateChat", {
          private: false,
          message: "You have left " + socket.currentRoom + ".",
          to: null,
          nickname: CHAT_BOT,
          timestamp,
        });
        socket.broadcast.to(socket.currentRoom).emit("updateChat", {
          private: false,
          message: socket.nickname + " left " + socket.currentRoom,
          nickname: CHAT_BOT,
          timestamp,
        });
        socket.leave(socket.currentRoom);
      }
      socket.join(room);
      socket.currentRoom = room;
      socket.emit("joinedRoom", room);
      socket.emit("updateChat", {
        private: false,
        message: "You have joined " + room + ".",
        to: null,
        nickname: CHAT_BOT,
        timestamp,
      });
      socket.broadcast.to(room).emit("updateChat", {
        private: false,
        message: socket.nickname + " has joined " + room + ".",
        to: null,
        nickname: CHAT_BOT,
        timestamp,
      });
    } else {
      io.to(socket.id).emit("updateChat", {
        private: false,
        message: "#" + room + " doesn't exist.",
        to: null,
        nickname: CHAT_BOT,
        timestamp,
      });
    }
  });
  // /leave Leave un channel
  socket.on("leaveRoom", (room) => {
    let timestamp = Date.now();
    let roomExists = rooms.find((obj) => obj.name === room);
    if (roomExists) {
      socket.emit("updateChat", {
        private: false,
        message: "You have left " + socket.currentRoom + ".",
        to: null,
        nickname: CHAT_BOT,
        timestamp,
      });
      socket.broadcast.to(room).emit("updateChat", {
        private: false,
        message: socket.nickname + " left " + room,
        nickname: CHAT_BOT,
        timestamp,
      });
      socket.currentRoom = "";
      socket.leave(room);
    }
  });

  // Deconnexion
  socket.on("disconnect", function () {
    let timestamp = Date.now();
    console.log(`User ${socket.nickname} disconnected from server.`);
    /*     delete nicknames[socket.nickname]; */
    users = users.filter((user) => user.nickname !== socket.nickname);
    io.sockets.emit("updateUsers", users);
    socket.broadcast.emit("updateChat", {
      private: false,
      message: socket.nickname + " has disconnected",
      to: null,
      nickname: CHAT_BOT,
      timestamp,
    });
  });

  // /nick Changement de nickname
  socket.on("changeNickname", (data) => {
    let timestamp = Date.now();
    const { new_nickname, id } = data;
    users.map((user) => {
      if (user.id === id) {
        user.nickname = new_nickname;
      }
    });
    io.sockets.emit("updateChat", {
      private: false,
      nickname: CHAT_BOT,
      message: socket.nickname + " renamed himself " + new_nickname,
      to: null,
      timestamp,
    });
    socket.nickname = new_nickname;
    io.sockets.emit("newNickname", {
      id: socket.id,
      nickname: socket.nickname,
    });
    //on actualise la liste des utilisateur coté client
    io.sockets.emit("updateUsers", users);
    // console.log(data);
  });

  // /msg Messages privés
  socket.on("sendPrivate", function (data) {
    const { to, message, timestamp } = data;
    //console.log(data);
    users.map((user) => {
      if (user.nickname === to) {
        //l'evenement est recu uniquement par l'expediteur et le destinataire
        io.to(user.id).to(socket.id).emit("updateChat", {
          private: true,
          to: to,
          nickname: socket.nickname,
          message: message,
          timestamp,
        });
      }
    });
  });

  // /users Recupere la liste des utilisateurs
  socket.on("getUsers", async () => {
    console.log(socket.currentRoom);
    const sockets = await io.in(socket.currentRoom).fetchSockets();
    let timestamp = Date.now();
    let allnicknames = [];
    for (const socket of sockets) {
      allnicknames.push(socket.nickname);
    }

    io.emit("updateChat", {
      private: false,
      message: `Users in #${socket.currentRoom} : ` + allnicknames.join(", "),
      to: null,
      nickname: CHAT_BOT,
      timestamp,
    });
  });

  // /list recupère la liste des channels
  socket.on("getRooms", (data) => {
    let timestamp = Date.now();
    const { pattern } = data;
    let roomsByPattern = [];
    rooms.map((room) => {
      if (room.name.toLowerCase().includes(pattern.toLowerCase())) {
        roomsByPattern.push(room.name);
      }
    });
    if (roomsByPattern.length > 0) {
      socket.emit("updateChat", {
        private: false,
        nickname: CHAT_BOT,
        message: `Rooms containing '${pattern}' : ` + roomsByPattern.join(", "),
        to: null,
        nickname: CHAT_BOT,
        timestamp,
      });
    } else {
      socket.emit("updateChat", {
        private: false,
        nickname: CHAT_BOT,
        message: `No rooms contains '${pattern}'`,
        to: null,
        nickname: CHAT_BOT,
        timestamp,
      });
    }
  });
});

httpServer.listen(3000, () => {
  console.log("listening on *:3000");
});
