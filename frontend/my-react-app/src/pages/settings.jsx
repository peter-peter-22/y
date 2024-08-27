import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import axios from 'axios';
import React, { createContext, useCallback, useEffect, useMemo, useRef, memo, useState } from "react";
import Ask from "/src/components/web_push.js";
import { ListTitle, Loading } from "/src/components/utilities";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { Typography } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { OutlinedFab } from "/src/components/buttons";
import { useQuery } from '@tanstack/react-query'
import { ErrorPageFormatted } from "/src/pages/error";

function ControlledCheckbox({ title, name, group, data, setData, ...props }) {
  const full_name = useRef(group + "_" + name);

  const handleChange = useCallback(e => {
    const value = e.target.checked;
    setData(prev => ({ ...prev, [full_name.current]: value }));
  });

  return (
    <FormControlLabel
      value={full_name.current}
      control={<Checkbox />}
      label={title}
      labelPlacement="end"
      checked={Boolean(data[full_name.current])}
      onChange={handleChange}
      {...props}
    />
  );
}

const types = [
  { title: "Likes", name: "likes" },
  { title: "Comments", name: "comments" },
  { title: "Reposts", name: "reposts" },
  { title: "Follows", name: "follows" },
];

function Types({ group, disabled, ...props }) {
  return (
    types.map((type, i) => <ControlledCheckbox title={type.title} name={type.name} group={group} disabled={disabled} key={i} {...props} />)
  );
}

function Contents({ data, setData }) {
  const handleSave = useCallback(() => {
    console.log(data);
  });

  return (
    <Stack direction="column" sx={{ "&>*": { p: 2, borderBottom: 1, borderColor: "divider" } }}>
      <Typography variant="big_bold">Settings</Typography>

      <div >
        <Typography variant="medium_bold">Push Notifications</Typography>

        <FormGroup aria-label="Push Notifications">

          <div>
            <Fab color="black" variant="extended" size="small" onClick={Ask} sx={{ mt: 1 }}>
              Setup
            </Fab>
          </div>

          <ControlledCheckbox title="Enabled" name="enabled" group="push" data={data} setData={setData} />
          <Types group="push" disabled={!data.push_enabled} data={data} setData={setData} />
        </FormGroup>
      </div>

      <div>
        <Typography variant="medium_bold">Email Notifications</Typography>

        <FormGroup aria-label="Email Notifications">
          <ControlledCheckbox title="Enabled" name="enabled" group="email" data={data} setData={setData} />
          <Types group="email" disabled={!data.email_enabled} data={data} setData={setData} />
        </FormGroup>
      </div>

      <div>
        <Fab color="black" variant="extended" size="small" onClick={handleSave}>
          Save
        </Fab>
      </div>

    </Stack>
  );
}

export default () => {
  const [data, setData] = useState({});

  const getData = useCallback(async () => {
    const res = await axios.get("/member/settings/get");
    return res.data;
  });

  const { isPending, loaded, error } = useQuery({
    queryKey: ['settings'],
    queryFn: getData,
    retry: false,
    staleTime: 0,
  });

  useEffect(() => {
    if (loaded)
      setData(loaded);
  }, [loaded])

  if (error)
    return <ErrorPageFormatted error={error} />

  if (isPending)
    return <Loading />

  return <Contents data={data} setData={setData} />;
}