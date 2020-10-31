/**
 * [https://standards.buildingsmart.org/IFC/RELEASE/IFC2x3/FINAL/HTML/ifckernel/lexical/ifcobject.htm]
 */

import { IfcObjectDefinition } from "./IfcObjectDefinition.js";

class IfcObject extends IfcObjectDefinition {
  getIfcProperties() {
    super.getIfcProperties();
    this.objectType = this.extractText();
  }
}

export { IfcObject };
