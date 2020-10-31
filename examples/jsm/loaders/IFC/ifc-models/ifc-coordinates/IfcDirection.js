/**
 * [https://standards.buildingsmart.org/IFC/RELEASE/IFC2x3/TC1/HTML/ifcgeometryresource/lexical/ifcdirection.htm]
 */

import { IfcBase } from "../IfcBase.js";
import {
  baseConstructor,
  registerConstructorByType,
} from "../../ifc-utils/ifc-constructors.js";
import { ifcTypes as t } from "../../ifc-utils/ifc-types.js";

class IfcDirection extends IfcBase {
  getIfcProperties() {
    super.getIfcProperties();
    this.directionRatios = this.extractNumberSet();
  }
}

function getIfcDirection(caller, ifcLine) {
  return baseConstructor(caller, IfcDirection, ifcLine);
}

registerConstructorByType(t.ifcDirection, getIfcDirection);
