import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router-dom';

function BackButton() {
    const navigate = useNavigate();

    function handleBack() {
        navigate(-1);
    }

    return (
        <IconButton aria-label="delete" onClick={handleBack}>
            <Icon>
                arrow_back
            </Icon>
        </IconButton>
    );
}

export { BackButton };
