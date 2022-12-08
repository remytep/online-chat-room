import { useState } from "react";
import { SocketContext, socket } from "./services/socketio";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle";
import "./App.css";
import Home from "./components/Home";
import Chat from "./components/Chat/Chat";

function App() {
  const [nickname, setNickname] = useState("");
  const [currentRoom, setCurrentRoom] = useState("general");
  return (
    <SocketContext.Provider value={socket}>
      <Router>
        <div className="App">
          <Routes>
            <Route
              path="/"
              element={<Home nickname={nickname} setNickname={setNickname} />}
            />
            <Route
              path="/chat"
              element={
                <Chat
                  socket={socket}
                  nickname={nickname}
                  setNickname={setNickname}
                  currentRoom={currentRoom}
                  setCurrentRoom={setCurrentRoom}
                />
              }
            />
          </Routes>
        </div>
      </Router>
    </SocketContext.Provider>
  );
}

export default App;
