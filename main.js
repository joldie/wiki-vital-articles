getListArticles = function() {
  fetch("https://en.wikipedia.org/wiki/Wikipedia:Vital_articles")
    .then(function(response) {
      return response.text();
    })
    .then(function(html) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, "text/html");
    })
    .catch(function(err) {
      console.log("Error fetching page: ", err);
    });
};
