import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../services/socketio";

export default function Home({ nickname, setNickname }) {
  const navigate = useNavigate();
  const [error, setError] = useState();
  const socket = useContext(SocketContext);
  const joinRoom = () => {
    if (nickname !== "") {
      socket.emit("checkUser", nickname);

      socket.on("userChecked", (user) => {
        if (user === null) {
          socket.emit("createUser", nickname);
          navigate("/chat", { replace: true, state: { nickname } });
        } else {
          setError("This name is already taken.");
        }
      });
    }
  };

  return (
    <div className="chat_login">
      <div className="logo_text">
        <span>
          Online<span className="colored">ChatRoom</span>
        </span>
      </div>
      <div className="nickname_input">
        <input
          placeholder="Enter Nickname"
          onKeyPress={(e) => (e.key === "Enter" ? joinRoom() : "")}
          onChange={(e) => {
            setNickname(e.target.value);
          }}
        />
        <button className="join_message_btn" onClick={joinRoom}>
          Join Room
        </button>
      </div>
      {error && <p className="text-start text-danger">{error}</p>}
    </div>
  );
}
