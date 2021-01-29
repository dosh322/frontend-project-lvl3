/* eslint-disable no-param-reassign */
import onChange from 'on-change';
import i18next from 'i18next';

export const textContentHandler = (elements) => {
  elements.appName.textContent = i18next.t('appName');
  elements.appDescription.textContent = i18next.t('appDescription');
  elements.input.placeholder = i18next.t('inputPlaceholder');
  elements.copyright.textContent = i18next.t('copyright');
  elements.submitBtn.textContent = i18next.t('submit');
  elements.exampleLinkElem.textContent = i18next.t('example');
  elements.modalCloseBtn.textContent = i18next.t('closeBtn');
  elements.modalFullArticle.textContent = i18next.t('full');
};

const buildFeedbackElem = (type) => {
  const div = document.createElement('div');
  const textClass = type === 'success' ? 'text-success' : 'text-danger';
  div.classList.add('feedback', textClass);
  div.textContent = i18next.t(`feedback.${type}`, 'Something went wrong! Try again later');
  return div;
};

const buildPreviewBtn = (postId) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.classList.add('btn', 'btn-primary', 'preview');
  btn.dataset.toggle = 'modal';
  btn.dataset.target = '#modal';
  btn.dataset.id = postId;
  btn.textContent = i18next.t('preview');
  return btn;
};

const buildPost = (title, link, id, isPostOpened) => {
  const postLink = document.createElement('a');
  postLink.href = link;
  postLink.textContent = title;
  postLink.target = '_blank';
  postLink.dataset.id = id;
  const fontWeight = isPostOpened ? 'font-weight-normal' : 'font-weight-bold';
  postLink.classList.add(fontWeight);
  return postLink;
};

const errorsHandler = (elements, validStatus, err) => {
  const { exampleLinkElem, input } = elements;
  const feedbackElem = exampleLinkElem.nextElementSibling;

  if (feedbackElem) {
    feedbackElem.remove();
  }
  if (validStatus) {
    input.classList.remove('is-invalid');
  } else {
    input.classList.add('is-invalid');
  }
  if (!err) {
    return;
  }

  const errorElem = buildFeedbackElem(err);
  exampleLinkElem.after(errorElem);
};

const feedsHandler = (elements, feeds) => {
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

const postsHandler = (elements, posts, viewedPosts) => {
  elements.posts.innerHTML = '';
  const postsHeading = document.createElement('h2');
  postsHeading.textContent = i18next.t('postsTitle');
  const listOfPosts = document.createElement('ul');
  listOfPosts.classList.add('list-group');

  posts.forEach((post) => {
    const { title, link, id } = post;
    const isPostOpened = viewedPosts.includes(id);
    const postList = document.createElement('li');
    postList.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    const preview = buildPreviewBtn(id);
    const postLink = buildPost(title, link, id, isPostOpened);
    postList.append(postLink, preview);
    listOfPosts.append(postList);
  });

  elements.posts.append(postsHeading, listOfPosts);
};

const feedbackHandler = (elements, value) => {
  const { exampleLinkElem } = elements;
  const feedbackElem = exampleLinkElem.nextElementSibling;

  if (feedbackElem) {
    feedbackElem.remove();
  }
  if (value === 'succeed') {
    const feedbackType = 'success';
    const feedback = buildFeedbackElem(feedbackType);
    exampleLinkElem.after(feedback);
  }
};

const formStateHandler = (elements, status) => {
  const { submitBtn, input } = elements;
  switch (status) {
    case 'filling':
      submitBtn.disabled = false;
      input.readOnly = false;
      input.value = '';
      input.select();
      break;

    case 'submitted':
      submitBtn.disabled = true;
      input.readOnly = true;
      break;

    case 'failed':
      submitBtn.disabled = false;
      input.readOnly = false;
      input.select();
      break;

    default:
      throw new Error(`Unknown process status: ${status}`);
  }
};

const postsUiHandler = (viewedPostsIds) => {
  viewedPostsIds.forEach((postId) => {
    const viewedPost = document.querySelector(`a[data-id='${postId}']`);
    viewedPost.classList.remove('font-weight-bold');
    viewedPost.classList.add('font-weight-normal');
  });
};

const modalHandler = (posts, currentPostId, elements) => {
  const currentPost = posts.find(({ id }) => id === currentPostId);
  elements.modalTitle.textContent = currentPost.title;
  elements.modalBody.textContent = currentPost.description;
  elements.modalFullArticle.href = currentPost.link;
};

export default (state, elements) => onChange(state, (path, value) => {
  switch (path) {
    case 'appStatus':
      textContentHandler(elements);
      break;

    case 'rssForm.fields.rssLink.error':
      errorsHandler(elements, state.rssForm.fields.rssLink.valid, value);
      break;

    case 'rssForm.status':
      formStateHandler(elements, value);
      break;

    case 'loadingProcess.error':
      errorsHandler(elements, state.rssForm.fields.rssLink.valid, value);
      break;

    case 'feeds':
      feedsHandler(elements, value);
      break;

    case 'posts':
      postsHandler(elements, value, state.uiState.viewedPostsIds);
      break;

    case 'loadingProcess.status':
      feedbackHandler(elements, value);
      break;

    case 'uiState.viewedPostsIds':
      postsUiHandler(state.uiState.viewedPostsIds);
      break;

    case 'uiState.previewModal.currentPostId':
      modalHandler(state.posts, value, elements);
      break;

    default:
      break;
  }
});
