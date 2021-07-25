const download = require('../image-downloader');
var imageSizeOf = require('image-size');
var Jimp = require('jimp');
const fs = require('fs');
const {promisify} = require('util');
const utils = require('../utils');
const mkdir = promisify(fs.mkdir);

const getInfoImageByVision = require('../google-api/vision');
const translate = require('../google-api/translate');

const config = require('../../config.json');

const typesImagesValids = config.typesImages;

let imgPayload;

let lastImgPayload;

let typeImages;

let lengthImages;

let optionSelectMultiplesImages;

let lastUrlsNewsImages = [];

const minScore = config.minScore;

let resolveOnlyImages = config.resolveOnlyImages;

function resetVariables() {
  imgPayload = '';
  typeImages = '';
  lengthImages = 0;
  optionSelectMultiplesImages = false;
  lastUrlsNewsImages = [];
}

function checkImageCorrect() {
  let valid = false;
  try {
    if (imgPayload && lengthImages && typeImages && typesImagesValids) {
      if (Object.keys(typesImagesValids).includes(typeImages.toLowerCase())) {
        valid = true;
      } else {
        typesImagesValids[typeImages] = [typeImages, typeImages.length > 0 ? typeImages.substring(0, typeImages.length - 1) : ''];
        valid = true;
      }
    }
    if (resolveOnlyImages && resolveOnlyImages.length) {
      if (resolveOnlyImages.includes(typeImages.toLowerCase())) {
        valid = true;
      } else {
        valid = false;
      }
    }
  } catch (error) {
    valid = false;
  }
  return valid;
}

function setLastUrlsNewsImages(url) {
  lastUrlsNewsImages.push(url);
}

async function classifyImages(path, indexImg) {
  const objetContent = [];

  let keys = typesImagesValids[typeImages];

  const containsStartsWith = (text) => {
    let contain = false;
    if (keys && keys.length) {
      keys.forEach((key) => {
        if (key.startsWith(text.toLowerCase()) && key.endsWith(text.toLowerCase())) contain = true;
      });
    }
    // if (keys && keys.length) {
    //   keys.forEach((key) => {
    //     if (text.toLowerCase().match(new RegExp(key, 'i'))) contain = true;
    //   });
    // }
    return contain;
  };

  const selectItem = (index) => {
    let contain = false;
    objetContent.forEach((item) => {
      if (item.index === index && item.select) contain = true;
    });
    if (contain) return false;
    return true;
  };

  const readJsonVision = async (pathJson, index) => {
    var json = await JSON.parse(fs.readFileSync(`${pathJson}`));

    if (json && json.responses[0]) {
      json.responses[0].labelAnnotations &&
        json.responses[0].labelAnnotations.forEach((label) => {
          if (label.description && containsStartsWith(label.description)) {
            if (label.score > minScore) {
              objetContent.push({
                index: index,
                contem: true,
                select: selectItem(index),
                data: label,
              });
            }
          }
        });

      json.responses[0].webDetection &&
        json.responses[0].webDetection.webEntities &&
        json.responses[0].webDetection.webEntities.forEach((entitie) => {
          if (entitie.description && containsStartsWith(entitie.description)) {
            if (entitie.score > minScore) {
              objetContent.push({
                index: index,
                contem: true,
                select: selectItem(index),
                data: entitie,
              });
            }
          }
        });

      json.responses[0].localizedObjectAnnotations &&
        json.responses[0].localizedObjectAnnotations.forEach((objectAnnotations) => {
          if (objectAnnotations && containsStartsWith(objectAnnotations.name)) {
            if (objectAnnotations.score > minScore) {
              objetContent.push({
                index: index,
                contem: true,
                select: selectItem(index),
                data: objectAnnotations,
              });
            }
          }
        });
    }
  };

  if (fs.lstatSync(path).isDirectory()) {
    for (let i = 0; i < lengthImages; i++) {
      await readJsonVision(`${path}/payload${i}.json`, i);
    }
  } else if (fs.lstatSync(path).isFile()) {
    await readJsonVision(`${path}`, indexImg);
  }

  return objetContent;
}

async function getImagePayload(page) {
  return await page.evaluate(() => {
    const iframe = document.querySelector('iframe[src*="api2/bframe"]');
    if (!iframe) return false;
    if (iframe.contentWindow.document.querySelector('.rc-image-tile-target img')) return iframe.contentWindow.document.querySelector('.rc-image-tile-target img').src;
    if (iframe.contentWindow.document.querySelector('#rc-imageselect-target img')) return iframe.contentWindow.document.querySelector('#rc-imageselect-target img').src;
  });
}

