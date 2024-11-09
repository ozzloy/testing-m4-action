export function generateUniqueUsername() {
  const letters = Array.from({ length: 6 }, () =>
    String.fromCharCode(Math.floor(Math.random() * 26) + 97),
  ).join("");
  const numbers = Math.floor(Math.random() * 9000) + 1000;
  const timestamp = Date.now();
  return `${letters}${numbers}${timestamp}`;
}

export function createUniqueUser() {
  return {
    firstName: "Fakey",
    lastName: "McFakeFake",
    email: `${generateUniqueUsername()}@example.com`,
    username: generateUniqueUsername(),
    password: "secret password",
  };
}

export function createUniqueSpot() {
  return {
    address: generateUniqueUsername(),
    city: "Test Valley",
    state: "CA",
    country: "USA",
    lat: 50,
    lng: 90,
    name: generateUniqueUsername(),
    description: "Great spot for testing!",
    price: 299,
  };
}

export function createUniqueImage() {
  return {
    url: `${generateUniqueUsername()}.png`,
    preview: true,
  };
}

export function createUniqueReview() {
  return {
    review: `${generateUniqueUsername()} Cool Spot; really awesome!!`,
    stars: 5,
  };
}

let startOffset = 1;
let now = Date.now();
const millisecondsPerDay = 1000 * 60 * 60 * 24;
export function createUniqueBooking() {
  const startDateObject = new Date(now + startOffset * millisecondsPerDay);
  const startDate = startDateObject.toISOString().split("T")[0];
  const endDateObject = new Date(now + (startOffset + 1) * millisecondsPerDay);
  const endDate = endDateObject.toISOString().split("T")[0];
  const booking = { startDate, endDate };
  startOffset += 2;
  return booking;
}
