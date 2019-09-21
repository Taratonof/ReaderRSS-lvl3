import '@babel/polyfill';
import validator from 'validator';
import axios from 'axios';

const render = (state) => {
  const input = document.getElementById('formGroupExampleInput');
  if (state.registrationProcess.valid) {
    input.classList.remove('is-invalid');
  } else {
    input.classList.add('is-invalid');
  }
  const listChannel = document.querySelector('.list-group');
  listChannel.innerHTML = '';
  state.listChannelState.forEach((elem) => {
    const listChannelElem = document.createElement('a');
    listChannelElem.setAttribute('href', '#');
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
  console.log(state.listChannelState);
};

const app = () => {
  const state = {
    registrationProcess: {
      valid: true,
    },
    listChannelState: [],
  };
  const input = document.getElementById('formGroupExampleInput');
  input.addEventListener('keyup', () => {
    if (validator.isURL(input.value)) {
      state.registrationProcess.valid = true;
      render(state);
    } else {
      state.registrationProcess.valid = false;
      render(state);
    }
  });

  const button = document.querySelector('.btn-primary');
  button.addEventListener('click', () => {
    axios.get(`https://cors-anywhere.herokuapp.com/${input.value}`)
      .then((response) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(response.data, 'application/xml');
        const title = doc.querySelector('title').textContent;
        const description = doc.querySelector('description').textContent;
        state.listChannelState.push({ title, description });
        render(state);
        //console.log(doc.querySelector('title').textContent);
      });
  });
};

export default () => {
  app();
};
