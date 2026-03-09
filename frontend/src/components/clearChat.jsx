import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import api from "../../api/axios";

const ClearChat = () => {

  const selectedChat = useSelector((state) => state.chat.selectedChat);
  const [dropBoxOpen, setOpen] = useState(false);

  const handleClearChat = async () => {
    try {

      if (!selectedChat?._id) return;

      await api.delete("/messages/deleteallforme", {
        data: { chatId: selectedChat._id }
      });

      setOpen(false);

    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  useEffect(() => {

    const handleClick = () => {
      setOpen(false);
    };

    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
    };

  }, []);

  return (
    <div className="relative">

      <BsThreeDotsVertical
        className="text-lg cursor-pointer hover:text-white"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      />

      {dropBoxOpen && (
        <div className="absolute right-0 top-8 w-40 bg-slate-800 border border-slate-700 rounded shadow-lg">

          <button
            className="px-4 py-2 text-sm text-white hover:bg-slate-700 w-full text-left"
            onClick={(e) => {
              e.stopPropagation();
              handleClearChat();
            }}
          >
            Clear Chat
          </button>

        </div>
      )}

    </div>
  );
};

export default ClearChat;