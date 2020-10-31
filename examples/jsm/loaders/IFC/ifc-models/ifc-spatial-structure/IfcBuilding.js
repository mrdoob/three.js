/**
 * [https://standards.buildingsmart.org/IFC/RELEASE/IFC4_1/FINAL/HTML/schema/ifcproductextension/lexical/ifcbuilding.htm]
 */

import {
  baseConstructor,
  registerConstructorByType,
} from "../../ifc-utils/ifc-constructors.js";
import { ifcTypes as t } from "../../ifc-utils/ifc-types.js";
import { IfcSpatialStructureElement } from "../ifc-base-classes/IfcSpatialStructureElement.js";

class IfcBuilding extends IfcSpatialStructureElement {
  getIfcProperties() {
    super.getIfcProperties();
    this.elevationOfRefHeight = this.extractNumber();
    this.elevationOfTerrain = this.extractNumber();
    this.buildingAddress = this.extractId();
  }
}

function getIfcBuilding(caller, ifcLine) {
  return baseConstructor(caller, IfcBuilding, ifcLine);
}

registerConstructorByType(t.ifcBuilding, getIfcBuilding);
