/**
 * [https://standards.buildingsmart.org/IFC/RELEASE/IFC2x3/FINAL/HTML/ifcproductextension/lexical/ifcspace.htm]
 */

import {
  baseConstructor,
  registerConstructorByType,
} from "../../ifc-utils/ifc-constructors.js";
import { ifcTypes as t } from "../../ifc-utils/ifc-types.js";
import { IfcSpatialStructureElement } from "../ifc-base-classes/IfcSpatialStructureElement.js";

class IfcSpace extends IfcSpatialStructureElement {
  getIfcProperties() {
    super.getIfcProperties();
    this.interiorOrExteriorSpace = this.extractEnum();
    this.elevationWithFlooring = this.extractNumber();
  }
}

function getIfcSpace(caller, ifcLine) {
  return baseConstructor(caller, IfcSpace, ifcLine);
}

registerConstructorByType(t.ifcSpace, getIfcSpace);
