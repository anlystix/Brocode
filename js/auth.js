/* =========================================================
   BROCODE AUTHENTICATION
   ---------------------------------------------------------
   Handles:
   - Login
   - Signup
   - Logout
   - Session check
   - Protected page redirect
   - Login/signup form integration
   - Demo mode through BrocodeAPI
========================================================= */

(function () {

    "use strict";

    /* =========================================================
       CONFIG
    ========================================================= */

    const LOGIN_PAGE = "login.html";
    const SIGNUP_PAGE = "signup.html";
    const HOME_PAGE = "index.html";


    /* =========================================================
       API CHECK
    ========================================================= */

    function getAPI() {

        if (
            typeof window.BrocodeAPI ===
            "undefined"
        ) {

            console.error(
                "BrocodeAPI is not loaded. Make sure api.js is included before auth.js."
            );

            return null;

        }

        return window.BrocodeAPI;

    }


    /* =========================================================
       USER HELPERS
    ========================================================= */

    function getCurrentUser() {

        const api = getAPI();

        if (!api) {
            return null;
        }

        return api.getCurrentUser();

    }


    function isLoggedIn() {

        const api = getAPI();

        if (!api) {
            return false;
        }

        return api.isLoggedIn();

    }


    function logout() {

        const api = getAPI();

        if (!api) {
            return false;
        }

        api.logout();

        /*
         * Redirect after logout.
         */

        window.location.href =
            LOGIN_PAGE;

        return true;

    }


    /* =========================================================
       ERROR MESSAGE
    ========================================================= */

    function showFormMessage(
        element,
        message,
        type
    ) {

        if (!element) {
            return;
        }

        element.textContent =
            message || "";

        element.className =
            "auth-message " +
            (type || "error");

    }


    function clearFormMessage(element) {

        if (!element) {
            return;
        }

        element.textContent = "";

        element.className =
            "auth-message";

    }


    /* =========================================================
       LOGIN
    ========================================================= */

    async function handleLogin(
        username,
        password,
        options
    ) {

        options =
            options || {};


        const api =
            getAPI();


        if (!api) {

            throw new Error(
                "Authentication system is not available."
            );

        }


        const normalizedUsername =
            api.normalizeUsername(
                username
            );


        if (!normalizedUsername) {

            throw new Error(
                "Please enter your username."
            );

        }


        if (!password) {

            throw new Error(
                "Please enter your password."
            );

        }


        const user =
            await api.login(
                normalizedUsername,
                password
            );


        /*
         * Save remember preference only.
         * Never save the password.
         */

        if (
            options.remember === true
        ) {

            localStorage.setItem(
                "brocode_remember_login",
                "true"
            );

        } else {

            localStorage.removeItem(
                "brocode_remember_login"
            );

        }


        return user;

    }


    /* =========================================================
       SIGNUP
    ========================================================= */

    async function handleSignup(
        displayName,
        username,
        password,
        confirmPassword,
        options
    ) {

        options =
            options || {};


        const api =
            getAPI();


        if (!api) {

            throw new Error(
                "Authentication system is not available."
            );

        }


        const name =
            String(
                displayName || ""
            ).trim();


        const normalizedUsername =
            api.normalizeUsername(
                username
            );


        if (name.length < 2) {

            throw new Error(
                "Please enter a valid display name."
            );

        }


        if (
            !/^[a-z0-9_]{3,20}$/
                .test(
                    normalizedUsername
                )
        ) {

            throw new Error(
                "Username must be 3–20 characters and can contain only letters, numbers and underscore."
            );

        }


        if (
            !password ||
            password.length < 8
        ) {

            throw new Error(
                "Password must contain at least 8 characters."
            );

        }


        if (!/[A-Za-z]/.test(password)) {

            throw new Error(
                "Password must contain at least one letter."
            );

        }


        if (!/\d/.test(password)) {

            throw new Error(
                "Password must contain at least one number."
            );

        }


        if (
            password !==
            confirmPassword
        ) {

            throw new Error(
                "Passwords do not match."
            );

        }


        const user =
            await api.signup(
                name,
                normalizedUsername,
                password
            );


        return user;

    }


    /* =========================================================
       LOGIN FORM
    ========================================================= */

    function initLoginForm() {

        const form =
            document.getElementById(
                "loginForm"
            );


        if (!form) {
            return;
        }


        /*
         * Prevent multiple handlers if this
         * function is called more than once.
         */

        if (
            form.dataset.authInitialized ===
            "true"
        ) {

            return;

        }


        form.dataset.authInitialized =
            "true";


        const usernameInput =
            document.getElementById(
                "username"
            );


        const passwordInput =
            document.getElementById(
                "password"
            );


        const rememberInput =
            document.getElementById(
                "remember"
            );


        const submitButton =
            form.querySelector(
                'button[type="submit"]'
            );


        const message =
            document.getElementById(
                "authMessage"
            );


        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                clearFormMessage(
                    message
                );


                const username =
                    usernameInput
                        ? usernameInput.value
                        : "";


                const password =
                    passwordInput
                        ? passwordInput.value
                        : "";


                const remember =
                    rememberInput
                        ? rememberInput.checked
                        : false;


                const originalButtonText =
                    submitButton
                        ? submitButton.textContent
                        : "Log In";


                if (submitButton) {

                    submitButton.disabled =
                        true;

                    submitButton.textContent =
                        "Signing in...";

                }


                try {

                    await handleLogin(
                        username,
                        password,
                        {
                            remember:
                                remember
                        }
                    );


                    showFormMessage(
                        message,
                        "Login successful. Welcome back!",
                        "success"
                    );


                    /*
                     * Never keep the password
                     * in memory longer than necessary.
                     */

                    if (passwordInput) {

                        passwordInput.value =
                            "";

                    }


                    setTimeout(
                        function () {

                            window.location.href =
                                HOME_PAGE;

                        },
                        500
                    );


                } catch (error) {

                    showFormMessage(
                        message,
                        error.message ||
                        "Unable to log in. Please try again.",
                        "error"
                    );


                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            originalButtonText;

                    }

                }

            }
        );

    }


    /* =========================================================
       SIGNUP FORM
    ========================================================= */

    function initSignupForm() {

        const form =
            document.getElementById(
                "signupForm"
            );


        if (!form) {
            return;
        }


        if (
            form.dataset.authInitialized ===
            "true"
        ) {

            return;

        }


        form.dataset.authInitialized =
            "true";


        const displayNameInput =
            document.getElementById(
                "displayName"
            );


        const usernameInput =
            document.getElementById(
                "username"
            );


        const passwordInput =
            document.getElementById(
                "password"
            );


        const confirmPasswordInput =
            document.getElementById(
                "confirmPassword"
            );


        const termsInput =
            document.getElementById(
                "terms"
            );


        const submitButton =
            document.getElementById(
                "signupButton"
            );


        const message =
            document.getElementById(
                "authMessage"
            );


        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                clearFormMessage(
                    message
                );


                const displayName =
                    displayNameInput
                        ? displayNameInput.value
                        : "";


                const username =
                    usernameInput
                        ? usernameInput.value
                        : "";


                const password =
                    passwordInput
                        ? passwordInput.value
                        : "";


                const confirmPassword =
                    confirmPasswordInput
                        ? confirmPasswordInput.value
                        : "";


                /*
                 * Terms must be accepted.
                 */

                if (
                    termsInput &&
                    !termsInput.checked
                ) {

                    showFormMessage(
                        message,
                        "Please agree to the Terms and Privacy Policy.",
                        "error"
                    );

                    termsInput.focus();

                    return;

                }


                const originalButtonText =
                    submitButton
                        ? submitButton.textContent
                        : "Create Account";


                if (submitButton) {

                    submitButton.disabled =
                        true;

                    submitButton.textContent =
                        "Creating account...";

                }


                try {

                    await handleSignup(
                        displayName,
                        username,
                        password,
                        confirmPassword
                    );


                    showFormMessage(
                        message,
                        "Account created successfully. Welcome to Brocode!",
                        "success"
                    );


                    /*
                     * Remove password values.
                     */

                    if (passwordInput) {
                        passwordInput.value = "";
                    }

                    if (confirmPasswordInput) {
                        confirmPasswordInput.value = "";
                    }


                    setTimeout(
                        function () {

                            window.location.href =
                                HOME_PAGE;

                        },
                        700
                    );


                } catch (error) {

                    showFormMessage(
                        message,
                        error.message ||
                        "Unable to create your account. Please try again.",
                        "error"
                    );


                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            originalButtonText;

                    }

                }

            }
        );

    }


    /* =========================================================
       PROTECTED PAGES
    ========================================================= */

    function requireAuth() {

        if (!isLoggedIn()) {

            /*
             * Save current page so we can eventually
             * return the user after login.
             */

            const currentPage =
                window.location.pathname
                    .split("/")
                    .pop();


            if (
                currentPage &&
                currentPage !== LOGIN_PAGE &&
                currentPage !== SIGNUP_PAGE
            ) {

                sessionStorage.setItem(
                    "brocode_redirect_after_login",
                    currentPage
                );

            }


            window.location.href =
                LOGIN_PAGE;

            return false;

        }


        return true;

    }


    /* =========================================================
       AUTH PAGE REDIRECT
       ---------------------------------------------------------
       If already logged in and user opens login/signup,
       send them to Home.
    ========================================================= */

    function redirectIfLoggedIn() {

        if (!isLoggedIn()) {
            return;
        }


        const currentPage =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();


        if (
            currentPage ===
            LOGIN_PAGE
        ) {

            window.location.href =
                HOME_PAGE;

            return;

        }


        if (
            currentPage ===
            SIGNUP_PAGE
        ) {

            window.location.href =
                HOME_PAGE;

        }

    }


    /* =========================================================
       POST LOGIN REDIRECT
    ========================================================= */

    function consumeLoginRedirect() {

        const redirect =
            sessionStorage.getItem(
                "brocode_redirect_after_login"
            );


        if (!redirect) {
            return null;
        }


        sessionStorage.removeItem(
            "brocode_redirect_after_login"
        );


        return redirect;

    }


    /* =========================================================
       LOGOUT BUTTONS
    ========================================================= */

    function initLogoutButtons() {

        const buttons =
            document.querySelectorAll(
                '[data-action="logout"]'
            );


        buttons.forEach(
            function (button) {

                if (
                    button.dataset.authLogoutInitialized ===
                    "true"
                ) {

                    return;

                }


                button.dataset.authLogoutInitialized =
                    "true";


                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        logout();

                    }
                );

            }
        );

    }


    /* =========================================================
       UPDATE USER UI
    ========================================================= */

    function updateAuthUI() {

        const user =
            getCurrentUser();


        /*
         * Display username wherever
         * data-user-name is present.
         */

        document
            .querySelectorAll(
                "[data-user-name]"
            )
            .forEach(
                function (element) {

                    element.textContent =
                        user?.displayName ||
                        user?.username ||
                        "Guest";

                }
            );


        /*
         * Display username specifically.
         */

        document
            .querySelectorAll(
                "[data-user-username]"
            )
            .forEach(
                function (element) {

                    element.textContent =
                        user?.username
                            ? "@" +
                              user.username
                            : "";

                }
            );


        /*
         * Logged-in / logged-out elements.
         */

        document
            .querySelectorAll(
                "[data-auth-only]"
            )
            .forEach(
                function (element) {

                    element.style.display =
                        user
                            ? ""
                            : "none";

                }
            );


        document
            .querySelectorAll(
                "[data-guest-only]"
            )
            .forEach(
                function (element) {

                    element.style.display =
                        user
                            ? "none"
                            : "";

                }
            );

    }


    /* =========================================================
       INITIALIZATION
    ========================================================= */

    function init() {

        /*
         * Login/signup forms are handled only
         * when they exist on the current page.
         */

        initLoginForm();

        initSignupForm();

        initLogoutButtons();

        updateAuthUI();


        /*
         * Do not automatically redirect here on every
         * page because normal app pages must remain usable.
         *
         * Login/signup pages can explicitly use:
         *
         * BrocodeAuth.redirectIfLoggedIn()
         */

    }


    /* =========================================================
       PUBLIC AUTH OBJECT
    ========================================================= */

    window.BrocodeAuth = {

        getCurrentUser,

        isLoggedIn,

        login:
            handleLogin,

        signup:
            handleSignup,

        logout,

        requireAuth,

        redirectIfLoggedIn,

        consumeLoginRedirect,

        updateAuthUI,

        init

    };


    /* =========================================================
       DOM READY
    ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();

    }


})();
