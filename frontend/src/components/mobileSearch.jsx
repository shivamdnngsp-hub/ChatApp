import { IoSearch, IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { closeSerachScreen, openSearchScreen } from "../store/uiSlice";
import { useState, useEffect } from "react";
import api from "../../api/axios";
import { setResults } from "../store/resultSlice";

const MobileSearch = () => {

  const dispatch = useDispatch();
  const openSearch = useSelector((state) => state.ui.openSearch);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchResult = async () => {
    try {

      if (query.trim().length <= 2) return;

      setLoading(true);

      const res = await api.get(`/search/input?q=${query}`);
      dispatch(setResults(res.data));

    } catch (error) {
      console.log("error fetching search results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    if (!query) {
      dispatch(setResults([]));
      return;
    }

    const timer = setTimeout(fetchResult, 400);
    return () => clearTimeout(timer);

  }, [query]);



  return (
    <>
      {!openSearch && (
        <IoSearch
          className="text-white text-xl cursor-pointer min-[760px]:hidden"
          onClick={() => dispatch(openSearchScreen())}
        />
      )}

      {openSearch && (
        <div className="fixed top-0 left-0 w-full p-3 bg-[#12071f] z-50 flex items-center gap-2 min-[760px]:hidden">

          <div className="relative flex-1">

            <input
              autoFocus
              type="text"
              value={query}
              placeholder="Search chats..."
              className="
                w-full
                bg-[#18122B] text-white placeholder:text-[#9A8FBF]
                px-4 py-2.5 pr-10 rounded-xl
                border border-[#2E2550]
                outline-none focus:border-[#7C4DFF]
              "
              onChange={(e) => setQuery(e.target.value)}
            />

           
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}

          </div>

          <IoClose
            className="text-white text-2xl cursor-pointer"
            onClick={() => {
              dispatch(closeSerachScreen());
              setQuery("");
            }}
          />

        </div>
      )}
    </>
  );
};

export default MobileSearch;