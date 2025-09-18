import axios from "axios";
import { useNavigate } from "react-router-dom";

const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("token", token);

      // Call backend logout API
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/");
    } catch (err) {
      console.error(
        "Logout failed:",
        err.response?.data?.message || err.message
      );
    }
  };

  return { logout };
};

export default useLogout;
