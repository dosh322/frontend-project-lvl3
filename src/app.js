import axios from 'axios';
import i18next from 'i18next';
import _ from 'lodash';
import initView from './view.js';
import parse from './parser.js';
import resources from './locales/index.js';
import {
  addProxy, makePosts, validate,
} from './helpers';

const getRssLinks = (watched) => watched.feeds.map((feed) => feed.rssLink);

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
      const newPosts = _.differenceWith(posts, currentPosts,
        (post, currentPost) => post.title === currentPost.title
        && post.description === currentPost.description);
      watched.posts.unshift(...newPosts);
    })
    .catch());

  Promise.all(promises)
    .then(() => setTimeout(autoUpdate, timeout, watched, timeout));
};

export default () => {
  const defaultLanguage = 'en';
  const updTimeout = 5000;

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.form-control'),
    submitBtn: document.querySelector('form .btn'),
    exampleLinkElem: document.querySelector('#example-link'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    copyright: document.querySelector('#copyright'),
    appName: document.querySelector('#app-name'),
    appDescription: document.querySelector('#app-description'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalFullArticle: document.querySelector('.full-article'),
    modalCloseBtn: document.querySelector('.close-btn'),
  };

  const state = {
    appStatus: 'init',
    loadingProcess: {
      status: 'idle',
      error: null,
    },
    rssForm: {
      fields: {
        rssLink: {
          valid: true,
          error: null,
        },
      },
    },
    feeds: [],
    posts: [],
    uiState: {
      viewedPostsIds: [],
      previewModal: {
        currentPostId: null,
      },
    },
  };

  return i18next.init({
    lng: defaultLanguage,
    resources,
  }).then(() => {
    const watched = initView(state, elements);

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      watched.loadingProcess.error = null;
      const formData = new FormData(e.target);
      const rssLink = formData.get('url').trim();
      const error = validate(rssLink, getRssLinks(watched));

      if (error) {
        watched.rssForm.fields.rssLink.error = error;
        watched.rssForm.fields.rssLink.valid = false;
        return;
      }

      watched.rssForm.fields.rssLink.valid = true;
      watched.rssForm.fields.rssLink.error = null;
      watched.loadingProcess.status = 'loading';
      axios.get(addProxy(rssLink))
        .then((response) => {
          const { description, title, items } = parse(response);
          const feedId = _.uniqueId();
          watched.feeds.push({
            feedId, title, description, rssLink,
          });
          const posts = makePosts(feedId, items);
          watched.posts.unshift(...posts);
          watched.loadingProcess.status = 'succeed';
        })
        .catch((err) => {
          watched.loadingProcess.status = 'failed';
          watched.loadingProcess.error = err.message;
        });
    });

    elements.posts.addEventListener('click', (e) => {
      const postId = e.target.dataset.id;
      if (!postId) {
        return;
      }

      if (!watched.uiState.viewedPostsIds.includes(postId)) {
        watched.uiState.viewedPostsIds.push(postId);
      }
      watched.uiState.previewModal.currentPostId = postId;
    });

    watched.appStatus = 'active';
    autoUpdate(watched, updTimeout);
  });
};
