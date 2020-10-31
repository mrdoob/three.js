/**
 * [https://standards.buildingsmart.org/IFC/DEV/IFC4_2/FINAL/HTML/schema/ifcgeometryresource/lexical/ifcplacement.htm]
 */

import { getItemByType } from "../../ifc-utils/ifc-constructors.js";
import { IfcGeometricRepresentationItem } from "../ifc-contexts/IfcGeometricRepresentationItem.js";

class IfcPlacement extends IfcGeometricRepresentationItem {
  getIfcProperties() {
    super.getIfcProperties();
    this.location = getItemByType(this, this.extractId());
  }
}

export { IfcPlacement };
