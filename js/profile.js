/* =========================================================
   BROCODE PROFILE
   ---------------------------------------------------------
   Handles:
   - Current user profile
   - Creator level
   - Profile likes
   - Profile statistics
   - User's own posts
   - Saved posts count
   - Profile UI updates
   - Profile like notification
========================================================= */

(function () {

    "use strict";


    /* =========================================================
       CONFIG
    ========================================================= */

    const PROFILE_LIKE_PREFIX =
        "brocode_profile_liked_";

    const POSTS_KEY =
        "brocode_posts";


    const DEMO_LEVELS = [
        {
            level: 1,
            name: "Creator",
            minLikes: 0
        },
        {
            level: 2,
            name: "Rising Creator",
            minLikes: 10
        },
        {
            level: 3,
            name: "Pro Creator",
            minLikes: 100
        },
        {
            level: 4,
            name: "Elite Creator",
            minLikes: 500
        },
        {
            level: 5,
            name: "Legend Creator",
            minLikes: 1000
        }
    ];


    /* =========================================================
       HELPERS
    ========================================================= */

    function getAPI() {

        return window.BrocodeAPI || null;

    }


    function getCurrentUser() {

        const api =
            getAPI();


        if (api) {

            return api.getCurrentUser();

        }


        try {

            return JSON.parse(
                localStorage.getItem(
                    "community_user"
                )
            );

        } catch (error) {

            return null;

        }

    }


    function getPosts() {

        const api =
            getAPI();


        if (api) {

            /*
             * api.getPosts() is async.
             * Profile rendering uses the local
             * storage copy for immediate demo mode.
             */

            try {

                const raw =
                    localStorage.getItem(
                        POSTS_KEY
                    );


                return raw
                    ? JSON.parse(raw)
                    : [];

            } catch (error) {

                return [];

            }

        }


        try {

            return JSON.parse(
                localStorage.getItem(
                    POSTS_KEY
                )
            ) || [];

        } catch (error) {

            return [];

        }

    }


    function getSavedPosts() {

        try {

            const saved =
                JSON.parse(
                    localStorage.getItem(
                        "brocode_saved_posts"
                    )
                );


            return Array.isArray(saved)
                ? saved
                : [];

        } catch (error) {

            return [];

        }

    }


    function normalizeUsername(
        username
    ) {

        return String(
            username || ""
        )
            .trim()
            .toLowerCase();

    }


    function escapeHTML(value) {

        if (
            window.BrocodeApp &&
            typeof window.BrocodeApp.escapeHTML ===
            "function"
        ) {

            return window.BrocodeApp.escapeHTML(
                String(value || "")
            );

        }


        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function showToast(
        message
    ) {

        if (
            window.BrocodeApp &&
            typeof window.BrocodeApp.showToast ===
            "function"
        ) {

            window.BrocodeApp.showToast(
                message
            );

            return;

        }


        /*
         * Fallback toast.
         */

        let toast =
            document.getElementById(
                "profileToast"
            );


        if (!toast) {

            toast =
                document.createElement(
                    "div"
                );

            toast.id =
                "profileToast";

            toast.style.position =
                "fixed";

            toast.style.left =
                "50%";

            toast.style.bottom =
                "90px";

            toast.style.transform =
                "translateX(-50%)";

            toast.style.zIndex =
                "9999";

            toast.style.padding =
                "11px 16px";

            toast.style.borderRadius =
                "12px";

            toast.style.background =
                "#151a26";

            toast.style.color =
                "#ffffff";

            toast.style.border =
                "1px solid rgba(255,255,255,.08)";

            toast.style.fontSize =
                "13px";

            document.body.appendChild(
                toast
            );

        }


        toast.textContent =
            message;


        toast.style.display =
            "block";


        clearTimeout(
            toast._timer
        );


        toast._timer =
            setTimeout(
                function () {

                    toast.style.display =
                        "none";

                },
                2200
            );

    }


    /* =========================================================
       CREATOR LEVEL
    ========================================================= */

    function getCreatorLevel(
        likes
    ) {

        const totalLikes =
            Math.max(
                0,
                Number(likes || 0)
            );


        /*
         * Prefer API calculation if available.
         */

        const api =
            getAPI();


        if (
            api &&
            typeof api.calculateCreatorLevel ===
            "function"
        ) {

            const levelNumber =
                api.calculateCreatorLevel(
                    totalLikes
                );


            const matchingLevel =
                DEMO_LEVELS.find(
                    function (item) {

                        return (
                            item.level ===
                            levelNumber
                        );

                    }
                );


            if (matchingLevel) {

                return matchingLevel;

            }

        }


        let selected =
            DEMO_LEVELS[0];


        DEMO_LEVELS.forEach(
            function (level) {

                if (
                    totalLikes >=
                    level.minLikes
                ) {

                    selected =
                        level;

                }

            }
        );


        return selected;

    }


    /* =========================================================
       PROFILE LIKE STATE
    ========================================================= */

    function profileLikeKey(
        username
    ) {

        return (
            PROFILE_LIKE_PREFIX +
            normalizeUsername(
                username
            )
        );

    }


    function hasLikedProfile(
        username
    ) {

        if (!username) {
            return false;
        }


        return (
            localStorage.getItem(
                profileLikeKey(
                    username
                )
            ) === "true"
        );

    }


    function setProfileLikeState(
        username,
        liked
    ) {

        if (!username) {
            return;
        }


        if (liked) {

            localStorage.setItem(
                profileLikeKey(
                    username
                ),
                "true"
            );

        } else {

            localStorage.removeItem(
                profileLikeKey(
                    username
                )
            );

        }

    }


    /* =========================================================
       PRIVATE PROFILE LIKE COUNT
       ---------------------------------------------------------
       Exact count is intentionally stored privately.
       Other users only see creator level.
    ========================================================= */

    function getPrivateProfileLikeCount(
        username
    ) {

        const key =
            "brocode_profile_like_count_" +
            normalizeUsername(
                username
            );


        const count =
            Number(
                localStorage.getItem(
                    key
                ) || 0
            );


        return Math.max(
            0,
            count
        );

    }


    function setPrivateProfileLikeCount(
        username,
        count
    ) {

        const key =
            "brocode_profile_like_count_" +
            normalizeUsername(
                username
            );


        localStorage.setItem(
            key,
            String(
                Math.max(
                    0,
                    Number(count || 0)
                )
            )
        );

    }


    /* =========================================================
       PROFILE DATA
    ========================================================= */

    function getUserPosts(
        username
    ) {

        const normalized =
            normalizeUsername(
                username
            );


        if (!normalized) {
            return [];
        }


        const posts =
            getPosts();


        return posts.filter(
            function (post) {

                const author =
                    normalizeUsername(
                        post.author ||
                        post.username ||
                        post.authorUsername
                    );


                return (
                    author ===
                    normalized
                );

            }
        );

    }


    function getProfileStats(
        username
    ) {

        const posts =
            getUserPosts(
                username
            );


        const postCount =
            posts.length;


        const totalLikes =
            posts.reduce(
                function (sum, post) {

                    return (
                        sum +
                        Number(
                            post.likes || 0
                        )
                    );

                },
                0
            );


        const totalComments =
            posts.reduce(
                function (sum, post) {

                    return (
                        sum +
                        Number(
                            post.comments || 0
                        )
                    );

                },
                0
            );


        const engagement =
            totalLikes +
            totalComments;


        return {

            posts:
                postCount,

            likes:
                totalLikes,

            comments:
                totalComments,

            engagement:
                engagement

        };

    }


    /* =========================================================
       UPDATE PROFILE HEADER
    ========================================================= */

    function updateProfileHeader(
        user,
        stats,
        level
    ) {

        if (!user) {
            return;
        }


        const displayName =
            user.displayName ||
            user.name ||
            user.username ||
            "Brocode User";


        const username =
            normalizeUsername(
                user.username
            );


        /*
         * Display name.
         */

        document
            .querySelectorAll(
                "[data-profile-name]"
            )
            .forEach(
                function (element) {

                    element.textContent =
                        displayName;

                }
            );


        /*
         * Username.
         */

        document
            .querySelectorAll(
                "[data-profile-username]"
            )
            .forEach(
                function (element) {

                    element.textContent =
                        username
                            ? "@" + username
                            : "";

                }
            );


        /*
         * Creator level.
         */

        document
            .querySelectorAll(
                "[data-creator-level]"
            )
            .forEach(
                function (element) {

                    element.textContent =
                        "Level " +
                        level.level;

                }
            );


        document
            .querySelectorAll(
                "[data-creator-level-name]"
            )
            .forEach(
                function (element) {

                    element.textContent =
                        level.name;

                }
            );


        /*
         * Post count.
         */

        document
            .querySelectorAll(
                "[data-profile-posts]"
            )
            .forEach(
                function (element) {

                    element.textContent =
                        stats.posts;

                }
            );


        /*
         * Engagement.
         */

        document
            .querySelectorAll(
                "[data-profile-engagement]"
            )
            .forEach(
                function (element) {

                    element.textContent =
                        stats.engagement;

                }
            );


        /*
         * Avatar initials.
         */

        const initials =
            getInitials(
                displayName
            );


        document
            .querySelectorAll(
                "[data-profile-avatar]"
            )
            .forEach(
                function (element) {

                    element.textContent =
                        initials;

                }
            );

    }


    function getInitials(
        name
    ) {

        const words =
            String(name || "")
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (!words.length) {
            return "B";
        }


        if (words.length === 1) {

            return words[0]
                .substring(0, 2)
                .toUpperCase();

        }


        return (
            words[0][0] +
            words[words.length - 1][0]
        ).toUpperCase();

    }


    /* =========================================================
       PROFILE LIKE BUTTON
    ========================================================= */

    function updateLikeButton(
        username
    ) {

        const button =
            document.getElementById(
                "profileLikeButton"
            );


        if (!button) {
            return;
        }


        const liked =
            hasLikedProfile(
                username
            );


        button.classList.toggle(
            "liked",
            liked
        );


        /*
         * Support different button structures.
         */

        const text =
            button.querySelector(
                "[data-like-text]"
            );


        if (text) {

            text.textContent =
                liked
                    ? "Liked"
                    : "Like Creator";

        } else {

            const currentText =
                button.textContent
                    .trim();


            if (
                currentText.includes(
                    "Creator"
                ) ||
                currentText === "Liked"
            ) {

                button.textContent =
                    liked
                        ? "♥ Liked"
                        : "♡ Like Creator";

            }

        }


        button.setAttribute(
            "aria-pressed",
            liked
                ? "true"
                : "false"
        );

    }


    async function toggleProfileLike(
        username
    ) {

        const currentUser =
            getCurrentUser();


        if (!currentUser) {

            showToast(
                "Please log in to like a creator."
            );

            return;

        }


        const target =
            normalizeUsername(
                username
            );


        const currentUsername =
            normalizeUsername(
                currentUser.username
            );


        /*
         * Self-like is not allowed.
         */

        if (
            target &&
            target === currentUsername
        ) {

            showToast(
                "You can't like your own creator profile."
            );

            return;

        }


        if (!target) {
            return;
        }


        const alreadyLiked =
            hasLikedProfile(
                target
            );


        const newState =
            !alreadyLiked;


        setProfileLikeState(
            target,
            newState
        );


        /*
         * Private count.
         */

        let count =
            getPrivateProfileLikeCount(
                target
            );


        if (newState) {

            count++;

        } else {

            count =
                Math.max(
                    0,
                    count - 1
                );

        }


        setPrivateProfileLikeCount(
            target,
            count
        );


        updateLikeButton(
            target
        );


        if (newState) {

            /*
             * Notification is generated for the creator.
             * Exact like count remains private.
             */

            const api =
                getAPI();


            if (
                api &&
                typeof api.addNotification ===
                "function"
            ) {

                await api.addNotification({

                    type:
                        "like",

                    title:
                        "Your profile was liked",

                    message:
                        (
                            currentUser.displayName ||
                            currentUser.username ||
                            "Someone"
                        ) +
                        " liked your creator profile.",

                    data: {

                        username:
                            currentUser.username,

                        targetUsername:
                            target

                    }

                });

            }


            showToast(
                "Creator liked successfully."
            );

        } else {

            showToast(
                "Creator like removed."
            );

        }

    }


    /* =========================================================
       RENDER MY POSTS
    ========================================================= */

    function renderMyPosts(
        username
    ) {

        const container =
            document.getElementById(
                "myPostsList"
            );


        if (!container) {
            return;
        }


        const posts =
            getUserPosts(
                username
            );


        /*
         * Existing HTML may use another
         * container ID.
         */

        const possibleContainer =
            container ||
            document.querySelector(
                "[data-my-posts]"
            );


        if (!possibleContainer) {
            return;
        }


        if (!posts.length) {

            possibleContainer.innerHTML = `
                <div class="profile-empty-posts">
                    <div class="profile-empty-icon">✦</div>
                    <h3>No posts yet</h3>
                    <p>Your posts will appear here once you publish something.</p>
                    <a href="create-post.html" class="profile-create-btn">
                        Create your first post
                    </a>
                </div>
            `;

            return;

        }


        possibleContainer.innerHTML =
            posts.map(
                function (post) {

                    const title =
                        escapeHTML(
                            post.title ||
                            "Untitled Post"
                        );


                    const content =
                        escapeHTML(
                            post.content ||
                            ""
                        );


                    const category =
                        escapeHTML(
                            post.category ||
                            ""
                        );


                    const likes =
                        Number(
                            post.likes || 0
                        );


                    const comments =
                        Number(
                            post.comments || 0
                        );


                    return `
                        <article
                            class="profile-post-item"
                            data-post-id="${escapeHTML(post.id)}"
                        >

                            <div class="profile-post-top">

                                <span class="profile-post-category">
                                    ${category}
                                </span>

                                <span class="profile-post-likes">
                                    ♥ ${likes}
                                </span>

                            </div>

                            <h3 class="profile-post-title">
                                ${title}
                            </h3>

                            ${
                                content
                                    ? `
                                    <p class="profile-post-content">
                                        ${content}
                                    </p>
                                    `
                                    : ""
                            }

                            <div class="profile-post-meta">
                                <span>
                                    💬 ${comments}
                                </span>

                                <a href="index.html">
                                    View Post
                                </a>
                            </div>

                        </article>
                    `;

                }
            )
            .join("");

    }


    /* =========================================================
       SAVED COUNT
    ========================================================= */

    function updateSavedCount() {

        const saved =
            getSavedPosts();


        document
            .querySelectorAll(
                "[data-saved-count]"
            )
            .forEach(
                function (element) {

                    element.textContent =
                        saved.length;

                }
            );

    }


    /* =========================================================
       PROFILE INIT
    ========================================================= */

    async function initProfile() {

        const user =
            getCurrentUser();


        /*
         * Profile page should require login.
         */

        if (!user) {

            /*
             * Do not force redirect if profile.js
             * is used on another page.
             */

            const currentPage =
                window.location.pathname
                    .split("/")
                    .pop()
                    .toLowerCase();


            if (
                currentPage ===
                "profile.html"
            ) {

                window.location.href =
                    "login.html";

                return;

            }

            return;

        }


        const username =
            normalizeUsername(
                user.username
            );


        const stats =
            getProfileStats(
                username
            );


        const level =
            getCreatorLevel(
                stats.likes
            );


        updateProfileHeader(
            user,
            stats,
            level
        );


        updateLikeButton(
            username
        );


        updateSavedCount();


        renderMyPosts(
            username
        );


        /*
         * Update level on current session.
         */

        const api =
            getAPI();


        if (api) {

            api.setCurrentUser({

                ...user,

                creatorLevel:
                    level.level

            });

        }

    }


    /* =========================================================
       EVENT BINDING
    ========================================================= */

    function initEvents() {

        const likeButton =
            document.getElementById(
                "profileLikeButton"
            );


        if (
            likeButton &&
            likeButton.dataset.profileInitialized !==
            "true"
        ) {

            likeButton.dataset.profileInitialized =
                "true";


            likeButton.addEventListener(
                "click",
                async function (event) {

                    event.preventDefault();


                    const user =
                        getCurrentUser();


                    if (!user) {

                        showToast(
                            "Please log in first."
                        );

                        return;

                    }


                    await toggleProfileLike(
                        user.username
                    );

                }
            );

        }


        /*
         * Refresh profile when storage
         * changes in another tab.
         */

        window.addEventListener(
            "storage",
            function (event) {

                if (
                    event.key ===
                    POSTS_KEY ||
                    event.key ===
                    "brocode_saved_posts"
                ) {

                    initProfile();

                }

            }
        );

    }


    /* =========================================================
       PUBLIC OBJECT
    ========================================================= */

    window.BrocodeProfile = {

        init:
            initProfile,

        getCurrentUser,

        getUserPosts,

        getProfileStats,

        getCreatorLevel,

        hasLikedProfile,

        toggleProfileLike,

        getPrivateProfileLikeCount,

        renderMyPosts,

        updateSavedCount

    };


    /* =========================================================
       DOM READY
    ========================================================= */

    function boot() {

        initEvents();

        initProfile();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            boot
        );

    } else {

        boot();

    }


})();
