import React, { useEffect, useState } from "react";

export default function RoomsList({
  socket,
  nickname,
  currentRoom,
  setCurrentRoom,
}) {
  const [roomsList, setRoomsList] = useState([]);
  const handleChangeRoom = (room) => {
    if (room !== currentRoom) {
      socket.emit("updateRooms", room);
      setCurrentRoom(room);
    }
  };
  const handleDeleteRoom = (room) => {
    if (room === currentRoom) {
      socket.emit("updateRooms", "general");
      setCurrentRoom("general");
      socket.emit("deleteRoom", room);
    }
  };
  useEffect(() => {
    socket.on("updateRooms", function (rooms, newRoom) {
      setRoomsList(rooms);
    });
    return () => socket.off("updateRooms");
  }, [socket]);
  return (
    <div id="active_rooms_list" className="active_rooms_list">
      {roomsList &&
        roomsList.map((room, i) => (
          <div key={i} className="room_container">
            <div
              className={`room_card ${
                room.name === currentRoom ? "active_item" : ""
              }`}
              onClick={(e) => {
                handleChangeRoom(room.name);
              }}
            >
              <div className="roomInfo">
                <span className="room_name">#{room.name}</span>
                <span className="room_owner">{room.owner}</span>
              </div>
              {room.owner === nickname ? (
                <div
                  className="room_delete"
                  onClick={(e) => {
                    handleDeleteRoom(room.name);
                  }}
                >
                  X
                </div>
              ) : null}
            </div>
          </div>
        ))}
    </div>
  );
}
