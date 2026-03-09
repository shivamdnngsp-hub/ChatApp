import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../api/axios";
import { socket } from "../../socket/socket";
import { removeSelectedMessage, setSelectedMessage } from "../store/selectedMessgaeSlice";


const ChatSpace = () => {

  const selectedChat = useSelector((state) => state.chat.selectedChat);
  const user = useSelector((state) => state.auth.user);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);

  const dispatch = useDispatch()
  const selectedMessage = useSelector(state => state.selectedMessage.selected)
  const messageSearchResults = useSelector(
    state => state.messageSearchResults.results
  );

  const otherUser = selectedChat?.participants?.find(
    (u) => u._id.toString() !== user?._id?.toString()
  );

  const bottomRef = useRef(null);

  useEffect(() => {
    if (!selectedChat?._id) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);

        const res = await api.get(
          `/messages/fetchmessage/${selectedChat._id}`
        );



        setMessages(res.data);

      } catch (error) {
        console.log(error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

  }, [selectedChat?._id]);


  const handelSelection = (e, msg) => {
    e.preventDefault();
    e.stopPropagation();

    const alreadySelected = selectedMessage.some(
      m => m._id === msg._id
    );

    if (alreadySelected) {
      dispatch(removeSelectedMessage(msg._id));
    } else {
      dispatch(setSelectedMessage(msg));
    }
  };




  useEffect(() => {
    if (!selectedChat?._id) return;

    const handleNewMessage = (message) => {
      if (message.chatId?.toString() === selectedChat._id?.toString()) {
        setMessages((prev) => [...prev, message]);
        socket.emit("seenMessages", { chatId: selectedChat._id });
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => socket.off("newMessage", handleNewMessage);
  }, [selectedChat?._id]);


  useEffect(() => {
    const handleAiTyping = ({ chatId, status }) => {
      if (chatId?.toString() !== selectedChat?._id?.toString()) return;

      setAiTyping(status);
    };

    socket.on("aiTyping", handleAiTyping);

    return () => socket.off("aiTyping", handleAiTyping);
  }, [selectedChat?._id]);




  useLayoutEffect(() => {
    if (messages.length === 0) return;

    const scrollContainer = bottomRef.current?.parentElement?.parentElement;
    if (!scrollContainer) return;

    requestAnimationFrame(() => {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    });

  }, [messages]);


  useEffect(() => {
    const handleSeen = ({ chatId }) => {
      if (chatId?.toString() !== selectedChat?._id?.toString()) return;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId?.toString() === user._id?.toString()
            ? { ...msg, seen: true }
            : msg
        )
      );
    };

    socket.on("messagesSeen", handleSeen);

    return () => socket.off("messagesSeen", handleSeen);
  }, [selectedChat?._id, user._id]);


  useEffect(() => {
    const handleDeletedMessages = (delMsg) => {
      setMessages(prev =>
        prev.filter(msg =>
          !delMsg.some(del => del._id === msg._id)
        )
      );
    };

    const handleDeleteForEveryone = (delMsg) => {
      setMessages(prev =>
        prev.map(msg =>
          delMsg.some(del => del._id === msg._id)
            ? { ...msg, isDeleted: true }
            : msg
        )
      );
    };

    socket.on("messagesDeleted", handleDeletedMessages);
    socket.on("messagesDeletedForEveryone", handleDeleteForEveryone)
    return () => {
      socket.off("messagesDeleted", handleDeletedMessages);
      socket.off("messagesDeletedForEveryone", handleDeleteForEveryone);
    };

  }, []);

  useEffect(() => {
    const handleChatCleared = (chatId) => {
      console.log("CHAT CLEARED EVENT RECEIVED", chatId);
      if (chatId === selectedChat?._id) {
        setMessages([]);
      }
    };
    socket.on("chatCleared", handleChatCleared);
    return () => {
      socket.off("chatCleared", handleChatCleared);
    };

  }, [selectedChat]);




  return (
    <>
      <div className="p-3 space-y-2 pb-10">
        {loading && (
          <div className="flex justify-center items-center h-full">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            Start a conversation 🚀
          </p>
        )}

        {!loading && messages.map((msg) => {
          const isMe = msg.senderId?.toString() === user._id?.toString();
          const time = new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          });
          const containInSearch = messageSearchResults.includes(msg._id)
          const highlight = containInSearch ? "ring-5 ring-yellow-400" : "";
          const ismessgaeSelected = selectedMessage.includes(msg)
          const messageSelectedUi = ismessgaeSelected ? "ring-4 ring-purple-400 bg-white/10" : "";
          return (

            <div
              key={msg._id}
              onContextMenu={(e) => handelSelection(e, msg)}

              className={`px-4 py-2 rounded-2xl w-fit max-w-[75%] text-sm ${highlight}
              ${isMe
                  ? "bg-linear-to-r from-indigo-500 to-purple-600 text-white ml-auto shadow-lg"
                  : "bg-[#1e293b]/80 text-gray-200 border border-[#2d3b52]"
                }
              ${messageSelectedUi
                }
              `}
            >
              <div className={msg.isDeleted ? "italic text-gray-400 text-sm" : ""}>
                {msg.isDeleted ? "This message was deleted" : msg.text}
              </div>

              {msg.media?.length > 0 && (
                <div className="mt-1 space-y-2">
                  {msg.media.map((m, i) =>
                    m.filetype === "video" ? (
                      <video
                        key={i}
                        src={m.url}
                        controls
                        className="rounded-xl max-h-60 w-full object-cover"
                      />
                    ) : (
                      <img
                        key={i}
                        src={m.url}
                        className="rounded-xl max-h-60 w-full object-cover"
                        loading="lazy"
                      />
                    )
                  )}
                </div>
              )}

              {!isMe && (
                <div className="text-[10px] text-right mt-1 opacity-80">
                  <span className="time">{time}</span>
                </div>
              )

              }

              {isMe && (
                <div className="text-[10px] text-right mt-1 opacity-80">
                  <span className="time mr-1">{time}</span>

                  {msg.seen ? (
                    <span className="text-blue-300">✔✔</span>
                  ) : (
                    <span className="text-gray-300">✔</span>
                  )}

                </div>
              )}
            </div>
          );
        })}
        {aiTyping && otherUser?.isAI &&(
          <div className="bg-[#1e293b]/80 text-gray-200 border border-[#2d3b52] px-4 py-2 rounded-2xl w-fit text-sm italic animate-pulse">
            Chatly AI is typing...
          </div>
        )}

        <div ref={bottomRef} />
      </div>



    </>
  );
};

export default ChatSpace;
