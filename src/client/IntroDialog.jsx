import React from 'react';

import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import Slide from 'material-ui/transitions/Slide';

export const DIALOG_VERSION = 2;

const Transition = props => <Slide direction="up" {...props} />;

const IntroDialog = ({ dialogOpen, setDialogOpen }) => (
  <Dialog
    open={dialogOpen}
    transition={Transition}
    onClose={() => setDialogOpen(false)}
  >
    <DialogTitle>What is LimeGreenJS</DialogTitle>
    <DialogContent>
      <DialogContentText>
        LimeGreenJS is a React-based Single Page Application runner.
        It takes code from a GitHub repository and serves compiled code.
        The generated code is for production with a unique URL.
      </DialogContentText>
      <DialogContentText>
        LimeGreenJS is also a repository for example apps for learning
        how to code React/GraphQL Single Page Applications.
        The apps may connect to any GraphQL-based backends.
        Happy coding!
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setDialogOpen(false)} color="secondary" autoFocus>
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

export default IntroDialog;
