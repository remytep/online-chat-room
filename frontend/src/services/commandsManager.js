export function commandsManager(
  args,
  socket,
  nickname,
  setNickname,
  currentRoom,
  setCurrentRoom
) {
  switch (args[0]) {
    case "/nick":
      if (args[1]) {
        setNickname(args[1]);
        socket.emit("changeNickname", { id: socket.id, new_nickname: args[1] });
      }
      break;
    case "/list":
      if (args[1]) {
        socket.emit("getRooms", { pattern: args[1] });
      }
      break;
    case "/create":
      if (args[1]) {
        socket.emit("createRoom", args[1]);
      }
      break;
    case "/delete":
      if (args[1]) {
        socket.emit("deleteRoom", args[1]);
      }
      break;
    case "/join":
      if (args[1]) {
        socket.emit("joinRoom", args[1]);
        socket.on("joinedRoom", (room) => {
          setCurrentRoom(room);
        })
      }
      break;
    case "/leave":
      if (args[1]) {
        socket.emit("leaveRoom", args[1]);
        setCurrentRoom("");
      }
      break;
    case "/users":
      socket.emit("getUsers");
      break;
    case "/msg":
      if (args[2]) {
        let to = args[1];
        let completeMsg = args;
        //on enleve la commande et le nom de l'utilsateur du tableau
        completeMsg.splice(0, 2);
        let msg = {
          private: true,
          nickname,
          to,
          message: completeMsg.join(" "),
          timestamp: Date.now(),
        };
        console.log(msg);
        socket.emit("sendPrivate", msg);
      }
      break;
    default:
  }
}
