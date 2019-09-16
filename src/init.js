import '@babel/polyfill';
import validator from 'validator';

const render = (state) => {
  const input = document.getElementById('formGroupExampleInput');
  if (state.registrationProcess.valid) {
    input.style.border = null;
  } else {
    input.style.border = "thick solid red";
  }
};

const app = () => {
  const state = {
    registrationProcess: {
      valid: true,
    },
  };
  const input = document.getElementById('formGroupExampleInput');
  input.addEventListener('keyup', () => {
    if (validator.isURL(input.value)) {
      alert('YEEEEE');
      state.registrationProcess.valid = true;
    } else {
      alert('NOOO');
      state.registrationProcess.valid = false;
    }
  });
  render(state);
};

export default () => {
  app();
};
