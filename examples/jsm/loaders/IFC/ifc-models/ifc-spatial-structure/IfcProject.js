/**
 * [https://standards.buildingsmart.org/IFC/RELEASE/IFC2x3/FINAL/HTML/ifckernel/lexical/ifcproject.htm]
 */
import "../../ifc-utils/ifc-dependency-loader.js";
import { IfcObject } from "../ifc-base-classes/IfcObject.js";
import { ifcTypes as t } from "../../ifc-utils/ifc-types.js";
import { createIfcItemsFinder } from "../../ifc-utils/items-finder.js";
import {
  baseConstructor,
  getItemByType,
  registerConstructorByType,
} from "../../ifc-utils/ifc-constructors.js";

class IfcProject extends IfcObject {
  getIfcProperties() {
    super.getIfcProperties();
    this.longName = this.extractText();
    this.phase = this.extractText();
    this.representationContexts = this.extractIdSet().map((e) =>
      getItemByType(this, e)
    );
    this.unitsInContext = getItemByType(this, this.extractId());
    this.spatialStructure = this.getSpatialStructure();
  }

  getSpatialStructure() {
    return this.getFinder()
      .findIfcRelAggregates()
      .map((e) => getItemByType(this, e));
  }
}

function constructIfcProject(loadedIfc) {
  const finder = createIfcItemsFinder(loadedIfc);
  return new IfcProject(finder, finder.findFirstByType(t.ifcProject));
}

function getIfcProject(caller, ifcLine) {
  return baseConstructor(caller, IfcProject, ifcLine);
}

registerConstructorByType(t.ifcProject, getIfcProject);

export { constructIfcProject };
