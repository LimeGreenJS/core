import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { CircularProgress } from 'material-ui/Progress';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';

const LoginName = ({ height, data: { loading, error, viewer } }) => {
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
      type="body2"
      style={{ display: 'inline-flex', alignItems: 'center' }}
    >
      <img
        src={viewer.avatarUrl}
        alt="icon"
        style={{ height, borderRadius: 3, marginRight: 5 }}
      />
      {viewer.name}
    </Typography>
  );
};

export const QUERY_LOGIN_INFO = gql`
{
  viewer {
    avatarUrl
    name
    login
  }
}
`;

const withQuery = graphql(QUERY_LOGIN_INFO);
export default withQuery(LoginName);
