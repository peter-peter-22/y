import { useEffect, useRef } from "react";

function ListenToStream(url, onData) {
    const first = useRef(true);
    useEffect(() => {
        //prevent double request
        if (first.current)
            first.current = false;
        else
            return;

        async function createEvents() {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Connection': 'keep-alive',
                    'Cache-Control': 'no-cache',
                },
                credentials: 'include',
                mode: "cors"
            });

            if (!response.ok) {
                throw Error(response.statusText());
            }

            for (const reader = response.body.getReader(); ;) {
                const { value, done } = await reader.read();

                if (done) {
                    break;
                }

                const chunk = new TextDecoder().decode(value);
                const subChunks = chunk.split(/(?<=})\n\ndata: (?={)/);

                for (const subChunk of subChunks) {
                    const payload = subChunk.replace(/^data: /, "");
                    const data = JSON.parse(payload).chunk;
                    onData(data);
                }
            };
        };
        createEvents();

        return (() => { });
    }, []);
}

export { ListenToStream };

