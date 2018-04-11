import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
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

const renderList = (nodes, hasNextPage, filterType, setFilterType, loadMore) => (
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

const GET_FILTER_TYPE = gql`
{
  filterType @client
}
`;

const getQ = (filterType, viewer) => {
  const { login } = viewer || {};
  const criteria = {
    official: 'user:LimeGreenJS',
    mine: `user:${login}`,
    all: '',
  }[filterType];
  return `LimeGreenJS-enabled in:description is:public fork:true ${criteria} sort:stars`;
};

const CardList = () => (
  <Query query={QUERY_LOGIN_INFO} fetchPolicy="cache-only">
    {({ data: { viewer } = {} }) => (
      <Query query={GET_FILTER_TYPE}>
        {({ data: { filterType }, client }) => (
          // The next line is a workaround as skip does not work as expected.
          !viewer ? renderNodes(PRELOADED_NODES) :
          <Query
            skip={!viewer}
            query={QUERY_REPOS}
            variables={{ q: getQ(filterType, viewer) }}
          >
            {({ loading, data, fetchMore }) => {
              if (loading) {
                return renderLoading();
              }
              if (!data.search) {
                return renderNodes(PRELOADED_NODES);
              }
              const {
                nodes = [],
                pageInfo: { hasNextPage } = {},
              } = data.search;
              const setFilterType = value =>
                client.writeData({ data: { filterType: value } });
              const loadMore = () => fetchMore({
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
              });
              return renderList(nodes, hasNextPage, filterType, setFilterType, loadMore);
            }}
          </Query>
        )}
      </Query>
    )}
  </Query>
);

export default CardList;
