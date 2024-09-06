import { Typography } from '@mui/material';
import {
    useInfiniteQuery,
    useQueryClient
} from '@tanstack/react-query';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Loading, AboveBreakpoint } from "/src/components/utilities";


const lastIndexes = {};

//convert the data of the query to an array of readable entries 
function defaultEntryArranger(data) {
    return data.pages.flatMap((d) => d.rows)
}

const OnlineList = forwardRef(({ exampleSize = 100, EntryMapper, getEntries, overscan = 5, id, getKey, scrollRestoration = true, virtualizerProps, entryArranger = defaultEntryArranger, Displayer = DefaultDisplayer }, ref) => {
    //the unix timestamp when this list was created. it is used to filter out the contents those were created after the feed
    const startTimeRef = useRef(Math.floor(Date.now() / 1000));
    const listRef = useRef(null);
    const queryClient = useQueryClient();
    const [version, setVersion] = useState(0);
    const addMargin = !AboveBreakpoint("bottomTabs");

    //update the virtualized rows
    const update = useCallback(() => setVersion(prev => prev + 1));

    //handle infinite list queries
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

    //array of all rows generated from the infinite list data
    const allRows = data ? entryArranger(data) : []

    //external functions
    useImperativeHandle(ref, () => ({
        AddEntryToTop(newEntry) {
            queryClient.setQueryData([id], (data) => {
                const topPage = data.pages[0]
                topPage.rows = [newEntry, ...topPage.rows];

                return {
                    pages: data.pages,
                    pageParams: data.pageParams
                }
            });
            update();
        },

        update,

        mapRows(fn) {
            queryClient.setQueryData([id], (data) => {
                return {
                    pages: data.pages.map(page => {
                        page.rows = page.rows.map(row => fn(row))
                        return page;
                    }),
                    pageParams: data.pageParams
                }
            });
            update();
        }
    }));

    //handle virtualizer
    const virtualizer = useWindowVirtualizer({
        count: hasNextPage ? allRows.length + 1 : allRows.length,
        estimateSize: () => exampleSize,
        overscan: overscan,
        scrollMargin: listRef.current?.offsetTop ?? 0,
        getItemKey: getKey ? (i) => getKey(allRows[i], i) : undefined,
        ...virtualizerProps
    })

    //the visible rows
    const items = virtualizer.getVirtualItems();

    //fetch the next page when reached the bottom
    useEffect(() => {
        //the last visible item
        const [lastItem] = [...items].reverse()

        if (!lastItem) {
            return
        }

        //if there are no more invisible items after this one, and there is a next page, and currently not fetching, fetch the next page 
        if (
            lastItem.index >= allRows.length - 1 &&
            hasNextPage &&
            !isFetchingNextPage &&
            !error
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

    //load the last rendered location
    useEffect(() => {
        if (!scrollRestoration)
            return;

        const loaded = lastIndexes[id];
        setTimeout(() => {
            console.log("loaded " + loaded + " rows: " + allRows.length);
            if (allRows.length === 0)
                window.scrollTo(0, 0);
            else
                virtualizer.scrollToIndex(loaded ? loaded : 0, { align: "middle" });
        }, 100);
    }, []);

    //save the last rendered location
    useEffect(() => {
        console.log(`items: ${items.length}`)
        if (items.length !== 0) {
            const row = items[Math.floor((items.length - 1) / 2)].index;
            if (row < 20)
                return;
            console.log("saved " + row);
            lastIndexes[id] = row;
        }
    }, [items]);


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
                        marginBottom: addMargin ? 70 : 0
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
                        <Displayer items={items} allRows={allRows} virtualizer={virtualizer} EntryMapper={EntryMapper} hasNextPage={hasNextPage} />
                    </div>
                </div>
            )}
        </div>
    )
});

function DefaultDisplayer({ items, allRows, virtualizer, EntryMapper, hasNextPage }) {
    return items.map((virtualRow) => {
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
                    <EntryMapper entry={entry} index={virtualRow.index} />
                }
            </div>
        )
    })
}

async function fetchServerPage(getEntries, offset = 0, timestamp) {
    const rows = await getEntries(offset, timestamp);
    if (rows.length === 0)//if fetched 0 posts, this is the end. nextOffset:null means hasNextPage will be false
        return { rows, nextOffset: null };
    return { rows, nextOffset: offset + rows.length };
}

export { OnlineList };

