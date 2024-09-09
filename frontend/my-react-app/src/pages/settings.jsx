import { Typography } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import Fab from '@mui/material/Fab';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { Suspense, useCallback ,lazy} from "react";
import { Controller, FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import { ThrowIfNotAxios } from "/src/communication.js";
import { Modals, SuccessModal } from "/src/components/modals";
import { Loading } from "/src/components/utilities";
import Ask from "/src/components/web_push.js";
import { ErrorPageFormatted } from "/src/pages/error";
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { ScrollToTop } from "/src/components/scroll_to_top";
const QuestionMarkIcon = lazy(() => import('@mui/icons-material/QuestionMark'));

function ControlledCheckbox({ title, name, group, ...props }) {
  const { control } = useFormContext();
  const full_name = group + "_" + name;

  return (

    <FormControlLabel
      control={
        <Controller
          name={full_name}
          control={control}
          render={({ field }) => <Checkbox
            {...field}
            checked={Boolean(field.value)}
            onChange={(e) => field.onChange(e.target.checked)}
          />}
        />
      }
      label={title}
      labelPlacement="end"
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

function Types({ group, dependsOn, ...props }) {
  const { control } = useFormContext();

  const enabled = useWatch({
    control,
    name: dependsOn,
  });

  return (
    types.map((type, i) => <ControlledCheckbox title={type.title} name={type.name} group={group} disabled={!enabled} key={i} {...props} />)
  );
}

function Form() {
  const queryClient = useQueryClient()

  const getData = useCallback(async () => {
    const res = await axios.get("/member/settings/get");
    return res.data;
  });

  const { data: loaded, error } = useSuspenseQuery({
    queryKey: ['settings'],
    queryFn: getData,
    retry: false,
  });

  const methods = useForm({
    defaultValues: loaded
  });

  const onSubmit = async (data) => {
    try {
      await axios.post("/member/settings/set", {
        settings: data
      });
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      Modals[0].Show(<SuccessModal text={"settings saved"} />);
    }
    catch (err) {
      ThrowIfNotAxios(err);
    }
  };

  return (
    error ? <ErrorPageFormatted error={error} /> :
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Stack direction="column" sx={{ "&>*": { p: 2, borderBottom: 1, borderColor: "divider" } }}>
            <Typography variant="big_bold">Settings</Typography>

            <div >
              <Typography variant="medium_bold">Push Notifications</Typography>

              <FormGroup aria-label="Push Notifications">

                <Stack direction="row" spacing={1}>
                  <Fab color="black" variant="extended" size="small" onClick={Ask} sx={{ mt: 1 }}>
                    Setup
                  </Fab>

                  <Tooltip title={
                    <>
                      <h3 >Create a service worker</h3>
                      <p>
                        This must be pressed at least once to make the push notifications work.
                      </p>
                      <p>
                        After pressing, a notification must appear.
                      </p>
                      <p>
                        If not then your browser is not compatible with webpush.
                      </p>
                      <p>
                        Incompatibility examples: brave, edge.
                      </p>
                      <p>
                        Compatibility examples: chrome.
                      </p>
                    </>
                  }>
                    <IconButton size="small">
                      <QuestionMarkIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>

                <ControlledCheckbox title="Enabled" name="enabled" group="push" />
                <Types group="push" dependsOn="push_enabled" />
              </FormGroup>
            </div>

            <div>
              <Typography color="warning.main">Email notifications are not working now!</Typography>
              <Typography variant="medium_bold">Email Notifications</Typography>

              <FormGroup aria-label="Email Notifications">
                <ControlledCheckbox title="Enabled" name="enabled" group="email" />
                {/*<Types group="email" dependsOn="email_enabled" />*/}
              </FormGroup>
            </div>

            <div>
              <Fab color="black" variant="extended" size="small" type="submit">
                Save
              </Fab>
            </div>
          </Stack>
        </form>
      </FormProvider>
  );
}

export default () => {
  ScrollToTop();
  return (
    <Suspense fallback={<Loading />}>
      <Form />
    </Suspense>
  );
}