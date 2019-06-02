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
        imgsrc: $(this).find('img').attr('src'),
        prodlink: $(this).find('.wedding-product-tile__link').attr('href'),
        price: $(this).find('.wedding__text--price').text(),
      });
    });

    // console.log(items);

    var fileContents = fs.readFileSync(file, 'utf8');
    var arr = fileContents.toString().split('\n');
    var selector = 'id="registry-container"';
    var containerStart = arr.findIndex(function(val) {
      return val.includes(selector);
    });

    var loopNum = 0;
    const itemLength = 4; // image and price
    items.forEach(function(value) {
      if (loopNum >= 4) {
        return; // don't add everything
      }

      var image = '<a href="https://www.amazon.com';
      image += value.prodlink;
      image += '">';
      image += '<img class="amazon-item-img" src="';
      image += value.imgsrc;
      image += '"></img>';
      image += '</a>';

      var price = value.price;
      price = price.slice(0, -2) + '.' + price.slice(-2);
      price = '<p>' + price + '</p>';

      const itemStart = containerStart + loopNum * itemLength + 1;

      arr[itemStart + 1] = image;
      // arr[itemStart + 2] = price;

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
