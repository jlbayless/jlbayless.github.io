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

    return page.goto(url, {waitUntil: 'networkidle0'})
    .then(function() { return page.content(); });
  })
  .then(async html => {
    const $ = await cheerio.load(html);
    const items = [];

    $('div[class="wedding-product-tile"]').each(function() {
      items.push({
        title: $(this).find('img').attr('src'),
      });
    })

    var fileContents = fs.readFileSync(file, 'utf8');
    var arr = fileContents.toString().split('\n');
    var selector = 'id="registry-container"';
    var containerStart = arr.findIndex(function(val) {
      return val.includes(selector);
    });

    var loopNum = 0;
    const itemLength = 7; // image + 4 other lines
    items.forEach(function(value) {
      if (loopNum >= 4) {
        return; // don't add everything
      }

      var image = '<img class="amazon-item-img" src="';
      image += value.title;
      image += '"></img>';

      const itemStart = containerStart + loopNum * itemLength + 1;
      var prevImage = arr[itemStart + 1]; // image is the first thing in the tile div

      // Going to assume that we will always be replacing for now
      // var replace = 0;
      // if (prevImage != undefined && prevImage.includes('<img class="amazon-item-img"')) {
      //   replace = 1;
      // }
      // arr.splice(itemStart + 1, replace, image);

      arr[itemStart + 1] = image;

      loopNum++;
    });

    arr.forEach(function(value, index) {
      arr[index] = value + '\n';
    });
    fs.writeFileSync(file, arr.join(''));
  })
  .then(() => {
    console.log('Update Complete');
    process.exit(0);
  });
