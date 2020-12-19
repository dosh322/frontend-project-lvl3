// import _ from 'lodash';

export default () => {
  const state = {
    rssForm: {
      processState: 'filling',
      valid: true,
      name: null,
      errors: [],
    },
  };

  const form = document.querySelector('form');
  console.log(form);
  console.log('hello World!');
};
