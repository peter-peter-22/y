import { useEffect, useRef } from "react";
import axios from "axios";
import { Endpoint, FormatAxiosError, ThrowIfNotAxios } from "/src/communication.js";
import fetchAdapter from "@shiroyasha9/axios-fetch-adapter";

function GetNotificationCount() {
    const first = useRef(true);
    useEffect(() => {
        //prevent double request
        if (first.current)
            first.current = false;
        else
            return;

        async function createEvents() {
            // const res = await axios.get(Endpoint("/member/notifications/events"), {
            //     withCredentials: true,
            //     headers: {
            //         'Accept': 'text/event-stream',
            //     },
            //     responseType: 'stream',
            //     adapter: fetchAdapter
            // });

            const response = await fetch(Endpoint("/member/notifications/events"), {
                headers: {
                    "Accept": "text/event-stream",
                },
                credentials: 'include'
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
                    console.log(JSON.parse(payload).chunk);
                }
            };
        };
        createEvents();

        return (() => { });
    }, []);

    return 0;
}

export { GetNotificationCount };