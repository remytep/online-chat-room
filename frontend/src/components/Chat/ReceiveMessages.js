import React, { useState, useEffect } from "react";

export default function ReceiveMessages({ socket, nickname, setNickname }) {
  const [messagesReceived, setMessagesReceived] = useState([]);
  useEffect(() => {
    socket.on("updateChat", (data) => {
      //console.log(data);
      setMessagesReceived((state) => [
        ...state,
        {
          private: data.private,
          to: data.to,
          message: data.message,
          id: data.id,
          nickname: data.nickname,
          timestamp: data.timestamp,
        },
      ]);
    });
    socket.on("newNickname", (data) => {
      //console.log(messagesReceived);
      let newArr = messagesReceived.map((message) => {
        if (message.id === data.id) {
          return { ...message, nickname: data.nickname };
        }
        return message;
      });
      console.log(newArr);
      setMessagesReceived(newArr);
    });
    return () => socket.off("updateChat");
  }, [socket, messagesReceived, setNickname]);
  const formatDateFromTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  return (
    <div>
      {messagesReceived &&
        messagesReceived.map((msg, i) =>
          msg.private ? (
            <div
              className={`message_holder${msg.nickname === nickname ? " me" : ""
                }`}
              key={i}
            >
              <div className="message_box">
                <div className="private message">
                  <div>
                    {msg.to === nickname ? (
                      <span className="message_name">From {msg.nickname}</span>
                    ) : (
                      <span className="message_name">To {msg.to} </span>
                    )}
                    <span className="message_time">
                      {formatDateFromTimestamp(msg.timestamp)}
                    </span>
                  </div>
                  <pre className="message_text text-start">{msg.message}</pre>
                </div>
              </div>
            </div>
          ) : msg.nickname === "ANNOUNCEMENT" ? (
            <div className="announcement" key={i}>
              <span>{msg.message}</span>
            </div>
          ) : (
            <div
              className={`message_holder${msg.nickname === nickname ? " me" : ""
                }`}
              key={i}
            >
              <div className="message_box">
                <div className="message">
                  <div>
                    <span className="message_name">{msg.nickname}</span>
                    <span className="message_time">
                      {formatDateFromTimestamp(msg.timestamp)}
                    </span>
                  </div>
                  <pre className="message_text text-start">{msg.message}</pre>
                </div>
              </div>
            </div>
          )
        )}
    </div>
  );
}
