# M4 Mocha Tests (Beta) 🚀

This repo contains a test suite for the M4 project. It is meant to
streamline assessing your project and act as an alternative to the
Comprehensive Test Collection in Postman.

## Quick Start

- Clone this repo and cd into this directory.
- Run: `npm install`.

- Update the base url in
  [`.env`](.env) ⭐

for example, it could look like this
```bash
API_URL="http://localhost:5001/api"
# API_URL="https://example-slug.onrender.com/api"
```

- run tests, stop at the first failing test
  - Run: `npm test`
  - or one of the following
    - `npm run test-auth`
    - `npm run test-spots`
    - `npm run test-reviews`
    - `npm run test-images`
    - `npm run test-bookings`
- to run all tests
  - run: `npm run test-all`

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
