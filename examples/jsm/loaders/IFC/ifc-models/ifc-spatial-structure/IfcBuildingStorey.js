/**
 * [https://standards.buildingsmart.org/IFC/RELEASE/IFC4_1/FINAL/HTML/schema/ifcproductextension/lexical/ifcbuilding.htm]
 */

import {
  baseConstructor,
  registerConstructorByType,
} from "../../ifc-utils/ifc-constructors.js";
import { ifcTypes as t } from "../../ifc-utils/ifc-types.js";
import { IfcSpatialStructureElement } from "../ifc-base-classes/IfcSpatialStructureElement.js";

class IfcBuildingStorey extends IfcSpatialStructureElement {
  getIfcProperties() {
    super.getIfcProperties();
    this.elevation = this.extractNumber();
  }
}

function getIfcBuildingStorey(caller, ifcLine) {
  return baseConstructor(caller, IfcBuildingStorey, ifcLine);
}

registerConstructorByType(t.ifcBuildingStorey, getIfcBuildingStorey);
