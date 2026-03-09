import { useDispatch } from "react-redux";
import { onlogout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useState } from "react";
import { setSelectedChat } from "../store/chatSlice";

const Logout = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
const [loading, setLoading] = useState(false)
const logout = async () => {
  try {
    setLoading(true);
    await api.post("/auth/logout");
   dispatch(setSelectedChat(null))
    dispatch(onlogout());
    navigate("/login");
  } catch (error) {
    console.log("Unable to logout");
  } finally {
    setLoading(false);
  }
};


  return (
   <button
  onClick={logout}
  disabled={loading}
  className="
    px-5 py-2.5
    rounded-xl
    font-semibold
    text-white
    bg-linear-to-r from-red-500 to-pink-500
    hover:scale-105
    hover:shadow-lg
    transition-all duration-200
    disabled:opacity-60
    disabled:cursor-not-allowed
  "
>
  {loading ? "Logging out..." : "Logout"}
</button>

  );
};

export default Logout;
