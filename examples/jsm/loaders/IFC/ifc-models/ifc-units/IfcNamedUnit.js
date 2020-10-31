/**
 * [https://standards.buildingsmart.org/IFC/RELEASE/IFC2x3/TC1/HTML/ifcmeasureresource/lexical/ifcnamedunit.htm]
 */

import { IfcBase } from "../IfcBase.js";

class IfcNamedUnit extends IfcBase {
  getIfcProperties() {
    super.getIfcProperties();
    this.dimensions = this.extractId();
    this.unitType = this.extractEnum();
  }
}

export { IfcNamedUnit };
