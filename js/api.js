/* =========================================================
   BROCODE API LAYER
   ---------------------------------------------------------
   Purpose:
   - Keep frontend API logic in one place
   - Work with demo/localStorage mode for now
   - Ready for future Node.js + PostgreSQL/Supabase backend
   - Never store passwords in localStorage
========================================================= */

(function () {

    "use strict";


    /* =========================================================
       CONFIGURATION
    ========================================================= */

    const CONFIG = {

        /*
         * Keep false while the backend is not connected.
         *
         * Later:
         * API_MODE: "backend"
         */
        API_MODE: "demo",

        /*
         * Future backend URL.
         *
         * Example:
         * https://api.brocode.com/api
         */
        API_BASE_URL: "",

        /*
         * Request timeout.
         */
        REQUEST_TIMEOUT: 15000,

        /*
         * LocalStorage keys.
         */
        KEYS: {

            CURRENT_USER: "community_user",

            USERS: "brocode_users",

            POSTS: "brocode_posts",

            SAVED_POSTS: "brocode_saved_posts",

            NOTIFICATIONS: "brocode_notifications",

            SUPPORT_CHAT: "brocode_support_chat_v1"

        }

    };


    /* =========================================================
       BASIC HELPERS
    ========================================================= */

    function generateId(prefix) {

        return (
            prefix +
            "_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 9)
        );

    }


    function nowISO() {

        return new Date().toISOString();

    }


    function normalizeUsername(username) {

        return String(username || "")
            .trim()
            .toLowerCase();

    }


    function safeParse(value, fallback) {

        if (!value) {
            return fallback;
        }

        try {

            return JSON.parse(value);

        } catch (error) {

            return fallback;

        }

    }


    function readStorage(key, fallback) {

        return safeParse(
            localStorage.getItem(key),
            fallback
        );

    }


    function writeStorage(key, value) {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return value;

    }


    function removeStorage(key) {

        localStorage.removeItem(key);

    }


    /* =========================================================
       CURRENT USER
    ========================================================= */

    function getCurrentUser() {

        return readStorage(
            CONFIG.KEYS.CURRENT_USER,
            null
        );

    }


    function setCurrentUser(user) {

        if (!user) {

            removeStorage(
                CONFIG.KEYS.CURRENT_USER
            );

            return null;

        }

        /*
         * Only safe public/session information is stored.
         * Passwords must never be stored here.
         */

        const safeUser = {

            id:
                user.id ||
                null,

            displayName:
                user.displayName ||
                user.name ||
                "",

            username:
                normalizeUsername(
                    user.username
                ),

            creatorLevel:
                user.creatorLevel ||
                1

        };


        writeStorage(
            CONFIG.KEYS.CURRENT_USER,
            safeUser
        );


        return safeUser;

    }


    function clearCurrentUser() {

        removeStorage(
            CONFIG.KEYS.CURRENT_USER
        );

    }


    function isLoggedIn() {

        return !!getCurrentUser();

    }


    /* =========================================================
       GENERIC BACKEND REQUEST
    ========================================================= */

    async function request(
        endpoint,
        options
    ) {

        options =
            options || {};


        if (
            CONFIG.API_MODE !== "backend" ||
            !CONFIG.API_BASE_URL
        ) {

            throw new Error(
                "Backend API is not connected yet."
            );

        }


        const controller =
            new AbortController();


        const timeout =
            setTimeout(
                function () {
                    controller.abort();
                },
                CONFIG.REQUEST_TIMEOUT
            );


        const requestOptions = {

            method:
                options.method ||
                "GET",

            headers: {

                "Content-Type":
                    "application/json",

                ...(options.headers || {})

            },

            body:
                options.body
                    ? JSON.stringify(
                        options.body
                    )
                    : undefined,

            signal:
                controller.signal

        };


        /*
         * Token will be handled here later.
         *
         * Example:
         *
         * requestOptions.headers.Authorization =
         *     "Bearer " + token;
         */


        try {

            const response =
                await fetch(
                    CONFIG.API_BASE_URL +
                    endpoint,
                    requestOptions
                );


            const contentType =
                response.headers.get(
                    "content-type"
                ) || "";


            const data =
                contentType.includes(
                    "application/json"
                )
                    ? await response.json()
                    : await response.text();


            if (!response.ok) {

                const error =
                    new Error(
                        data?.message ||
                        "API request failed."
                    );

                error.status =
                    response.status;

                error.data =
                    data;

                throw error;

            }


            return data;

        } catch (error) {

            if (
                error.name ===
                "AbortError"
            ) {

                throw new Error(
                    "Request timed out. Please try again."
                );

            }

            throw error;

        } finally {

            clearTimeout(timeout);

        }

    }


    /* =========================================================
       USER API
    ========================================================= */

    async function getUserByUsername(
        username
    ) {

        const normalized =
            normalizeUsername(
                username
            );


        if (!normalized) {
            return null;
        }


        /*
         * Demo mode
         */

        if (CONFIG.API_MODE === "demo") {

            const users =
                readStorage(
                    CONFIG.KEYS.USERS,
                    []
                );


            return (
                users.find(
                    function (user) {

                        return (
                            normalizeUsername(
                                user.username
                            ) === normalized
                        );

                    }
                ) || null
            );

        }


        /*
         * Backend mode
         */

        return request(
            "/users/" +
            encodeURIComponent(
                normalized
            )
        );

    }


    async function getUserById(id) {

        if (!id) {
            return null;
        }


        if (CONFIG.API_MODE === "demo") {

            const users =
                readStorage(
                    CONFIG.KEYS.USERS,
                    []
                );


            return (
                users.find(
                    function (user) {

                        return (
                            String(user.id) ===
                            String(id)
                        );

                    }
                ) || null
            );

        }


        return request(
            "/users/" +
            encodeURIComponent(id)
        );

    }


    async function searchUsers(query) {

        const search =
            String(query || "")
                .trim()
                .toLowerCase();


        if (!search) {
            return [];
        }


        if (CONFIG.API_MODE === "demo") {

            const users =
                readStorage(
                    CONFIG.KEYS.USERS,
                    []
                );


            return users.filter(
                function (user) {

                    const username =
                        String(
                            user.username || ""
                        ).toLowerCase();


                    const displayName =
                        String(
                            user.displayName ||
                            user.name ||
                            ""
                        ).toLowerCase();


                    const id =
                        String(
                            user.id || ""
                        ).toLowerCase();


                    return (
                        username.includes(search) ||
                        displayName.includes(search) ||
                        id.includes(search)
                    );

                }
            );

        }


        return request(
            "/users/search?q=" +
            encodeURIComponent(search)
        );

    }


    /* =========================================================
       AUTH API
    ========================================================= */

    async function login(
        username,
        password
    ) {

        const normalized =
            normalizeUsername(
                username
            );


        if (!normalized || !password) {

            throw new Error(
                "Username and password are required."
            );

        }


        /*
         * Demo mode.
         *
         * IMPORTANT:
         * We do NOT verify/store real passwords here.
         * Real authentication will happen through backend.
         */

        if (CONFIG.API_MODE === "demo") {

            const users =
                readStorage(
                    CONFIG.KEYS.USERS,
                    []
                );


            const user =
                users.find(
                    function (item) {

                        return (
                            normalizeUsername(
                                item.username
                            ) === normalized
                        );

                    }
                );


            if (!user) {

                throw new Error(
                    "Account not found. Please create an account first."
                );

            }


            return setCurrentUser(
                user
            );

        }


        const result =
            await request(
                "/auth/login",
                {
                    method: "POST",
                    body: {
                        username:
                            normalized,
                        password:
                            password
                    }
                }
            );


        /*
         * Backend may eventually return:
         *
         * {
         *   user: {...},
         *   token: "..."
         * }
         */


        if (result.user) {

            setCurrentUser(
                result.user
            );

        }


        return result;

    }


    async function signup(
        displayName,
        username,
        password
    ) {

        const name =
            String(
                displayName || ""
            ).trim();


        const normalized =
            normalizeUsername(
                username
            );


        if (name.length < 2) {

            throw new Error(
                "Please enter a valid display name."
            );

        }


        if (
            !/^[a-z0-9_]{3,20}$/
                .test(normalized)
        ) {

            throw new Error(
                "Username must be 3–20 characters and can contain only letters, numbers and underscore."
            );

        }


        if (!password || password.length < 8) {

            throw new Error(
                "Password must contain at least 8 characters."
            );

        }


        /*
         * Demo mode
         */

        if (CONFIG.API_MODE === "demo") {

            const users =
                readStorage(
                    CONFIG.KEYS.USERS,
                    []
                );


            const exists =
                users.some(
                    function (user) {

                        return (
                            normalizeUsername(
                                user.username
                            ) === normalized
                        );

                    }
                );


            if (exists) {

                throw new Error(
                    "This username is already taken."
                );

            }


            const user = {

                id:
                    generateId("user"),

                displayName:
                    name,

                username:
                    normalized,

                createdAt:
                    nowISO(),

                creatorLevel:
                    1

            };


            users.push(user);


            writeStorage(
                CONFIG.KEYS.USERS,
                users
            );


            /*
             * Password intentionally NOT stored.
             */

            setCurrentUser(
                user
            );


            return user;

        }


        /*
         * Backend mode
         */

        const result =
            await request(
                "/auth/signup",
                {
                    method: "POST",
                    body: {

                        displayName:
                            name,

                        username:
                            normalized,

                        password:
                            password

                    }
                }
            );


        if (result.user) {

            setCurrentUser(
                result.user
            );

        }


        return result;

    }


    async function logout() {

        /*
         * Backend logout can be connected here later.
         */

        clearCurrentUser();

        return {
            success: true
        };

    }


    /* =========================================================
       POSTS API
    ========================================================= */

    async function getPosts(
        options
    ) {

        options =
            options || {};


        if (CONFIG.API_MODE === "demo") {

            const posts =
                readStorage(
                    CONFIG.KEYS.POSTS,
                    []
                );


            let result =
                Array.isArray(posts)
                    ? posts.slice()
                    : [];


            if (options.category &&
                options.category !== "All") {

                result =
                    result.filter(
                        function (post) {

                            return (
                                String(
                                    post.category || ""
                                ).toLowerCase() ===
                                String(
                                    options.category
                                ).toLowerCase()
                            );

                        }
                    );

            }


            return result;

        }


        const params =
            new URLSearchParams();


        if (options.category) {

            params.set(
                "category",
                options.category
            );

        }


        if (options.sort) {

            params.set(
                "sort",
                options.sort
            );

        }


        if (options.page) {

            params.set(
                "page",
                options.page
            );

        }


        if (options.limit) {

            params.set(
                "limit",
                options.limit
            );

        }


        const query =
            params.toString();


        return request(
            "/posts" +
            (query ? "?" + query : "")
        );

    }


    async function getPostById(id) {

        if (!id) {
            return null;
        }


        if (CONFIG.API_MODE === "demo") {

            const posts =
                readStorage(
                    CONFIG.KEYS.POSTS,
                    []
                );


            return (
                posts.find(
                    function (post) {

                        return (
                            String(post.id) ===
                            String(id)
                        );

                    }
                ) || null
            );

        }


        return request(
            "/posts/" +
            encodeURIComponent(id)
        );

    }


    async function createPost(postData) {

        if (!postData) {

            throw new Error(
                "Post data is required."
            );

        }


        if (CONFIG.API_MODE === "demo") {

            const posts =
                readStorage(
                    CONFIG.KEYS.POSTS,
                    []
                );


            const currentUser =
                getCurrentUser();


            const post = {

                id:
                    postData.id ||
                    generateId("post"),

                category:
                    postData.category ||
                    "",

                title:
                    String(
                        postData.title || ""
                    ).trim(),

                content:
                    String(
                        postData.content || ""
                    ).trim(),

                author:
                    postData.author ||
                    currentUser?.username ||
                    "unknown",

                authorName:
                    postData.authorName ||
                    currentUser?.displayName ||
                    "Unknown",

                likes:
                    Number(
                        postData.likes || 0
                    ),

                comments:
                    Number(
                        postData.comments || 0
                    ),

                createdAt:
                    postData.createdAt ||
                    nowISO(),

                saved:
                    false

            };


            posts.unshift(post);


            writeStorage(
                CONFIG.KEYS.POSTS,
                posts
            );


            return post;

        }


        return request(
            "/posts",
            {
                method: "POST",
                body: postData
            }
        );

    }


    async function deletePost(id) {

        if (!id) {
            throw new Error(
                "Post ID is required."
            );
        }


        if (CONFIG.API_MODE === "demo") {

            const posts =
                readStorage(
                    CONFIG.KEYS.POSTS,
                    []
                );


            const filtered =
                posts.filter(
                    function (post) {

                        return (
                            String(post.id) !==
                            String(id)
                        );

                    }
                );


            writeStorage(
                CONFIG.KEYS.POSTS,
                filtered
            );


            return {
                success: true
            };

        }


        return request(
            "/posts/" +
            encodeURIComponent(id),
            {
                method: "DELETE"
            }
        );

    }


    /* =========================================================
       LIKE API
    ========================================================= */

    async function likePost(id) {

        if (!id) {
            return null;
        }


        if (CONFIG.API_MODE === "demo") {

            const posts =
                readStorage(
                    CONFIG.KEYS.POSTS,
                    []
                );


            const post =
                posts.find(
                    function (item) {

                        return (
                            String(item.id) ===
                            String(id)
                        );

                    }
                );


            if (!post) {
                return null;
            }


            post.likes =
                Number(
                    post.likes || 0
                ) + 1;


            writeStorage(
                CONFIG.KEYS.POSTS,
                posts
            );


            return post;

        }


        return request(
            "/posts/" +
            encodeURIComponent(id) +
            "/like",
            {
                method: "POST"
            }
        );

    }


    async function unlikePost(id) {

        if (!id) {
            return null;
        }


        if (CONFIG.API_MODE === "demo") {

            const posts =
                readStorage(
                    CONFIG.KEYS.POSTS,
                    []
                );


            const post =
                posts.find(
                    function (item) {

                        return (
                            String(item.id) ===
                            String(id)
                        );

                    }
                );


            if (!post) {
                return null;
            }


            post.likes =
                Math.max(
                    0,
                    Number(
                        post.likes || 0
                    ) - 1
                );


            writeStorage(
                CONFIG.KEYS.POSTS,
                posts
            );


            return post;

        }


        return request(
            "/posts/" +
            encodeURIComponent(id) +
            "/like",
            {
                method: "DELETE"
            }
        );

    }


    /* =========================================================
       SAVED POSTS API
    ========================================================= */

    async function getSavedPostIds() {

        const saved =
            readStorage(
                CONFIG.KEYS.SAVED_POSTS,
                []
            );


        return Array.isArray(saved)
            ? saved
            : [];

    }


    async function savePost(id) {

        if (!id) {
            return false;
        }


        const saved =
            await getSavedPostIds();


        const exists =
            saved.some(
                function (savedId) {

                    return (
                        String(savedId) ===
                        String(id)
                    );

                }
            );


        if (!exists) {

            saved.push(id);

        }


        writeStorage(
            CONFIG.KEYS.SAVED_POSTS,
            saved
        );


        if (CONFIG.API_MODE === "backend") {

            return request(
                "/posts/" +
                encodeURIComponent(id) +
                "/save",
                {
                    method: "POST"
                }
            );

        }


        return true;

    }


    async function unsavePost(id) {

        if (!id) {
            return false;
        }


        const saved =
            await getSavedPostIds();


        const filtered =
            saved.filter(
                function (savedId) {

                    return (
                        String(savedId) !==
                        String(id)
                    );

                }
            );


        writeStorage(
            CONFIG.KEYS.SAVED_POSTS,
            filtered
        );


        if (CONFIG.API_MODE === "backend") {

            return request(
                "/posts/" +
                encodeURIComponent(id) +
                "/save",
                {
                    method: "DELETE"
                }
            );

        }


        return true;

    }


    /* =========================================================
       NOTIFICATIONS API
    ========================================================= */

    async function getNotifications() {

        const notifications =
            readStorage(
                CONFIG.KEYS.NOTIFICATIONS,
                []
            );


        return Array.isArray(
            notifications
        )
            ? notifications
            : [];

    }


    async function addNotification(
        notification
    ) {

        if (!notification) {
            return null;
        }


        const notifications =
            await getNotifications();


        const item = {

            id:
                notification.id ||
                generateId("notification"),

            type:
                notification.type ||
                "system",

            title:
                notification.title ||
                "Notification",

            message:
                notification.message ||
                "",

            read:
                Boolean(
                    notification.read
                ),

            createdAt:
                notification.createdAt ||
                nowISO(),

            data:
                notification.data ||
                {}

        };


        notifications.unshift(item);


        writeStorage(
            CONFIG.KEYS.NOTIFICATIONS,
            notifications
        );


        return item;

    }


    async function markNotificationRead(
        id
    ) {

        const notifications =
            await getNotifications();


        const notification =
            notifications.find(
                function (item) {

                    return (
                        String(item.id) ===
                        String(id)
                    );

                }
            );


        if (!notification) {
            return false;
        }


        notification.read = true;


        writeStorage(
            CONFIG.KEYS.NOTIFICATIONS,
            notifications
        );


        return true;

    }


    async function markAllNotificationsRead() {

        const notifications =
            await getNotifications();


        notifications.forEach(
            function (item) {

                item.read = true;

            }
        );


        writeStorage(
            CONFIG.KEYS.NOTIFICATIONS,
            notifications
        );


        return true;

    }


    /* =========================================================
       SUPPORT CHAT API
    ========================================================= */

    async function getSupportMessages() {

        const messages =
            readStorage(
                CONFIG.KEYS.SUPPORT_CHAT,
                []
            );


        return Array.isArray(messages)
            ? messages
            : [];

    }


    async function sendSupportMessage(
        message
    ) {

        const text =
            String(
                message || ""
            ).trim();


        if (!text) {

            throw new Error(
                "Message cannot be empty."
            );

        }


        const messages =
            await getSupportMessages();


        const currentUser =
            getCurrentUser();


        const item = {

            id:
                generateId("support"),

            sender:
                "user",

            username:
                currentUser?.username ||
                "guest",

            message:
                text,

            createdAt:
                nowISO()

        };


        messages.push(item);


        writeStorage(
            CONFIG.KEYS.SUPPORT_CHAT,
            messages
        );


        if (CONFIG.API_MODE === "backend") {

            return request(
                "/support/messages",
                {
                    method: "POST",
                    body: {
                        message: text
                    }
                }
            );

        }


        return item;

    }


    /* =========================================================
       PROFILE API
    ========================================================= */

    async function updateProfile(
        profileData
    ) {

        if (!profileData) {

            throw new Error(
                "Profile data is required."
            );

        }


        const currentUser =
            getCurrentUser();


        if (!currentUser) {

            throw new Error(
                "Please log in first."
            );

        }


        if (
            profileData.displayName !==
            undefined
        ) {

            currentUser.displayName =
                String(
                    profileData.displayName
                ).trim();

        }


        if (
            profileData.username !==
            undefined
        ) {

            currentUser.username =
                normalizeUsername(
                    profileData.username
                );

        }


        if (CONFIG.API_MODE === "demo") {

            setCurrentUser(
                currentUser
            );


            const users =
                readStorage(
                    CONFIG.KEYS.USERS,
                    []
                );


            const index =
                users.findIndex(
                    function (user) {

                        return (
                            String(user.id) ===
                            String(currentUser.id)
                        );

                    }
                );


            if (index !== -1) {

                users[index] = {

                    ...users[index],

                    displayName:
                        currentUser.displayName,

                    username:
                        currentUser.username

                };


                writeStorage(
                    CONFIG.KEYS.USERS,
                    users
                );

            }


            return currentUser;

        }


        const result =
            await request(
                "/users/me",
                {
                    method: "PATCH",
                    body: profileData
                }
            );


        if (result.user) {

            setCurrentUser(
                result.user
            );

        }


        return result;

    }


    /* =========================================================
       CREATOR LEVEL
    ========================================================= */

    function calculateCreatorLevel(
        likes
    ) {

        const totalLikes =
            Math.max(
                0,
                Number(likes || 0)
            );


        /*
         * Temporary demo thresholds.
         *
         * These will eventually come from
         * the admin/database settings.
         */

        if (totalLikes >= 1000) {
            return 5;
        }

        if (totalLikes >= 500) {
            return 4;
        }

        if (totalLikes >= 100) {
            return 3;
        }

        if (totalLikes >= 10) {
            return 2;
        }

        return 1;

    }


    /* =========================================================
       PUBLIC API
    ========================================================= */

    const BrocodeAPI = {

        CONFIG,

        request,

        generateId,

        nowISO,

        normalizeUsername,

        getCurrentUser,

        setCurrentUser,

        clearCurrentUser,

        isLoggedIn,

        login,

        signup,

        logout,

        getUserByUsername,

        getUserById,

        searchUsers,

        getPosts,

        getPostById,

        createPost,

        deletePost,

        likePost,

        unlikePost,

        getSavedPostIds,

        savePost,

        unsavePost,

        getNotifications,

        addNotification,

        markNotificationRead,

        markAllNotificationsRead,

        getSupportMessages,

        sendSupportMessage,

        updateProfile,

        calculateCreatorLevel

    };


    /*
     * Expose globally so other Brocode files can use:
     *
     * BrocodeAPI.login(...)
     * BrocodeAPI.getPosts(...)
     * BrocodeAPI.createPost(...)
     */

    window.BrocodeAPI =
        BrocodeAPI;


})();
