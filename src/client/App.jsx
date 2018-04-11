/* eslint-env browser */

import React from 'react';
import { ApolloLink } from 'apollo-link';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { withClientState } from 'apollo-link-state';
import { ApolloProvider } from 'react-apollo';

import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import lime from 'material-ui/colors/lime';
import green from 'material-ui/colors/green';
import red from 'material-ui/colors/red';

import MainLayout from './MainLayout';
import { DIALOG_VERSION } from './IntroDialog';

const getInitialState = () => {
  let initialDialogOpen = true;
  try {
    initialDialogOpen = localStorage.getItem('DIALOG_VERSION') < DIALOG_VERSION;
    localStorage.setItem('DIALOG_VERSION', DIALOG_VERSION);
  } catch (e) {
    // ignored
  }
  return {
    drawerOpen: false,
    dialogOpen: initialDialogOpen,
    filterType: 'official',
  };
};

const apolloClientMap = new Map();
const createApolloClient = (accessToken) => {
  if (apolloClientMap.has(accessToken)) {
    return apolloClientMap.get(accessToken);
  }
  const cache = new InMemoryCache();
  const httpLink = new HttpLink({
    uri: 'https://api.github.com/graphql',
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
  const stateLink = withClientState({ cache, defaults: getInitialState() });
  const link = ApolloLink.from([stateLink, httpLink]);
  const client = new ApolloClient({ link, cache });
  apolloClientMap.set(accessToken, client);
  return client;
};

const theme = createMuiTheme({
  palette: {
    primary: lime,
    secondary: green,
    error: red,
  },
});

const App = ({ accessToken }) => (
  <ApolloProvider client={createApolloClient(accessToken)}>
    <MuiThemeProvider theme={theme}>
      <MainLayout />
    </MuiThemeProvider>
  </ApolloProvider>
);

export default App;
