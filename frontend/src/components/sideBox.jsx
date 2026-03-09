import { useState } from "react";
import { IoReorderThreeOutline, IoCloseOutline } from "react-icons/io5";
import Logout from "./logout";
import { useSelector } from "react-redux";

const SideBox = () => {

  const [clicked, setClicked] = useState(false);
  const user = useSelector((state) => state.auth.user);

  return (
    <>

      
      <div
        className="p-2 rounded-lg hover:bg-[#2E2550] cursor-pointer transition duration-200 active:scale-95"
        onClick={() => setClicked(true)}
      >
        <IoReorderThreeOutline size={26} className="text-white" />
      </div>

     
      <div
        onClick={() => setClicked(false)}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300
        ${clicked ? "opacity-100 visible" : "opacity-0 invisible"}`}
      />

     
      <div
        className={`fixed top-0 left-0 h-screen w-[75%] max-w-75
        bg-[#2E2550] z-50 p-4 shadow-xl border-r border-[#3c2f66]
        transform transition-transform duration-300 ease-in-out
        ${clicked ? "translate-x-0" : "-translate-x-full"}`}
      >

       
        <div
          className="absolute top-3 right-3 cursor-pointer"
          onClick={() => setClicked(false)}
        >
          <IoCloseOutline size={26} className="text-white" />
        </div>


        
        <div className="flex items-center gap-3 mt-10">

         
          <div className="w-12 h-12 rounded-full bg-linear-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            {user?.userName?.charAt(0).toUpperCase()}
          </div>

         
          <p className="text-white font-semibold">
            {user?.userName}
          </p>

        </div>


      
        <div className="mt-10">
          <Logout />
        </div>

      </div>
    </>
  );
};

export default SideBox;