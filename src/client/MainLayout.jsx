import React from 'react';
import { ApolloConsumer } from 'react-apollo';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';

import CardList from './CardList';
import LeftDrawer from './LeftDrawer';
import LoginName from './LoginName';
import IntroDialog from './IntroDialog';

const TopBar = () => (
  <ApolloConsumer>
    {cache => (
      <AppBar>
        <Toolbar>
          <IconButton
            aria-label="Menu"
            onClick={() => cache.writeData({ data: { drawerOpen: true } })}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="title" style={{ flex: 1 }}>LimeGreenJS</Typography>
          <LoginName height={30} />
        </Toolbar>
      </AppBar>
    )}
  </ApolloConsumer>
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

export default MainLayout;
