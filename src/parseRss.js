export default (rss) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rss, 'application/xml');
  const title = doc.querySelector('title').textContent;
  const description = doc.querySelector('description').textContent;
  const items = [...doc.querySelectorAll('item')];
  const listItems = items.map((item) => {
    const obj = {
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
    };
    return obj;
  });
  return { title, description, listItems };
};
