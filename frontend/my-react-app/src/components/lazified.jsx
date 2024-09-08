import React, { Suspense } from "react";
import { Loading } from "/src/components/utilities";

function Sus({ children }) {
    return (
        <Suspense fallback={<Loading />}>
            {children}
        </Suspense>
    );
}

export { Sus };