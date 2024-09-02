import { useEffect, useRef } from "react";
import axios from "axios";

function ListenToStream(url, onData) {
    const first = useRef(true);
    useEffect(() => {
        //prevent double request
        if (first.current)
            first.current = false;
        else
            return;

        async function createEvents() {
            //const response = await fetch(url, {
            //    headers: {
            //        "Accept": "text/event-stream",
            //        'Content-Type': 'application/json'
            //    },
            //    credentials: 'include',
            //    mode: "cors",
            //});
            //
            //if (!response.ok) {
            //    throw Error(response.statusText());
            //}
            //
            //for (const reader = response.body.getReader(); ;) {
            //    const { value, done } = await reader.read();
            //
            //    if (done) {
            //        break;
            //    }
            //
            //    const chunk = new TextDecoder().decode(value);
            //    const subChunks = chunk.split(/(?<=})\n\ndata: (?={)/);
            //
            //    for (const subChunk of subChunks) {
            //        const payload = subChunk.replace(/^data: /, "");
            //        const data = JSON.parse(payload).chunk;
            //        onData(data);
            //    }
            //};
            axios.get(url, {
                headers: {
                    'Accept': 'text/event-stream',
                },
                responseType: 'stream',
                adapter: 'fetch', // <- this option can also be set in axios.create()
            })
                .then(async (response) => {
                    //console.log(`event stream started at "${url}"`);
                    const stream = response.data;

                    // consume response
                    const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
                    while (true) {
                        const { value, done } = await reader.read();
                        if (done) break;
                        onData(value);
                    }
                })
            // catch/etc.
        }
        createEvents();

        return (() => { });
    }, []);
}

export { ListenToStream };

