const download = require('../src/image-downloader');

async function exec() {
  await download.image({
    url: 'https://p.bigstockphoto.com/GeFvQkBbSLaMdpKXF1Zv_bigstock-Aerial-View-Of-Blue-Lakes-And--227291596.jpg',
    dest: `./tmp/payload${new Date().getTime()}.jpg`,
  });
}

exec();
