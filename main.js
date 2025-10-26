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
  const toc = getTocCategoryItems(dom.window.document.body.querySelector("#toc"));
  if (toc === null) return null;

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
    const subcategoryList = item.querySelector("ul");
    if (subcategoryList === null) {
      return;
    }
    const subcategoryArray = Array.from(subcategoryList.children);
    const subcategories = [];
    subcategoryArray.forEach(item => {
      // For each subcategory, save the name and HTML id
      const subcategoryAnchor = item.querySelector("a");
      if (subcategoryAnchor === null) {
        return;
      }
      const subcategorySpans = subcategoryAnchor.querySelectorAll("span");
      if (subcategorySpans.length < 2) {
        return;
      }
      const subcategoryName = normalizeName(subcategorySpans[1].textContent);
      const subcategoryId = subcategoryAnchor.href;
      subcategories.push({
        name: subcategoryName,
        id: subcategoryId.substring(
          subcategoryId.indexOf("#") + 1,
          subcategoryId.length
        )
      });
    });
    // For each category, save the name, HTML id and array of subcategories
    const anchor = item.querySelector("a");
    if (anchor === null) {
      return;
    }
    const categorySpans = anchor.querySelectorAll("span");
    if (categorySpans.length < 2) {
      return;
    }
    const categoryName = normalizeName(categorySpans[1].textContent);
    const categoryId = anchor.href;
    categories.push({
      name: categoryName,
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

/**
 * Extract the list elements that represent article categories from the table of contents.
 * The structure of Wikipedia's table of contents occasionally changes, so we try a couple
 * of different layouts before giving up.
 * @param {HTMLElement|null} tocRoot Root element of the table of contents
 * @return {Array|null} Array with TOC elements as HTML DOM objects or null if none found
 */
const getTocCategoryItems = function(tocRoot) {
  if (tocRoot === null) {
    return null;
  }

  // In the previous layout the categories were stored inside the first list item.
  const legacyList = tocRoot.querySelector("ul > li > ul");
  if (legacyList !== null) {
    return Array.from(legacyList.children);
  }

  // Current layout keeps the categories as direct children of the first unordered list.
  const primaryList = tocRoot.querySelector("ul");
  if (primaryList !== null) {
    const categoryItems = Array.from(primaryList.children).filter(item =>
      item.querySelector("ul")
    );
    if (categoryItems.length > 0) {
      return categoryItems;
    }
  }

  return null;
};

/**
 * Remove trailing metadata (e.g. "(10 articles)") from a heading text.
 * @param {string} name Raw heading text
 * @return {string} Cleaned heading text
 */
const normalizeName = function(name) {
  const parenIndex = name.indexOf(" (");
  return parenIndex === -1 ? name : name.substring(0, parenIndex);
};
