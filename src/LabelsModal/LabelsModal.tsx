import { Dialog } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MultiSelect, { MultiSelectProps } from "../MultiSelect/MultiSelect";

interface LabelsModalProps {
  open: boolean;
  handleClose: Function;
}
function LabelsModal(props: LabelsModalProps & MultiSelectProps) {
  const {
    open,
    labels,
    handleClose,
    updateLabels,
    currentTitle,
  } = props;
  return (
    <Dialog
      open={open}
      onClose={() => handleClose()}
      >
        <DialogTitle id="alert-dialog-title">
          {currentTitle}
        </DialogTitle>
        <DialogContent>
          <Box p={2}>
            <MultiSelect
              labels={labels}
              updateLabels={updateLabels}
              currentTitle={currentTitle}/>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose()} autoFocus>
            Close
          </Button>
        </DialogActions>
    </Dialog>
  );
}

export default LabelsModal;