import * as yup from 'yup';
import axios from 'axios';
import initView from './view.js';
import parse from './parser.js';

export default () => {
  const proxyUrl = 'https://api.allorigins.win/get?url=';

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.form-control'),
    submitBtn: document.querySelector('form .btn'),
    exampleLinkElem: document.querySelector('#example-link'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
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
    error: null,
    feeds: [],
    posts: [],
  };

  const watched = initView(state, elements);

  const getRssLinks = () => watched.feeds.map((feed) => feed.rssLink);

  const validate = (rsslink) => {
    const schema = yup.string().url()
      .notOneOf(getRssLinks(), 'not one of');
    try {
      schema.validateSync(rsslink);
      return null;
    } catch (err) {
      return err.message;
    }
  };

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
        watched.posts.push(...posts);
        watched.rssForm.status = 'filling';
      }).catch((err) => {
        watched.rssForm.status = 'failed';
        watched.error = err.message;
        throw err;
      });
  });
};
