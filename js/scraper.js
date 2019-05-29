const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const url = 'https://www.amazon.com/wedding/share/JonathanLillian2020';

async function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

puppeteer
  .launch({
    // headless: false,
    // slowMo: 1000
  })
  .then(async browser => {
    const page = await browser.newPage();
    console.log('Waiting for data to load');

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
    });

    console.log(items);
  });
