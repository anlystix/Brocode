/* =========================================================
   BROCODE — POSTS / FEED SYSTEM
   ========================================================= */


/* =========================================================
   DEMO POSTS
   Backend connect hone ke baad ye API se aayenge.
   ========================================================= */

const DEMO_POSTS = [

  {
    id: "p1",
    category: "Tips",
    user: "Aarav",
    handle: "@aarav",
    title: "What is one small habit that actually improved your productivity?",
    body: "For me, writing the first three tasks before opening social media changed my whole morning. Small system, big difference.",
    likes: 128,
    comments: 24,
    time: "12 min ago",
    minutesAgo: 12
  },

  {
    id: "p2",
    category: "Knowledge",
    user: "Mira",
    handle: "@mira",
    title: "A simple way to understand compound growth",
    body: "Think of every improvement as a seed. The first few weeks look slow, then the same habit starts creating results on top of previous results.",
    likes: 94,
    comments: 18,
    time: "38 min ago",
    minutesAgo: 38
  },

  {
    id: "p3",
    category: "Meme",
    user: "Rohan",
    handle: "@rohan",
    title: "Me: I will sleep early today.",
    body: "Also me at 1:47 AM: one last video and then I will definitely sleep. 😭",
    likes: 241,
    comments: 31,
    time: "1 hr ago",
    minutesAgo: 60
  },

  {
    id: "p4",
    category: "Motivation",
    user: "Zoya",
    handle: "@zoya",
    title: "You do not need a perfect plan to begin.",
    body: "Start with the next useful action. Clarity often arrives after movement, not before it.",
    likes: 176,
    comments: 27,
    time: "2 hrs ago",
    minutesAgo: 120
  },

  {
    id: "p5",
    category: "Hacks",
    user: "Kabir",
    handle: "@kabir",
    title: "A tiny phone setting that reduces distractions",
    body: "Move the apps you check impulsively off the first screen. A little friction can protect a lot of focus.",
    likes: 83,
    comments: 12,
    time: "3 hrs ago",
    minutesAgo: 180
  }

];


/* =========================================================
   STATE
   ========================================================= */

let selectedCategory = "All";
let currentSort = "latest";


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const data =
      window.BrocodeApp?.getAppData?.() || {};


    selectedCategory =
      data.selectedCategory || "All";


    currentSort =
      data.sort || "latest";


    renderFeed();


    window.addEventListener(
      "categorychange",
      event => {

        selectedCategory =
          event.detail || "All";

        renderFeed();

      }
    );


    window.addEventListener(
      "sortchange",
      event => {

        currentSort =
          event.detail || "latest";

        renderFeed();

      }
    );

  }
);


/* =========================================================
   GET FILTERED POSTS
   ========================================================= */

function getVisiblePosts() {

  let posts = [...DEMO_POSTS];


  /*
   * Category filter
   */

  if (selectedCategory !== "All") {

    posts =
      posts.filter(
        post =>
          post.category === selectedCategory
      );

  }


  /*
   * Sorting
   */

  if (currentSort === "popular") {

    posts.sort(
      (a, b) =>
        b.likes - a.likes
    );

  } else {

    posts.sort(
      (a, b) =>
        a.minutesAgo - b.minutesAgo
    );

  }


  return posts;

}


/* =========================================================
   RENDER FEED
   ========================================================= */

function renderFeed() {

  const feed =
    document.getElementById("feed");


  if (!feed) return;


  const posts =
    getVisiblePosts();


  updatePostCount(posts.length);


  /*
   * Empty state
   */

  if (!posts.length) {

    feed.innerHTML = createEmptyState();

    return;

  }


  feed.innerHTML = posts
    .map(post => createPostCard(post))
    .join("");


  bindPostMenus();

}


/* =========================================================
   POST CARD
   ========================================================= */

