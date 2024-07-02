import React from "react";
import { Endpoint, FormatAxiosError, ThrowIfNotAxios } from "/src/communication.js";
import axios from 'axios';
import {SimplifiedPostList} from "/src/components/posts";
import {useLocation} from "react-router-dom";

// A custom hook that builds on useLocation to parse
// the query string for you.
function useQuery() {
    const { search } = useLocation();
  
    return React.useMemo(() => new URLSearchParams(search), [search]);
  }

export default ()=>{
    const query = useQuery();
    const text = query.get("q")

    return(
        text
    )
};