/* eslint-disable no-param-reassign */
import onChange from 'on-change';

const buildFeedbackElem = () => {
  const div = document.createElement('div');
  div.classList.add('feedback');
  return div;
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
  errorElem.textContent = err;
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
  errorElem.textContent = err;
  exampleLinkElem.after(errorElem);
};

const renderFeeds = (elements, feeds) => {
  elements.feeds.innerHTML = '';
  const feedsHeading = document.createElement('h2');
  feedsHeading.textContent = 'Feeds';
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

const renderPosts = (elements, posts) => {
  console.log(posts);
  const postsHeading = document.createElement('h2');
  postsHeading.textContent = 'Posts';
  const listOfPosts = document.createElement('ul');
  listOfPosts.classList.add('list-group');
  posts.forEach((post) => {
    const { title, link } = post;
    const list = document.createElement('li');
    list.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    const postLink = document.createElement('a');
    postLink.href = link;
    postLink.textContent = title;
    list.append(postLink);
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
  feedback.textContent = 'Rss has been loaded';
  exampleLinkElem.after(feedback);
};

const processStateHandler = (elements, status) => {
  const { submitBtn, input } = elements;
  switch (status) {
    case 'filling':
      submitBtn.disabled = false;
      input.textContent = '';
      input.disabled = false;
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
    console.log(path);
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
        renderPosts(elements, value);
        break;

      default:
        break;
    }
  });

  return watchedState;
};
