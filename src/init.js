import '@babel/polyfill';
import validator from 'validator';
import axios from 'axios';
import WatchJS from 'melanke-watchjs';
import _ from 'lodash';
import parseRss from './parseRss';
import * as views from './watchers/views';

export default () => {
  const state = {
    validationForm: 'valid',
    processUploadingRss: 'loaded',
    processUpdatingRss: 'updating',
    listChannels: [],
    listChannelNews: [],
  };

  WatchJS.watch(state, 'validationForm', views.viewValidationForm(state));

  WatchJS.watch(state, 'processUploadingRss', views.viewUploadingRss(state));

  WatchJS.watch(state, 'processUpdatingRss', views.viewUpdatingRss(state));

  WatchJS.watch(state, 'listChannels', views.viewListChannels(state));

  WatchJS.watch(state, 'ListChannelNews', views.viewListChannelNews(state));

  const addNewItemsChannel = (url) => {
    state.listChannels.forEach((elem) => {
      if (elem.url !== url) {
        return;
      }
      const oldChannel = elem.channel;
      const oldChannelItems = oldChannel.listItems;
      state.processUpdatingRss = 'updating';
      axios.get(`https://cors-anywhere.herokuapp.com/${elem.url}`)
        .then((response) => {
          state.processUpdatingRss = 'updated';
          const newChannel = parseRss(response.data);
          const newChannelItems = newChannel.listItems;
          const unionChannelItems = _.unionBy(newChannelItems, oldChannelItems, 'link');
          oldChannel.listItems = unionChannelItems;
        })
        .catch((e) => {
          console.log(e);
          state.processUpdatingRss = 'notUpdated';
        })
        .finally(() => {
          setTimeout(() => addNewItemsChannel(url), 5000);
        });
    });
  };


  const isValidUrl = (url) => validator.isURL(url)
   && state.listChannels.filter((elem) => elem.url === url).length === 0;

  const input = document.getElementById('formGroupExampleInput');

  input.addEventListener('input', (e) => {
    if (isValidUrl(e.currentTarget.value) || e.currentTarget.value === '') {
      state.validationForm = 'valid';
    } else {
      state.validationForm = 'invalid';
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

  const jumbotron = document.querySelector('.jumbotron');
  const form = jumbotron.querySelector('form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const target = e.currentTarget;
    const inputForm = target.querySelector('[data-toggle="inputJumbotron"]');
    const inputFormValue = inputForm.value;
    state.processUploadingRss = 'uploading';
    axios.get(`https://cors-anywhere.herokuapp.com/${inputFormValue}`)
      .then((response) => {
        const channel = parseRss(response.data);
        const targetStatus = false;
        const url = inputFormValue;

        if (!isValidUrl(url)) {
          state.processUploadingRss = 'loaded';
          state.validationForm = 'valid';
        } else {
          state.listChannels.push({ channel, targetStatus, url });
          state.processUploadingRss = 'loaded';
        }
      })
      .catch((error) => {
        console.log(error);
        state.processUploadingRss = 'notLoaded';
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
