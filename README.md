# wiki-vital-articles

Get a list of Wikipedia's ~1000 most important articles

## Description

Returns an up-to-date list of Wikipedia's vital articles (~1000 subjects every Wikipedia should have), by scraping the webpage.

Currently only works for the English version of wikipedia. See [Wikipedia:Vital articles](https://en.wikipedia.org/wiki/Wikipedia:Vital_articles) for details on the list.

## Installation

`$ npm install --global wiki-vital-articles`

## API

Usage:

```javascript
const wikiVitalArticles = require("wiki-vital-articles");

wikiVitalArticles().then(articles => {
  articles.forEach(article => {
    console.log(article.name);
  }
});
```

Return data format:

```javascript
[
  {
    name: "Hammurabi",
    category: "People",
    subcategory: "Politicians and leaders",
    url: "https://en.wikipedia.org/wiki/Hammurabi"
  },
  {
    name: "Hatshepsut",
    category: "People",
    subcategory: "Politicians and leaders",
    url: "https://en.wikipedia.org/wiki/Hatshepsut"
  },
  ...
];
```

## CLI

```
$ wiki-vital-articles --help

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
```

## Contributing

All contributions are welcome, particularly feedback on code quality, bug reports, tips and ideas for improvement.

## License

All code licensed under a [GNU General Public License v3.0 License](https://www.gnu.org/licenses/gpl.html)
