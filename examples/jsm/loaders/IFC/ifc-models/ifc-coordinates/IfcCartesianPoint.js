/**
 * [https://standards.buildingsmart.org/IFC/RELEASE/IFC2x3/TC1/HTML/ifcgeometryresource/lexical/ifccartesianpoint.htm]
 */

import { IfcPoint } from "./IfcPoint.js";
import {
  baseConstructor,
  registerConstructorByType,
} from "../../ifc-utils/ifc-constructors.js";
import { ifcTypes as t } from "../../ifc-utils/ifc-types.js";

class IfcCartesianPoint extends IfcPoint {
  getIfcProperties() {
    super.getIfcProperties();
    this.coordinates = this.extractNumberSet();
  }
}

function getIfcCartesianPoint(caller, ifcLine) {
  return baseConstructor(caller, IfcCartesianPoint, ifcLine);
}

registerConstructorByType(t.ifcCartesianPoint, getIfcCartesianPoint);
