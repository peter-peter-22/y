import { SearchField } from "/src/components/inputs.jsx";
import { ListTitle } from '/src/components/utilities';
import Stack from '@mui/material/Stack';
import { Box } from '@mui/material';
import { ScrollToTop } from "/src/components/scroll_to_top";

export default () => {
    ScrollToTop();
    return (
        <Stack direction="column">
            <ListTitle>
                Search for something
            </ListTitle>
            <Box sx={{ mx: 1.5 }}>
                <SearchField />
            </Box>
        </Stack>
    );
}