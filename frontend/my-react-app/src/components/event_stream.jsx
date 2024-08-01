import { useEffect, useRef } from "react";
import axios from "axios";
import {  FormatAxiosError, ThrowIfNotAxios } from "/src/communication.js";
import fetchAdapter from "@shiroyasha9/axios-fetch-adapter";
import config from "/src/components/config.js";

function ListenToStream( url, onData ) {
    const first = useRef(true);
    useEffect(() => {
        //prevent double request
        if (first.current)
            first.current = false;
        else
            return;

        async function createEvents() {
            const response = await fetch(config.address_mode.server+"/"+ url, {
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
                    const data = JSON.parse(payload).chunk;
                    onData(data);
                }
            };
        };
        createEvents();

        return (() => { });
    }, []);
}

export {ListenToStream};
