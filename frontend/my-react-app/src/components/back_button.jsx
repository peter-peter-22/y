import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router-dom';
import { lazy } from "react";
const ArrowBackIcon = lazy(() => import('@mui/icons-material/ArrowBack'));

function BackButton() {
    const navigate = useNavigate();

    function handleBack() {
        navigate(-1);
    }

    return (
        <IconButton aria-label="delete" onClick={handleBack}>
            <ArrowBackIcon />
        </IconButton>
    );
}

export { BackButton };
