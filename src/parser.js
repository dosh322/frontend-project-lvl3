export default (response) => {
  const domparser = new DOMParser();
  const doc = domparser.parseFromString(response.data, 'text/xml');
  const rss = doc.querySelector('rss');
  if (!rss) {
    throw new Error('invalidRss');
  }
  const title = doc.querySelector('title').textContent;
  const description = doc.querySelector('description').textContent;
  const posts = [...doc.querySelectorAll('item')].map((post) => ({
    title: post.querySelector('title').textContent,
    description: post.querySelector('description').textContent,
    link: post.querySelector('link').textContent,
  }));
  return {
    title,
    description,
    posts,
  };
};