async function getTypeImages(page) {
  let text = await page.evaluate(() => {
    const iframe = document.querySelector('iframe[src*="api2/bframe"]');
    if (!iframe) return false;
    if (iframe.contentWindow.document.querySelector('.rc-imageselect-instructions strong'))
      return iframe.contentWindow.document.querySelector('.rc-imageselect-instructions strong').innerText;
    return '';
  });
  if (!text) text = '';
  const textTranslate = await translate(text, {to: 'en'});
  if (textTranslate && textTranslate.text) return textTranslate.text.toLowerCase();
  return text.toLowerCase();
}

async function getInfosRecaptcha(page, reload) {
  if (!checkImageCorrect()) {
    if (reload) {
      await page.evaluate(() => {
        function rdn(min, max) {
          return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) + Math.ceil(min);
        }
        const iframe = document.querySelector('iframe[src*="api2/bframe"]');
        if (!iframe) return false;
        return iframe.contentWindow.document.querySelector('#recaptcha-reload-button').click({delay: rdn(40, 100)});
      });
      await page.waitForTimeout(500);
    }

    imgPayload = await getImagePayload(page);

    typeImages = await getTypeImages(page);

    lengthImages = await page.evaluate(() => {
      const iframe = document.querySelector('iframe[src*="api2/bframe"]');
      if (!iframe) return false;
      return iframe.contentWindow.document.querySelectorAll('#rc-imageselect-target td').length;
    });

    optionSelectMultiplesImages = await page.evaluate(() => {
      const iframe = document.querySelector('iframe[src*="api2/bframe"]');
      if (!iframe) return false;
      let selectMultiples = false;
      if (iframe.contentWindow.document.querySelector('.rc-imageselect-desc-no-canonical span'))
        selectMultiples = iframe.contentWindow.document.querySelector('.rc-imageselect-desc-no-canonical span').innerText;
      if (iframe.contentWindow.document.querySelector('.rc-imageselect-desc span'))
        selectMultiples = iframe.contentWindow.document.querySelector('.rc-imageselect-desc span').innerText;
      return selectMultiples;
    });
  }

  if (lengthImages > 9) optionSelectMultiplesImages = false;

  // console.log('imgPayload -> ', imgPayload);
  // console.log('typeImages -> ', typeImages);
  // console.log('lengthImages -> ', lengthImages);
  // console.log('optionSelectMultiplesImages -> ', optionSelectMultiplesImages);

  return true;
}

async function resolveImageObject(pathImage) {
  const imagePick = await Jimp.read(pathImage);
  await imagePick.brightness(-0.05).contrast(0.08).writeAsync(pathImage);
  var imageB64 = fs.readFileSync(`${pathImage}`, 'base64');
  fs.writeFileSync(pathImage.replace('.jpg', '.base64'), imageB64);
  const response = await getInfoImageByVision(imageB64);
  fs.writeFileSync(pathImage.replace('.jpg', '.json'), JSON.stringify(response.data));
}

