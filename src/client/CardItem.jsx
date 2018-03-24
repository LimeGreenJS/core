/* eslint-env browser */

import React from 'react';

import Card, { CardActions, CardContent, CardHeader } from 'material-ui/Card';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import Avatar from 'material-ui/Avatar';
import StarIcon from 'material-ui-icons/Star';

const createRunUrl = (item) => {
  try {
    const commit = item.ref.target.oid.slice(0, 7);
    const { name } = item;
    const owner = item.owner.login;
    const baseHost = window.location.host.replace('limegreenjs.', 'limegreenjsapp.');
    return `http://${commit}.${name}.${owner}.${baseHost}`;
  } catch (e) {
    return null;
  }
};

const getDescription = item => item.description.replace(/\S*limegreenjs-enabled\S*/i, '');

const MyHeader = ({ item }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span>{item.owner.login}</span>
    {item.owner.login === 'LimeGreenJS' && (
      <Typography
        type="caption"
        style={{
          backgroundColor: 'silver',
          color: 'white',
          padding: '4px 8px',
          borderRadius: 2,
          marginBottom: 16,
        }}
      >
        OFFICIAL
      </Typography>
    )}
  </div>
);

const CardItem = ({ item }) => (
  <Card>
    <CardHeader
      style={{ padding: '8px 8px 2px 8px' }}
      avatar={<Avatar src={item.owner.avatarUrl} />}
      subheader={<MyHeader item={item} />}
    />
    <CardContent style={{ minHeight: 100, padding: 8 }}>
      <Typography type="title" style={{ marginBottom: 4 }}>{item.name}</Typography>
      <Typography type="body1">{getDescription(item)}</Typography>
    </CardContent>
    <CardActions>
      <a href={createRunUrl(item)} target="_blank">
        <Button raised color="secondary">Run app</Button>
      </a>
      <a href={item.url} target="_blank">
        <Button raised color="default">Show code</Button>
      </a>
      <Typography
        type="caption"
        style={{
          flexGrow: 2,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <StarIcon style={{ width: 18, height: 18 }} />
        <div style={{ height: 18, display: 'flex', alignItems: 'center' }}>
          {item.stargazers.totalCount}
        </div>
      </Typography>
    </CardActions>
  </Card>
);

export default CardItem;
