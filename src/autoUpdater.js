/* eslint-disable no-param-reassign */

import axios from 'axios';
import _ from 'lodash';
import parse from './parser';
import { getRssLinks, linkPosts } from './helpers';

const checkForUpdTimer = 5000;

const postsComparator = (post, currentPost) => post.title === currentPost.title
  && post.description === currentPost.description;

const autoUpdate = (watched, proxyUrl) => {
  if (watched.loadingProcess.state === 'loading') {
    setTimeout(autoUpdate, checkForUpdTimer, watched, proxyUrl);
    return;
  }

  const urls = getRssLinks(watched);
  const postsUpdPromises = urls.map((url) => axios.get(`${proxyUrl}${url}`)
    .then((response) => {
      const parsedResponse = parse(response);
      const currentFeed = watched.feeds.find((feed) => feed.title === parsedResponse.title);
      const { feedId } = currentFeed;
      const currentPosts = watched.posts.filter((post) => post.feedId === feedId);
      const { posts } = parsedResponse;
      const newPosts = _.differenceWith(posts, currentPosts, postsComparator);
      const linkedNewPosts = linkPosts(feedId, newPosts);
      watched.posts.unshift(...linkedNewPosts);
    })
    .catch());

  Promise.all(postsUpdPromises)
    .then(() => setTimeout(autoUpdate, checkForUpdTimer, watched, proxyUrl));
};

export default autoUpdate;
