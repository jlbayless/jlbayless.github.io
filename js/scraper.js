#!/usr/bin/env node
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
const util = require('util');

const url = 'https://www.amazon.com/wedding/share/JonathanLillian2020';
const file = '../pages/registry.html';

async function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// fs.readFileAsync = util.promisify(fs.readFile);

puppeteer
  .launch({
    // headless: false,
    // slowMo: 1000
  })
  .then(async browser => {
    const page = await browser.newPage();
    console.log('Waiting for page to load');

    return page.goto(url, {waitUntil: 'networkidle0'}).then(function() {
      page
        .waitForSelector('.wedding-product-tile') // probably extraneous because of the 'waitUntil'
        .then(() => console.log('Container visible'));
      return page.content();
    });
  })
  .then(async html => {
    const $ = await cheerio.load(html);
    const items = [];

    $('div[class="wedding-product-tile"]').each(function() {
      items.push({
        title: $(this).find('img').attr('src'),
      });
    })

    var idx = 0;
    var arr = [];
    var image = '';
    fs.readFileSync(file, 'utf8', function(err, data) {
      if (err) throw err;
      arr = data.toString().split('\n');
      // console.log(arr);
      var selector = 'id="registry-container"';
      // idx = arr.findIndex(function(val) {
      //   return val.includes(selector);
      // });

      items.forEach(function(value) {
        image = '<img class="amazon-item-img" src="';
        image += value.title;
        image += '"></img>';

        var replace = 0;
        var prevImage = arr[idx + 1];
        // console.log(prevImage);
        if (prevImage != undefined && prevImage.includes('<img class="amazon-item-img"')) {
          replace = 1;
        }
        arr.splice(idx, replace, image);
        console.log(arr);
      });
    });
// fs.writeFile(file, arr, (err) => if (err) throw err;);
  });
