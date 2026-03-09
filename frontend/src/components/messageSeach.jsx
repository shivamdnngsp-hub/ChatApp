import { useEffect, useRef, useState } from "react";
import { CiSearch } from "react-icons/ci";
import api from "../../api/axios";
import { useDispatch, useSelector } from "react-redux";
import { setMessageResults } from "../store/messageSearchSlice";
import { RxCross2 } from "react-icons/rx";
const MessageSearch = () => {

  const [clicked, setClicked] = useState(false);
  const [query, setquery] = useState("")
  const selectedChat = useSelector((state) => state.chat.selectedChat)
  const [results, setResults] = useState([])
  const dispatch = useDispatch()
  const inputRef = useRef(null);

  const search = async (query) => {
    try {
      if (!selectedChat) return;

      const res = await api.get(`/messages/search/${selectedChat._id}?query=${query}`)
      setResults(res.data.map((msg) => msg._id))
      dispatch(
        setMessageResults(
          res.data
            .filter(msg => !msg.isDeleted)
            .map(msg => msg._id)
        )
      );


    } catch (error) {
      console.log("error in finding the messgae")
    }
  }

  useEffect(() => {

    const timer = setTimeout(() => {
      if (query.trim()) {
        search(query);
      } else {
        setResults([]);
        dispatch(setMessageResults([]));
      }
    }, 300);

    return () => clearTimeout(timer);

  }, [query]);


  useEffect(() => {
    console.log(results)
  }, [query])

  useEffect(() => {
    if (clicked && inputRef.current) {
      inputRef.current.focus();
    }
  }, [clicked]);

  return (
    <div className="flex items-center relative">

      {clicked && (
        <input
          value={query}
          ref={inputRef}
          onChange={(e) => setquery(e.target.value)}
          placeholder="Search..."
          className="bg-slate-800 text-white px-2 py-1 rounded-md 
          w-32 sm:w-40 md:w-56 outline-none transition-all duration-200"
        />
      )}

      {!clicked && <CiSearch
        onClick={() => setClicked(prev => !prev)}
        className="text-xl cursor-pointer hover:text-white ml-2"
      />}
      {clicked &&
        <RxCross2
          onClick={() => {
            setClicked(prev => !prev)
            setquery("")
          }
          }
          className="text-xl cursor-pointer hover:text-white ml-2"
        />
      }

    </div>
  );

}

export default MessageSearch