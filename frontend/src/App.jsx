import { Routes, Route } from "react-router-dom";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Home from "./pages/home";
import { useEffect } from "react";
import api from "../api/axios";
import { useDispatch } from "react-redux";
import { onlogout, setUser } from "./store/authSlice";
function App() {
const dispatch = useDispatch()
console.log("app ran")
useEffect(() => {

  const fetchUser = async () => {
    try {

      const res = await api.get("/user/me");
      dispatch(setUser(res.data));
      console.log("app ran user is  "+ res.data);
    } catch (error) {

      dispatch(onlogout());
      console.log("User not logged in");

    }
  };

  fetchUser();

}, [dispatch]);


    return (
        <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
                 <Route path="/" element={<Home />} />
                 
        </Routes>
    )

}

export default App