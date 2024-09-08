import { Typography } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { memo, useCallback } from "react";
import { ThrowIfNotAxios } from "/src/communication.js";
import { CornerButton, LinkButton } from "/src/components/buttons.jsx";
import { BoxList } from '/src/components/containers';
import { OnlineList } from "/src/components/online_list";
import { GetSearchUrl } from "/src/components/search_components";
import { formatNumber, InheritLink, ListTitle, Loading } from '/src/components/utilities';

function TrendsPreview() {
    const Download = useCallback(async () => {
        const res = await axios.get("member/trends/preview");
        return res.data;
    });

    const { isPending, data: getEntries } = useQuery({
        queryKey: ['trends_preview'],
        queryFn: Download,
    });

    return (
        <BoxList>

            <ListItem>
                <ListItemText>
                    <Typography variant="big_bold">
                        Trends
                    </Typography>
                </ListItemText>
            </ListItem>

            {isPending ? <Loading /> : getEntries.map((entry, i) => <TrendEntry key={i} index={i} entry={entry} />)}

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
            <InheritLink to={GetSearchUrl(hashtag)} style={{ width: "100%" }}>
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
            const response = await axios.post("member/trends/list", { from: from });
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
            <OnlineList
                getEntries={GetEntries}
                EntryMapper={TrendEntry}
                id={"trends"}
                exampleHeight={81}
            />
        </Stack>
    );
}


export default TrendsPreview;
export { TrendList };

