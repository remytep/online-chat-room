import React, { useEffect, useState } from "react";

export default function UsersList({ socket }) {
  const [usersList, setUsersList] = useState([]);
  useEffect(() => {
    socket.on("updateUsers", function (nicknames) {
      setUsersList(nicknames);
    });
    return () => socket.off("updateUsers");
  }, [socket, usersList]);
  //console.log(usersList);
  return (
    <div id="active_users_list" className="active_users_list">
      {usersList &&
        usersList.map((user, i) => (
          <div className="user_card" key={i}>
            <div className="pic"></div>
            <span>{user.nickname}</span>
          </div>
        ))}
    </div>
  );
}
