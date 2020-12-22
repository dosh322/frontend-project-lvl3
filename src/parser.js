import _ from 'lodash';

export default (response) => {
  const domparser = new DOMParser();
  const doc = domparser.parseFromString(response.data.contents, 'text/xml');
  try {
    const title = doc.querySelector('title').textContent;
    const description = doc.querySelector('description').textContent;
    const feedId = _.uniqueId();
    const posts = [...doc.querySelectorAll('item')].map((post) => ({
      feedId,
      postId: post.querySelector('guid').textContent,
      title: post.querySelector('title').textContent,
      description: post.querySelector('description').textContent,
      link: post.querySelector('link').textContent,
    }));
    return {
      feedId,
      title,
      description,
      posts,
    };
  } catch (err) {
    throw new Error('ParseError');
  }
};
