/* =========================================================
   BROCODE — EXPLORE SYSTEM
   ========================================================= */


/* =========================================================
   DEMO USERS
   Backend connect hone ke baad API se load honge.
   ========================================================= */

const EXPLORE_USERS = [

  {
    id: "u001",
    name: "Aarav",
    username: "@aarav",
    level: 4
  },

  {
    id: "u002",
    name: "Mira",
    username: "@mira",
    level: 3
  },

  {
    id: "u003",
    name: "Rohan",
    username: "@rohan",
    level: 5
  },

  {
    id: "u004",
    name: "Zoya",
    username: "@zoya",
    level: 4
  },

  {
    id: "u005",
    name: "Kabir",
    username: "@kabir",
    level: 2
  },

  {
    id: "u006",
    name: "Dev",
    username: "@dev",
    level: 3
  },

  {
    id: "u007",
    name: "Anaya",
    username: "@anaya",
    level: 2
  }

];


/* =========================================================
   TRENDING TOPICS
   ========================================================= */

const TRENDING_TOPICS = [

  {
    title: "Productivity habits that actually work",
    category: "Tips",
    posts: 128
  },

  {
    title: "The internet's funniest moments",
    category: "Meme",
    posts: 96
  },

  {
    title: "Things nobody teaches you",
    category: "Knowledge",
    posts: 84
  },

  {
    title: "Simple ways to stay consistent",
    category: "Motivation",
    posts: 71
  },

  {
    title: "Useful phone and tech tricks",
    category: "Hacks",
    posts: 58
  }

];


/* =========================================================
   CATEGORY DATA
   ========================================================= */

const EXPLORE_CATEGORIES = [

  {
    name: "Meme",
    icon: "◉",
    description: "Laugh, react and share"
  },

  {
    name: "Tips",
    icon: "✦",
    description: "Useful everyday ideas"
  },

  {
    name: "Motivation",
    icon: "↗",
    description: "Keep moving forward"
  },

  {
    name: "Hacks",
    icon: "⚡",
    description: "Smart shortcuts"
  },

  {
    name: "Knowledge",
    icon: "◇",
    description: "Learn something new"
  }

];


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    renderTrending();

    renderCategories();

    setupSearch();

  }
);


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function safeText(value = "") {

  if (window.BrocodeApp?.escapeHTML) {

    return window.BrocodeApp.escapeHTML(
      value
    );

  }

  return String(value).replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[character])
  );

}


/* =========================================================
   AVATAR
   ========================================================= */

function getUserInitial(name = "") {

  return String(name)
    .trim()
    .charAt(0)
    .toUpperCase() || "B";

}


/* =========================================================
   TRENDING RENDER
   ========================================================= */

function renderTrending() {

  const container =
    document.getElementById(
      "trendingList"
    );


  if (!container) return;


  container.innerHTML =
    TRENDING_TOPICS.map(
      (topic, index) => `

        <button
          type="button"
          class="trending-card"
          data-trending="${safeText(topic.category)}"
        >

          <span class="trend-number">
            ${String(index + 1).padStart(2, "0")}
          </span>

          <span class="trend-info">

            <strong class="trend-title">
              ${safeText(topic.title)}
            </strong>

            <span class="trend-meta">

              <span>
                ${safeText(topic.category)}
              </span>

              <span>•</span>

              <span>
                ${topic.posts} posts
              </span>

            </span>

          </span>

          <span class="trend-arrow">
            ›
          </span>

        </button>

      `
    ).join("");


  /*
   * Trending click
   */

  container
    .querySelectorAll(
      "[data-trending]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const category =
            button.dataset.trending;


          openCategory(
            category
          );

        }
      );

    });

}


/* =========================================================
   CATEGORY CARDS
   ========================================================= */

function renderCategories() {

  const container =
    document.getElementById(
      "discoverGrid"
    );


  if (!container) return;


  container.innerHTML =
    EXPLORE_CATEGORIES.map(
      category => `

        <button
          type="button"
          class="discover-card"
          data-category="${safeText(category.name)}"
        >

          <span class="discover-icon">
            ${category.icon}
          </span>

          <h3>
            ${safeText(category.name)}
          </h3>

          <p>
            ${safeText(category.description)}
          </p>

          <span class="discover-glow"></span>

        </button>

      `
    ).join("");


  container
    .querySelectorAll(
      "[data-category]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          openCategory(
            button.dataset.category
          );

        }
      );

    });

}


/* =========================================================
   OPEN CATEGORY
   ========================================================= */

function openCategory(category) {

  const validCategory =
    EXPLORE_CATEGORIES.some(
      item =>
        item.name === category
    );


  if (!validCategory) return;


  /*
   * Save selected category
   */

  const data =
    window.BrocodeApp?.getAppData?.();


  if (data) {

    data.selectedCategory =
      category;

    window.BrocodeApp.saveAppData(
      data
    );

  }


  /*
   * Go to Home feed
   */

  window.location.href =
    `index.html?category=${encodeURIComponent(category)}`;

}

/* =========================================================
   SEARCH SETUP
   ========================================================= */

