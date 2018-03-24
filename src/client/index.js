/* eslint-env browser */

import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

const render = () => {
  // we should use "qs" if we need non-hex access_token
  const match = /access_token=([a-f0-9]+)/.exec(window.location.hash);
  const accessToken = match && match[1];
  ReactDOM.render(
    <App accessToken={accessToken} />,
    document.getElementById('app'),
  );
};

render();

if (module.hot) {
  module.hot.accept('./App', render);
}
