// import _ from 'lodash';
import * as yup from 'yup';
// import axios from 'axios';
// import _ from 'lodash';
import initView from './view.js';

export default () => {
  // const proxyUrl = 'https://api.allorigins.win/';

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.form-control'),
    submitBtn: document.querySelector('form .btn'),
    exampleLinkElem: document.querySelector('#example-link'),
  };

  const state = {
    rssForm: {
      processState: 'filling',
      valid: true,
      name: {
        valid: true,
        error: null,
      },
    },
    errors: [],
    feeds: [],
    posts: [],
  };

  const validate = (rsslink) => {
    const schema = yup.string().url();
    try {
      schema.validateSync(rsslink);
      return null;
    } catch (err) {
      console.log(err);
      return err.message;
    }
  };

  const watched = initView(state, elements);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('url');
    const errors = validate(value);
    watched.rssForm.name.valid = !errors;
    watched.rssForm.name.error = errors;
    if (errors) {
      return;
    }
  });
};
