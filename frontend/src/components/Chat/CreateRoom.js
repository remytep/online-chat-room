import React, { useState } from "react";
import { socket } from "../../services/socketio";

export default function CreateRoom({ socket, currentRoom, setCurrentRoom }) {
  const [newRoom, setNewRoom] = useState("");
  const handleNewRoomName = (e) => {
    setNewRoom(e.target.value.trim());
  };
  const handleCreateRoom = () => {
    if (newRoom !== "") {
      socket.emit("createRoom", newRoom);
      setNewRoom("");
    }
  };
  return (
    <div className="create_room">
      <input
        type="text"
        placeholder="Create room"
        onKeyPress={(e) => e.key === "Enter" ? handleCreateRoom() : ""}
        onChange={(e) => {
          handleNewRoomName(e);
        }}
        value={newRoom}
      />
      <button
        className="create_room_icon"
        onClick={(e) => {
          handleCreateRoom();
        }}
      >
        +
      </button>
    </div>
  );
}
