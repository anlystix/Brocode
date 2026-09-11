/* =========================================================
   BROCODE — APP CORE
   ========================================================= */


/* =========================================================
   APP CONFIG
   ========================================================= */

const APP_KEY = "brocode_demo_v1";

const CATEGORIES = [
  "All",
  "Meme",
  "Tips",
  "Motivation",
  "Hacks",
  "Knowledge"
];


/* =========================================================
   STORAGE
   ========================================================= */

function getAppData() {
  try {
    const data = JSON.parse(
      localStorage.getItem(APP_KEY)
    );

    return data || {
      savedPosts: [],
      likedPosts: [],
      selectedCategory: "All",
      sort: "latest"
    };

  } catch (error) {
    return {
      savedPosts: [],
      likedPosts: [],
      selectedCategory: "All",
      sort: "latest"
    };
  }
}


function saveAppData(data) {
  localStorage.setItem(
    APP_KEY,
    JSON.stringify(data)
  );
}


/* =========================================================
   CURRENT USER
   ========================================================= */

function getCurrentUser() {
  try {
    return JSON.parse(
      localStorage.getItem("community_user") || "null"
    );

  } catch {
    return null;
  }
}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char])
  );
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message, type = "default") {

  const toast =
    document.getElementById("toast");

  if (!toast) return;

  toast.className = "toast";

  if (type === "success") {
    toast.classList.add("success");
  }

  if (type === "error") {
    toast.classList.add("error");
  }

  toast.textContent = message;

  /*
   * Force reflow so repeated toast messages
   * can animate correctly.
   */
  void toast.offsetWidth;

  toast.classList.add("show");

  clearTimeout(window.__toastTimer);

  window.__toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}


/* =========================================================
   CATEGORY SLIDER
   ========================================================= */

function setupCategories() {

  const slider =
    document.getElementById("categorySlider");

  if (!slider) return;

  const data = getAppData();

  let selectedCategory =
    data.selectedCategory || "All";

  /*
   * Safety:
   * If stored category no longer exists,
   * reset to All.
   */
  if (!CATEGORIES.includes(selectedCategory)) {
    selectedCategory = "All";

    const currentData = getAppData();
    currentData.selectedCategory = "All";
    saveAppData(currentData);
  }

  slider.innerHTML = "";

  CATEGORIES.forEach(category => {

    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      "category-item";

    button.textContent = category;

    if (category === selectedCategory) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {

      selectedCategory = category;

      const currentData =
        getAppData();

      currentData.selectedCategory =
        category;

      saveAppData(currentData);

      document
        .querySelectorAll(".category-item")
        .forEach(item => {
          item.classList.remove("active");
        });

      button.classList.add("active");


      /*
       * Center selected category
       */

      try {
        button.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        });
      } catch (error) {
        button.scrollIntoView();
      }


      /*
       * Update page title
       */

      const title =
        document.getElementById("feedTitle");

      if (title) {

        title.textContent =
          category === "All"
            ? "All Posts"
            : category;
      }


      /*
       * Notify Posts module
       */

      window.dispatchEvent(
        new CustomEvent(
          "categorychange",
          {
            detail: category
          }
        )
      );

    });

    slider.appendChild(button);

  });


  /*
   * Initial center
   */

  const activeButton =
    slider.querySelector(
      ".category-item.active"
    );

  if (activeButton) {

    setTimeout(() => {

      try {
        activeButton.scrollIntoView({
          behavior: "instant",
          block: "nearest",
          inline: "center"
        });
      } catch (error) {
        activeButton.scrollIntoView();
      }

    }, 50);
  }


  setupCategoryArrows();
  setupCategorySwipe();
}


/* =========================================================
   CATEGORY ARROWS
   ========================================================= */

function setupCategoryArrows() {

  const slider =
    document.getElementById(
      "categorySlider"
    );

  const prev =
    document.getElementById(
      "categoryPrev"
    );

  const next =
    document.getElementById(
      "categoryNext"
    );

  if (!slider) return;


  /*
   * Prevent duplicate listeners
   * if setup is called again.
   */

  if (prev && !prev.dataset.bound) {

    prev.dataset.bound = "true";

    prev.addEventListener("click", () => {

      slider.scrollBy({
        left: -180,
        behavior: "smooth"
      });

    });
  }


  if (next && !next.dataset.bound) {

    next.dataset.bound = "true";

    next.addEventListener("click", () => {

      slider.scrollBy({
        left: 180,
        behavior: "smooth"
      });

    });
  }

}


