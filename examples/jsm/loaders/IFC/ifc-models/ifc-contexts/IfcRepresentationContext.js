/**
 * [https://standards.buildingsmart.org/IFC/RELEASE/IFC2x3/TC1/HTML/ifcrepresentationresource/lexical/ifcrepresentationcontext.htm]
 */

import { IfcBase } from "../IfcBase.js";

class IfcRepresentationContext extends IfcBase {
  getIfcProperties() {
    super.getIfcProperties();
    this.contextIdentifier = this.extractText();
    this.contextType = this.extractText();
  }
}

export { IfcRepresentationContext };
