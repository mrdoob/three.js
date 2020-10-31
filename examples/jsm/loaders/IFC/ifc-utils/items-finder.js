import { readIfcItems } from "../ifc-loader/ifc-items-reader.js";
import { ifcTypes } from "./ifc-types.js";

class IfcEntityFinder {
  constructor(ifcData) {
    this.ifcData = ifcData;
    this.loadedItems = {};
  }

  register(id, item) {
    this.loadedItems[id] = item;
  }

  isLoaded(id) {
    return this.loadedItems[id] ? true : false;
  }

  getLoaded(id) {
    return this.loadedItems[id];
  }

  findByType(typeToFind) {
    return this.ifcData.filter((e) => e.type === typeToFind);
  }

  findFirstByType(typeToFind) {
    return this.findByType(typeToFind)[0];
  }

  findById(idToFind) {
    const foundItem = this.ifcData.find((e) => e.id === idToFind);
    return foundItem ? foundItem : idToFind;
  }

  getSpatial() {
    return this.spatialFinder;
  }

  findIfcRelAggregates() {
    return this.findByType(ifcTypes.ifcRelAggregates);
  }
}

function createIfcItemsFinder(loadedIfc) {
  return new IfcEntityFinder(readIfcItems(loadedIfc));
}

export { IfcEntityFinder, createIfcItemsFinder };
