import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { composeWithState } from 'react-compose-state';
import InfiniteScroll from 'react-infinite-scroller';

import Grid from 'material-ui/Grid';
import { CircularProgress } from 'material-ui/Progress';
import Tabs, { Tab } from 'material-ui/Tabs';

import CardItem from './CardItem';
import { QUERY_LOGIN_INFO } from './LoginName';

import { ITEMS as PRELOADED_NODES } from './preloaded';

const renderLoading = () => (
  <Grid container justify="center" style={{ marginTop: 10 }}>
    <Grid item><CircularProgress /></Grid>
  </Grid>
);

const renderNodes = nodes => (
  <Grid container spacing={24} style={{ marginTop: 5 }}>
    {nodes.map(item => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={item.url}>
        <CardItem item={item} />
      </Grid>
    ))}
  </Grid>
);

const CardList = ({
  filterType,
  setFilterType,
  data: {
    loading, search, loadMore,
  } = {},
}) => {
  if (loading) {
    return renderLoading();
  }
  if (!search) {
    return renderNodes(PRELOADED_NODES);
  }
  const {
    nodes = [],
    pageInfo: { hasNextPage } = {},
  } = search;
  return (
    <div>
      <Tabs
        value={filterType}
        onChange={(event, value) => setFilterType(value)}
        indicatorColor="primary"
        textColor="primary"
        fullWidth
        style={{ backgroundColor: '#f9f9f9' }}
      >
        <Tab label="Official" value="official" />
        <Tab label="My Repos" value="mine" />
        <Tab label="All" value="all" />
      </Tabs>
      <InfiniteScroll
        loadMore={loadMore}
        hasMore={hasNextPage}
        loader={renderLoading()}
      >
        {renderNodes(nodes)}
      </InfiniteScroll>
    </div>
  );
};

const withState = composeWithState({
  filterType: 'official',
});

const withLoginInfo = graphql(QUERY_LOGIN_INFO, {
  name: 'loginInfo',
  options: { fetchPolicy: 'cache-only' },
});

const QUERY_REPOS = gql`
query ($q: String!, $end: String){
  search(first: 20, type: REPOSITORY, query: $q, after: $end) {
    nodes {
      ... on Repository {
        owner {
          login
          avatarUrl
        }
        name
        description
        url
        ref(qualifiedName: "master") {
          target {
            oid
          }
        }
        stargazers {
          totalCount
        }
      }
    }
    repositoryCount
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
`;

const withQuery = graphql(QUERY_REPOS, {
  skip: ({ loginInfo = {} }) => !loginInfo.viewer,
  options: (props) => {
    const { filterType, loginInfo } = props;
    const { viewer: { login } = {} } = loginInfo || {};
    const criteria = {
      official: 'user:LimeGreenJS',
      mine: `user:${login}`,
      all: '',
    }[filterType];
    const q = `LimeGreenJS-enabled in:description is:public fork:true ${criteria} sort:stars`;
    return {
      variables: { q },
    };
  },
  props: ({ data }) => ({
    data: {
      ...data,
      loadMore: () => data.fetchMore({
        variables: { end: data.search.pageInfo.endCursor },
        updateQuery: (previousResult = {}, { fetchMoreResult = {} }) => {
          const previousSearch = previousResult.search || {};
          const currentSearch = fetchMoreResult.search || {};
          const previousNodes = previousSearch.nodes || [];
          const currentNodes = currentSearch.nodes || [];
          return {
            ...previousResult,
            search: {
              ...previousSearch,
              nodes: [...previousNodes, ...currentNodes],
              pageInfo: currentSearch.pageInfo,
            },
          };
        },
      }),
    },
  }),
});

export default withState(withLoginInfo(withQuery(CardList)));
