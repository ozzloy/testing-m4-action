import { fileURLToPath } from "url";
import { relative } from "path";

export const isNumber = (maybeNumber) =>
  !isNaN(maybeNumber) && typeof maybeNumber === "number";

export const isString = (maybeString) =>
  typeof maybeString === "string" || maybeString instanceof String;

export const isDateString = (maybeDateString) => {
  if (!isString(maybeDateString)) return false;
  const date = new Date(maybeDateString);
  return date instanceof Date && !isNaN(date);
};

const getFileLine = () => {
  const err = new Error();
  const stack = err.stack.split("\n")[5];
  const match = stack.match(/at\s+(?:\w+\s+)?\(?(.*):(\d+):\d+\)?/);

  const line = match ? parseInt(match[2]) : "unknown";
  const file = relative(
    process.cwd(),
    match
      ? match[1].startsWith("file://")
        ? fileURLToPath(match[1])
        : match[1]
      : "unknown",
  );
  return { file, line };
};

export const TODO = () => {
  console.log("TODO: finish test", JSON.stringify(getFileLine(), null, 2));
};
