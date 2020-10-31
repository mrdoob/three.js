import { getDefaultValue, isDefaultValue } from "./ifc-property-constants.js";

function baseConstructor(caller, classToConstruct, ifcLine) {
  if (isDefaultValue(ifcLine)) return getDefaultValue(ifcLine);
  if (caller.isLoaded(ifcLine)) return caller.getLoaded(ifcLine);
  return new classToConstruct(caller.getFinder(), ifcLine);
}

const constructorsByType = {};

function registerConstructorByType(type, constructor) {
  constructorsByType[type] = constructor;
}

function getItemByType(caller, ifcLine) {
  if (isDefaultValue(ifcLine)) return getDefaultValue(ifcLine);
  return constructorsByType[ifcLine.type](caller, ifcLine);
}

export { baseConstructor, registerConstructorByType, getItemByType };
