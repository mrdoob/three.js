/**
 * [https://standards.buildingsmart.org/IFC/RELEASE/IFC2x3/TC1/HTML/ifcutilityresource/lexical/ifcapplication.htm]
 */

import { IfcBase } from "../IfcBase.js";
import {
  baseConstructor,
  getItemByType,
  registerConstructorByType,
} from "../../ifc-utils/ifc-constructors.js";
import { ifcTypes as t } from "../../ifc-utils/ifc-types.js";

class IfcApplication extends IfcBase {
  getIfcProperties() {
    super.getIfcProperties();
    this.applicationDeveloper = getItemByType(this, this.extractId());
    this.version = this.extractText();
    this.applicationFullName = this.extractText();
    this.applicationIdentifier = this.extractText();
  }
}

function getIfcApplication(caller, ifcLine) {
  return baseConstructor(caller, IfcApplication, ifcLine);
}

registerConstructorByType(t.ifcApplication, getIfcApplication);
