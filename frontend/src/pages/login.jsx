import { useForm } from "react-hook-form";
import logo from "../assets/8068a5d1-45c9-4364-8cf9-68f180c1ec93.png";
import api from "../../api/axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store/authSlice";


const Login = () => {

  const { register, handleSubmit } = useForm();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch()
  const navigate = useNavigate()

const user = useSelector((state)=> state.auth.user)
const isLoggined = Boolean(user)
useEffect(() => {
  if (isLoggined) {
    navigate("/");
  }
}, [isLoggined, navigate]);


  const submit = async (data) => {
    try {
      setLoading(true)
      const res = await api.post("/auth/login", data);
      console.log("Login success:", res.data);
      dispatch(setUser(res.data.user))
      window.location.href = "/";
    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message)
      }
      else {
        setError("Unable to login")
      }
    } finally {
      setLoading(false)
    }

  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-500 via-indigo-500 to-purple-600">

      <div className="backdrop-blur-xl bg-white/90 p-8 rounded-3xl shadow-2xl max-w-sm w-full">

        <div className="flex justify-center mb-3">
          <img
            src={logo}
            alt="logo"
            className="h-16 w-16"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800">
          Welcome Back
        </h2>

        <p className="text-sm text-center text-gray-500 mb-6">
          Login to continue chatting
        </p>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">

          <div>
            <label className="text-sm font-medium text-gray-700">
              Username
            </label>

            <input
              {...register("userName")}
              disabled={loading}
              type="text"
              placeholder="Enter your username"
              required
              className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              {...register("password")}
              disabled={loading}
              type="password"
              placeholder="Enter your password"
              required
              className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
            />
          </div>

          <p className="text-red-500 text-sm text-center mb-2">
            {error}
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-indigo-500 to-blue-500 text-white py-2.5 rounded-xl font-semibold hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
          >

            {loading ? "Logging In..." : "Login"}

          </button>

        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don’t have an account?
          <span className="text-indigo-600 font-medium cursor-pointer hover:underline ml-1"
            onClick={() => { navigate("/signup") }}
          >
            Signup
          </span>
        </p>

      </div>

    </div>
  );



}
export default Login