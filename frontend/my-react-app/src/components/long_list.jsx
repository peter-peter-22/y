import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState, useCallback } from 'react';
import List from '@mui/material/List';

function LongList({ entries, startindex = 0, EntryMapper, getKey = (entry, index) => index, stepCount = 1, exampleHeight = 150, overFill = 100 }) {
    const [start, setStart] = useState({ real: 0, target: 0 });
    const [end, setEnd] = useState({ real: 0, target: 0 });
    const listRef = useRef(null);
    const itemsRef = useRef(null);
    const updateRef = useRef();
    updateRef.current = { start, end, entries, startindex };
    const anchorRef = useRef(null);
    anchorRef.current = anchors(itemsRef?.current);

    //convert the start and end index to a array that react can map
    const displayed = sequence(start.real, end.real);

    useEffect(() => {
        tryMoveStart(0);
        tryMoveEnd(0);
    }, [entries, startindex]);

    const tryMoveStart = useCallback((move) => {
        setStart((prev) => {
            const target = prev.real + move;
            const real = Math.max(target, startindex);
            //console.log(`start was moved. target:${target} real:${real}`);
            return { real, target };
        })
    });

    const tryMoveEnd = useCallback((move) => {
        setEnd((prev) => {
            const target = prev.real + move;
            const real = Math.min(target, updateRef.current.entries.length - updateRef.current.startindex);
            //console.log(`end was moved. target:${target} real:${real} entries:${updateRef.current.entries.length}`);
            return { real, target };
        })
    });

    //listen to scroll event
    useEffect(() => {
        window.addEventListener("scroll", Scrolling);
        Scrolling();
        return () => {
            window.removeEventListener("scroll", Scrolling)
        };
    }, [])

    //add or remove rows to keep them inside the visible area
    const Scrolling = useCallback(() => {
        //both ends of the list must overfill
        const { isOverfillBottom, isOverfillTop } = isOverfill(listRef.current, overFill);

        //add or remove elements at the bottom
        if (!isOverfillBottom) {//add if overfill is not enough
            //console.log(`not enough overfill on bottom, expanding list`)
            tryMoveEnd(stepCount);
        }
        //else {//remove from bottom if more than one step of rows are overfilling
        //    const chosenIndex = endsRef.current.end.real - stepCount - 2;
        //    const chosenElement = itemsRef.current[chosenIndex];
        //    if (chosenElement) {
        //        const chosenOverfill = isOverfill(chosenElement, overFill);
        //        if (chosenOverfill.isOverfillBottom) {
        //            console.log(`too much overfill on bottom, shrinking list`)
        //            tryMoveEnd(-stepCount);
        //        }
        //    }
        //}

        //add or remove elements at the top
        if (!isOverfillTop) {//add if overfill is not enough
            console.log(`not enough overfill on top, expanding list`)
            tryMoveStart(-stepCount);
        }
        else {//remove from top if more than one step of rows are overfilling
            const chosenIndex = updateRef.current.start.real + stepCount;
            const chosenElement = itemsRef.current[chosenIndex];
            if (chosenElement) {
                const chosenOverfill = isOverfill(chosenElement, overFill);
                if (chosenOverfill.isOverfillTop) {
                    console.log(`too much overfill on top, shrinking list`)
                    tryMoveStart(stepCount);
                }
            }
        }
    });

    useEffect(() => {
        use_anchors(anchorRef);
        Scrolling();
    }, [start.real, end.real]);

    return (
        <Displayer
            exampleHeight={exampleHeight}
            start={start.real}
            end={end.real}
            startindex={startindex}
            entries={entries}
            displayed={displayed}
            EntryMapper={EntryMapper}
            getKey={getKey}
            ref={{ itemsRef, listRef }}
        />
    );
}

function use_anchors(items, anchorsRef) {
    if (!anchorsRef?.current)
        return;

    for (const a in anchorsRef.current) {
        const row = items[a.index];
        if (row) {
            const diff = row.getBoundingClientRect().top - a.top;
            window.scrollY(diff);
            anchorsRef.current = null;
            console.log("el: " + a.el);
            return;
        }
    }
}
function anchors(items) {
    if (!items || items.length === 0) return null;
    const indexes = Object.keys(items);
    try {
        return [anchor(items, indexes[1]), anchor(items, indexes[indexes.length - 1])];
    }
    catch { }
    debugger
}
function anchor(items, index) {
    const el = items[index];
    if (!el)
        return;
    return { el, index, top: el.getBoundingClientRect().top };
}

function isOverfill(element, overFill) {
    const rect = element.getBoundingClientRect();

    const overFillBottom = rect.bottom - window.innerHeight;
    const overFillTop = -rect.top;

    const isOverfillBottom = overFillBottom > overFill;
    const isOverfillTop = overFillTop > overFill;
    return { isOverfillBottom, isOverfillTop, overFillBottom, overFillTop };
}

const Displayer = forwardRef(({ exampleHeight, start, end, startindex, entries, displayed, EntryMapper, getKey }, refs) => {
    const { itemsRef, listRef } = refs;
    itemsRef.current = [];
    return (
        <div style={{
            paddingTop: exampleHeight * (start - startindex),
            paddingBottom: exampleHeight * ((entries.length - startindex) - end)
        }}>
            <List
                style={{
                    padding: 0,
                }}
                ref={listRef}
            >
                {displayed.map((index) => {
                    const entry = entries[index];
                    return (
                        <div ref={el => itemsRef.current[index] = el} key={getKey(entry, index)}>
                            <EntryMapper entry={entry} />
                        </div>
                    );
                })}
            </List>
        </div>
    );
})

const DisplayerMemo = memo((props) => <Displayer {...props} />, (prev, next) => prev.displayed === next.displayed && prev.entries === next.entries);

function sequence(fromInclusive, toExclusive) {
    return Array(toExclusive - fromInclusive).fill().map((_, i) => i + fromInclusive);
}


export { LongList };