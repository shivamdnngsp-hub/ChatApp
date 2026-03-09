import { useNavigate } from "react-router-dom";
import Search from "../components/Laptopsearch";
import SideBox from "../components/sideBox";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import ChatBox from "../components/chatBox";
import { CiSearch } from "react-icons/ci";
import Chats from "../components/chats";
import SearchResults from "../components/serachResults";
import { socket } from "../../socket/socket";
import api from "../../api/axios";
import { addOnlineUser, removeOnlineuser, setOnlineUsers } from "../store/onlineSlice";
import MobileSearch from "../components/mobileSearch";



const Home = () => {

  const user = useSelector(state => state.auth.user);
  console.log("home ran user is " + user)
  const selectedChat = useSelector(state => state.chat.selectedChat);

  const isLoggedIn = Boolean(user);
  const navigate = useNavigate();
  const openSearch = useSelector((state) => state.ui.openSearch)
  const dispatch = useDispatch();
  const onlineUsers = useSelector((state) => state.onlineUsers.users)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/signup");
    }

  }, [isLoggedIn, navigate]);


  useEffect(() => {
    if (!user?._id) return;

    socket.emit("join", user._id);
  }, [user?._id]);

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const res = await api.get("/user/online");
        dispatch(setOnlineUsers(res.data))
      } catch (err) {
        console.error("Failed to fetch online users", err);
      }
    };

    fetchOnlineUsers();
  }, []);


  useEffect(() => {
    socket.on("userOnline", (userId) => {
      dispatch(addOnlineUser(userId))
    })
    socket.on("userOffline", (userId) => {
      dispatch(removeOnlineuser(userId))
    })

    return () => {
      socket.off("userOnline");
      socket.off("userOffline");
    };


  }, [dispatch])


  useEffect(() => {
    console.log("Online users:", onlineUsers);
  }, [onlineUsers]);






  return (
    <div className="flex overflow-hidden" style={{ height: "100dvh" }}>


      <div
        className={`
      bg-[#1B1628] border-r border-[#2E2550]
      w-full min-[760px]:w-[35%]
      ${selectedChat ? "hidden min-[760px]:block" : "block"}
    `}
      >

        {/* for mobile  */}
        <div className="min-[760px]:hidden flex items-center justify-between px-4 py-3 
bg-[#141024] border-b border-[#2A2145]">
          <div className="flex justify-center items-center">
            <SideBox />

            <span className="text-white font-semibold text-lg tracking-wide ">
              Chatly
            </span>
          </div>

          <MobileSearch></MobileSearch>
        </div>



        {/* for laptop*/}
        <div className="hidden min-[760px]:flex items-center gap-3 p-4">
          <SideBox />
          <Search />
        </div>
        {!openSearch && <div className="p-4 text-gray-400">
          <Chats />
        </div>
        }

        {openSearch && <SearchResults />}

      </div>

      <div
        className={`
    bg-[#0F0B1A] text-gray-500
    flex-1 h-full
    ${selectedChat ? "block" : "hidden min-[760px]:block"}
  `}
      >
        <ChatBox />
      </div>


    </div>
  );
};

export default Home;