const getPageDataRecaptcha = require('./puppeteer-recaptcha');
const webHookResponseRecaptcha = require('./web-hook');
var uuid = require('node-uuid');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.raw());

const port = 3000;

const resolveRecaptcha = async (opt) => {
  const headless = false;
  const dataPage = await getPageDataRecaptcha(opt.urlRecaptcha, opt.waitSelectorSucces, headless);
  webHookResponseRecaptcha(opt, dataPage);
};

app.post('/resolveRecaptcha', (req, res) => {
  const opts = req.body;
  opts.task = uuid.v4();
  opts.start = new Date();
  resolveRecaptcha(opts);
  res.send(opts);
});

app.listen(port, () => console.log(`Puppeteer Recaptcha Solver running in port ${port}`));

process.on('SIGINT', () => {
  console.log('bye, end process');
  process.exit();
});
