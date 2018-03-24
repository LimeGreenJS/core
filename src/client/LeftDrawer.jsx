import React from 'react';
import { graphql } from 'react-apollo';

import Drawer from 'material-ui/Drawer';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import HomeIcon from 'material-ui-icons/Home';
import InfoOutlineIcon from 'material-ui-icons/InfoOutline';
import ExitToAppIcon from 'material-ui-icons/ExitToApp';
import Typography from 'material-ui/Typography';
import { LinearProgress } from 'material-ui/Progress';

import { QUERY_LOGIN_INFO } from './LoginName';

const LeftDrawer = ({
  drawerOpen,
  setDrawerOpen,
  setDialogOpen,
  data: { loading, viewer },
}) => (
  <Drawer
    open={drawerOpen}
    onClose={() => setDrawerOpen(false)}
  >
    <List>
      <ListItem>
        <Typography variant="title">LimeGreenJS</Typography>
      </ListItem>
      <Divider />
      {loading && <LinearProgress />}
      <ListItem button onClick={() => { setDrawerOpen(false); setDialogOpen(true); }}>
        <ListItemIcon><InfoOutlineIcon /></ListItemIcon>
        <ListItemText primary="About this" />
      </ListItem>
      {!loading && !viewer && (
        <a href="/auth/github">
          <ListItem button>
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText primary="Log in with GitHub" />
          </ListItem>
        </a>
      )}
      {!loading && viewer && (
        <a href="/">
          <ListItem button>
            <ListItemIcon><ExitToAppIcon /></ListItemIcon>
            <ListItemText primary="Log out" />
          </ListItem>
        </a>
      )}
    </List>
  </Drawer>
);

const withQuery = graphql(QUERY_LOGIN_INFO, {
  options: { fetchPolicy: 'cache-only' },
});
export default withQuery(LeftDrawer);
