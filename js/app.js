/* =========================================================
   BROCODE — APP CORE
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
    const data = JSON.parse(localStorage.getItem(APP_KEY));

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
  localStorage.setItem(APP_KEY, JSON.stringify(data));
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
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message, type = "default") {

  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.className = "toast";

  if (type === "success") {
    toast.classList.add("success");
  }

  if (type === "error") {
    toast.classList.add("error");
  }

  toast.textContent = message;
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

  const slider = document.getElementById("categorySlider");

  if (!slider) return;

  const data = getAppData();

  let selectedCategory =
    data.selectedCategory || "All";


  slider.innerHTML = "";


  CATEGORIES.forEach(category => {

    const button = document.createElement("button");

    button.type = "button";

    button.className = "category-item";

    button.textContent = category;


    if (category === selectedCategory) {
      button.classList.add("active");
    }


    button.addEventListener("click", () => {

      selectedCategory = category;

      const currentData = getAppData();

      currentData.selectedCategory = category;

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

      button.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
      });


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
        new CustomEvent("categorychange", {
          detail: category
        })
      );

    });

    slider.appendChild(button);

  });


  /*
   * Initial center
   */

  const activeButton =
    slider.querySelector(".category-item.active");

  if (activeButton) {

    setTimeout(() => {

      activeButton.scrollIntoView({
        behavior: "instant",
        block: "nearest",
        inline: "center"
      });

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
    document.getElementById("categorySlider");

  const prev =
    document.getElementById("categoryPrev");

  const next =
    document.getElementById("categoryNext");


  if (!slider) return;


  if (prev) {

    prev.addEventListener("click", () => {

      slider.scrollBy({
        left: -180,
        behavior: "smooth"
      });

    });

  }


  if (next) {

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
    document.getElementById("categorySlider");

  if (!slider) return;


  let startX = 0;
  let isDragging = false;


  slider.addEventListener(
    "touchstart",
    event => {

      startX = event.touches[0].clientX;

      isDragging = true;

    },
    { passive: true }
  );


  slider.addEventListener(
    "touchmove",
    event => {

      if (!isDragging) return;

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
    document.getElementById("sortBtn");

  if (!sortButton) return;


  const data = getAppData();

  let sort =
    data.sort || "latest";


  updateSortButton(
    sortButton,
    sort
  );


  sortButton.addEventListener("click", () => {

    sort =
      sort === "latest"
        ? "popular"
        : "latest";


    const currentData = getAppData();

    currentData.sort = sort;

    saveAppData(currentData);


    updateSortButton(
      sortButton,
      sort
    );


    window.dispatchEvent(
      new CustomEvent("sortchange", {
        detail: sort
      })
    );


    showToast(
      sort === "latest"
        ? "Showing latest posts"
        : "Showing popular posts"
    );

  });

}


/* =========================================================
   SORT BUTTON UI
   ========================================================= */

function updateSortButton(button, sort) {

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

  const data = getAppData();


  const index =
    data.savedPosts.indexOf(postId);


  if (index === -1) {

    data.savedPosts.push(postId);

    saveAppData(data);

    showToast(
      "Post saved",
      "success"
    );

    return true;

  }


  data.savedPosts.splice(index, 1);

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

  const data = getAppData();

  return data.savedPosts.includes(postId);

}


/* =========================================================
   LIKE POST
   ========================================================= */

function togglePostLike(postId) {

  const data = getAppData();


  const index =
    data.likedPosts.indexOf(postId);


  if (index === -1) {

    data.likedPosts.push(postId);

    saveAppData(data);

    showToast(
      "Liked",
      "success"
    );

    return true;

  }


  data.likedPosts.splice(index, 1);

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

  const data = getAppData();

  return data.likedPosts.includes(postId);

}


/* =========================================================
   GLOBAL CLICK HANDLER
   ========================================================= */

document.addEventListener(
  "click",
  event => {

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


    if (action === "like") {

      const liked =
        togglePostLike(postId);


      actionButton.classList.toggle(
        "liked",
        liked
      );

    }


    if (action === "save") {

      const saved =
        toggleSavePost(postId);


      actionButton.classList.toggle(
        "saved",
        saved
      );

    }


    if (action === "share") {

      sharePost(postId);

    }

  }
);


/* =========================================================
   SHARE POST
   ========================================================= */

async function sharePost(postId) {

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


    if (navigator.clipboard) {

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


  document
    .querySelectorAll(".bottom-nav a")
    .forEach(link => {

      const href =
        link.getAttribute("href") || "";


      const page =
        href
          .split("/")
          .pop()
          .toLowerCase();


      link.classList.toggle(
        "active",
        page === currentPage
      );

    });

}


/* =========================================================
   INITIALIZE APP
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupCategories();

    setupSort();

    setActiveNavigation();

  }
);


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

  sharePost

};
