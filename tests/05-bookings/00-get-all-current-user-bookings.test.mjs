import { assert, expect } from "chai";

import {
  agentCreateSpot,
  agentCreateBooking,
  agentSignUp,
  createManyAgents,
  fetchManyCsrfTokens,
} from "../utils/agent-factory.mjs";
import {
  createUniqueBooking,
  getBookingOffset,
  millisecondsPerDay,
} from "../utils/agent-helpers.mjs";
import { apiBaseUrl } from "../utils/constants.mjs";
import { expectedBookingKeys } from "../utils/err-helpers.mjs";

describe("get all bookings for the current user", function () {
  let owner, renter, agentNoAuth;
  let xsrfTokenOwner, xsrfTokenRenter, xsrfTokenNoAuth;
  let spot, path;

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
    path = "/spots/" + spot.id + "/bookings";
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

  describe("error responses", function () {
    xit("rejects booking with no end date", function (done) {
      const bookingSansEndDate = { startDate: Date.now() };
      renter
        .post("/spots/" + spot.id + "/bookings")
        .send(bookingSansEndDate)
        .set("X-XSRF-TOKEN", xsrfTokenRenter)
        .set("Accept", "application/json")
        .expect(400)
        .end(function (err, res) {
          expect(err).to.not.exist;
          return done();
        });
    });
    xit("rejects booking with no start date", function (done) {
      const bookingSansStartDate = { endDate: Date.now() };
      renter
        .post("/spots/" + spot.id + "/bookings")
        .send(bookingSansEndDate)
        .set("X-XSRF-TOKEN", xsrfTokenRenter)
        .set("Accept", "application/json")
        .expect(400)
        .end(function (err, res) {
          expect(err).to.not.exist;
          return done();
        });
    });
    it("rejects booking with startDate in the past", function (done) {
      /**
       * Status Code: 400
       * Headers:
       *  * Content-Type: application/json
       * Body:
       *  ```json
       *  {
       *    // (or "Validation error" if generated by Sequelize),
       *    "message": "Bad Request",
       *    "errors": {
       *      "startDate": "startDate cannot be in the past",
       *      "endDate": "endDate cannot be on or before startDate"
       *    }
       *  }
       *  ```
       */
      const bookingStartsInPast = {
        startDate: new Date(Date.now() - millisecondsPerDay)
          .toISOString()
          .split("T")[0],
        endDate: new Date(Date.now() + millisecondsPerDay)
          .toISOString()
          .split("T")[0],
      };
      renter
        .post(path)
        .send(bookingStartsInPast)
        .set("X-XSRF-TOKEN", xsrfTokenRenter)
        .set("Accept", "application/json")
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);
          const { body } = res;
          expect(body).to.have.all.keys("message", "errors");
          const { message, errors } = body;
          expect(message).to.be.oneOf(["Validation error", "Bad Request"]);
          expect(errors).to.be.an("object").that.has.property("startDate");
          const { startDate } = errors;
          expect(startDate).to.equal("startDate cannot be in the past");
          return done();
        });
    });
    it("rejects booking with endDate on or before startDate", function (done) {
      const booking = {
        startDate: new Date(
          Date.now() + getBookingOffset() * millisecondsPerDay,
        )
          .toISOString()
          .split("T")[0],
        endDate: new Date(Date.now() + getBookingOffset() * millisecondsPerDay)
          .toISOString()
          .split("T")[0],
      };
      renter
        .post(path)
        .send(booking)
        .set("X-XSRF-TOKEN", xsrfTokenRenter)
        .set("Accept", "application/json")
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);
          const { body } = res;
          expect(body).to.have.all.keys("message", "errors");
          const { message, errors } = body;
          expect(message).to.be.oneOf(["Validation error", "Bad Request"]);
          expect(errors).to.be.an("object").that.has.property("endDate");
          const { endDate } = errors;
          expect(endDate).to.equal("endDate cannot be on or before startDate");
          return done();
        });
    });
    it("rejects booking for spot it can't find", function (done) {
      /**
       * Status Code: 404
       * Headers:
       *  * Content-Type: application/json
       * Body:
       *  ```json
       *  {
       *    "message": "Spot couldn't be found"
       *  }
       *  ```
       */
      const booking = {
        startDate: new Date(
          Date.now() + getBookingOffset() * millisecondsPerDay,
        )
          .toISOString()
          .split("T")[0],
        endDate: new Date(
          Date.now() + (getBookingOffset() + 1) * millisecondsPerDay,
        )
          .toISOString()
          .split("T")[0],
      };
      renter
        .post("/spots/0/bookings")
        .send(booking)
        .set("X-XSRF-TOKEN", xsrfTokenRenter)
        .set("Accept", "application/json")
        .expect("Content-Type", /application\/json/)
        .expect(404)
        .end(function (err, res) {
          if (err) return done(err);
          const { body } = res;
          expect(body).to.have.all.keys(["message"]);
          const { message } = body;
          expect(message).to.equal("Spot couldn't be found");
          return done();
        });
    });
    /**
     * Error response: Booking conflict
     * Status Code: 403
     * Headers:
     *  * Content-Type: application/json
     * Body:
     * ```json
     * {
     *   "message": "Sorry, this spot is already booked for the specified dates",
     *   "errors": {
     *     "startDate": "Start date conflicts with an existing booking",
     *     "endDate": "End date conflicts with an existing booking"
     *   }
     * }
     * ```
     */
    it("rejects booking with start date conflict", function (done) {
      const extantBooking = createUniqueBooking();
      // make a booking
      renter
        .post(path)
        .send(extantBooking)
        .set("X-XSRF-TOKEN", xsrfTokenRenter)
        .set("Accept", "application/json")
        .end(function (err, res) {
          // attempt to make a new booking who's start date
          // is inside the extant booking
          let newEndDate = new Date(extantBooking.endDate);
          newEndDate.setDate(newEndDate.getDate() + 1);
          newEndDate = newEndDate.toISOString().split("T")[0];

          const conflictingBooking = {
            startDate: extantBooking.endDate,
            endDate: newEndDate,
          };

          renter
            .post(path)
            .send(conflictingBooking)
            .set("X-XSRF-TOKEN", xsrfTokenRenter)
            .set("Accept", "application/json")
            .expect("Content-Type", /application\/json/)
            .end(function (err, res) {
              if (err) return done(err);
              const { body } = res;
              expect(body).to.have.all.keys(["message", "errors"]);
              const { message, errors } = body;
              expect(message).to.equal(
                "Sorry, this spot is already booked for the specified dates",
              );
              expect(errors).to.have.all.keys(["startDate"]);
              const { startDate } = errors;
              expect(startDate).to.equal(
                "Start date conflicts with an existing booking",
              );
              return done();
            });
        });
    });
    it("rejects booking with end date conflict", function (done) {
      const conflictingBooking = createUniqueBooking();
      const extantBooking = createUniqueBooking();
      conflictingBooking.endDate = extantBooking.startDate;
      renter
        .post(path)
        .send(extantBooking)
        .set("X-XSRF-TOKEN", xsrfTokenRenter)
        .set("Accept", "application/json")
        .end(function (err, res) {
          if (err) return done(err);
          // attempt to make a new booking with an date
          // inside the extant booking
          return renter
            .post(path)
            .send(conflictingBooking)
            .set("X-XSRF-TOKEN", xsrfTokenRenter)
            .set("Accept", "application/json")
            .expect("Content-Type", /application\/json/)
            .end(function (err, res) {
              if (err) return done(err);
              const { body } = res;
              expect(body).to.have.all.keys(["message", "errors"]);
              const { message, errors } = body;
              expect(message).to.equal(
                "Sorry, this spot is already booked for the specified dates",
              );
              expect(errors).to.have.all.keys(["endDate"]);
              const { endDate } = errors;
              expect(endDate).to.equal(
                "End date conflicts with an existing booking",
              );
              return done();
            });
        });
    });
    it("rejects booking that surrounds extant booking", function (done) {
      /**
       * start with:
       * |  conflict start, conflict end, extant start, extant end
       * end with:
       * |  conflict start, extant start,   extant end, conflict end
       */
      const conflictingBooking = createUniqueBooking();
      const extantBooking = createUniqueBooking();

      const extantStart = conflictingBooking.endDate;
      const extantEnd = extantBooking.startDate;

      const conflictingEnd = extantBooking.endDate;

      extantBooking.startDate = extantStart;
      extantBooking.endDate = extantEnd;

      conflictingBooking.endDate = conflictingEnd;

      renter
        .post(path)
        .send(extantBooking)
        .set("X-XSRF-TOKEN", xsrfTokenRenter)
        .set("Accept", "application/json")
        .end(function (err, res) {
          if (err) return done(err);
          return renter
            .post(path)
            .send(conflictingBooking)
            .set("X-XSRF-TOKEN", xsrfTokenRenter)
            .set("Accept", "application/json")
            .expect("Content-Type", /application\/json/)
            .end(function (err, res) {
              if (err) return done(err);
              const { body } = res;
              expect(body).to.have.all.keys(["message", "errors"]);
              const { message, errors } = body;
              expect(message).to.equal(
                "Sorry, this spot is already booked for the specified dates",
              );
              expect(errors).to.have.all.keys(["startDate", "endDate"]);
              const { startDate, endDate } = errors;
              expect(startDate).to.equal(
                "Start date conflicts with an existing booking",
              );
              expect(endDate).to.equal(
                "End date conflicts with an existing booking",
              );
              return done();
            });
        });
    });
    it("rejects booking inside extant booking", function (done) {
      /**
       * start with:
       * |  extant start,     extant end, conflict start, conflict end
       * end with:
       * |  extant start, conflict start,   conflict end,   extant end
       */
      const extantBooking = createUniqueBooking();
      const conflictingBooking = createUniqueBooking();

      const extantEnd = conflictingBooking.endDate;

      const conflictingStart = extantBooking.endDate;
      const conflictingEnd = conflictingBooking.startDate;

      conflictingBooking.startDate = conflictingStart;
      conflictingBooking.endDate = conflictingEnd;

      extantBooking.endDate = extantEnd;

      renter
        .post(path)
        .send(extantBooking)
        .set("X-XSRF-TOKEN", xsrfTokenRenter)
        .set("Accept", "application/json")
        .end(function (err, res) {
          if (err) return done(err);
          return renter
            .post(path)
            .send(conflictingBooking)
            .set("X-XSRF-TOKEN", xsrfTokenRenter)
            .set("Accept", "application/json")
            .expect("Content-Type", /application\/json/)
            .end(function (err, res) {
              if (err) return done(err);
              const { body } = res;
              expect(body).to.have.all.keys(["message", "errors"]);
              const { message, errors } = body;
              expect(message).to.equal(
                "Sorry, this spot is already booked for the specified dates",
              );
              expect(errors).to.have.all.keys(["startDate", "endDate"]);
              const { startDate, endDate } = errors;
              expect(startDate).to.equal(
                "Start date conflicts with an existing booking",
              );
              expect(endDate).to.equal(
                "End date conflicts with an existing booking",
              );
              return done();
            });
        });
    });
    xit("owner can't book their own spot", function (done) {
      done();
    });
  });
});