async function verifyNewsImagesContainsObject(path, page) {
  if (optionSelectMultiplesImages) {
    const urlsNewImage = await page.evaluate((lastUrlsNewsImages) => {
      const iframe = document.querySelector('iframe[src*="api2/bframe"]');
      if (!iframe) return false;

      const docIframe = iframe.contentWindow.document;
      const newsUrls = [];

      docIframe.querySelectorAll('.rc-imageselect-target td').forEach((elm, index) => {
        if (elm.querySelector('img').width < 150) {
          const imgUrl = elm.querySelector('img').src;
          if (!lastUrlsNewsImages.includes(imgUrl)) {
            newsUrls.push({
              url: imgUrl,
              index: index,
            });
          }
        }
      });

      return newsUrls;
    }, lastUrlsNewsImages);

    const newPath = `${path}/new-images-${new Date().getTime()}`;

    await mkdir(newPath);

    if (urlsNewImage && urlsNewImage.length) {
      for (obj of urlsNewImage) {
        const pathImgPayload = `${newPath}/new-payload-${obj.index}.jpg`;

        await download.image({
          url: obj.url,
          dest: pathImgPayload,
        });

        setLastUrlsNewsImages(obj.url);

        await resolveImageObject(pathImgPayload);

        let imagesSelect = await classifyImages(pathImgPayload.replace('.jpg', '.json'), obj.index);

        fs.writeFileSync(pathImgPayload.replace('.jpg', '.imagesSelect.json'), `${JSON.stringify(imagesSelect)}`);

        await selectImagesContainsObject(imagesSelect, page);

        return true;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
}

async function selectImagesContainsObject(imagesSelect, page) {
  if (imagesSelect && imagesSelect.length) {
    const promises = imagesSelect.map(async (elm, idx) => {
      if (elm && elm.contem && elm.select && elm.index !== undefined) {
        await page.evaluate(async (itemElm) => {
          function rdn(min, max) {
            return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) + Math.ceil(min);
          }
          const iframe = document.querySelector('iframe[src*="api2/bframe"]');
          return iframe.contentWindow.document.querySelectorAll('.rc-imageselect-target td')[itemElm.index].click({delay: rdn(50, 100)});
        }, elm);

        if (optionSelectMultiplesImages) {
          await page.evaluate(async (itemElm) => {
            function rdn(min, max) {
              return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) + Math.ceil(min);
            }
            const iframe = document.querySelector('iframe[src*="api2/bframe"]');
            return iframe.contentWindow.document.querySelectorAll('.rc-imageselect-target td')[itemElm.index].querySelector('img').remove();
          }, elm);

          try {
            await page.waitForFunction(
              (index) => {
                const iframe = document.querySelector('iframe[src*="api2/bframe"]');
                if (!iframe) return false;
                const img = iframe.contentWindow.document.querySelectorAll('.rc-imageselect-target td')[index].querySelector('img');
                return img && img.complete;
              },
              {timeout: 20000},
              elm.index
            );
          } catch (error) {}
        }
      }
    });
    await Promise.all(promises);
  }
}

async function selectImagesObject(page) {
  const urlsImagesCrop = [];

  if (!fs.existsSync(`tmp`)) {
    await mkdir(`tmp`);
  }

  const path = `tmp/${new Date().getTime()}`;

  await mkdir(path);

  const pathImgPayload = `${path}/payload.jpg`;

  fs.writeFileSync(pathImgPayload.replace('.jpg', '.typeImage'), `${typeImages} - ${JSON.stringify(typesImagesValids[typeImages])}`);

  for (let i = 0; i < lengthImages; i++) {
    urlsImagesCrop.push(pathImgPayload.replace('payload.jpg', `payload${i}.jpg`));
  }

  await download.image({
    url: imgPayload,
    dest: pathImgPayload,
  });

  let dividend = await page.evaluate(() => {
    const iframe = document.querySelector('iframe[src*="api2/bframe"]');
    if (!iframe) return false;
    if (iframe.contentWindow.document.querySelector('.rc-imageselect-target tr'))
      return iframe.contentWindow.document.querySelector('.rc-imageselect-target tr').querySelectorAll('td').length;
  });

  const imagePayloadDimensions = imageSizeOf(pathImgPayload);
  const new_width = imagePayloadDimensions.width / dividend;
  const new_height = imagePayloadDimensions.height / dividend;

  const promises = urlsImagesCrop.map(async (url, idx) => {
    const image = await Jimp.read(`${pathImgPayload}`);
    let x = Math.floor(new_width * Math.floor(idx % dividend));
    let y = Math.floor(new_height * Math.floor(idx / dividend));
    await image.crop(x, y, new_width, new_height).writeAsync(url);
    await resolveImageObject(url);
  });

  await Promise.all(promises);

  return path;
}

async function verifyErrosSelect(page) {
  const errorSelect = await page.evaluate(
    (optionSelectMultiplesImages, utils) => {
      function isVisible(elem) {
        if (elem) return elem.offsetWidth > 0 || elem.offsetHeight > 0 || elem.getClientRects().length > 0;
        return false;
      }

      const iframe = document.querySelector('iframe[src*="api2/bframe"]');
      if (!iframe) return false;

      let error = false;

      if (isVisible(iframe.contentWindow.document.querySelector('.rc-imageselect-incorrect-response'))) {
        if (iframe.contentWindow.document.querySelector('.rc-imageselect-incorrect-response').innerText) error = true;
      }
      if (isVisible(iframe.contentWindow.document.querySelector('.rc-imageselect-error-select-more'))) {
        if (iframe.contentWindow.document.querySelector('.rc-imageselect-error-select-more').innerText) error = true;
      }
      if (isVisible(iframe.contentWindow.document.querySelector('.rc-imageselect-error-dynamic-more'))) {
        if (iframe.contentWindow.document.querySelector('.rc-imageselect-error-dynamic-more').innerText) error = true;
      }
      if (isVisible(iframe.contentWindow.document.querySelector('.rc-imageselect-error-select-something'))) {
        if (iframe.contentWindow.document.querySelector('.rc-imageselect-error-select-something').innerText) error = true;
      }

      if (!optionSelectMultiplesImages && !document.querySelectorAll('.rc-imageselect-tileselected').length && !document.querySelector('.recaptcha-checkbox-checked')) error = true;

      if (error) {
        if (iframe.contentWindow.document.querySelector('.recaptcha-checkbox-checkmark')) {
          error = false;
        }
      }

      if (error) {
        if (
          iframe.contentWindow.document.querySelector('#recaptcha-token') &&
          iframe.contentWindow.document.querySelector('#recaptcha-token').value &&
          iframe.contentWindow.document.querySelector('#recaptcha-token').value.length < utils.recaptchaTokenMinLength
        ) {
          error = false;
        }
      }

      return error;
    },
    optionSelectMultiplesImages,
    utils
  );

  return errorSelect;
}

async function buttonVerifyImages(page) {
  await page.evaluate(() => {
    const iframe = document.querySelector('iframe[src*="api2/bframe"]');
    if (!iframe) return false;
    function rdn(min, max) {
      return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) + Math.ceil(min);
    }
    return iframe.contentWindow.document.querySelector('#recaptcha-verify-button').click({delay: rdn(40, 100)});
  });
}

