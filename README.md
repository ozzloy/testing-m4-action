# M4 Mocha Tests (Beta) 🚀

This repo contains a test suite for the M4 project. It is meant to
streamline assessing your project and act as an alternative to the
Comprehensive Test Collection in Postman.

## Quick Start

- Clone this repo and cd into this directory.
- Run: `npm install`.

- Update the base url in
  [`test/utils/constants`](./tests/utils/constants.mjs) ⭐

  for example, you could make the following change:
```diff
diff --git a/tests/utils/constants.mjs b/tests/utils/constants.mjs
index 3a82462..fab2142 100644
--- a/tests/utils/constants.mjs
+++ b/tests/utils/constants.mjs
@@ -9,16 +9,15 @@ If you're testing locally, ensure your server is running.
 */
 
 /* For Local Testing */
-// export const apiBaseUrl = 'http://localhost:8000/api';
+export const apiBaseUrl = "http://localhost:5001/api";
 
 /* For Testing Your Live Site Locally*/
 // export const apiBaseUrl = 'https://testing-action.onrender.com/api';
 
-
 // -----------------------------------------------------------------------------
 // GitHub Actions
 // -----------------------------------------------------------------------------
 
 /* For Using the GitHub Action to Test Your Live Site;
 Use this when your passing all tests and are ready to officially submit your project */
-export const apiBaseUrl = process.env.API_URL;
+// export const apiBaseUrl = process.env.API_URL;
```
if your server is up and running on port 5001.

- Run: `npm test`.
- or one of the following
  - `npm run test-auth`
  - `npm run test-spots`
  - `npm run test-reviews`
  - `npm run test-images`

## Running the Tests

To get the tests working, ensure you've configuired the following:

- Update the base url to point to your live site on Render or your local
  server.
- Ensure your server is running, or your live site is up and running.
- [`test/utils/constants`](./tests/utils/constants.mjs) is the only
  place you'll need to make a change.

Use `npm test` to run all of the tests. The test results will map
1-to-1 with your Scorecard.

## Bug Reporting

This test suite is an early release, so please report any bugs or
inconsitencies you find by throwing a comment in our `questions` channel
on Discord 🙏
