import { useSelector } from "react-redux";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoArrowBack } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { setSelectedChat } from "../store/chatSlice";
import MessageSearch from "./messageSeach";
import { useEffect, useState } from "react";
import ClearChat from "./clearChat";


const ChatHead = () => {

    const selectedChat = useSelector((state) => state.chat.selectedChat);
    const user = useSelector((state) => state.auth.user)
    const onlineUsers = useSelector((state) => state.onlineUsers.users)
    const dispatch = useDispatch();


    const otherUser = selectedChat?.participants?.find(
        (u) => u._id !== user._id
    );
    const isOnline = onlineUsers.includes(otherUser._id);
const isAi = otherUser?.isAI

    return (
        <div className="w-full h-16 px-4 flex items-center z-50 justify-between border-b border-slate-800 bg-slate-900">

            {selectedChat && (

                <>
                    <div className="flex items-center gap-3 mr-2">


                        <IoArrowBack
                            onClick={() => dispatch(setSelectedChat(null))}
                            className="min-[760px]:hidden text-white text-xl cursor-pointer"
                        />

                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-pink-500
                            flex items-center justify-center text-white font-semibold">
                            {otherUser.userName?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <p className="text-white font-medium leading-tight">
                                {otherUser.userName}
                            </p>
                            <p className="text-xs text-green-400">
                                {isOnline || isAi ? "online" : "offline"}
                            </p>
                        </div>

                    </div>


                    <div className="flex items-center gap-2 text-slate-300">

                        <MessageSearch></MessageSearch>

                        <div className="relative" onClick={((e) => {
                           e.stopPropagation();
                            setOpen(prev => !prev)
                        })}>
                          
                <ClearChat></ClearChat>
                        </div>

                  
                    </div>

                </>
            )}

        </div>
    );
};

export default ChatHead;
