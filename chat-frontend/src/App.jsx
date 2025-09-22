import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";

const Login = lazy(() => import("./pages/login/Login"));
const Signup = lazy(() => import("./pages/signup/Signup"));
const ChatUi = lazy(() => import("./pages/chatUi/ChatUi"));

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chat-ui" element={<ChatUi />} />
        </Routes>
      </Suspense>

      {/* Toast container yahan add karna zaroori hai */}
      {/* <ToastContainer
        position="top-right" // Position (top-right, top-center, bottom-left etc.)
        autoClose={3000} // 3 seconds me close hoga
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored" // light, dark, colored
      /> */}
      <Toaster position="top-right" reverseOrder={false} />
    </BrowserRouter>
  );
};

export default App;
