import axios from 'axios';
import i18next from 'i18next';
import _ from 'lodash';
import { initView, renderTextContent } from './view.js';
import autoUpdate from './autoUpdater';
import parse from './parser.js';
import resources from './locales/index.js';
import { getRssLinks, linkPosts, validate } from './helpers';

export default () => {
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  const defaultLanguage = 'en';

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
    loadingProcess: {
      state: 'ready',
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
    renderTextContent(elements);

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
      watched.loadingProcess.state = 'loading';
      watched.rssForm.status = 'submitted';
      axios.get(`${proxyUrl}${rssLink}`)
        .then((response) => {
          const parsedData = parse(response);
          const { description, title, posts } = parsedData;
          const feedId = _.uniqueId();
          watched.feeds.push({
            feedId, title, description, rssLink,
          });
          const linkedPosts = linkPosts(feedId, posts);
          watched.posts.unshift(...linkedPosts);
          watched.rssForm.status = 'succeed';
        })
        .catch((err) => {
          watched.loadingProcess.state = 'failed';
          watched.loadingProcess.error = err.message;
        })
        .finally(() => {
          watched.rssForm.status = 'filling';
          watched.loadingProcess.state = 'ready';
        });
    });
    autoUpdate(watched, proxyUrl);
  });
};
