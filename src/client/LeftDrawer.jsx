import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import Drawer from 'material-ui/Drawer';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import HomeIcon from 'material-ui-icons/Home';
import InfoOutlineIcon from 'material-ui-icons/InfoOutline';
import ExitToAppIcon from 'material-ui-icons/ExitToApp';
import Typography from 'material-ui/Typography';
import { LinearProgress } from 'material-ui/Progress';

import { QUERY_LOGIN_INFO } from './LoginName';

const GET_DRAWER_OPEN = gql`
{
  drawerOpen @client
}
`;

const LeftDrawer = () => (
  <Query query={QUERY_LOGIN_INFO} fetchPolicy="cache-only">
    {({ loading, data }) => (
      <Query query={GET_DRAWER_OPEN}>
        {({ data: { drawerOpen }, client }) => (
          <Drawer
            open={drawerOpen}
            onClose={() => client.writeData({ data: { drawerOpen: false } })}
          >
            <List>
              <ListItem>
                <Typography variant="title">LimeGreenJS</Typography>
              </ListItem>
              <Divider />
              {loading && <LinearProgress />}
              <ListItem
                button
                onClick={() => client.writeData({ data: { drawerOpen: false, dialogOpen: true } })}
              >
                <ListItemIcon><InfoOutlineIcon /></ListItemIcon>
                <ListItemText primary="About this" />
              </ListItem>
              {!loading && !data.viewer && (
                <a href="/auth/github">
                  <ListItem button>
                    <ListItemIcon><HomeIcon /></ListItemIcon>
                    <ListItemText primary="Log in with GitHub" />
                  </ListItem>
                </a>
              )}
              {!loading && data.viewer && (
                <a href="/">
                  <ListItem button>
                    <ListItemIcon><ExitToAppIcon /></ListItemIcon>
                    <ListItemText primary="Log out" />
                  </ListItem>
                </a>
              )}
            </List>
          </Drawer>
        )}
      </Query>
    )}
  </Query>
);

export default LeftDrawer;
