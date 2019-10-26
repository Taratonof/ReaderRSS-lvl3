export const viewUploadingFid = (state) => () => {
  const alert = document.getElementById('alertFid');
  switch (state.processUploadingFid) {
    case 'uploadingFid':
      break;

    case 'loadedFid':
      alert.innerHTML = '';
      break;

    case 'notLoadedFid':
      alert.innerHTML = `
        <div class="alert alert-warning alert-danger fade show" role="alert">
          <strong>Внимание!</strong> Возникла ошибка при запросе данных - проверьте соединение с интернетом.
        </div>`;
      break;

    default:
      throw new Error(`No suitable type "processUploadingFid": ${state.processUploadingFid}`);
  }
};

export const viewUploadingRss = (state) => () => {
  const input = document.getElementById('formGroupExampleInput');
  const form = input.closest('form');
  const button = document.querySelector('[data-toggle="submitJumbotron"]');
  const alert = document.getElementById('alertUploadingRss');
  switch (state.processUploadingRss) {
    case 'valid':
      input.classList.remove('is-invalid');
      break;

    case 'invalid':
      input.classList.add('is-invalid');
      break;

    case 'uploading':
      button.setAttribute('disabled', '');
      input.setAttribute('disabled', '');
      button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Загрузка...';
      break;

    case 'loaded':
      form.reset();
      button.removeAttribute('disabled');
      input.removeAttribute('disabled');
      button.innerHTML = 'Добавить';
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

    default:
      throw new Error(`No suitable type "processUploadingRss": ${state.processUploadingRss}`);
  }
};

export const viewListChannels = (state) => () => {
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
};

export const viewListChannelNews = (state) => () => {
  const listNews = document.getElementById('listNews');
  listNews.innerHTML = '';
  state.ListChannelNews.forEach((elem) => {
    const news = document.createElement('li');
    news.classList.add('list-group-item');
    news.innerHTML = `
      <a href="${elem.link}" target="_blank">${elem.title}</a>
      <button class="btn btn-primary type="button" data-toggle="modal" data-target="#exampleModal" style="float: right">Подробнее</button>`;
    const buttonModal = news.querySelector('button');
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
};
