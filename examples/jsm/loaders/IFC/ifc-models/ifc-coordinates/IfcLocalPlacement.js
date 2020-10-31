/**
 * [https://standards.buildingsmart.org/IFC/RELEASE/IFC4_1/FINAL/HTML/schema/ifcgeometricconstraintresource/lexical/ifclocalplacement.htm]
 */

import {
  baseConstructor,
  getItemByType,
  registerConstructorByType,
} from "../../ifc-utils/ifc-constructors.js";
import { ifcTypes as t } from "../../ifc-utils/ifc-types.js";
import { IfcObjectPlacement } from "./IfcObjectPlacement.js";

class IfcLocalPlacement extends IfcObjectPlacement {
  getIfcProperties() {
    super.getIfcProperties();
    this.placementRelTo = getItemByType(this, this.extractId());
    this.relativePlacement = getItemByType(this, this.extractId());
  }
}

function getIfcLocalPlacement(caller, ifcLine) {
  return baseConstructor(caller, IfcLocalPlacement, ifcLine);
}

registerConstructorByType(t.ifcLocalPlacement, getIfcLocalPlacement);
