/**
 * [https://standards.buildingsmart.org/IFC/RELEASE/IFC2x3/TC1/HTML/ifcmeasureresource/lexical/ifcderivedunit.htm]
 */

import {
  baseConstructor,
  getItemByType,
  registerConstructorByType,
} from "../../ifc-utils/ifc-constructors.js";
import { ifcTypes as t } from "../../ifc-utils/ifc-types.js";
import { IfcNamedUnit } from "./IfcNamedUnit.js";

class IfcConversionBasedUnit extends IfcNamedUnit {
  getIfcProperties() {
    super.getIfcProperties();
    this.name = this.extractText();
    this.conversionFactor = getItemByType(this, this.extractId());
  }
}

function getIfcConversionBasedUnit(caller, ifcLine) {
  return baseConstructor(caller, IfcConversionBasedUnit, ifcLine);
}

registerConstructorByType(t.ifcConversionBasedUnit, getIfcConversionBasedUnit);
