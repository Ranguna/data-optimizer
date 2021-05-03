import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@material-ui/core";
import {SyntheticEvent} from "react";
import {toast} from "react-toastify";

import {loadMainDataFromCsv, MainDataIntegrityError, mainDataStore} from "../state/mainData/store";

const CSV_MIME_TYPES = ['text/csv', 'text/x-csv', 'application/vnd.ms-excel'];

const onFileSelect = (event: SyntheticEvent<HTMLInputElement>) => {
  if(!CSV_MIME_TYPES.includes(event.currentTarget.files?.item(0)?.type ?? ''))
    return toast.error("File needs to be a csv file.");

  loadMainDataFromCsv(event.currentTarget.files!.item(0)!).catch(err => {
    if(err instanceof MainDataIntegrityError)
      toast.error(err.message);
  });
};

export const LoadFileDialog = () => {
  const mainData = mainDataStore.use();

  return (
    <Dialog open={!mainData.data}>
      <DialogTitle>Load file</DialogTitle>
      <DialogContent>Upload a csv file with uniquely idententified data.</DialogContent>
      <DialogActions>
        <Button>Cancel</Button>
        <Button color="primary" component="label">
          Select File
          <input
            onInput={onFileSelect}
            type="file"
            hidden
          />
        </Button>
      </DialogActions>
    </Dialog>
  );
};
