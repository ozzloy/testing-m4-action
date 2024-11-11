export function cleanStackTrace(error) {
  const stackLines = error.stack.split("\n");
  const filteredStack = stackLines.filter(
    (line) => !line.trim().startsWith("at "),
  );
  error.stack = filteredStack.join("\n");
  return error;
}

export const expectedSpotKeys = [
  "id",
  "ownerId",
  "address",
  "city",
  "state",
  "country",
  "lat",
  "lng",
  "name",
  "description",
  "price",
  "createdAt",
  "updatedAt",
  "avgRating",
  "previewImage",
];

export const expectedNeOrEditSpotKeys = [
  "id",
  "ownerId",
  "address",
  "city",
  "state",
  "country",
  "lat",
  "lng",
  "name",
  "description",
  "price",
  "createdAt",
  "updatedAt",
];

export const expectedSpotByIdKeys = [
  "id",
  "ownerId",
  "address",
  "city",
  "state",
  "country",
  "lat",
  "lng",
  "name",
  "description",
  "price",
  "createdAt",
  "updatedAt",
  "numReviews",
  "avgStarRating",
  "SpotImages",
  "Owner",
];

export const expectedBookingKeys = [
  "id",
  "spotId",
  "userId",
  "startDate",
  "endDate",
  "createdAt",
  "updatedAt",
];

export const expectedBookingCurrentKeys = [
  "id",
  "spotId",
  "Spot",
  "userId",
  "startDate",
  "endDate",
  "createdAt",
  "updatedAt",
];

export const expectedBookingCurrentSpotKeys = [
  "id",
  "ownerId",
  "address",
  "city",
  "state",
  "country",
  "lat",
  "lng",
  "name",
  "price",
  "previewImage",
];

export const expectedBookingBySpotNonOwnerKeys = [
  "spotId",
  "startDate",
  "endDate",
];

export const expectedBookingBySpotOwnerKeys = [
  "User",
  "id",
  "spotId",
  "userId",
  "startDate",
  "endDate",
  "createdAt",
  "updatedAt",
];

export const expectedSpotBookingUserKeys = ["id", "firstName", "lastName"];
