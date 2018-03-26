import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import { CircularProgress } from 'material-ui/Progress';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';

export const QUERY_LOGIN_INFO = gql`
{
  viewer {
    avatarUrl
    name
    login
  }
}
`;

const LoginName = ({ height }) => (
  <Query query={QUERY_LOGIN_INFO}>
    {({ loading, error, data }) => {
      if (loading) {
        return <CircularProgress color="secondary" />;
      }
      if (error) {
        return (
          <a href="/auth/github">
            <Button>Log in with GitHub</Button>
          </a>
        );
      }
      return (
        <Typography
          variant="body2"
          style={{ display: 'inline-flex', alignItems: 'center' }}
        >
          <img
            src={data.viewer.avatarUrl}
            alt="icon"
            style={{ height, borderRadius: 3, marginRight: 5 }}
          />
          {data.viewer.name}
        </Typography>
      );
    }}
  </Query>
);

export default LoginName;
