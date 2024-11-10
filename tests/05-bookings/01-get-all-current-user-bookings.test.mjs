import { assert, expect } from "chai";

import { apiBaseUrl } from "../utils/constants.mjs";

import {
  agentSignUp,
  createManyAgents,
  fetchManyCsrfTokens,
} from "../utils/agent-factory.mjs";

/**
 * GET /bookings/current
 * response: 200
 *  ```json
 *   {
 *     "Bookings": [
 *       {
 *         "id": 1,
 *         "spotId": 1,
 *         "Spot": {
 *           "id": 1,
 *           "ownerId": 1,
 *           "address": "123 Disney Lane",
 *           "city": "San Francisco",
 *           "state": "California",
 *           "country": "United States of America",
 *           "lat": 37.7645358,
 *           "lng": -122.4730327,
 *           "name": "App Academy",
 *           "price": 123,
 *           "previewImage": "image url"
 *         },
 *         "userId": 2,
 *         "startDate": "2021-11-19",
 *         "endDate": "2021-11-20",
 *         "createdAt": "2021-11-19 20:39:36",
 *         "updatedAt": "2021-11-19 20:39:36"
 *       }
 *     ]
 *   }
 *   ```
 */
describe("get all current user bookings", function () {
  /**
     create an owner
   */
  let owner;
  let xsrfOwner;
  before(async function () {
    this.timeout(15000);
    [owner] = createManyAgents(apiBaseUrl, 1);
    [xsrfOwner] = await fetchManyCsrfTokens([owner]);
    agentSignUp(owner, xsrfOwner);
  });

  it("has correct endpoint", function (done) {
    owner.get("/bookings/current").end(function (err, res) {
      expect(err).to.not.exist;
      done();
    });
  });
});

import { fileURLToPath } from "url";
const getFileLine = () => {
  const err = new Error();
  const stack = err.stack.split("\n")[5];
  // at file:///.../tests/05-bookings/01-get-all-current-user-bookings.test.mjs:91:1
  const match = stack.match(
    /at\s+(?:\w+\s+)?\(?(?:.+(\/tests\/.*?)):(\d+):\d+\)?/,
  );

  const line = match ? parseInt(match[2]) : "unknown";
  const file =
    "." + match
      ? match[1].startsWith("file://")
        ? fileURLToPath(match[1])
        : match[1]
      : "unknown";
  return { file, line };
};
const printFileLine = () => {
  console.log("TODO:", getFileLine());
};

/**
 * get all bookings for spot which current user does not own
 *   request
 *     GET /spots/:spotId/bookings
 *   response
 *     status:
 *       200
 *     headers:
 *       Content-Type: application/json
 *     body:
 *       ```json
 *       {
 *         "Bookings": [
 *           {
 *             "spotId": 1,
 *             "startDate": "2021-11-19",
 *             "endDate": "2021-11-20"
 *           }
 *         ]
 *       }
 *       ```
 */
describe(
  "TODO: get all bookings for spot owned by current user",
  printFileLine,
);

/**
 * get all bookings for spot which current user owns
 *   request:
 *     GET /spots/:spotId/bookings
 *   response:
 *     status:
 *       200
 *     headers:
 *       Content-Type: application/json
 *     body:
 *       ```json
 *       {
 *         "Bookings": [
 *           {
 *             "User": {
 *               "id": 2,
 *               "firstName": "John",
 *               "lastName": "Smith"
 *             },
 *             "id": 1,
 *             "spotId": 1,
 *             "userId": 2,
 *             "startDate": "2021-11-19",
 *             "endDate": "2021-11-20",
 *             "createdAt": "2021-11-19 20:39:36",
 *             "updatedAt": "2021-11-19 20:39:36"
 *           }
 *         ]
 *       }
 *       ```
 */
describe(
  "TODO: get all bookings for spot owned by current user",
  printFileLine,
);

/**
 * get a spot that doesn't exist
 *   request:
 *     GET /spots/:spotId/bookings
 *   response:
 *     status:
 *       200
 *     headers:
 *       Content-Type: application/json
 *     body:
 *       ```json
 *       {
 *         "message": "Spot couldn't be found"
 *       }
 *       ```
 */
describe("TODO: spot could not be found", printFileLine);