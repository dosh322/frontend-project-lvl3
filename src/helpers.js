import _ from 'lodash';
import * as yup from 'yup';

const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

export const makePosts = (feedId, items) => items
  .map((item) => ({ feedId, id: _.uniqueId(), ...item }));

export const getRssLinks = (watched) => watched.feeds.map((feed) => feed.rssLink);

export const addProxy = (url) => `${proxyUrl}${url}`;

export const validate = (rssLink, urls) => {
  const schema = yup.string().url('url')
    .notOneOf(urls, 'double');
  try {
    schema.validateSync(rssLink);
    return null;
  } catch (err) {
    return err.message;
  }
};
