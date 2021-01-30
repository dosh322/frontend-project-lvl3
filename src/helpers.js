import _ from 'lodash';
import * as yup from 'yup';

const proxyUrl = new URL('https://hexlet-allorigins.herokuapp.com/get?disableCache=true');

export const makePosts = (feedId, items) => items
  .map((item) => ({ feedId, id: _.uniqueId(), ...item }));

export const addProxy = (sourceUrl) => {
  proxyUrl.searchParams.set('url', sourceUrl);
  return proxyUrl.toString();
};

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
