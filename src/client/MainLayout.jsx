/* eslint-env browser */

import React from 'react';
import { composeWithState } from 'react-compose-state';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';

import CardList from './CardList';
import LeftDrawer from './LeftDrawer';
import LoginName from './LoginName';
import IntroDialog, { DIALOG_VERSION } from './IntroDialog';

const TopBar = ({ setDrawerOpen }) => (
  <AppBar>
    <Toolbar>
      <IconButton
        aria-label="Menu"
        onClick={() => setDrawerOpen(true)}
      >
        <MenuIcon />
      </IconButton>
      <Typography variant="title" style={{ flex: 1 }}>LimeGreenJS</Typography>
      <LoginName height={30} />
    </Toolbar>
  </AppBar>
);

const MainLayout = props => (
  <div>
    <TopBar {...props} />
    <LeftDrawer {...props} />
    <IntroDialog {...props} />
    <div style={{ margin: '85px 25px 0 25px' }}>
      <CardList />
    </div>
  </div>
);

let initialDialogOpen = true;
try {
  initialDialogOpen = localStorage.getItem('DIALOG_VERSION') < DIALOG_VERSION;
  localStorage.setItem('DIALOG_VERSION', DIALOG_VERSION);
} catch (e) {
  // ignored
}

const withState = composeWithState({
  drawerOpen: false,
  dialogOpen: initialDialogOpen,
});

export default withState(MainLayout);
