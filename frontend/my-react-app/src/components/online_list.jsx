import {
    useInfiniteQuery,
    useQueryClient
} from '@tanstack/react-query';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ThrowIfNotAxios } from "/src/communication.js";
import { Loading } from "/src/components/utilities";

const lastIndexes = {};

const OnlineList = forwardRef(({ exampleSize = 100, EntryMapper, getEntries, overscan = 5, id, getKey,scrollRestoration=true }, ref) => {
    //the unix timestamp when this list was created. it is used to filter out the contents those were created after the feed
    const startTimeRef = useRef(Math.floor(Date.now() / 1000));
    const listRef = useRef(null);
    const queryClient = useQueryClient();
    const [version, setVersion] = useState(0);

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
    const allRows = data ? data.pages.flatMap((d) => d.rows) : []

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

    //load the last rendered location
    useEffect(() => {
        const loaded = lastIndexes[id];
        if (loaded && scrollRestoration)
            virtualizer.scrollToIndex(loaded, { align: "middle" });
    }, [id, virtualizer,scrollRestoration]);

    //save the last rendered location
    useEffect(() => {
        if (items.length !== 0) {
            const row = items[Math.floor((items.length - 1) / 2)].index;
            lastIndexes[id] = row;
        }
    }, [items, id, overscan]);

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
                                        <EntryMapper entry={entry} index={virtualRow.index}/>
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
        if (rows.length === 0)//if fetched 0 posts, this is the end. nextOffset:null means hasNextPage will be false
            return { rows, nextOffset: null };
        return { rows, nextOffset: offset + rows.length };
    }
    catch (err) {
        ThrowIfNotAxios(err);
        return { rows: [], nextOffset: offset }
    };
}

export { OnlineList };
