/* eslint-disable no-param-reassign */

import axios from 'axios';
import _ from 'lodash';
import parse from './parser';
import { addProxy, makePosts } from './helpers';

const isSimilar = (post, currentPost) => post.title === currentPost.title
  && post.description === currentPost.description;

const autoUpdate = (watched, timeout) => {
  if (watched.loadingProcess.status === 'loading') {
    setTimeout(autoUpdate, timeout, watched, timeout);
    return;
  }

  const { feeds } = watched;
  const promises = feeds.map((feed) => axios.get(addProxy((feed.rssLink)))
    .then((response) => {
      const { feedId } = feed;
      const { items } = parse(response);
      const posts = makePosts(feedId, items);
      const currentPosts = watched.posts.filter((post) => post.feedId === feedId);
      const newPosts = _.differenceWith(posts, currentPosts, isSimilar);
      watched.posts.unshift(...newPosts);
    })
    .catch());

  Promise.all(promises)
    .then(() => setTimeout(autoUpdate, timeout, watched, timeout));
};

export default autoUpdate;
