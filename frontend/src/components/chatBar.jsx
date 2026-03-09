
import { CiFaceSmile } from "react-icons/ci";
import { FaMicrophone } from "react-icons/fa6";
import { IoSend } from "react-icons/io5";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useSelector } from "react-redux";
import AddFile from "./file";
import EmojiPicker from "emoji-picker-react";


const ChatBar = () => {

    const [text, setText] = useState("");

    const user = useSelector((state) => state.auth.user);
    const chat = useSelector((state) => state.chat.selectedChat);
    const [showEmojiPicker, setEmojiPicker] = useState(false)

    const otherUser = chat?.participants?.find(
        (u) => u._id !== user._id
    );

    const aiChatBot = otherUser?.isAI;
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const sendMessage = async () => {
        try {

            if (!otherUser?._id) {
                console.log("No receiver selected");
                return;
            }

            if (!text.trim()) return;

            const messageText = text;
            setText("");


            await api.post("/messages/send", { receiver: otherUser._id, text: messageText });
        } catch (error) {
            console.log("error in sending message", error);
        }
    };


    const handelEmojiPicker = (e) => {
        e.stopPropagation();
        setEmojiPicker((prev) => !prev);
    }


    useEffect(() => {
        const close = () => setEmojiPicker(false);
        window.addEventListener("click", close);
        return () => {
            window.removeEventListener("click", close);
        };
    }, []);
    const handleEmojiClick = (emojiData) => {
        setText((prev) => prev + emojiData.emoji);
    };


    return (
        <div className="
  w-full h-16
  bg-linear-to-r from-[#12071f] via-[#1b0f2e] to-[#12071f]
  border-t border-[#2a1845]
  flex items-center px-4 gap-3
  backdrop-blur-md
">


            {!aiChatBot && <AddFile />}
            {aiChatBot && (
                <span className="text-xs text-purple-400 ml-2">
                    AI
                </span>
            )}

            <input
                type="text"
                value={text}
                onKeyDown={handleKeyDown}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="
          flex-1
          bg-[#0f071a]
          text-gray-200
          rounded-full
          px-4 py-2
          outline-none
          placeholder-gray-500
          border border-[#2a1845]
          focus:border-purple-500
          focus:ring-1 focus:ring-purple-500
        "
            />

            <div className="relative"
                onClick={() => e.stopPropagation()}
            >

                <CiFaceSmile
                    className="text-purple-300 text-xl cursor-pointer
    hover:text-purple-400 transition"
                    onClick={(e) => handelEmojiPicker(e)}
                />

                {showEmojiPicker && (
                    <div className="absolute bottom-12 right-0 z-50">
                        <EmojiPicker
                            onEmojiClick={(emojiData, event) => {
                                event.stopPropagation();
                                handleEmojiClick(emojiData);
                            }}
                            height={320}
                            width={300}
                            previewConfig={{ showPreview: false }}
                        />
                    </div>
                )}

            </div>





            <IoSend
                className={`text-xl transition ${text.trim().length > 0
                    ? "text-purple-500 cursor-pointer hover:scale-110"
                    : "text-gray-400 cursor-not-allowed opacity-50"
                    }`}
                onClick={(e) => {
                    e.stopPropagation();
                    if (text.trim().length === 0) return;
                    sendMessage();
                }}
            />

        </div>
    );
};

export default ChatBar;