function setupSearch() {

  const input =
    document.getElementById(
      "exploreSearch"
    );


  const clearButton =
    document.getElementById(
      "clearSearch"
    );


  if (!input) return;


  let searchTimer;


  input.addEventListener(
    "input",
    () => {

      clearTimeout(
        searchTimer
      );


      const query =
        input.value.trim();


      /*
       * Clear button
       */

      if (clearButton) {

        clearButton.classList.toggle(
          "show",
          query.length > 0
        );

      }


      searchTimer =
        setTimeout(
          () => {

            if (query.length === 0) {

              hideSearchResults();

              return;

            }


            performSearch(
              query
            );

          },
          150
        );

    }
  );


  /*
   * Clear search
   */

  if (clearButton) {

    clearButton.addEventListener(
      "click",
      () => {

        input.value = "";

        clearButton.classList.remove(
          "show"
        );

        hideSearchResults();

        input.focus();

      }
    );

  }

}


/* =========================================================
   SEARCH
   ========================================================= */

function performSearch(query) {

  const normalizedQuery =
    query.toLowerCase();


  const results =
    EXPLORE_USERS.filter(
      user => {

        const name =
          user.name.toLowerCase();

        const username =
          user.username.toLowerCase();

        const id =
          user.id.toLowerCase();


        return (
          name.includes(normalizedQuery) ||
          username.includes(normalizedQuery) ||
          id.includes(normalizedQuery)
        );

      }
    );


  showSearchResults(
    results,
    query
  );

}


/* =========================================================
   SHOW SEARCH RESULTS
   ========================================================= */

function showSearchResults(
  results,
  query
) {

  const searchResults =
    document.getElementById(
      "searchResults"
    );


  const discoverContent =
    document.getElementById(
      "discoverContent"
    );


  const list =
    document.getElementById(
      "searchResultList"
    );


  const count =
    document.getElementById(
      "resultCount"
    );


  if (
    !searchResults ||
    !list
  ) {
    return;
  }


  searchResults.classList.add(
    "show"
  );


  if (discoverContent) {

    discoverContent.style.display =
      "none";

  }


  if (count) {

    count.textContent =
      `${results.length} ${
        results.length === 1
          ? "result"
          : "results"
      }`;

  }


  if (!results.length) {

    list.innerHTML = `

      <div class="no-results">

        <div class="no-results-icon">
          ⌕
        </div>

        <h3>
          No results found
        </h3>

        <p>
          We couldn't find anyone matching
          "${safeText(query)}".
        </p>

      </div>

    `;

    return;

  }


  list.innerHTML =
    results.map(
      user => `

        <button
          type="button"
          class="search-result"
          data-user-id="${safeText(user.id)}"
        >

          <span class="result-avatar">
            ${getUserInitial(user.name)}
          </span>

          <span class="result-info">

            <strong>
              ${safeText(user.name)}
            </strong>

            <span>
              ${safeText(user.username)}
              · ID ${safeText(user.id)}
            </span>

          </span>

          <span class="result-type">
            Level ${user.level}
          </span>

        </button>

      `
    ).join("");


  bindSearchResults();

}


/* =========================================================
   SEARCH RESULT CLICK
   ========================================================= */

function bindSearchResults() {

  document
    .querySelectorAll(
      "[data-user-id]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const userId =
            button.dataset.userId;


          /*
           * Profile page will later
           * receive the real user ID.
           */

          window.BrocodeApp?.showToast(
            `Opening ${userId} profile`
          );

        }
      );

    });

}


/* =========================================================
   HIDE SEARCH RESULTS
   ========================================================= */

function hideSearchResults() {

  const searchResults =
    document.getElementById(
      "searchResults"
    );


  const discoverContent =
    document.getElementById(
      "discoverContent"
    );


  if (searchResults) {

    searchResults.classList.remove(
      "show"
    );

  }


  if (discoverContent) {

    discoverContent.style.display =
      "";

  }

}


/* =========================================================
   KEYBOARD SHORTCUT
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    /*
     * "/" focuses search
     */

    if (
      event.key === "/" &&
      !isTypingField(event.target)
    ) {

      event.preventDefault();


      document
        .getElementById(
          "exploreSearch"
        )
        ?.focus();

    }


    /*
     * Escape clears search
     */

    if (
      event.key === "Escape"
    ) {

      const input =
        document.getElementById(
          "exploreSearch"
        );


      if (
        document.activeElement === input &&
        input.value
      ) {

        input.value = "";

        hideSearchResults();

        document
          .getElementById(
            "clearSearch"
          )
          ?.classList.remove(
            "show"
          );

      }

    }

  }
);


/* =========================================================
   CHECK TYPING FIELD
   ========================================================= */

function isTypingField(element) {

  if (!element) return false;


  const tag =
    element.tagName?.toLowerCase();


  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    element.isContentEditable
  );

}


/* =========================================================
   EXPOSE EXPLORE API
   ========================================================= */

window.BrocodeExplore = {

  search(query) {

    performSearch(
      String(query || "")
    );

  },

  openCategory,

  getTrending() {

    return [
      ...TRENDING_TOPICS
    ];

  },

  getUsers() {

    return [
      ...EXPLORE_USERS
    ];

  }

};
