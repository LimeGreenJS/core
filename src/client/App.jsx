import React from 'react';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';

import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import lime from 'material-ui/colors/lime';
import green from 'material-ui/colors/green';
import red from 'material-ui/colors/red';

import MainLayout from './MainLayout';

const apolloClientMap = new Map();
const createApolloClient = (accessToken) => {
  if (apolloClientMap.has(accessToken)) {
    return apolloClientMap.get(accessToken);
  }
  const link = new HttpLink({
    uri: 'https://api.github.com/graphql',
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
  const cache = new InMemoryCache();
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
