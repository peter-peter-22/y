import React from "react";
import Stack from '@mui/material/Stack';
import  { Inside } from "/src/components/side_menus.jsx";
import { TopMenu } from '/src/components/utilities';
import { SearchField } from "/src/components/inputs.jsx";
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { ThemeProvider } from '@mui/material';
import { ResponsiveSelector, ProfileText, FadeLink, TabSwitcher } from '/src/components/utilities';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { BoxList, BoxListOutlined, BlueTextButton } from '/src/components/containers';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { ResponsiveButton, ButtonIcon, ButtonSvg, TabButton, PostButton, ProfileButton, TopMenuButton } from "/src/components/buttons.jsx";
import { ForYou,Following } from "/src/components/home_pages";

function Page() {
  return (
      <TabSwitcher tabs={[
        {
          tabName: "for you",
          text: "For you",
          contents: <ForYou/>
        },
        {
          tabName: "following",
          text: "Following",
          contents: <Following/>
        }
      ]}>
      </TabSwitcher >
  )
}

export default Page
