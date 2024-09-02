import { useQuery as useUrlQuery } from "/src/pages/search";
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { Suspense, useCallback, useContext, useEffect } from "react";
import { Loading } from "/src/components/utilities";
import axios from "axios";
import { Successpage, ErrorPageFormatted } from "/src/pages/error";
import { useNavigate } from "react-router-dom";
import { UserContext } from "/src/components/user_data";

export default () => {
    return (
        <Suspense fallback={<Loading />}>
            <ProcessCode />
        </Suspense>
    );
};

function ProcessCode() {
    const query = useUrlQuery();
    const code = query.get("code");
    const navigate = useNavigate();
    const { update } = useContext(UserContext);

    const codeToApi = useCallback(async () => {
        const res = await axios.post("/auth/google/process_code", { code });
        return res.data;
    });

    const { error } = useSuspenseQuery({
        queryKey: ['google_login'],
        queryFn: codeToApi,
        retry: false,
        staleTime: 3000
    });

    //if authenticated without error, return to the main page
    useEffect(() => {
        if (error)
            return;
        update().then(() => {
            navigate("/");
        });
    }, []);

    return (
        error ? <ErrorPageFormatted error={error} />
            : <Successpage text="Authentication successful. Redirecting to main page." />
    );
}

function LoginLink({ children }) {
    const getLink = useCallback(async () => {
        const res = await axios.get("/auth/google/url");
        return res.data;
    });

    const { data } = useQuery({
        queryKey: ['google_login_link'],
        queryFn: getLink,
        retry: false,
        staleTime: 0
    });

    return <a href={data ? data : "#"}>{children}</a>
}

export { LoginLink };