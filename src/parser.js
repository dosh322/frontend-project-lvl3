export default (response) => {
  const domparser = new DOMParser();
  const doc = domparser.parseFromString(response.data.contents, 'text/xml');
  const error = doc.querySelector('parsererror');
  if (error) {
    throw new Error('invalidRss');
  }
  const title = doc.querySelector('title').textContent;
  const description = doc.querySelector('description').textContent;
  const items = [...doc.querySelectorAll('item')].map((post) => ({
    title: post.querySelector('title').textContent,
    description: post.querySelector('description').textContent,
    link: post.querySelector('link').textContent,
  }));
  return {
    title,
    description,
    items,
  };
};
