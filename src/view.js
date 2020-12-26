/* eslint-disable no-param-reassign */
import onChange from 'on-change';
import i18next from 'i18next';

const renderTextContent = (elements) => {
  const feedback = document.querySelector('.feedback');
  const feedsHeading = document.querySelector('.feeds h2');
  const postsHeading = document.querySelector('.posts h2');
  const previewBtns = document.querySelectorAll('.preview');

  if (feedback) {
    feedback.textContent = i18next.t(`feedback.${feedback.dataset.type}`);
  } if (feedsHeading) {
    feedsHeading.textContent = i18next.t('feedsTitle');
  } if (postsHeading) {
    postsHeading.textContent = i18next.t('postsTitle');
  } if (previewBtns) {
    previewBtns.forEach((btn) => {
      btn.textContent = i18next.t('preview');
    });
  }

  elements.appName.textContent = i18next.t('appName');
  elements.langToggler.textContent = i18next.t('lng');
  elements.appDescription.textContent = i18next.t('appDescription');
  elements.input.placeholder = i18next.t('inputPlaceholder');
  elements.copyright.textContent = i18next.t('copyright');
  elements.submitBtn.textContent = i18next.t('submit');
  elements.exampleLinkElem.textContent = i18next.t('example');
  elements.modalCloseBtn.textContent = i18next.t('closeBtn');
  elements.modalFullArticle.textContent = i18next.t('full');
};

const buildFeedbackElem = () => {
  const div = document.createElement('div');
  div.classList.add('feedback');
  return div;
};

const buildPreviewBtn = (btnId) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = btnId;
  btn.classList.add('btn', 'btn-primary', 'preview');
  btn.dataset.toggle = 'modal';
  btn.dataset.target = '#modal';
  btn.textContent = i18next.t('preview');
  return btn;
};

const renderValidationErrors = (elements, validStatus, err) => {
  const { exampleLinkElem, input } = elements;
  const feedbackElem = exampleLinkElem.nextElementSibling;

  if (feedbackElem) {
    feedbackElem.remove();
  }
  if (validStatus) {
    input.classList.remove('is-invalid');
    return;
  }

  input.classList.add('is-invalid');
  const errorElem = buildFeedbackElem();
  errorElem.classList.add('text-danger');
  errorElem.dataset.type = err;
  errorElem.textContent = i18next.t(`feedback.${err}`);
  exampleLinkElem.after(errorElem);
};

const renderErrors = (elements, err) => {
  const { exampleLinkElem } = elements;
  const feedbackElem = exampleLinkElem.nextElementSibling;

  if (feedbackElem) {
    feedbackElem.remove();
  }
  if (!err) {
    return;
  }

  const errorElem = buildFeedbackElem();
  errorElem.classList.add('text-danger');
  errorElem.dataset.type = err;
  errorElem.textContent = i18next.t(`feedback.${err}`);
  exampleLinkElem.after(errorElem);
};

const renderFeeds = (elements, feeds) => {
  elements.feeds.innerHTML = '';
  const feedsHeading = document.createElement('h2');
  feedsHeading.textContent = i18next.t('feedsTitle');
  const listOfFeeds = document.createElement('ul');
  listOfFeeds.classList.add('list-group', 'mb-5');

  feeds.forEach((feed) => {
    const { title, description } = feed;
    const list = document.createElement('li');
    list.classList.add('list-group-item');
    const feedTitle = document.createElement('h3');
    const feedDescription = document.createElement('p');
    feedTitle.textContent = title;
    feedDescription.textContent = description;
    list.append(feedTitle, feedDescription);
    listOfFeeds.prepend(list);
  });

  elements.feeds.append(feedsHeading, listOfFeeds);
};

const renderPosts = (elements, posts, state) => {
  elements.posts.innerHTML = '';
  const postsHeading = document.createElement('h2');
  postsHeading.textContent = i18next.t('postsTitle');
  const listOfPosts = document.createElement('ul');
  listOfPosts.classList.add('list-group');

  posts.forEach((post, index) => {
    const {
      title, link, description, id,
    } = post;
    const [postUiState] = state.uiState.posts.filter((postUi) => postUi.id === id);
    const list = document.createElement('li');
    const preview = buildPreviewBtn(index + 1);
    list.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    const postLink = document.createElement('a');
    const fontWeight = postUiState.status === 'opened' ? 'font-weight-normal' : 'font-weight-bold';
    postLink.classList.add(fontWeight);
    postLink.href = link;
    postLink.textContent = title;
    postLink.target = '_blank';
    postLink.addEventListener('click', () => {
      if (postUiState.status === 'opened') {
        return;
      }
      postUiState.status = 'opened';
      postLink.classList.remove('font-weight-bold');
      postLink.classList.add('font-weight-normal');
    });

    preview.addEventListener('click', (e) => {
      e.preventDefault();
      elements.modalTitle.textContent = title;
      elements.modalBody.textContent = description;
      elements.modalFullArticle.href = link;
      if (postUiState.status === 'opened') {
        return;
      }
      postUiState.status = 'opened';
      postLink.classList.remove('font-weight-bold');
      postLink.classList.add('font-weight-normal');
    });

    list.append(postLink, preview);
    listOfPosts.append(list);
  });

  elements.posts.append(postsHeading, listOfPosts);
};

const renderFeedback = (elements) => {
  const { exampleLinkElem } = elements;
  const feedbackElem = exampleLinkElem.nextElementSibling;

  if (feedbackElem) {
    feedbackElem.remove();
  }

  const feedback = buildFeedbackElem();
  feedback.classList.add('text-success');
  feedback.dataset.type = 'success';
  feedback.textContent = i18next.t('feedback.success');
  exampleLinkElem.after(feedback);
};

const processStateHandler = (elements, status) => {
  const { submitBtn, input } = elements;
  switch (status) {
    case 'filling':
      submitBtn.disabled = false;
      input.disabled = false;
      input.value = '';
      renderFeedback(elements);
      break;

    case 'loading':
      submitBtn.disabled = true;
      input.disabled = true;
      break;

    case 'failed':
      submitBtn.disabled = false;
      input.disabled = false;
      input.select();
      break;

    default:
      throw new Error(`Unknown process status: ${status}`);
  }
};

export default (state, elements) => {
  elements.input.focus();

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'rssForm.fields.rssLink.error':
        renderValidationErrors(elements, state.rssForm.fields.rssLink.valid, value);
        break;

      case 'rssForm.status':
        processStateHandler(elements, value);
        break;

      case 'error':
        renderErrors(elements, value);
        break;

      case 'feeds':
        renderFeeds(elements, value);
        break;

      case 'posts':
        renderPosts(elements, value, state);
        break;

      case 'lng':
        renderTextContent(elements);
        break;

      default:
        break;
    }
  });

  return watchedState;
};
