/**
 * [https://standards.buildingsmart.org/IFC/RELEASE/IFC2x3/TC1/HTML/ifcmeasureresource/lexical/ifcderivedunitelement.htm]
 */

import { IfcBase } from "../IfcBase.js";
import {
  baseConstructor,
  getItemByType,
  registerConstructorByType,
} from "../../ifc-utils/ifc-constructors.js";
import { ifcTypes as t } from "../../ifc-utils/ifc-types.js";

class IfcDerivedUnitElement extends IfcBase {
  getIfcProperties() {
    super.getIfcProperties();
    this.unit = getItemByType(this, this.extractId());
    this.exponent = this.extractNumber();
  }
}

function getIfcDerivedUnitElement(caller, ifcLine) {
  return baseConstructor(caller, IfcDerivedUnitElement, ifcLine);
}

registerConstructorByType(t.ifcDerivedUnitElement, getIfcDerivedUnitElement);
