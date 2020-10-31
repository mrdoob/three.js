/**
 * [https://standards.buildingsmart.org/IFC/RELEASE/IFC2x3/TC1/HTML/ifcgeometryresource/lexical/ifcaxis2placement3d.htm]
 */
import {
  baseConstructor,
  getItemByType,
  registerConstructorByType,
} from "../../ifc-utils/ifc-constructors.js";
import { IfcPlacement } from "./IfcPlacement.js";
import { ifcTypes as t } from "../../ifc-utils/ifc-types.js";

class IfcAxis2Placement3D extends IfcPlacement {
  getIfcProperties() {
    super.getIfcProperties();
    this.axis = getItemByType(this, this.extractId());
    this.refDirection = getItemByType(this, this.extractId());
  }
}

function getIfcAxis2Placement3D(caller, ifcLine) {
  return baseConstructor(caller, IfcAxis2Placement3D, ifcLine);
}

registerConstructorByType(t.ifcAxis2Placement3D, getIfcAxis2Placement3D);
