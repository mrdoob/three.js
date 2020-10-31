/**
 * [https://standards.buildingsmart.org/IFC/RELEASE/IFC2x3/TC1/HTML/ifcmeasureresource/lexical/ifcunitassignment.htm]
 */

import { IfcBase } from "../IfcBase.js";
import {
  baseConstructor,
  getItemByType,
  registerConstructorByType,
} from "../../ifc-utils/ifc-constructors.js";
import { ifcTypes as T } from "../../ifc-utils/ifc-types.js";

class IfcUnitAssignment extends IfcBase {
  getIfcProperties() {
    super.getIfcProperties();
    this.units = this.extractIdSet().map((e) => getItemByType(this, e));
  }
}

function getIfcUnitAssignment(caller, ifcLine) {
  return baseConstructor(caller, IfcUnitAssignment, ifcLine);
}

registerConstructorByType(T.ifcUnitAssignment, getIfcUnitAssignment);
