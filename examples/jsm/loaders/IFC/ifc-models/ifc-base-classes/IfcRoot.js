/**
 * [https://standards.buildingsmart.org/IFC/RELEASE/IFC2x3/FINAL/HTML/ifckernel/lexical/ifcroot.htm]
 */

import { IfcBase } from "../IfcBase.js";
import { getItemByType } from "../../ifc-utils/ifc-constructors.js";

class IfcRoot extends IfcBase {
  getIfcProperties() {
    super.getIfcProperties();
    this.globalId = this.extractGuid();
    this.ownerHistory = getItemByType(this, this.extractId());
    this.name = this.extractText();
    this.description = this.extractText();
  }
}

export { IfcRoot };
