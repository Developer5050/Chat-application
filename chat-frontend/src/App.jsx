import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import Signup from "./pages/signup/Signup";
import ChatUi from "./pages/chatUi/ChatUi";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chat-ui" element={<ChatUi />}/>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
