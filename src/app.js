import axios from 'axios';
import i18next from 'i18next';
import _ from 'lodash';
import initView from './view.js';
import autoUpdate from './autoUpdater';
import parse from './parser.js';
import resources from './locales/index.js';
import {
  addProxy, getRssLinks, makePosts, validate,
} from './helpers';

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
      status: 'ready',
      error: null,
    },
    rssForm: {
      status: 'filling',
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
        watched.rssForm.fields.rssLink.valid = false;
        watched.rssForm.fields.rssLink.error = error;
        return;
      }

      watched.rssForm.fields.rssLink.valid = true;
      watched.rssForm.fields.rssLink.error = null;
      watched.loadingProcess.status = 'loading';
      watched.rssForm.status = 'submitted';
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
          watched.rssForm.status = 'filling';
        })
        .catch((err) => {
          console.log(err);
          watched.rssForm.status = 'filling';
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
