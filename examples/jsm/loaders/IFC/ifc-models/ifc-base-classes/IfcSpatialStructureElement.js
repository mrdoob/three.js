/**
 * [https://standards.buildingsmart.org/IFC/RELEASE/IFC4_1/FINAL/HTML/schema/ifcproductextension/lexical/ifcspatialstructureelement.htm]
 */

import { IfcSpatialElement } from "./IfcSpatialElement.js";

class IfcSpatialStructureElement extends IfcSpatialElement {
  getIfcProperties() {
    super.getIfcProperties();
    this.compositionType = this.extractEnum();
  }
}

export { IfcSpatialStructureElement };