function createPostCard(post) {

  const app =
    window.BrocodeApp;


  const liked =
    app?.isPostLiked?.(post.id) || false;


  const saved =
    app?.isPostSaved?.(post.id) || false;


  const safeUser =
    app?.escapeHTML?.(post.user) ||
    post.user;


  const safeHandle =
    app?.escapeHTML?.(post.handle) ||
    post.handle;


  const safeTitle =
    app?.escapeHTML?.(post.title) ||
    post.title;


  const safeBody =
    app?.escapeHTML?.(post.body) ||
    post.body;


  const avatar =
    getAvatarLetter(post.user);


  return `

    <article
      class="post-card"
      data-post-id="${post.id}"
    >

      <!-- POST HEADER -->

      <div class="post-header">

        <div class="post-author">

          <div class="author-avatar">
            ${avatar}
          </div>

          <div class="author-info">

            <strong>${safeUser}</strong>

            <span>
              ${safeHandle}
              <span class="post-time">
                · ${post.time}
              </span>
            </span>

          </div>

        </div>


        <div class="post-menu-wrap">

          <button
            type="button"
            class="post-menu"
            data-menu-button="${post.id}"
            aria-label="Post options"
          >
            ⋯
          </button>

          <div
            class="post-dropdown"
            data-dropdown="${post.id}"
          >

            <button
              type="button"
              data-menu-action="save"
              data-post-id="${post.id}"
            >
              ${saved ? "Remove saved" : "Save post"}
            </button>

            <button
              type="button"
              data-menu-action="report"
              data-post-id="${post.id}"
            >
              Report
            </button>

          </div>

        </div>

      </div>


      <!-- CATEGORY -->

      <div class="post-category">
        ${post.category}
      </div>


      <!-- POST CONTENT -->

      <div class="post-content">

        <h3 class="post-title">
          ${safeTitle}
        </h3>

        <p>
          ${safeBody}
        </p>

      </div>


      <!-- POST FOOTER -->

      <div class="post-footer">

        <div class="post-actions">

          <button
            type="button"
            class="post-action like-action ${liked ? "liked" : ""}"
            data-action="like"
            data-post-id="${post.id}"
            aria-label="Like post"
          >

            <span class="action-icon">
              ${liked ? "♥" : "♡"}
            </span>

            <span class="action-count">
              ${formatNumber(
                post.likes +
                (liked ? 1 : 0)
              )}
            </span>

          </button>


          <button
            type="button"
            class="post-action"
            data-action="comment"
            data-post-id="${post.id}"
            aria-label="Comments"
          >

            <span class="action-icon">
              ◌
            </span>

            <span class="action-count">
              ${formatNumber(post.comments)}
            </span>

          </button>


          <button
            type="button"
            class="post-action save-action ${saved ? "saved" : ""}"
            data-action="save"
            data-post-id="${post.id}"
            aria-label="Save post"
          >

            <span class="action-icon">
              ${saved ? "★" : "☆"}
            </span>

            <span>
              ${saved ? "Saved" : "Save"}
            </span>

          </button>


          <button
            type="button"
            class="post-action share-action"
            data-action="share"
            data-post-id="${post.id}"
            aria-label="Share post"
          >

            <span class="action-icon">
              ↗
            </span>

            <span>
              Share
            </span>

          </button>

        </div>

      </div>

    </article>

  `;

}


/* =========================================================
   AVATAR LETTER
   ========================================================= */

function getAvatarLetter(name = "") {

  const cleanName =
    String(name).trim();


  if (!cleanName) {
    return "B";
  }


  return cleanName
    .charAt(0)
    .toUpperCase();

}


/* =========================================================
   NUMBER FORMAT
   ========================================================= */

function formatNumber(number) {

  const value =
    Number(number) || 0;


  if (value >= 1000000) {

    return (
      (value / 1000000)
        .toFixed(1)
        .replace(".0", "") +
      "M"
    );

  }


  if (value >= 1000) {

    return (
      (value / 1000)
        .toFixed(1)
        .replace(".0", "") +
      "K"
    );

  }


  return String(value);

}


/* =========================================================
   POST COUNT
   ========================================================= */

