import React from "react";
import { useLocation } from "react-router-dom";

// A custom hook that builds on useLocation to parse
// the query string for you.
function useQuery() {
    const { search } = useLocation();

    return React.useMemo(() => new URLSearchParams(search), [search]);
}

function GetSearchText() {
    const query = useQuery();
    const text = query.get("q");
    return text;
}

function GetSearchUrl(text) {
    return "/search?q=" + text;
}

export { GetSearchText, GetSearchUrl, useQuery };