async function solverByImage(page, attemptsImages) {
  try {
    let currentImgPayload = await getImagePayload(page);

    resetVariables();

    const valueRecaptcha = await utils.isValueRecaptcha(page);

    if (valueRecaptcha) return true;

    console.info(`-------------------------INITIATE-${new Date().toLocaleTimeString()}-------------------------`);

    console.info('Init process recognition of images');

    let reloadRecaptcha = false;

    if (attemptsImages > 0) {
      if (currentImgPayload === lastImgPayload) {
        reloadRecaptcha = true;
      }
    }

    await getInfosRecaptcha(page, reloadRecaptcha);

    await page.waitForTimeout(1000);

    const resolutionDisable = await utils.resolutionRecaptchaDisabled(page);

    if (resolutionDisable) {
      console.info('Image resolution disabled');
      return false;
    }

    if (config.resolveLengthImages && config.resolveLengthImages > 0) {
      if (lengthImages !== config.resolveLengthImages) {
        console.info(`Configuration length Images ${lengthImages} !== ${config.resolveLengthImages} `);
        await buttonVerifyImages(page);
        return 'reload-images';
      }
    }

    await (async () => {
      while (!checkImageCorrect()) {
        await getInfosRecaptcha(page, true);
        await utils.delay(1000);
      }
    })();

    console.info(`Preparing image ${typeImages}`);

    const path = await selectImagesObject(page);

    console.info(`Classifying images ${typeImages}`);

    let imagesSelect = await classifyImages(path);

    console.info(`Selecting images ${typeImages}`);

    await utils.saveScreenshot(page, `pre-select`);

    fs.writeFileSync(`${path}/payload.imagesSelect.json`, `${JSON.stringify(imagesSelect)}`);

    await selectImagesContainsObject(imagesSelect, page);

    await utils.saveScreenshot(page, `pos-select`);

    await page.waitForTimeout(1000);

    console.info(`Checking selection of other images ${typeImages}`);

    await (async () => {
      while (await verifyNewsImagesContainsObject(path, page)) {
        await utils.delay(500);
      }
    })();

    await page.waitForTimeout(500);

    console.info(`Process button checking images ${typeImages}`);

    await buttonVerifyImages(page);

    await page.waitForTimeout(2000);

    const errorSelect = await verifyErrosSelect(page);

    console.info(`Resolution with error = ${errorSelect}`);

    console.info(`-------------------------FINISHING-${new Date().toLocaleTimeString()}-------------------------`);

    lastImgPayload = imgPayload;

    if (errorSelect) {
      resetVariables();
      return 'reload-images';
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

module.exports = solverByImage;
