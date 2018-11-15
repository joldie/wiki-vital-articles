"use strict";

const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// Webpage URL of English Wikipedia's list of "Vital Articles"
const vitalArticlesUrl =
  "https://en.wikipedia.org/wiki/Wikipedia:Vital_articles";

// Fetch HTML text from webpage and parse into JSON DOM object
const getHTML = async function(url) {
  try {
    // Fetch object from URL
    const response = await fetch(url);
    // Extract HTML text from object
    const html = await response.text();
    // Return parse HTML text as DOM object
    return new JSDOM(html);
  } catch (error) {
    console.log("Error fetching page: ", error);
    return null;
  }
};

// Parse all categories (and subcategories) from TOC into an array of objects
const getCategoriesFromToC = function(toc) {
  // Save basic data of all categories
  const categories = [];
  toc.forEach(item => {
    // Get all subcategories from TOC
    //const subcategoryArray = Array.from(item.querySelector("ul").children);
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

const vitalArticles = async function() {
  // Get DOM object from URL
  const dom = await getHTML(vitalArticlesUrl);
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
            url: "https://en.wikipedia.org" + articleLink.href,
            category: category.name,
            subcategory: subcategory.name
          });
        }
      });
    });
  });
  return articles;
};

export default vitalArticles;
