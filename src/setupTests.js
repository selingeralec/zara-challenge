// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
const originalWarn = console.warn.bind(console);
console.warn = (...args) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes("React Router Future Flag Warning")
  )
    return;
  originalWarn(...args);
};
