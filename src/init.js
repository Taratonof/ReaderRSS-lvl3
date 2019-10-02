import '@babel/polyfill';
import validator from 'validator';
import axios from 'axios';
import WatchJS from 'melanke-watchjs';

const app = () => {
  const state = {
    registrationProcess: {
      valid: true,
    },
    listChannels: [],
    itemChannel: [],
    menu: {
      target: null,
    },
  };

  const domParseFromString = (data, format) => {
    const parser = new DOMParser();
    const document = parser.parseFromString(data, format);
    return document;
  };

  const checkNewNews = () => {
    state.listChannels.forEach((elem) => {
      axios.get(`https://cors-anywhere.herokuapp.com/${elem.url}`)
        .then((response) => {
          const doc = domParseFromString(response.data, 'application/xml');
          const items = [...doc.querySelectorAll('item')];
          const listItems = items.reduce((acc, item) => {
            const obj = {
              title: item.querySelector('title').textContent,
              description: item.querySelector('description').textContent,
              link: item.querySelector('link').textContent,
            };
            acc.push(obj);
            return acc;
          }, []);
          // eslint-disable-next-line no-param-reassign
          elem.listItems = listItems;
        });
    });
  };

  setInterval(checkNewNews, 5000);

  const validation = (url) => {
    if ((validator.isURL(url) && state.listChannels.filter((elem) => elem.url === url).length === 0) || url === '') {
      return true;
    }
    return false;
  };

  const input = document.getElementById('formGroupExampleInput');
  input.addEventListener('keyup', (e) => {
    if (validation(e.currentTarget.value)) {
      state.registrationProcess.valid = true;
    } else {
      state.registrationProcess.valid = false;
    }
  });

  WatchJS.watch(state, 'registrationProcess', () => {
    const inputtt = document.getElementById('formGroupExampleInput');
    if (state.registrationProcess.valid) {
      inputtt.classList.remove('is-invalid');
    }
    if (!state.registrationProcess.valid) {
      inputtt.classList.add('is-invalid');
    }
  });

  WatchJS.watch(state, 'listChannels', () => {
    const listChannel = document.querySelector('.list-group');
    const beforeActiveChannel = listChannel.querySelector('.active');
    const beforeActiveChannelUrl = (beforeActiveChannel === null) ? '' : beforeActiveChannel.getAttribute('url');
    listChannel.innerHTML = '';
    state.listChannels.forEach((elem) => {
      const listChannelElem = document.createElement('a');
      listChannelElem.setAttribute('href', '#');
      listChannelElem.setAttribute('url', elem.url);
      listChannelElem.classList.add('list-group-item', 'list-group-item-action');
      if (elem.url === beforeActiveChannelUrl) {
        listChannelElem.classList.add('active');
      }
      const div = document.createElement('div');
      div.classList.add('d-flex', 'w-100', 'justify-content-between');
      const h5 = document.createElement('h5');
      h5.classList.add('mb-1');
      h5.textContent = elem.title;
      div.append(h5);
      listChannelElem.append(div);
      const p = document.createElement('p');
      p.classList.add('mb-1');
      p.textContent = elem.description;
      listChannelElem.append(p);
      listChannel.append(listChannelElem);
    });
  });


  const listChannel = document.getElementById('ggg');
  WatchJS.watch(state, 'menu', () => {
    const beforeActiveButton = listChannel.querySelector('.active');
    if (beforeActiveButton !== null) {
      beforeActiveButton.classList.remove('active');
    }
    state.menu.target.classList.add('active');
  });

  WatchJS.watch(state, 'itemChannel', () => {
    const listNews = document.getElementById('listNews');
    listNews.innerHTML = '';
    state.itemChannel.forEach((elem) => {
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

  listChannel.addEventListener('click', (e) => {
    const targetButtonChanel = e.target.closest('.list-group-item-action');
    state.menu.target = targetButtonChanel;
    const url = targetButtonChanel.getAttribute('url');
    state.listChannels.forEach((elem) => {
      if (elem.url === url) {
        state.itemChannel = elem.listItems;
      }
    });
  });

  const button = document.querySelector('.jumbotron');
  button.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputForm = e.currentTarget.querySelector('input');
    axios.get(`https://cors-anywhere.herokuapp.com/${inputForm.value}`)
      .then((response) => {
        const doc = domParseFromString(response.data, 'application/xml');
        const title = doc.querySelector('title').textContent;
        const description = doc.querySelector('description').textContent;
        const url = input.value;
        const items = [...doc.querySelectorAll('item')];
        //
        const listItems = items.reduce((acc, item) => {
          const obj = {
            title: item.querySelector('title').textContent,
            description: item.querySelector('description').textContent,
            link: item.querySelector('link').textContent,
          };
          acc.push(obj);
          return acc;
        }, []);
        //
        if (state.listChannels.filter((elem) => elem.url === url).length > 0) {
          state.registrationProcess.valid = false;
        } else {
          state.listChannels.push({
            title, description, url, listItems,
          });
          inputForm.value = '';
          state.registrationProcess.valid = true;
        }
      });
  });
};

export default () => {
  app();
};
