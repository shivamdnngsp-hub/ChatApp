import { useSelector } from "react-redux"
import ChatHead from "./ChatHead"
import ChatBar from "./chatBar";
import ChatSpace from "./chatSpace";
import { useEffect } from "react";
import { socket } from "../../socket/socket";
import DeleteMessage from "./deleteMessage";

const ChatBox = () => {
    const selectedChat = useSelector((state) => state.chat.selectedChat);

  const user = useSelector((state) => state.auth.user);   
  const selectedMessage = useSelector(state => state.selectedMessage.selected)

  useEffect(() => {
    if (!selectedChat?._id || !user?._id) return;

    console.log("Emitting seenMessages:", selectedChat._id);
    socket.emit("seenMessages", { chatId: selectedChat._id });
  }, [selectedChat?._id, user?._id]);  


    return (
        <>
            {!selectedChat && (
                <div className="flex justify-center items-center w-full h-full">
                    select chat to start messaging
                </div>
            )}

           {selectedChat && (
<div className="flex flex-col h-full">

  <ChatHead />

  <div className="flex-1 overflow-y-auto ultra-thin-scroll">
    <ChatSpace />
  </div>



{selectedMessage?.length ===  0 ? <ChatBar /> : <DeleteMessage/>}




</div>



)}
        </>

    )

}
export default ChatBox