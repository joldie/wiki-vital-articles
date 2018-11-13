const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

fetchHTML = async function(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    return dom;
  } catch (error) {
    console.log("Error fetching page: ", error);
    return null;
  }
};

getListArticles = async function() {
  // Get DOM object from URL
  const dom = await fetchHTML(
    "https://en.wikipedia.org/wiki/Wikipedia:Vital_articles"
  );
  if (dom === null) return null;

  // Get first list element in TOC (Table of Contents) and save as an array
  // List contains all categories and subcategories
  const toc = Array.from(
    dom.window.document.body.querySelector("#toc li ul").children
  );

  // Save basic data of all categories
  let categories = [];
  toc.forEach(item => {
    // Get all subcategories from TOC
    const subcategoryArray = Array.from(item.querySelector("ul").children);
    let subcategories = [];
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

  allArticles = [];
  categories.forEach(category => {
    category.subcategories.forEach(subcategory => {
      articles = Array.from(
        dom.window.document.querySelector(`[id="${subcategory.id}"]`).parentNode
          .nextElementSibling.children
      );
      articles.forEach(article => {
        const link = article.querySelector("a");
        allArticles.push({
          name: link.textContent,
          url: "https://en.wikipedia.org" + link.href,
          category: category.name,
          subcategory: subcategory.name
        });
      });
    });
  });
  return allArticles;
};

getListArticles();
