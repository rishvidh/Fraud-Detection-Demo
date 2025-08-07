import React, { useState } from "react";
import AdminView from "./components/AdminView";
import UserView from "./components/UserView";
import Login from "./components/Login";
import "./App.css";

function App() {
  const [user, setUser] = useState(null); // { username, password, role, ccNum }

  if (!user) {
    return <Login setUser={setUser} />;
  }

  return (
    <div className="container">
      <h1>Fraud Detection Demo</h1>
      <button className="logout-btn" onClick={() => setUser(null)}>
        Logout
      </button>
      {user.role === "admin" ? (
        <AdminView auth={user} />
      ) : (
        <UserView cc_num={user.cc_num} name={user.name} auth={user} />
      )}
    </div>
  );
}

export default App;