/* =========================================================
   CATEGORY TOUCH / SWIPE
   ========================================================= */

function setupCategorySwipe() {

  const slider =
    document.getElementById(
      "categorySlider"
    );

  if (!slider) return;


  /*
   * Prevent duplicate swipe listeners.
   */

  if (slider.dataset.swipeBound === "true") {
    return;
  }

  slider.dataset.swipeBound = "true";


  let startX = 0;
  let isDragging = false;


  slider.addEventListener(
    "touchstart",
    event => {

      if (!event.touches.length) return;

      startX =
        event.touches[0].clientX;

      isDragging = true;

    },
    { passive: true }
  );


  slider.addEventListener(
    "touchmove",
    event => {

      if (
        !isDragging ||
        !event.touches.length
      ) {
        return;
      }

      const currentX =
        event.touches[0].clientX;

      const difference =
        startX - currentX;

      if (Math.abs(difference) > 20) {

        slider.scrollLeft += difference;

        startX = currentX;
      }

    },
    { passive: true }
  );


  slider.addEventListener(
    "touchend",
    () => {

      isDragging = false;

    }
  );

}


/* =========================================================
   SORT BUTTON
   ========================================================= */

function setupSort() {

  const sortButton =
    document.getElementById(
      "sortBtn"
    );

  if (!sortButton) return;

  const data = getAppData();

  let sort =
    data.sort || "latest";


  /*
   * Safety for invalid stored value.
   */

  if (
    sort !== "latest" &&
    sort !== "popular"
  ) {
    sort = "latest";

    const currentData =
      getAppData();

    currentData.sort = sort;

    saveAppData(currentData);
  }


  updateSortButton(
    sortButton,
    sort
  );


  /*
   * Prevent duplicate listener.
   */

  if (
    sortButton.dataset.bound === "true"
  ) {
    return;
  }

  sortButton.dataset.bound = "true";


  sortButton.addEventListener(
    "click",
    () => {

      sort =
        sort === "latest"
          ? "popular"
          : "latest";

      const currentData =
        getAppData();

      currentData.sort = sort;

      saveAppData(currentData);


      updateSortButton(
        sortButton,
        sort
      );


      window.dispatchEvent(
        new CustomEvent(
          "sortchange",
          {
            detail: sort
          }
        )
      );


      showToast(
        sort === "latest"
          ? "Showing latest posts"
          : "Showing popular posts"
      );

    }
  );

}


/* =========================================================
   SORT BUTTON UI
   ========================================================= */

function updateSortButton(
  button,
  sort
) {

  if (!button) return;

  button.innerHTML =
    sort === "latest"
      ? `Latest <span>⌄</span>`
      : `Popular <span>⌄</span>`;
}


/* =========================================================
   SAVE POST
   ========================================================= */

function toggleSavePost(postId) {

  if (!postId) return false;

  const data =
    getAppData();


  if (!Array.isArray(data.savedPosts)) {
    data.savedPosts = [];
  }


  const index =
    data.savedPosts.indexOf(
      postId
    );


  if (index === -1) {

    data.savedPosts.push(
      postId
    );

    saveAppData(data);

    showToast(
      "Post saved",
      "success"
    );

    return true;
  }


  data.savedPosts.splice(
    index,
    1
  );

  saveAppData(data);

  showToast(
    "Post removed from saved"
  );

  return false;
}


/* =========================================================
   CHECK SAVED
   ========================================================= */

function isPostSaved(postId) {

  if (!postId) return false;

  const data =
    getAppData();

  return Array.isArray(
    data.savedPosts
  )
    ? data.savedPosts.includes(postId)
    : false;
}


/* =========================================================
   LIKE POST
   ========================================================= */

function togglePostLike(postId) {

  if (!postId) return false;

  const data =
    getAppData();


  if (!Array.isArray(data.likedPosts)) {
    data.likedPosts = [];
  }


  const index =
    data.likedPosts.indexOf(
      postId
    );


  if (index === -1) {

    data.likedPosts.push(
      postId
    );

    saveAppData(data);

    showToast(
      "Liked",
      "success"
    );

    return true;
  }


  data.likedPosts.splice(
    index,
    1
  );

  saveAppData(data);

  showToast(
    "Like removed"
  );

  return false;
}


/* =========================================================
   CHECK POST LIKE
   ========================================================= */

