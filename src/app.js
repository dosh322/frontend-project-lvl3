import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import initView from './view.js';
import parse from './parser.js';
import resources from './locales/index.js';

export default async () => {
  const proxyUrl = 'https://api.allorigins.win/get?url=';
  const defaultLanguage = 'en';

  await i18next.init({
    lng: defaultLanguage,
    resources,
  });

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
  };

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
    const rssLinks = watched.feeds.map((feed) => feed.rssLink);
    console.log(rssLinks);
    setTimeout(autoUpdate, 5000);
  };

  document.addEventListener('DOMContentLoaded', () => {
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
    axios.get(`${proxyUrl}${encodeURIComponent(rssLink)}`)
      .then((response) => parse(response))
      .then(({
        feedId,
        title,
        description,
        posts,
      }) => {
        watched.feeds.push({
          feedId,
          title,
          description,
          rssLink,
        });
        watched.posts.unshift(...posts);
        watched.rssForm.status = 'filling';
      }).catch((err) => {
        watched.rssForm.status = 'failed';
        watched.error = err.message;
        throw err;
      });
  });
  autoUpdate();
};
