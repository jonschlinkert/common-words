#!/usr/bin/env node

const path = require('path');
const log = require('verbalize');
const cheerio = require('cheerio');
const request = require('request');
const file = require('fs-utils');

log.runner = 'repos';

var options = {
  url: 'https://en.wikipedia.org/wiki/Most_common_words_in_English',
  headers: {
    'User-Agent': 'request'
  }
};

log.writeln();
log.inform('reading', options.url);

var dest = 'words.json';

function callback(err, response, body) {
  if (!err && response.statusCode === 200) {
    var $ = cheerio.load(body);
    var content = '';

    // Iterate over TR elements in the Wikipedia infobox
    $("table.wikitable tr").each(function (i, ele) {
      content += $(this).find("td").text();
      content += '\n';
    });

    var words = [];
    content.replace(/([\d]+)([\S]+)/g, function(match, num, word) {
      words = words.concat({
        rank: num,
        word: word
      });
    });

    file.writeJSONSync(dest, words);

    dest = path.relative(process.cwd(), dest).replace(/\\/g, '/');
    log.inform('writing', dest);
  } else {
    log.error(err);
  }

  // Success message.
  log.done('done');
}
request(options, callback);