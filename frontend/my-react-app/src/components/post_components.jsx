import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const postListContext = createContext();
let setPostList;
function SetPostList(value) {
    setPostList(value);
}
function PostListProvider({ children }) {
    const [get, set] = useState();
    setPostList = set;
    return <postListContext.Provider value={get}>{children}</postListContext.Provider>
}
function UsePostList() {
    return useContext(postListContext);
}

function OpenOnClick(props) {
    const navigate = useNavigate();
    function Clicked(e) {
        e.stopPropagation();
        navigate(props.link);
    }
    return (
        <div onClick={Clicked} {...props}>
            {props.children}
        </div>
    );
}

function PostModalFrame(props) {
    return (
        <div style={{ width: "500px", padding: "20px", maxWidth: "100%", boxSizing: "border-box" }}>
            {props.children}
        </div>
    );
}

export { OpenOnClick, PostListProvider, PostModalFrame, SetPostList, UsePostList };