function updatePostCount(count) {

  const element =
    document.getElementById("postCount");


  if (!element) return;


  element.textContent =
    `${count} ${count === 1 ? "post" : "posts"}`;

}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function createEmptyState() {

  return `

    <div class="empty-state">

      <div class="empty-icon">
        ✦
      </div>

      <h3>
        Nothing here yet
      </h3>

      <p>
        No posts found in this category.
        Try another category.
      </p>

    </div>

  `;

}


/* =========================================================
   POST MENU
   ========================================================= */

function bindPostMenus() {

  /*
   * Open / close dropdown
   */

  document
    .querySelectorAll("[data-menu-button]")
    .forEach(button => {

      button.addEventListener(
        "click",
        event => {

          event.stopPropagation();


          const postId =
            button.dataset.menuButton;


          const dropdown =
            document.querySelector(
              `[data-dropdown="${postId}"]`
            );


          document
            .querySelectorAll(".post-dropdown")
            .forEach(item => {

              if (item !== dropdown) {
                item.classList.remove("show");
              }

            });


          dropdown?.classList.toggle(
            "show"
          );

        }
      );

    });


  /*
   * Menu actions
   */

  document
    .querySelectorAll("[data-menu-action]")
    .forEach(button => {

      button.addEventListener(
        "click",
        event => {

          event.stopPropagation();


          const action =
            button.dataset.menuAction;


          const postId =
            button.dataset.postId;


          if (
            action === "save" &&
            window.BrocodeApp
          ) {

            window.BrocodeApp
              .toggleSavePost(postId);

            renderFeed();

          }


          if (action === "report") {

            window.BrocodeApp?.showToast(
              "Post reported for review"
            );

          }

        }
      );

    });


  /*
   * Close menus when clicking outside
   */

  document.addEventListener(
    "click",
    closePostMenus,
    {
      once: true
    }
  );

}


/* =========================================================
   CLOSE POST MENUS
   ========================================================= */

function closePostMenus() {

  document
    .querySelectorAll(".post-dropdown")
    .forEach(dropdown => {

      dropdown.classList.remove(
        "show"
      );

    });

}


/* =========================================================
   ACTION OVERRIDE
   ========================================================= */

document.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "[data-action]"
      );


    if (!button) return;


    const action =
      button.dataset.action;


    const postId =
      button.dataset.postId;


    if (!postId) return;


    /*
     * LIKE
     */

    if (action === "like") {

      const liked =
        window.BrocodeApp
          ?.isPostLiked?.(postId);


      /*
       * Update icon immediately
       */

      const icon =
        button.querySelector(
          ".action-icon"
        );


      const count =
        button.querySelector(
          ".action-count"
        );


      const post =
        DEMO_POSTS.find(
          item =>
            item.id === postId
        );


      if (!post) return;


      if (liked) {

        post.likes--;

        button.classList.remove(
          "liked"
        );


        if (icon) {
          icon.textContent = "♡";
        }

      } else {

        post.likes++;

        button.classList.add(
          "liked"
        );


        if (icon) {
          icon.textContent = "♥";
        }

      }


      if (count) {

        count.textContent =
          formatNumber(post.likes);

      }

    }


    /*
     * SAVE
     */

    if (action === "save") {

      const saved =
        window.BrocodeApp
          ?.isPostSaved?.(postId);


      const icon =
        button.querySelector(
          ".action-icon"
        );


      const label =
        button.querySelector(
          "span:last-child"
        );


      if (saved) {

        button.classList.add(
          "saved"
        );


        if (icon) {
          icon.textContent = "★";
        }


        if (label) {
          label.textContent = "Saved";
        }

      } else {

        button.classList.remove(
          "saved"
        );


        if (icon) {
          icon.textContent = "☆";
        }


        if (label) {
          label.textContent = "Save";
        }

      }

    }


    /*
     * COMMENTS
     */

    if (action === "comment") {

      window.BrocodeApp?.showToast(
        "Comments will open here"
      );

    }

  }
);


/* =========================================================
   EXPOSE POST DATA
   ========================================================= */

window.BrocodePosts = {

  getAll() {
    return [...DEMO_POSTS];
  },

  getVisible() {
    return getVisiblePosts();
  },

  render() {
    renderFeed();
  }

};
