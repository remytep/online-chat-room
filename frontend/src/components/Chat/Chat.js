import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateRoom from "./CreateRoom";
import ReceiveMessages from "./ReceiveMessages";
import RoomsList from "./RoomsList.js";
import SendMessages from "./SendMessages";
import UsersList from "./UsersList";

export default function Chat({
  socket,
  nickname,
  setNickname,
  currentRoom,
  setCurrentRoom,
}) {
  const navigate = useNavigate();
  useEffect(() => {
    if (nickname === "") {
      navigate("/", { replace: true });
    }
  }, [navigate, nickname]);
  return (
    <div className="chat_app">
      <div id="sidebar" className="left_sidebar">
        <div className="logo_text">
          <span>
            O<span className="colored">RC</span>
          </span>
        </div>
        <span className="room_label">Rooms</span>
        <RoomsList
          socket={socket}
          nickname={nickname}
          currentRoom={currentRoom}
          setCurrentRoom={setCurrentRoom}
        />
        <CreateRoom
          socket={socket}
          currentRoom={currentRoom}
          setCurrentRoom={setCurrentRoom}
        />
      </div>
      <div className="chat_area">
        <div className="chat_bg">
          <div id="chat" className="chat">
            <ReceiveMessages
              socket={socket}
              nickname={nickname}
              setNickname={setNickname}
            />
          </div>
          <SendMessages
            socket={socket}
            nickname={nickname}
            setNickname={setNickname}
            currentRoom={currentRoom}
            setCurrentRoom={setCurrentRoom}
          />
        </div>
      </div>
      <div className="right_sidebar">
        <span className="user_label">Users</span>
        <UsersList socket={socket} />
      </div>
    </div>
  );
}
