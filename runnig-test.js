// POST http://localhost:3000/resolveRecaptcha HTTP/1.1
// content-type: application/json

// {
//     "urlRecaptcha": "https://portalbnmp.cnj.jus.br/",
//     "waitSelectorSucces": "[label=\"Pesquisar\"]"
// }

// {
//     "urlRecaptcha": "https://www.google.com/recaptcha/api2/demo",
//     "waitSelectorSucces": ""
// }

const axios = require('axios');

axios
  .post('http://localhost:3000/resolveRecaptcha', {
    urlRecaptcha: 'https://www.google.com/recaptcha/api2/demo',
    waitSelectorSucces: '',
  })
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.error(error);
  });
