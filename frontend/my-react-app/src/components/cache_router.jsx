import { useState, useEffect, memo, useContext, createContext, useCallback } from 'react'
import { useLocation, useParams } from 'react-router-dom';

const CacheContext = createContext();

//this stores and renders the cached pages
function CacheProvider({ children, max, scrollRestoration = true }) {
    const [cachedRoutes, setCachedRoutes] = useState([]);
    console.log("render");

    const setVisibility = useCallback((id, visible, element, params) => {
        setCachedRoutes(prev => {
            //create the page if it's not in the cache list yet, but only if setting to visible
            if (!prev.find(route => route.id === id)) {
                if (!visible) {
                    console.log(`attempted to make a not cached page ("${id}") invisible, nothing happened`);
                    return prev;
                }
                console.log(`creating and displaying cached page with id "${id}"`);
                const newRoutes = [...prev, { id, visible, element, params }];
                //limit the length of the cached pages
                if (newRoutes.length > max)
                    return newRoutes.slice(-max);
                return newRoutes;
            }
            else {//set the visibility of an existing page
                //remove the selected route from the array, and put it into a variable
                let selected;
                const filtered = prev.filter(route => {
                    //if id equal with the selected id, filter this out and set it to the "selected" variable
                    if (route.id === id) {
                        selected = route;
                        return false;
                    }
                    return true;
                });

                //alter the selected route
                selected.visible = visible;
                console.log(`setting the visibility of cached route ("${id}") to ${visible}`)

                //save scroll if hiding
                if (!visible)
                    selected.scroll = window.scrollY;

                //put it back into the array
                //it will become the last element independently from its previous location
                return [...filtered, selected];
            }
        });
    }, [cachedRoutes]);

    //scroll restoration
    useEffect(() => {
        if (!scrollRestoration)
            return;

        //find the active page
        const selected = cachedRoutes.find((route) => route.visible);

        //reset the scroll when no cached page active
        if (!selected)
            return window.scrollTo(0, 0);

        //scroll to the saved value
        const scroll = selected.scroll ? selected.scroll : 0;
        console.log(`restoring scroll of cached page ("${selected.id}") to "${scroll}"`)
        window.scrollTo(0, scroll);
    }, [cachedRoutes])

    //render all cached pages, but set their display to none or block depending on their visible value
    //if a not cached route is active, none of the cached pages are visible
    //the "routes" component in the children will render the selected not cached route
    return (
        <CacheContext.Provider value={{
            setVisibility
        }}>
            {children}
            {
                cachedRoutes.map(route => (
                    <div style={{ display: route.visible ? "block" : "none" }} key={route.id}>
                        <ParamsContext.Provider value={route.params}>
                            <VisibleContext.Provider value={route.visible}>
                                <RouteMemo element={route.element} id={route.memo} />
                            </VisibleContext.Provider>
                        </ParamsContext.Provider>
                    </div>
                ))
            }
        </CacheContext.Provider>
    );
}

//memo to prevent re-rendering the cached routes
const RouteMemo = memo(({ id, element }) => {
    return element;
},
    (prev, next) => prev.id === next.id);

function CacheRoute(props) {
    //get the unique id of the current url
    const { pathname, search } = useLocation();
    const currentId = pathname + "?" + search;

    //the routes must be separated by keys otherwise react will not call useeffect when switching between routes
    return (<InnerCache id={currentId} key={currentId} {...props} />)
}

//cacheroute and innercache is separated only because of the key
function InnerCache({ id, element }) {
    const cacheContext = useContext(CacheContext);
    const { setVisibility } = cacheContext;

    const params = useParams();

    useEffect(() => {
        setVisibility(id, true, element, params);
        return () => { setVisibility(id, false) };
    }, []);

    //return nothing. the element will be rendered by the cache provider
}

const ParamsContext = createContext({});
//useParams does not works because it os provided by the route, this must be used instead
function useParamsCached() {
    return useContext(ParamsContext);
}

const VisibleContext = createContext(false);
//get if the cached route is visible or not
function useVisible() {
    return useContext(VisibleContext);
}

export { CacheProvider, CacheRoute, useParamsCached, useVisible };