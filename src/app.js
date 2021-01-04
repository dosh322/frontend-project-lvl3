import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import _ from 'lodash';
import { initView, renderTextContent } from './view.js';
import parse from './parser.js';
import resources from './locales/index.js';

export default () => {
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  const defaultLanguage = 'en';
  const checkForUpdTimer = 5000;

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
    rssForm: {
      status: 'filling',
      fields: {
        rssLink: {
          valid: true,
          error: null,
        },
      },
    },
    networkError: null,
    feeds: [],
    posts: [],
    uiState: {
      viewedPostsIds: [],
      previewModal: {
        currentPostId: null,
      },
    },
  };

  const watched = initView(state, elements);

  const getRssLinks = () => watched.feeds.map((feed) => feed.rssLink);

  const linkPosts = (feedId, posts) => posts.map((post) => ({ feedId, id: _.uniqueId(), ...post }));

  const validate = (rsslink) => {
    const schema = yup.string().url('url')
      .notOneOf(getRssLinks(), 'double');
    try {
      schema.validateSync(rsslink);
      return null;
    } catch (err) {
      return err.message;
    }
  };

  const autoUpdate = () => {
    if (watched.feeds.length === 0) {
      setTimeout(autoUpdate, checkForUpdTimer);
    }

    watched.feeds.forEach(({ rssLink, feedId }) => {
      const currentPosts = watched.posts.filter((post) => post.feedId === feedId);

      axios.get(`${proxyUrl}${rssLink}`)
        .then((responce) => parse(responce))
        .then(({ posts }) => posts.filter((post) => !currentPosts
          .some((currentPost) => currentPost.title === post.title
            && currentPost.description === post.description)))
        .then((newPosts) => linkPosts(feedId, newPosts))
        .then((linkedNewPosts) => {
          watched.posts.unshift(...linkedNewPosts);
        })
        .finally(() => setTimeout(autoUpdate, checkForUpdTimer));
    });
  };

  autoUpdate();

  i18next.init({
    lng: defaultLanguage,
    resources,
  }).then(() => {
    renderTextContent(elements);

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      watched.networkError = null;
      const formData = new FormData(e.target);
      const rssLink = formData.get('url').trim();
      const errors = validate(rssLink);
      watched.rssForm.fields.rssLink.valid = !errors;
      watched.rssForm.fields.rssLink.error = errors;

      if (errors) {
        return;
      }

      watched.rssForm.status = 'loading';
      axios.get(`${proxyUrl}${rssLink}`)
        .then((response) => parse(response))
        .then((parsedData) => ({
          feedId: _.uniqueId(), ...parsedData,
        }))
        .then(({
          feedId, title, description, posts,
        }) => {
          watched.feeds.push({
            feedId, title, description, rssLink,
          });
          return { feedId, posts };
        })
        .then(({ feedId, posts }) => {
          const linkedPosts = linkPosts(feedId, posts);
          watched.posts.unshift(...linkedPosts);
          watched.rssForm.status = 'filling';
        })
        .catch((err) => {
          watched.rssForm.status = 'failed';
          watched.networkError = err.message;
          throw err;
        });
    });
  });
};
