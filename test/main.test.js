const fetch = require("node-fetch");
const vitalArticles = require("../main");

// Run async function once only, then run relevant tests on retrieved data
let articles;
beforeAll(async () => {
  articles = await vitalArticles();
});

// Tests
test("returns an array", () => {
  expect(Array.isArray(articles)).toBe(true);
});

test("array contains more than 990 items", () => {
  expect(articles.length).toBeGreaterThan(990);
});

test("array contains less than 1010 items", () => {
  expect(articles.length).toBeLessThan(1010);
});

test("array items are objects with correct property names and types", () => {
  // Test on a single, randomly selected array item
  expect(articles[Math.floor(Math.random() * articles.length)]).toEqual(
    expect.objectContaining({
      name: expect.any(String),
      url: expect.any(String),
      category: expect.any(String),
      subcategory: expect.any(String)
    })
  );
});

test("array items contain data for valid Wikipedia articles", async () => {
  // Test on a single, randomly selected array item
  const article = articles[Math.floor(Math.random() * articles.length)];
  const response = await fetch(
    "https://en.wikipedia.org/api/rest_v1/page/summary/" + article.name
  );
  const json = await response.json();
  expect(json.title).not.toBe("Not found.");
  expect(json.content_urls.desktop.page).toBe(article.url);
});
