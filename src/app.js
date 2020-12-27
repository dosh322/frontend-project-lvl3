import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import _ from 'lodash';
import initView from './view.js';
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
    langToggler: document.querySelector('#lang-toggler'),
    copyright: document.querySelector('#copyright'),
    appName: document.querySelector('#app-name'),
    appDescription: document.querySelector('#app-description'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalFullArticle: document.querySelector('.full-article'),
    modalCloseBtn: document.querySelector('.close-btn'),
  };

  const state = {
    lng: null,
    rssForm: {
      status: 'filling',
      fields: {
        rssLink: {
          valid: true,
          error: null,
        },
      },
    },
    error: null,
    feeds: [],
    posts: [],
    uiState: {
      posts: [],
    },
  };

  console.log(state.uiState.posts);

  const watched = initView(state, elements);

  const getRssLinks = () => watched.feeds.map((feed) => feed.rssLink);

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
    watched.feeds.forEach(({ rssLink, feedId }) => {
      const currentPosts = watched.posts.filter((post) => post.feedId === feedId);
      axios.get(`${proxyUrl}${rssLink}`)
        .then((responce) => parse(responce))
        .then(({ posts }) => posts.filter((post) => !currentPosts
          .some((currentPost) => currentPost.id === post.id)))
        .then((newPosts) => newPosts.map(({
          id, title, description, link,
        }) => ({
          id, feedId, title, description, link,
        })))
        .then((linkedNewPosts) => {
          linkedNewPosts.forEach(({ id }) => {
            watched.uiState.posts.unshift({ id, status: 'unread' });
          });
          watched.posts.unshift(...linkedNewPosts);
        });
    });
    setTimeout(autoUpdate, checkForUpdTimer);
  };

  i18next.init({
    lng: defaultLanguage,
    resources,
  }).then(() => {
    watched.lng = defaultLanguage;
  });

  elements.langToggler.addEventListener('click', (e) => {
    e.preventDefault();
    const newLng = watched.lng === 'en' ? 'ru' : 'en';
    i18next.changeLanguage(newLng);
    watched.lng = newLng;
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watched.error = null;
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
      .then(({
        title, description, posts,
      }) => ({
        feedId: _.uniqueId(), title, description, posts,
      }))
      .then(({
        feedId, title, description, posts,
      }) => {
        watched.feeds.push({
          feedId, title, description, rssLink,
        });
        console.log('here');
        return { feedId, posts };
      })
      .then(({ feedId, posts }) => {
        const linkedPosts = posts.map(({
          id, title, description, link,
        }) => ({
          feedId, id, title, description, link,
        }));

        posts.forEach(({ id }) => {
          watched.uiState.posts.unshift({ id, status: 'unread' });
        });
        watched.posts.unshift(...linkedPosts);
        watched.rssForm.status = 'filling';
      })
      .catch((err) => {
        watched.rssForm.status = 'failed';
        watched.error = err.message;
        throw err;
      });
  });

  autoUpdate();
};
