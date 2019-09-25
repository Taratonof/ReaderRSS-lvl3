import '@babel/polyfill';
import validator from 'validator';
import axios from 'axios';
import WatchJS from 'melanke-watchjs';

const app = () => {
  const state = {
    registrationProcess: {
      flag: 0,
      valid: true,
    },
    listChannelState: [],
    itemChannel: [],
    menu: {
      click: false,
      target: null,
    },
  };

  const checkUrlList = (url, list) => {
    let flag = false;
    list.forEach((elem) => {
      if (elem.url === url) {
        flag = true;
      }
    });
    return flag;
  };

  const input = document.getElementById('formGroupExampleInput');
  input.addEventListener('keyup', () => {
    if ((validator.isURL(input.value) && !checkUrlList(input.value, state.listChannelState)) || input.value === '') {
      state.registrationProcess.valid = true;
      state.registrationProcess.flag += 1;
    } else {
      state.registrationProcess.valid = false;
      state.registrationProcess.flag -= 1;
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
    const listChannel = document.querySelector('.list-group');
    listChannel.innerHTML = '';
    state.listChannelState.forEach((elem) => {
      const listChannelElem = document.createElement('a');
      listChannelElem.setAttribute('href', '#');
      listChannelElem.setAttribute('url', elem.url);
      listChannelElem.classList.add('list-group-item', 'list-group-item-action');
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
    if (!state.menu) {
      return;
    }
    const beforeActiveButton = listChannel.querySelector('.active');
    if (beforeActiveButton !== null) {
      beforeActiveButton.classList.remove('active');
    }
    state.menu.target.classList.add('active');
    state.menu.click = false;
  });
  WatchJS.watch(state, 'itemChannel', () => {
    const listNews = document.getElementById('listNews');
    listNews.innerHTML = '';
    state.itemChannel.forEach((elem) => {
      const news = document.createElement('li');
      news.classList.add('list-group-item');
      const a = document.createElement('a');
      a.setAttribute('href', elem.querySelector('link').textContent);
      a.setAttribute('target', '_blank');
      a.textContent = elem.querySelector('title').textContent;
      news.append(a);
      const buttonModal = document.createElement('button');
      buttonModal.setAttribute('type', 'button');
      buttonModal.classList.add('btn', 'btn-primary');
      buttonModal.setAttribute('data-toggle', 'modal');
      buttonModal.setAttribute('data-target', '#exampleModal');
      buttonModal.setAttribute('style', 'float: right');
      buttonModal.textContent = 'Подробнее';
      buttonModal.addEventListener('click', () => {
        const titleNews = elem.querySelector('title').textContent;
        const descriptionNews = elem.querySelector('description').textContent;
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
    state.menu.click = true;
    const targetButtonChanel = e.target.closest('.list-group-item-action');
    state.menu.target = targetButtonChanel;
    axios.get(`https://cors-anywhere.herokuapp.com/${targetButtonChanel.getAttribute('url')}`)
      .then((response) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(response.data, 'application/xml');
        const items = [...doc.querySelectorAll('item')];
        state.itemChannel = items;
      });
  });

  const button = document.querySelector('.btn-primary');
  button.addEventListener('click', () => {
    axios.get(`https://cors-anywhere.herokuapp.com/${input.value}`)
      .then((response) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(response.data, 'application/xml');
        const title = doc.querySelector('title').textContent;
        const description = doc.querySelector('description').textContent;
        const url = input.value;
        if (checkUrlList(url, state.listChannelState)) {
          state.registrationProcess.valid = false;
          state.registrationProcess.flag += 1;
        } else {
          state.listChannelState.push({ title, description, url });
          input.value = '';
          state.registrationProcess.valid = true;
          state.registrationProcess.flag -= 1;
        }
      });
  });
};

export default () => {
  app();
};
