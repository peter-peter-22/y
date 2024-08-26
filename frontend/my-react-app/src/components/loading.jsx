import React from "react";
import {  logo } from '/src/components/utilities';

export default () => {
    return (
        <div style={{
            height: "100vh",
            width: "100vw",
            backgroundColor: "black",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <img src={logo} style={{
                height: "80px",
                filter: "invert(1)"
            }} />
        </div>
    );
}