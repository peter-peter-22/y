
import config from "/src/components/config.js";

function LoginLink({ children }) {
    return <a href={`${config.address_mode.server}/google/auth`}>{children}</a>
}

export { LoginLink };