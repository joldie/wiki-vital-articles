import { JSDOM } from "jsdom";

// Webpage URL of English Wikipedia's list of "Vital Articles"
const vitalArticlesUrl =
  "https://en.wikipedia.org/wiki/Wikipedia:Vital_articles";

/**
 * Main function
 * @return {Array} Array of objects representing all of Wikipedia's "vital articles"
 */
const wikiVitalArticles = async () => {
  // Get HTML text from URL
  const htmlText = await getHtml(vitalArticlesUrl);
  if (htmlText === null) return null;

  // Parse HTML text into JSON DOM object
  const dom = parseHtmlDom(htmlText);
  if (dom === null) return null;

  // Get first section of TOC (Table of Contents), which is a list of all article categories
  const toc = Array.from(
    dom.window.document.body.querySelector("#toc li ul").children
  );

  // Parse all categories (and subcategories) into an array of objects
  const categories = getCategoriesFromToC(toc);

  // Find all individual article links for each category and save basic information
  const articles = [];
  categories.forEach(category => {
    category.subcategories.forEach(subcategory => {
      // Get all list elements which are siblings (or children of siblings) of the category header.
      // => Most list elements correspond to a single article.
      const listItems = Array.from(
        dom.window.document
          .querySelector(`[id="${subcategory.id}"]`)
          .parentNode.nextElementSibling.querySelectorAll("li")
      );
      listItems.forEach(item => {
        // Ignore purely categorical list items, with no link to an article
        if (Array.from(item.children).some(child => child.nodeName === "A")) {
          // Select first anchor element only
          const articleLink = item.querySelector("a");
          // Extract article information into object and save in array
          articles.push({
            name: articleLink.title,
            url: urlLeftPart(vitalArticlesUrl) + articleLink.href,
            category: category.name,
            subcategory: subcategory.name
          });
        }
      });
    });
  });
  return articles;
};

export default wikiVitalArticles;

/**
 * Fetch HTML text from webpage and parse into JSON DOM object
 * @param {string} url URL of webpage
 * @return {string} HTML text of webpage
 */
const getHtml = async function(url) {
  try {
    // Fetch object from URL
    const response = await fetch(url);
    // Return HTML text from object
    return await response.text();
  } catch (error) {
    console.log("Error fetching page: ", error);
    return null;
  }
};

/**
 * Parse HTML text into JSDOM object
 * @param {string} htmlText HTML text of webpage
 * @return {JSDOM} JSON DOM Object representing HTML text of webpage
 */
const parseHtmlDom = function(htmlText) {
  try {
    return new JSDOM(htmlText);
  } catch (error) {
    console.log("Error parsing HTML DOM: ", error);
    return null;
  }
};

/**
 * Parse all categories (and subcategories) from TOC into an array of objects
 * @param {Array} toc Array with TOC elements as HTML DOM objects
 * @return {Array} Array with parsed categories/subcategories as objects
 */
const getCategoriesFromToC = function(toc) {
  // Save basic data of all categories
  const categories = [];
  toc.forEach(item => {
    // Get all subcategories from TOC
    const subcategoryArray = Array.from(item.querySelector("ul").children);
    const subcategories = [];
    subcategoryArray.forEach(item => {
      // For each subcategory, save the name and HTML id
      const subcategoryName = item.querySelectorAll("a span")[1].textContent;
      const subcategoryId = item.querySelector("a").href;
      subcategories.push({
        name: subcategoryName.substring(0, subcategoryName.indexOf(" (")),
        id: subcategoryId.substring(
          subcategoryId.indexOf("#") + 1,
          subcategoryId.length
        )
      });
    });
    // For each category, save the name, HTML id and array of subcategories
    const categoryName = item.querySelectorAll("a span")[1].textContent;
    const categoryId = item.querySelector("a").href;
    categories.push({
      name: categoryName.substring(0, categoryName.indexOf(" (")),
      id: categoryId.substring(categoryId.indexOf("#") + 1, categoryId.length),
      subcategories: subcategories
    });
  });
  return categories;
};

/**
 * Extracts the protocol and hostname of a URL (e.g. 'https://en.wikipedia.org' from
 * 'https://en.wikipedia.org/wiki/articlename')
 * @param {string} url Full URL
 * @return {string} Left part of URL (protocol and hostname)
 */
const urlLeftPart = function(url) {
  // Search for next forward slash after protocol text and return substring up to that position
  return url.substr(0, url.indexOf("/", "https://".length));
};
