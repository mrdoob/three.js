/**
 * [https://standards.buildingsmart.org/IFC/RELEASE/IFC4_1/FINAL/HTML/schema/ifcgeometricconstraintresource/lexical/ifcgridplacement.htm]
 */

import {
  baseConstructor,
  registerConstructorByType,
} from "../../ifc-utils/ifc-constructors.js";
import { ifcTypes as t } from "../../ifc-utils/ifc-types.js";
import { IfcObjectPlacement } from "./IfcObjectPlacement.js";

class IfcGridPlacement extends IfcObjectPlacement {
  getIfcProperties() {
    super.getIfcProperties();
    this.placementLocation = this.extractId();
    this.placementRefDirection = this.extractId();
  }
}

function getIfcGridPlacement(caller, ifcLine) {
  return baseConstructor(caller, IfcGridPlacement, ifcLine);
}

registerConstructorByType(t.ifcGridPlacement, getIfcGridPlacement);
