import '@babel/polyfill';
import validator from 'validator';
import axios from 'axios';
import WatchJS from 'melanke-watchjs';

const parseRss = (rss) => {
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

export default () => {
  const state = {
    registrationProcess: 'valid',
    listChannels: [],
    listChannelNews: [],
  };

  const checkNewNews = () => {
    state.listChannels.forEach((elem) => {
      const oldChannel = elem.channel;
      const oldChannelItems = oldChannel.listItems.concat();
      const oldChannelLinks = new Set(oldChannelItems.map((item) => item.link));
      axios.get(`https://cors-anywhere.herokuapp.com/${elem.url}`)
        .then((response) => {
          const newChannel = parseRss(response.data);
          const newChannelItems = newChannel.listItems;
          newChannelItems.map((item) => {
            if (!oldChannelLinks.has(item.link)) {
              const updatedItemsChannel = oldChannelItems.concat();
              updatedItemsChannel.unshift(item);
              oldChannel.listItems = updatedItemsChannel;
            }
            return null;
          });
        }).catch(() => {
          oldChannel.listItems = oldChannelItems;
        });
    });
  };

  setInterval(checkNewNews, 5000);

  const isValidUrl = (url) => validator.isURL(url)
   && state.listChannels.filter((elem) => elem.url === url).length === 0;

  WatchJS.watch(state, 'registrationProcess', () => {
    const input = document.getElementById('formGroupExampleInput');
    if (state.registrationProcess === 'added') {
      const form = input.closest('form');
      form.reset();
    }
    if (state.registrationProcess === 'valid') {
      input.classList.remove('is-invalid');
    }
    if (state.registrationProcess === 'invalid') {
      input.classList.add('is-invalid');
    }
  });

  WatchJS.watch(state, 'listChannels', () => {
    const listChannel = document.querySelector('.list-group');
    const beforeActiveChannel = listChannel.querySelector('.active');
    listChannel.innerHTML = '';
    state.listChannels.forEach((elem) => {
      const listChannelElem = document.createElement('a');
      listChannelElem.setAttribute('href', '#');
      listChannelElem.setAttribute('url', elem.url);
      listChannelElem.classList.add('list-group-item', 'list-group-item-action');
      if (elem.targetStatus) {
        if (beforeActiveChannel !== null) {
          beforeActiveChannel.classList.remove('active');
        }
        listChannelElem.classList.add('active');
      }
      const div = document.createElement('div');
      div.classList.add('d-flex', 'w-100', 'justify-content-between');
      const h5 = document.createElement('h5');
      h5.classList.add('mb-1');
      h5.textContent = elem.channel.title;
      div.append(h5);
      listChannelElem.append(div);
      const p = document.createElement('p');
      p.classList.add('mb-1');
      p.textContent = elem.channel.description;
      listChannelElem.append(p);
      listChannel.append(listChannelElem);
    });
  });

  WatchJS.watch(state, 'ListChannelNews', () => {
    const listNews = document.getElementById('listNews');
    listNews.innerHTML = '';
    state.ListChannelNews.forEach((elem) => {
      const news = document.createElement('li');
      news.classList.add('list-group-item');
      const a = document.createElement('a');
      a.setAttribute('href', elem.link);
      a.setAttribute('target', '_blank');
      a.textContent = elem.title;
      news.append(a);
      const buttonModal = document.createElement('button');
      buttonModal.setAttribute('type', 'button');
      buttonModal.classList.add('btn', 'btn-primary');
      buttonModal.setAttribute('data-toggle', 'modal');
      buttonModal.setAttribute('data-target', '#exampleModal');
      buttonModal.setAttribute('style', 'float: right');
      buttonModal.textContent = 'Подробнее';
      buttonModal.addEventListener('click', () => {
        const titleNews = elem.title;
        const descriptionNews = elem.description;
        const modalTitle = document.querySelector('.modal-title');
        const modalBody = document.querySelector('.modal-body');
        modalTitle.textContent = titleNews;
        modalBody.textContent = descriptionNews;
      });
      news.append(buttonModal);
      listNews.append(news);
    });
  });

  const input = document.getElementById('formGroupExampleInput');
  input.addEventListener('keyup', (e) => {
    if (isValidUrl(e.currentTarget.value) || e.currentTarget.value === '') {
      state.registrationProcess = 'valid';
    } else {
      state.registrationProcess = 'invalid';
    }
  });

  const listChannel = document.getElementById('listChannel');

  listChannel.addEventListener('click', (e) => {
    const targetButtonChannel = e.target.closest('.list-group-item-action');
    const url = targetButtonChannel.getAttribute('url');
    state.listChannels.forEach((elem) => {
      const element = elem;
      element.targetStatus = false;
      if (element.url === url) {
        element.targetStatus = true;
        state.ListChannelNews = element.channel.listItems;
      }
    });
  });

  const button = document.querySelector('.jumbotron');
  button.addEventListener('submit', (e) => {
    e.preventDefault();
    const target = e.currentTarget;
    const inputForm = target.querySelector('input');
    const inputFormValue = inputForm.value;

    axios.get(`https://cors-anywhere.herokuapp.com/${inputFormValue}`)
      .then((response) => {
        const channel = parseRss(response.data);
        const targetStatus = false;
        const url = inputFormValue;

        if (state.listChannels.filter((elem) => elem.url === url).length > 0) {
          state.registrationProcess = 'invalid';
        } else {
          state.listChannels.push({ channel, targetStatus, url });
          state.registrationProcess = 'added';
        }
      });
  });
};
