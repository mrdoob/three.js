/**
 * [https://standards.buildingsmart.org/IFC/RELEASE/IFC2x3/FINAL/HTML/ifcrepresentationresource/lexical/ifcGeometricrepresentationcontext.htm]
 */
import { IfcRepresentationContext } from "./IfcRepresentationContext.js";
import {
  baseConstructor,
  getItemByType,
  registerConstructorByType,
} from "../../ifc-utils/ifc-constructors.js";
import { ifcTypes as t } from "../../ifc-utils/ifc-types.js";

class IfcGeometricRepresentationContext extends IfcRepresentationContext {
  getIfcProperties() {
    super.getIfcProperties();
    this.coordinationSpaceDimension = this.extractNumber();
    this.precision = this.extractNumber();
    this.worldCoordinateSystem = getItemByType(this, this.extractId());
    this.trueNorth = getItemByType(this, this.extractId());
  }
}

function getIfcGeometricRepresentationContext(caller, ifcLine) {
  return baseConstructor(caller, IfcGeometricRepresentationContext, ifcLine);
}

registerConstructorByType(
  t.ifcGeometricRepresentationContext,
  getIfcGeometricRepresentationContext
);
