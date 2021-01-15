import _ from 'lodash';
import * as yup from 'yup';

export const linkPosts = (feedId, posts) => posts
  .map((post) => ({ feedId, id: _.uniqueId(), ...post }));

export const getRssLinks = (watched) => watched.feeds.map((feed) => feed.rssLink);

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