function isPostLiked(postId) {

  if (!postId) return false;

  const data =
    getAppData();

  return Array.isArray(
    data.likedPosts
  )
    ? data.likedPosts.includes(postId)
    : false;
}


/* =========================================================
   GLOBAL CLICK HANDLER
   ========================================================= */

function handleGlobalPostActions(event) {

  const actionButton =
    event.target.closest(
      "[data-action]"
    );

  if (!actionButton) return;


  const action =
    actionButton.dataset.action;

  const postId =
    actionButton.dataset.postId;


  if (!postId) return;


  /*
   * Prevent duplicate processing
   * when another module handles
   * the same action.
   */

  if (
    action === "like" ||
    action === "save" ||
    action === "share"
  ) {
    event.preventDefault();
  }


  if (action === "like") {

    const liked =
      togglePostLike(
        postId
      );

    actionButton.classList.toggle(
      "liked",
      liked
    );

    return;
  }


  if (action === "save") {

    const saved =
      toggleSavePost(
        postId
      );

    actionButton.classList.toggle(
      "saved",
      saved
    );

    return;
  }


  if (action === "share") {

    sharePost(
      postId
    );

  }

}


/*
 * Bind global action handler only once.
 */

if (
  !window.__brocodeGlobalActionHandler
) {

  window.__brocodeGlobalActionHandler =
    handleGlobalPostActions;

  document.addEventListener(
    "click",
    window.__brocodeGlobalActionHandler
  );
}


/* =========================================================
   SHARE POST
   ========================================================= */

async function sharePost(postId) {

  if (!postId) return;

  const shareUrl =
    `${window.location.origin}${window.location.pathname}?post=${encodeURIComponent(postId)}`;


  try {

    if (
      navigator.share &&
      typeof navigator.share === "function"
    ) {

      await navigator.share({
        title: "Brocode Community",
        text: "Check out this post on Brocode.",
        url: shareUrl
      });

      return;
    }


    if (
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {

      await navigator.clipboard.writeText(
        shareUrl
      );

      showToast(
        "Post link copied",
        "success"
      );

      return;
    }

  } catch (error) {

    /*
     * User cancelled native share.
     */

    if (
      error &&
      error.name === "AbortError"
    ) {
      return;
    }

  }


  /*
   * Fallback for browsers where
   * Clipboard API is unavailable.
   */

  try {

    const temporaryInput =
      document.createElement(
        "input"
      );

    temporaryInput.value =
      shareUrl;

    temporaryInput.style.position =
      "fixed";

    temporaryInput.style.opacity =
      "0";

    document.body.appendChild(
      temporaryInput
    );

    temporaryInput.select();

    const copied =
      document.execCommand(
        "copy"
      );

    temporaryInput.remove();

    if (copied) {

      showToast(
        "Post link copied",
        "success"
      );

      return;
    }

  } catch (error) {
    /* Ignore fallback error */
  }


  showToast(
    "Unable to share right now",
    "error"
  );

}


/* =========================================================
   ACTIVE NAVIGATION
   ========================================================= */

function setActiveNavigation() {

  const currentPage =
    window.location.pathname
      .split("/")
      .pop()
      .toLowerCase();


  /*
   * GitHub Pages / root fallback.
   */

  const normalizedCurrentPage =
    currentPage || "index.html";


  document
    .querySelectorAll(
      ".bottom-nav a"
    )
    .forEach(link => {

      const href =
        link.getAttribute(
          "href"
        ) || "";


      const page =
        href
          .split("/")
          .pop()
          .split("?")[0]
          .split("#")[0]
          .toLowerCase();


      const normalizedPage =
        page || "index.html";


      link.classList.toggle(
        "active",
        normalizedPage ===
          normalizedCurrentPage
      );

    });

}


/* =========================================================
   INITIALIZE APP
   ========================================================= */

function initializeApp() {

  setupCategories();

  setupSort();

  setActiveNavigation();

}


/*
 * DOM ready initialization.
 */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeApp,
    {
      once: true
    }
  );

} else {

  initializeApp();

}


/* =========================================================
   GLOBAL APP HELPERS
   ========================================================= */

window.BrocodeApp = {

  getAppData,

  saveAppData,

  getCurrentUser,

  escapeHTML,

  showToast,

  toggleSavePost,

  isPostSaved,

  togglePostLike,

  isPostLiked,

  sharePost,

  setActiveNavigation

};
