/* eslint-disable no-param-reassign */

import axios from 'axios';
import _ from 'lodash';
import parse from './parser';
import { addProxy, linkPosts } from './helpers';

const postsComparator = (post, currentPost) => post.title === currentPost.title
  && post.description === currentPost.description;

const autoUpdate = (watched, timeout) => {
  if (watched.loadingProcess.state === 'loading') {
    setTimeout(autoUpdate, timeout, watched, timeout);
    return;
  }

  const { feeds } = watched;
  const postsUpdPromises = feeds.map((feed) => axios.get(addProxy((feed.rssLink)))
    .then((response) => {
      const { feedId } = feed;
      const parsedResponse = parse(response);
      const currentPosts = watched.posts.filter((post) => post.feedId === feedId);
      const { posts } = parsedResponse;
      const newPosts = _.differenceWith(posts, currentPosts, postsComparator);
      const linkedNewPosts = linkPosts(feedId, newPosts);
      watched.posts.unshift(...linkedNewPosts);
    })
    .catch());

  Promise.all(postsUpdPromises)
    .then(() => setTimeout(autoUpdate, timeout, watched, timeout));
};

export default autoUpdate;
