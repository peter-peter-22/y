import React, { useState, useEffect, memo } from "react";
import Stack from '@mui/material/Stack';
import { Inside } from "./side_menus.jsx";
import { TopMenu } from '/src/components/utilities';
import { SearchField } from "/src/components/inputs.jsx";
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { ThemeProvider } from '@mui/material';
import { ResponsiveSelector, ProfileText, FadeLink, creation, FollowDialog, LinelessLink, Loading, AboveBreakpoint, InheritLink, SimplePopOver, formatNumber, OnlineList, ListTitle } from '/src/components/utilities';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { BoxList, BoxListOutlined, BlueTextButton } from '/src/components/containers';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { ResponsiveButton, ButtonIcon, ButtonSvg, TabButton, PostButton, ProfileButton, TopMenuButton, CornerButton, LinkButton } from "/src/components/buttons.jsx";
import { UserData } from "/src/components/user_data";
import { NavLink } from "react-router-dom";
import { Endpoint, FormatAxiosError, ThrowIfNotAxios } from "/src/communication.js";
import axios, { AxiosError } from 'axios';
import links from "/src/components/footer_links";
import { GetSearchUrl } from "/src/pages/search.jsx";

function TrendsPreview() {
    const [getEntries, setEntries] = useState();

    async function Download() {
        try {
            const res = await axios.get(Endpoint("/member/trends/preview"));
            setEntries(res.data);
        }
        catch (err) {
            ThrowIfNotAxios(err);
        }
    }

    useEffect(() => {
        Download();
    }, []);

    if (getEntries === undefined)
        return (<Loading />);

    return (
        <BoxList>

            <ListItem>
                <ListItemText>
                    <Typography variant="big_bold">
                        Trends
                    </Typography>
                </ListItemText>
            </ListItem>

            {getEntries.map((entry, i) => <TrendEntry key={i} index={i} entry={entry} />)}

            <LinkButton to="/trends">
                Show more
            </LinkButton>

        </BoxList>
    );
}

const TrendEntry = memo(({ entry, index }) => {
    const { hashtag, count } = entry;
    return (
        <ListItem disablePadding>
            <InheritLink to={GetSearchUrl(hashtag)} style={{width:"100%"}}>
                <ListItemButton>
                    <ListItemText>
                        <Typography variant="small_fade">
                            <div>
                                <span>{index + 1}</span><span style={{ margin: "0px 4px" }}>·</span><span>Trending</span>
                            </div>
                        </Typography>
                        <Typography variant="small_bold">
                            <div>
                                #{hashtag}
                            </div>
                        </Typography>
                        <Typography variant="small_fade">
                            <div>
                                {formatNumber(count)} posts
                            </div>
                        </Typography>

                        <CornerButton right>more_horiz</CornerButton>
                    </ListItemText>
                </ListItemButton>
            </InheritLink>
        </ListItem>
    );
});

function TrendList() {
    async function GetEntries(from) {
        try {
            const response = await axios.post(Endpoint("/member/trends/list"), { from: from });
            return response.data;
        }
        catch (err) {
            ThrowIfNotAxios(err);
            return [];
        }
    }

    return (
        <Stack direction="column">
            <ListTitle>
                Trends
            </ListTitle>
            <OnlineList getEntries={GetEntries} EntryMapper={TrendEntry} />
        </Stack>
    );
}


export default TrendsPreview;
export { TrendList };