import '@babel/polyfill';
import validator from 'validator';
import axios from 'axios';
import WatchJS from 'melanke-watchjs';
import _ from 'lodash';

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
    networkStatus: 'networkStable',
  };

  const addNewItemsChannel = (url) => {
    state.listChannels.forEach((elem) => {
      if (elem.url !== url) {
        return;
      }
      const oldChannel = elem.channel;
      const oldChannelItems = oldChannel.listItems;
      axios.get(`https://cors-anywhere.herokuapp.com/${elem.url}`)
        .then((response) => {
          state.networkStatus = 'networkStable';
          const newChannel = parseRss(response.data);
          const newChannelItems = newChannel.listItems;
          const unionChannelItems = _.unionBy(newChannelItems, oldChannelItems, 'link');
          oldChannel.listItems = unionChannelItems;
        })
        .catch((e) => {
          console.log(e);
          state.networkStatus = 'Error';
        })
        .finally(() => {
          setTimeout(() => addNewItemsChannel(url), 5000);
        });
    });
  };


  const isValidUrl = (url) => validator.isURL(url)
   && state.listChannels.filter((elem) => elem.url === url).length === 0;

  WatchJS.watch(state, 'registrationProcess', () => {
    const input = document.getElementById('formGroupExampleInput');
    const form = input.closest('form');
    const button = document.querySelector('[data-toggle="submitJumbotron"]');
    const alert = document.getElementById('alertUpload');
    switch (state.registrationProcess) {
      case 'upload':
        button.setAttribute('disabled', '');
        input.setAttribute('disabled', '');
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Загрузка...';
        break;

      case 'notLoaded':
        button.removeAttribute('disabled');
        input.removeAttribute('disabled');
        form.reset();
        button.innerHTML = 'Добавить';
        alert.innerHTML = `
          <div class="alert alert-warning alert-danger fade show" role="alert">
            <strong>Ошибка!</strong> Не получилось загрузить данные.
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>`;
        break;

      case 'added':
        form.reset();
        button.removeAttribute('disabled');
        input.removeAttribute('disabled');
        button.innerHTML = 'Добавить канал';
        break;

      case 'valid':
        input.classList.remove('is-invalid');
        break;

      case 'invalid':
        input.classList.add('is-invalid');
        break;

      default:
        throw new Error(`No suitable type: ${state.registrationProcess}`);
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

      listChannelElem.innerHTML = `
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1">${elem.channel.title}</h5>
        </div>
        <p class="mb-1">${elem.channel.description}</p>
      `;

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
      buttonModal.classList.add('btn', 'btn-primary');
      buttonModal.setAttribute('type', 'button');
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

  WatchJS.watch(state, 'networkStatus', () => {
    const alert = document.getElementById('alert');
    switch (state.networkStatus) {
      case 'Error':
        alert.innerHTML = `<div class="alert alert-danger" role="alert">
        <strong>Внимание!</strong> Возникла ошибка при запросе данных - проверьте соединение с интернетом.
      </div>`;
        break;

      case 'networkStable':
        alert.innerHTML = '';
        break;

      default:
        throw new Error(`No suitable type: ${state.networkStatus}`);
    }
  });

  const input = document.getElementById('formGroupExampleInput');
  input.addEventListener('keyup', (e) => {
    if (isValidUrl(e.currentTarget.value) || e.currentTarget.value === '') {
      state.registrationProcess = 'valid';
    } else {
      state.registrationProcess = 'invalid';
    }
  });

  const listChannels = document.getElementById('listChannels');

  listChannels.addEventListener('click', (e) => {
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
    const inputForm = target.querySelector('[data-toggle="inputJumbotron"]');
    const inputFormValue = inputForm.value;
    state.registrationProcess = 'upload';
    axios.get(`https://cors-anywhere.herokuapp.com/${inputFormValue}`)
      .then((response) => {
        const channel = parseRss(response.data);
        const targetStatus = false;
        const url = inputFormValue;

        if (!isValidUrl(url)) {
          state.registrationProcess = 'invalid';
        } else {
          state.listChannels.push({ channel, targetStatus, url });
          state.registrationProcess = 'added';
        }
      })
      .catch((error) => {
        console.log(error);
        state.registrationProcess = 'notLoaded';
      })
      .finally(() => {
        const isAddedChannelFlag = state.listChannels
          .find((elem) => elem.url === inputFormValue) !== undefined;

        if (isAddedChannelFlag) {
          addNewItemsChannel(inputFormValue);
        }
      });
  });
};
