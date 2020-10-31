/**
 * [https://standards.buildingsmart.org/IFC/RELEASE/IFC4_1/FINAL/HTML/schema/ifcproductextension/lexical/ifcspatialelement.htm]
 */

import { IfcProduct } from "./IfcProduct.js";

class IfcSpatialElement extends IfcProduct {
  getIfcProperties() {
    super.getIfcProperties();
    this.longName = this.extractText();
  }
}

export { IfcSpatialElement };
