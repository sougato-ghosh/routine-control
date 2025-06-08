# Fixing 404 Errors for SPAs on Render (e.g., for /logout)

When deploying a Single Page Application (SPA) like a React, Vue, or Angular app to Render's static site hosting, you might encounter 404 errors when trying to directly access or refresh client-side routes (e.g., `/login`, `/dashboard`, `/logout`). This happens because Render, by default, tries to find a physical file matching that path (like `logout.html`), which doesn't exist for SPA routes.

To fix this, you need to configure a rewrite rule to direct all such requests to your main `index.html` file. Your client-side router (like React Router) will then handle the routing.

Here's how to set it up:

## 1. Navigate to Your Static Site Settings on Render

*   Log in to your Render Dashboard: [https://dashboard.render.com/](https://dashboard.render.com/)
*   From the list of your services, click on the name of your **Static Site** that you want to configure.
*   In the sidebar for your static site, navigate to the **Redirects/Rewrites** section. (The exact naming might be "Settings" and then "Redirects and Rewrites" or similar).

## 2. Add a Rewrite Rule for SPA Routing

You need to add a rule that tells Render to serve your `index.html` file for any path that doesn't match an existing static file. This allows your SPA's router to take over.

*   Click on the button to "Add Rule" or "New Rule".
*   Configure the rule as follows:
    *   **Action/Type:** `Rewrite`
    *   **Source Path:** `/*`
    *   **Destination Path:** `/index.html`

*   **Explanation of the rule:**
    *   `Rewrite`: This action changes the path internally to what the server serves, without changing the URL the user sees in their browser.
    *   `/*`: This is a wildcard that matches all incoming request paths.
    *   `/index.html`: This is the file that Render will serve for any path matched by the source. All your application code is typically bootstrapped from this file.

    This setup ensures that if a user navigates directly to `https://your-app.onrender.com/logout`, Render will serve `index.html`. Your React/Vue/Angular application will load, and its router will then look at the URL (`/logout`) and render the appropriate page or component. Requests for actual existing assets like `/main.css` or `/logo.png` will still be served correctly as they match a specific file before the rewrite rule for `/*` is processed (Render's routing logic is smart enough to prioritize existing files).

## 3. Consult Render's Official Documentation

For the most up-to-date and detailed information, always refer to Render's official documentation on redirects and rewrites:

*   **Render Docs - Redirects and Rewrites:** [https://render.com/docs/redirects-rewrites](https://render.com/docs/redirects-rewrites)

This page provides comprehensive details on how Render handles these rules and any other advanced configurations you might need.

## 4. Save and Redeploy (If Necessary)

*   After adding the rewrite rule, make sure to **save** the changes in the Render dashboard.
*   In most cases, changes to redirect/rewrite rules take effect very quickly, often without needing a manual redeploy. However, if you don't see the changes reflected immediately, or if Render prompts you to, you might need to trigger a new deploy for your static site.
    *   You can usually do this from your service's page by clicking a "Manual Deploy" button or by pushing a new commit to your linked Git repository.

By following these steps, you should resolve the 404 errors for your SPA's client-side routes on Render.
