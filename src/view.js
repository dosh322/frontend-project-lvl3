/* eslint-disable no-param-reassign */
import onChange from 'on-change';

const buildFeedbackElem = () => {
  const div = document.createElement('div');
  div.classList.add('feedback');
  return div;
};

const renderErrors = (elements, form) => {
  const { exampleLinkElem, input } = elements;
  const feedbackElem = exampleLinkElem.nextElementSibling;
  if (feedbackElem) {
    feedbackElem.remove();
  }
  if (form.name.valid) {
    input.classList.remove('is-invalid');
    return;
  }
  input.classList.add('is-invalid');
  const errorElem = buildFeedbackElem();
  errorElem.classList.add('text-danger');
  errorElem.textContent = form.name.error;
  exampleLinkElem.after(errorElem);
};

export default (state, elements) => {
  elements.input.focus();

  const watchedState = onChange(state, (path, value) => {
    console.log(`path is ${path}`);
    console.log(`value is ${value}`);
    if (path === 'rssForm.name.valid') {
      // elements.submitBtn.disabled = true;
    } if (path === 'rssForm.name.error') {
      renderErrors(elements, state.rssForm);
    }
  });

  return watchedState;
};
