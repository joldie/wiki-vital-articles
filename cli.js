#!/usr/bin/env node

"use strict";

const meow = require("meow");
const wikiVitalArticles = require("./main");

const cli = meow(`
  Usage
    $ wiki-vital-articles [num] [options]
  
  Options
      num           Optional integer specifying maximum number of articles to print
    --random, -r    Print articles from list in random order
    --verbose, -v   Print verbose output of all articles, including category and URL

  Examples
	  $ wiki-vital-articles
    1.    Hammurabi
    2.    Hatshepsut
    3.    Ramesses II
    ...

    $ wiki-vital-articles 2 -rv
    1.    Name:     Prime number
          Category: Mathematics / Basics
          URL:      https://en.wikipedia.org/wiki/Prime_number
    2.    Name:     Johann Wolfgang von Goethe
          Category: People / Writers
          URL:      https://en.wikipedia.org/wiki/Johann_Wolfgang_von_Goethe

`);

wikiVitalArticles().then(articles => {
  if (cli.flags.r || cli.flags.random) {
    // Randomise order of articles in array
    shuffleArray(articles);
  }
  if (cli.input[0] !== "") {
    // If an integer passed as argument, reduce number of items in array to equal it
    let num = parseInt(cli.input[0]);
    if (!isNaN(num) && num < articles.length) {
      articles.splice(0, articles.length - num);
    }
  }
  // Print information for each article in array
  articles.forEach((article, indexZeroBased) => {
    let index = indexZeroBased + 1;
    if (cli.flags.v || cli.flags.verbose) {
      console.log(index + "." + spaces(index, 6) + "Name:     " + article.name);
      console.log(
        "      Category: " + article.category + " / " + article.subcategory
      );
      console.log("      URL:      " + article.url);
    } else {
      console.log(index + "." + spaces(index, 6) + article.name);
    }
  });
});

/**
 * Returns a string of space characters to insert after index number so that
 * verbose text is formatted vertically aligned, regardless of digits in index
 * @param  {Number} number      Current index number
 * @param  {Number} totalChars  Desired total number of characters
 */
const spaces = (number, totalChars) => {
  return Array(totalChars - String(number).length).join(" ");
};

/**
 * Shuffle (randomise) the order of items in an array
 * @param  {Array} array
 */
const shuffleArray = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};
