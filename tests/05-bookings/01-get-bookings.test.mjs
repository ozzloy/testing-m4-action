import { assert, expect } from "chai";

import {
  agentCreateBooking,
  agentCreateSpot,
  agentSignUp,
  createAgent,
  createManyAgents,
  fetchCsrfToken,
  fetchManyCsrfTokens,
} from "../utils/agent-factory.mjs";
import { createUniqueBooking } from "../utils/agent-helpers.mjs";
import { apiBaseUrl } from "../utils/constants.mjs";
import {
  expectedBookingBySpotNonOwnerKeys,
  expectedBookingCurrentKeys,
  expectedBookingCurrentSpotKeys,
} from "../utils/err-helpers.mjs";

import {
  isDateString,
  isInteger,
  isNumber,
  isString,
  TODO,
} from "../utils/test-utils.mjs";

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
  let owner, renter, nonAuth;
  let xsrfOwner, xsrfRenter, xsrfNonAuth;
  let spot;
  before(async function () {
    this.timeout(15000);
    [owner, renter, nonAuth] = createManyAgents(apiBaseUrl, 3);
    [xsrfOwner, xsrfRenter, xsrfNonAuth] = await fetchManyCsrfTokens([
      owner,
      renter,
      nonAuth,
    ]);
    await agentSignUp(owner, xsrfOwner);
    await agentSignUp(renter, xsrfRenter);
    spot = (await agentCreateSpot(owner, xsrfOwner)).body;
  });

  it("has correct endpoint", function (done) {
    owner.get("/bookings/current").end(function (err, res) {
      expect(err).to.not.exist;
      done();
    });
  });

  it("rejects unauthenticated", function (done) {
    nonAuth
      .get("/bookings/current")
      .set("X-XSRF-TOKEN", xsrfNonAuth)
      .expect(401)
      .end(function (err, res) {
        if (err) return done(err);
        return done();
      });
  });

  it("returns a body with empty Bookings", async function () {
    const agent = createAgent(apiBaseUrl);
    const xsrf = await fetchCsrfToken(agent);
    await agentSignUp(agent, xsrf);
    const res = await agent
      .get("/bookings/current")
      .expect(200)
      .set("Accept", "application/json")
      .set("X-XSRF-TOKEN", xsrfOwner)
      .expect("Content-Type", /application\/json/);
    expect(res.body).to.be.an("object");
    const { body } = res;
    expect(body).to.have.property("Bookings").that.is.an("array");
    const { Bookings } = body;
    expect(Bookings).to.be.empty;
  });

  it("returns a body with a valid booking", async function () {
    const bookingDetails = createUniqueBooking();
    bookingDetails.spot = spot;
    const bookingResponse = await agentCreateBooking(
      renter,
      xsrfRenter,
      bookingDetails,
    );
    const res = await renter
      .get("/bookings/current")
      .expect(200)
      .set("Accept", "application/json")
      .set("X-XSRF-TOKEN", xsrfRenter)
      .expect("Content-Type", /application\/json/);
    const { body } = res;
    expect(body).to.have.property("Bookings").that.is.an("array");
    const { Bookings } = body;
    expect(Bookings).to.not.be.empty;
    const [booking] = Bookings;
    expect(booking).to.be.an("object");
    expect(booking).to.have.all.keys(expectedBookingCurrentKeys);
    {
      const { id, spotId, userId } = booking;
      expect(
        [id, spotId, userId].every(isInteger),
        "booking's id, spotId, and userId should be integers",
      ).to.be.true;
      const { startDate, endDate, createdAt, updatedAt } = booking;
      expect(
        [startDate, endDate, createdAt, updatedAt].every(isDateString),
        "booking's startDate, endDate, createdAt, and updatedAt should be dates",
      ).to.be.true;
    }

    const { Spot } = booking;
    expect(Spot).to.be.an("object");
    expect(Spot).to.have.all.keys(expectedBookingCurrentSpotKeys);

    {
      const { id, ownerId } = Spot;
      expect(
        [id, ownerId].every(isInteger),
        "Spot's id and ownerId should be integers",
      ).to.be.true;

      const { lat, lng, price } = Spot;
      expect(
        [lat, lng, price].every(isNumber),
        "Spot's lat, lng, and price should be numbers",
      ).to.be.true;

      const { address, city, state, country, name } = Spot;
      expect(
        [address, city, state, country].every(isString),
        "Spot's address, city, state, country, and name should be strings",
      ).to.be.true;

      const { previewImage } = Spot;
      expect(
        typeof previewImage === "string" || previewImage === null,
        "Spot's previewImage should be null or string",
      ).to.be.true;
    }
  });
});

describe("get all bookings by spot", function () {
  let owner, renter, nonAuth;
  let xsrfOwner, xsrfRenter, xsrfNonAuth;
  let spot;
  let path;
  before(async function () {
    this.timeout(15000);
    [owner, renter, nonAuth] = createManyAgents(apiBaseUrl, 3);
    [xsrfOwner, xsrfRenter, xsrfNonAuth] = await fetchManyCsrfTokens([
      owner,
      renter,
      nonAuth,
    ]);
    await agentSignUp(owner, xsrfOwner);
    await agentSignUp(renter, xsrfRenter);
    spot = (await agentCreateSpot(owner, xsrfOwner)).body;
    path = "/spots/" + spot.id + "/bookings";
  });

  it("has correct endpoint, and status 200", async function () {
    renter.get(path).expect(200);
  });

  it("rejects unauthentic posers", async function () {
    nonAuth.get(path).set("X-XSRF-TOKEN", xsrfNonAuth).expect(401);
  });

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
  describe("spot not owned by current user", function () {
    it("returns a body with valid booking", async function () {
      const bookingDetails = createUniqueBooking();
      bookingDetails.spot = spot;
      const bookingResponse = await agentCreateBooking(
        renter,
        xsrfRenter,
        bookingDetails,
      );
      const res = await renter
        .get(path)
        .expect(200)
        .set("Accept", "application/json")
        .set("X-XSRF-TOKEN", xsrfRenter)
        .expect("Content-Type", /application\/json/);
      const { body } = res;
      expect(body).to.have.property("Bookings").that.is.an("array");
      const { Bookings } = body;
      expect(Bookings).to.not.be.empty;
      const [booking] = Bookings;
      expect(booking).to.be.an("object");
      expect(booking).to.have.all.keys(expectedBookingBySpotNonOwnerKeys);
      const { spotId, startDate, endDate } = booking;
      expect(
        [startDate, endDate].every(isDateString),
        "booking's startDate and endDate should be dates",
      ).to.be.true;
      expect(isInteger(spotId), "booking's spotId should be an integer").to.be
        .true;
    });
  });

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
  describe("TODO: spot owned by current user", TODO);

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
  describe("TODO: spot could not be found", TODO);
});
