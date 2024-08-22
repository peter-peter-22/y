import { alpha, Box, Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import axios from 'axios';
import Moment from "moment";
import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Link, NavLink } from "react-router-dom";
import { ThrowIfNotAxios } from "/src/communication.js";
import { TopMenuButton } from "/src/components/buttons.jsx";
import { Media, MediaDisplayer, MediaFromFileData, mediaTypes } from "/src/components/media.jsx";
import { ClickableSingleImageContainer } from "/src/components/post_media";
import { OpenOnClick } from "/src/components/posts";
import {
    QueryClient,
    QueryClientProvider,
    useInfiniteQuery,
} from '@tanstack/react-query';
import { Loading } from "/src/components/utilities";
import { useVirtualizer, useWindowVirtualizer } from '@tanstack/react-virtual'

const OnlineList = forwardRef(({ exampleSize = 100, EntryMapper, getEntries, overscan = 5, id }, ref) => {
    const startTimeRef = useRef(Math.floor(Date.now() / 1000));//the unix timestamp when this list was created. it is used to filter out the contents those were created after the feed
    const listRef = useRef(null)

    const {
        status,
        data,
        error,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery({
        queryKey: [id],
        queryFn: (ctx) => fetchServerPage(getEntries, ctx.pageParam, startTimeRef.current),
        getNextPageParam: (lastGroup) => lastGroup.nextOffset,
        initialPageParam: 0,
    })

    const allRows = data ? data.pages.flatMap((d) => d.rows) : []

    useImperativeHandle(ref, () => ({
        AddEntryToTop(newEntry) {
            // setEntries((prev) => [newEntry, ...prev]);
            console.log(newEntry);
        }
    }));

    const virtualizer = useWindowVirtualizer({
        count: hasNextPage ? allRows.length + 1 : allRows.length,
        estimateSize: () => exampleSize,
        overscan: overscan,
        scrollMargin: listRef.current?.offsetTop ?? 0,
    })

    const items = virtualizer.getVirtualItems();

    useEffect(() => {
        const [lastItem] = [...items].reverse()

        if (!lastItem) {
            return
        }

        if (
            lastItem.index >= allRows.length - 1 &&
            hasNextPage &&
            !isFetchingNextPage
        ) {
            fetchNextPage()
        }
    }, [
        hasNextPage,
        fetchNextPage,
        allRows.length,
        isFetchingNextPage,
        items
    ]);

    return (
        <div key={id} ref={listRef}>
            {status === 'pending' ? (
                <Loading />
            ) : status === 'error' ? (
                <span>Error: {error.message}</span>
            ) : (
                <div
                    style={{
                        height: `${virtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${(items[0]?.start ?? 0) - virtualizer.options.scrollMargin}px)`,
                        }}
                    >
                        {items.map((virtualRow) => {
                            const isLoaderRow = virtualRow.index > allRows.length - 1
                            const entry = allRows[virtualRow.index]

                            return (
                                <div
                                    key={virtualRow.key}
                                    data-index={virtualRow.index}
                                    ref={virtualizer.measureElement}
                                >
                                    {isLoaderRow
                                        ? hasNextPage
                                            ? <Loading />
                                            : 'Nothing more to load'
                                        :
                                        <EntryMapper entry={entry} />
                                    }
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
});

async function fetchServerPage(getEntries, offset = 0, timestamp) {
    try {
        const rows = await getEntries(offset, timestamp);
        if(rows.length===0)//if fetched 0 posts, this is the end. nextOffset:null means hasNextPage will be false
            return{rows, nextOffset:null};
        return { rows, nextOffset: offset + rows.length };
    }
    catch (err) {
        ThrowIfNotAxios(err);
        return { rows: [], nextOffset: offset }
    };
}

export {  OnlineList };