import React, { useState, useRef } from "react";
import { commandsManager } from "../../services/commandsManager";

export default function SendMessages({
  socket,
  nickname,
  setNickname,
  currentRoom,
  setCurrentRoom,
}) {
  const [message, setMessage] = useState("");
  const input = useRef(null);
  const regexCommand =
    /^[/](nick|msg|users|list|create|delete|join|leave)+(\s?\w?)/gi;
  const commands = [
    {
      name: "/nick",
      pattern: "nickname",
      description: "définit le surnom de l’utilisateur au sein du serveur",
    },
    {
      name: "/list",
      pattern: "string",
      description:
        "liste les channels disponibles sur le serveur. N’affiche que les channels contenant la chaîne 'string' si celle-ci est spécifiée.",
    },
    {
      name: "/create",
      pattern: "channel",
      description: "créer un channel sur le serveur",
    },
    {
      name: "/delete",
      pattern: "channel",
      description: "suppression du channel sur le serveur",
    },
    {
      name: "/join",
      pattern: "channel",
      description: "rejoint un channel sur le serveur",
    },
    { name: "/leave", pattern: "channel", description: "quitte le channel" },
    {
      name: "/users",
      description: "liste les utilisateurs connectés au channel",
    },
    {
      name: "/msg",
      pattern: "nickname message",
      description: "envoie un message à un utilisateur spécifique",
    },
  ];
  const handlePress = (e) => {
    if (e.key === "\n") {
      setMessage(message + "\n");
    } else if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const autoCompleteInput = (name) => {
    input.current.focus();
    setMessage(name + " ");
  };

  const sendMessage = () => {
    if (message !== "") {
      let args = message.split(/(\s+)/).filter((e) => e.trim().length > 0);
      if (message.match(regexCommand)) {
        commandsManager(
          args,
          socket,
          nickname,
          setNickname,
          currentRoom,
          setCurrentRoom
        );
      } else {
        const timestamp = Date.now();
        //console.log(nickname);
        let msg = {
          private: false,
          to: null,
          id: socket.id,
          nickname,
          message,
          timestamp,
        };
        //console.log(msg);
        socket.emit("sendMessage", msg);
      }
      setMessage("");
    }
  };

  return (
    <div className="chat_input dropup">
      <button
        type="button"
        id="commands-button"
        className="btn dropdown-toggle"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        Commands
      </button>
      <ul
        className="dropdown-menu"
        id="commands-menu"
        style={{ width: "25vw" }}
      >
        {commands.map((obj, i) => {
          return (
            <li key={i}>
              <div
                className="cursor dropdown-item text-wrap commands-option"
                onClick={() => {
                  autoCompleteInput(obj.name);
                }}
              >
                <p className="commands description mb-1">
                  <strong>{obj.name}</strong>
                  <em> {obj.pattern} </em>:
                </p>
                <p className="commands-description description lh-1 mb-2">
                  {obj.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <textarea
        ref={input}
        type="text"
        className="mx-2"
        id="messageInput"
        placeholder="Enter message"
        onChange={(e) => setMessage(e.target.value)}
        onFocus={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => handlePress(e)}
        value={message}
      />
      <button
        id="send_message_btn"
        className="send_message_btn"
        onClick={sendMessage}
      >
        SEND
      </button>
    </div>
  );
}
