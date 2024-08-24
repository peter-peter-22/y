import { HideablePostMemo } from "/src/components/posts";
import List from '@mui/material/List';
import { ExamplePost } from "/src/components/exampleData.js";
import { useCallback, useState } from "react";
import { OnlineList } from "/src/components/online_list";

function normal() {
    const [version, setVersion] = useState(0);

    const update = useCallback(() => setVersion(prev => prev++));

    const posts = new Array(20).fill(ExamplePost());
    return (
        <>
            <button onClick={update} style={{ margin: 20 }}>update</button>
            <List sx={{ p: 0 }} key={version}>
                {posts.map((post, i) => <HideablePostMemo key={i} entry={post} />)}
            </List>
        </>
    );
}

function virtual() {
    const getPosts=useCallback(()=>{return new Array(20).fill(ExamplePost());});
    
    return (
        <OnlineList
            getEntries={getPosts }
            EntryMapper={HideablePostMemo}
            id={"test"}
            exampleHeight={100}
        />
    );
}

export default virtual;