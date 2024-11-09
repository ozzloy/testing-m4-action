import { assert, expect } from "chai";

import {
  agentCreateSpot,
  agentCreateBooking,
  agentSignUp,
  createManyAgents,
  fetchManyCsrfTokens,
} from "../utils/agent-factory.mjs";
import { createUniqueBooking } from "../utils/agent-helpers.mjs";
import { apiBaseUrl } from "../utils/constants.mjs";
import { expectedBookingKeys } from "../utils/err-helpers.mjs";

describe("get all bookings for the current user", function () {
  let owner, renter, agentNoAuth;
  let xsrfTokenOwner, xsrfTokenRenter, xsrfTokenNoAuth;
  let spot;

  before(async function () {
    this.timeout(15000);
    [owner, renter, agentNoAuth] = createManyAgents(apiBaseUrl, 3);
    // create a session
    [xsrfTokenOwner, xsrfTokenRenter, xsrfTokenNoAuth] =
      await fetchManyCsrfTokens([owner, renter, agentNoAuth], 3);
    await agentSignUp(owner, xsrfTokenOwner);
    await agentSignUp(renter, xsrfTokenRenter);
    const spotResult = await agentCreateSpot(owner, xsrfTokenOwner);
    spot = spotResult.body;
  });

  describe("POST /spots/:spotId/bookings creates booking", function () {
    it("correct endpoint", function (done) {
      try {
        const booking = createUniqueBooking();
        renter
          .post("/spots/" + spot.id + "/bookings")
          .send(booking)
          .set("X-XSRF-TOKEN", xsrfTokenRenter)
          .set("Accept", "application/json")
          .end(function (err, res) {
            expect(err).to.not.exist;
            done();
          });
      } catch (e) {
        console.log(e);
        assert(!e, "'create booking' route failed");
      }
    });

    it("requires authentication", function (done) {
      const booking = createUniqueBooking();
      agentNoAuth
        .post("/spots/" + spot.id + "/bookings")
        .send(booking)
        .set("X-XSRF-TOKEN", xsrfTokenNoAuth)
        .set("Accept", "application/json")
        .expect(401)
        .end(function (err, res) {
          if (err) return done(err);
          return done();
        });
    });
  });

  describe("response", function () {
    it("status code 201", function (done) {
      const booking = createUniqueBooking();
      renter
        .post("/spots/" + spot.id + "/bookings")
        .send(booking)
        .set("X-XSRF-TOKEN", xsrfTokenRenter)
        .set("Accept", "application/json")
        .expect(201)
        .end(function (err, res) {
          expect(err).to.not.exist;
          done();
        });
    });

    it("has a body that matches the api docs", function (done) {
      const booking = createUniqueBooking();
      renter
        .post("/spots/" + spot.id + "/bookings")
        .send(booking)
        .set("X-XSRF-TOKEN", xsrfTokenRenter)
        .set("Accept", "application/json")
        .expect(201)
        .end(function (err, res) {
          expect(err).to.not.exist;
          const { body } = res;
          expect(body).to.include.keys(expectedBookingKeys);
          let { startDate, endDate, spotId } = body;
          startDate = new Date(startDate).toISOString().split("T")[0];
          endDate = new Date(endDate).toISOString().split("T")[0];
          expect(spotId).to.equal(spot.id);
          expect(startDate).to.equal(booking.startDate);
          expect(endDate).to.equal(booking.endDate);
          done();
        });
    });
  });
});
