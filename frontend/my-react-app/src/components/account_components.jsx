import { Icon } from '@mui/material';
import Fab from '@mui/material/Fab';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from 'axios';
import Moment from "moment";
import 'moment/locale/de';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import validator from "validator";
import { ThrowIfNotAxios } from "/src/communication.js";
import config from "/src/components/config.js";
import { PasswordFieldWithToggle, VisuallyHiddenInput } from "/src/components/inputs";
import { fileToMedia } from '/src/components/media';
import { UserContext } from "/src/components/user_data";
import { AvatarImageDisplayer, GetProfilePicture } from '/src/components/utilities';

function BirthDateEditor(props) {
    const startingValue = props.current ? new Moment(props.current) : new Moment();
    const [date, setDate] = useState(startingValue);
    const [dateOk, setDateOk] = useState(validateDate(startingValue));
    const onChangeDate = props.onChangeDate;
    const onChangeOk = props.onChangeOk;

    useEffect(() => {
        if (onChangeDate)
            onChangeDate(date);
        if (onChangeOk)
            onChangeOk(dateOk);
    }, [date, dateOk]);

    function handleDate(date) {
        setDate(date);
        setDateOk(validateDate(date));
    }

    function validateDate(myDate) {
        return myDate.isValid() && !myDate.isAfter() && myDate.year() >= 1900;
    }

    return (
        <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePicker label="Date of birth" disableFuture onChange={handleDate} value={date} />
        </LocalizationProvider>
    );
}
function ChangeablePicture(props) {
    const [file, setFile] = useState();
    const mediaRef = useRef(props.current);
    const media = mediaRef.current;
    const onUploadFile = props.onUploadFile;//only runs when the user uploads a new image, it does nothing in start, unlike the other similar onchange functions

    useEffect(() => {
        if (onUploadFile)
            onUploadFile(file);
    }, [file]);

    function handleFile(e) {
        const selected = e.target.files[0];
        if (selected === undefined)
            mediaRef.current = undefined;
        else {
            const myMedia = fileToMedia(selected);
            mediaRef.current = myMedia;
        }
        setFile(selected);
    }


    const Displayer = props.displayer;

    function ChangeButton() {
        return (
            <Fab size="small" color="transparentBlack" sx={{ border: 1, borderColor: "divider", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                <VisuallyHiddenInput type="file" accept={config.accepted_image_types} onChange={handleFile} onClick={(e) => e.stopPropagation()} />
                <Icon baseClassName="material-icons-outlined">
                    add_a_photo
                </Icon>
            </Fab>
        );
    }

    return (
        <Displayer
            button={<ChangeButton />}
            media={media} />
    );
}

function UserNameEditor(props) {
    const [username, setUserName] = useState("");
    const [usernameOk, setUserNameOk] = useState(false);
    const changedUserName = props.onChangeUserName;
    const changedOk = props.onChangeOk;
    const timerRef = useRef();
    const { getData } = useContext(UserContext);

    useEffect(() => {
        if (changedOk)
            changedOk(usernameOk);
        if (changedUserName)
            changedUserName(username);
    }, [username, usernameOk]);

    function handleUsername(e) {
        const value = e.target.value;
        setUserName(value);
        checkUsername(value);
    }
    function checkUsername(value) {
        setUserNameOk(false);
        WaitAfterChange(async () => {
            if (value.length > 0) {
                try {
                    const res = await axios.post("member/modify/ok_username", {
                        username: value
                    });
                    setUserNameOk(res.data);
                }
                catch (err) {
                    ThrowIfNotAxios(err);
                }
            }
        }, timerRef);
    }
    useEffect(() => {//add the existing username to the textfield on creation
        let starting_username;
        try {
            starting_username = getData.user.username;
        } catch {
            starting_username = "";
        }
        setUserName(starting_username);
        checkUsername(starting_username);
    }, []);

    return (
        <TextField variant="outlined" type="text" label="Username" sx={{ my: 3 }}
            onChange={handleUsername}
            value={username}
            InputProps={{
                maxLength: "50",
                endAdornment: (
                    <InputAdornment position="end">
                        {usernameOk ? <Icon color="success">check_circle</Icon> : <Icon color="error">cancel</Icon>}
                    </InputAdornment>
                ),
                startAdornment: (
                    <InputAdornment position="start">
                        @
                    </InputAdornment>
                ),
            }}
        />
    );
}

function NameEditor(props) {
    const [name, setName] = useState(props.current !== undefined ? props.current : "");
    const [nameError, setNameError] = useState('');
    const onChangeName = props.onChangeName;
    const onChangeOk = props.onChangeOk;

    useEffect(() => {
        if (onChangeName)
            onChangeName(name);
        if (onChangeOk)
            onChangeOk(!nameError);
    }, [name, nameError]);

    function handleName(e) {
        const value = e.target.value;
        setName(value);
        if (!validateName(value)) {
            setNameError('The name must be at least 3 characters long.');
        } else {
            setNameError('');
        }

    }

    const validateName = (name) => {
        return name.length >= 3;
    };

    return (
        <TextField autoComplete="name" variant="outlined" type="text" label="Name" inputProps={{ maxLength: "50" }} sx={{ mb: 3 }}
            onChange={handleName}
            error={Boolean(nameError)}
            helperText={nameError}
            value={name} />
    );
}

const ProfilePicEditor = memo(({ user, size: overwriteSize, onUploadFile }) => {
    const size = overwriteSize ? overwriteSize : "100px";
    const current = user ? GetProfilePicture(user) : undefined;

    function ProfileDisplayer({ media, button }) {
        return (
            <div style={{ position: "relative", width: "fit-content" }}>
                <AvatarImageDisplayer media={media} style={{ height: size, width: size }} />
                {button}
            </div>
        );
    }

    return (
        <ChangeablePicture displayer={ProfileDisplayer} current={current} onUploadFile={onUploadFile} />
    );
},
    (prev, now) => prev.user === now.user);

function PasswordInput(props) {
    const [password, setPassword] = useState(props.value ? props.value : "");
    const [passwordError, setPasswordError] = useState(false);
    const onChangePassword = props.onChangePassword;
    const onChangeOk = props.onChangeOk;

    function handlePassword(e) {
        const value = e.target.value;
        setPassword(value);
        const error = value.length >= 8 ? undefined : "Must be at least 8 characters";
        setPasswordError(error);

        if (onChangePassword)
            onChangePassword(value);
        if (onChangeOk)
            onChangeOk(!Boolean(error));
    };

    return (
        <PasswordFieldWithToggle variant="outlined" label="Password" sx={{ my: 3 }}
            error={Boolean(passwordError)}
            helperText={passwordError}
            onChange={handlePassword}
            value={password} />
    );
}
function EmailInput(props) {
    return (
        <TextField autoComplete="email" variant="outlined" type="email" label="Email"
            {...props} />
    );
}

function validateEmail(email) {
    //must be validated with the same function on the server
    return validator.isEmail(email);
};

function RechaptaInput(props) {
    return (
        <Stack style={{ alignItems: "center", flexGrow: 1 }}>
            <ReCAPTCHA
                sitekey={config.rechapta_key}
                {...props}
            />
        </Stack>
    );
}

export { BirthDateEditor, ChangeablePicture, EmailInput, NameEditor, PasswordInput, ProfilePicEditor, RechaptaInput, UserNameEditor, validateEmail };

