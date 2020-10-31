import { regexp } from "./ifc-regexp.js";

function isDefaultValue(ifcLine) {
  return regexp.default.test(ifcLine);
}

function isAsterisk(ifcLine) {
  return regexp.asterisk.test(ifcLine);
}

function isEmptySet(ifcLine) {
  return regexp.emptySet.test(ifcLine);
}

function getDefaultValue(ifcLine) {
  return ifcLine.match(regexp.default).toString();
}

export { isDefaultValue, isAsterisk, isEmptySet, getDefaultValue };
