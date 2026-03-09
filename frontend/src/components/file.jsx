import { useEffect, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { useForm } from "react-hook-form";
import api from "../../api/axios";
import { useSelector } from "react-redux";

const AddFile = () => {
  const [open, setOpen] = useState(false);

  const clickHandler = (e) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };
  const { register, handleSubmit } = useForm()

  const user = useSelector((state) => state.auth.user);
  const chat = useSelector((state) => state.chat.selectedChat);

  const otherUser = chat?.participants?.find(
    (u) => u._id !== user?._id
  );

  const onSubmit = async (data) => {
    try {

      if (!otherUser?._id) return;
      const formData = new FormData();

      if (data.media) {
        for (let i = 0; i < data.media.length; i++) {
          formData.append("media", data.media[i]);
        }
      }
      
      formData.append("receiver", otherUser._id);

      const res = await api.post("/messages/send-media", formData)
      console.log(res.data.media)
      setOpen(false);
    } catch (error) {
  console.log(error.response?.data || error.message);
}

  }

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close)
  }, [])



  return (
    <div className="relative">

      {open && (
        <div
          className="absolute bottom-11 left-0 bg-gray-800 text-white rounded-xl shadow-lg p-2 flex flex-col gap-2 z-50 w-36"
          onClick={(e) => e.stopPropagation()}
        >


          <input
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            id="mediaInput"
            {...register("media", {
              onChange: handleSubmit(onSubmit)
            })}
          />

          <label
            htmlFor="mediaInput"
            className="hover:bg-gray-700 rounded text-left cursor-pointer p-1 block"
          >
            Photos/Videos
          </label>

        

        </div>
      )}


      <GrAttachment
        onClick={(e) => clickHandler(e)}
        className="text-purple-300 text-lg cursor-pointer hover:text-purple-400 transition"
      />
    </div>
  );
};

export default AddFile;