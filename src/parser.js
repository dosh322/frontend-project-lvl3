export default (response) => {
  console.log(response);
  const domparser = new DOMParser();
  const doc = domparser.parseFromString(response.data, 'text/xml'); // .contents
  try {
    const title = doc.querySelector('title').textContent;
    const description = doc.querySelector('description').textContent;
    const posts = [...doc.querySelectorAll('item')].map((post) => ({
      id: post.querySelector('guid').textContent,
      title: post.querySelector('title').textContent,
      description: post.querySelector('description').textContent,
      link: post.querySelector('link').textContent,
    }));
    return {
      title,
      description,
      posts,
    };
  } catch (err) {
    throw new Error('parseError');
  }
};
