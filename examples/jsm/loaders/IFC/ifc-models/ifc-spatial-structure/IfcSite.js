/**
 * [https://standards.buildingsmart.org/IFC/RELEASE/IFC4_1/FINAL/HTML/schema/ifcproductextension/lexical/ifcsite.htm]
 */

import {
  baseConstructor,
  registerConstructorByType,
} from "../../ifc-utils/ifc-constructors.js";
import { ifcTypes as t } from "../../ifc-utils/ifc-types.js";
import { IfcSpatialStructureElement } from "../ifc-base-classes/IfcSpatialStructureElement.js";

class IfcSite extends IfcSpatialStructureElement {
  getIfcProperties() {
    super.getIfcProperties();
    this.refLatitude = this.extractNumberSet();
    this.refLongitude = this.extractNumberSet();
    this.refElevation = this.extractNumber();
    this.landTitleNumber = this.extractText();
    this.siteAddress = this.extractId();
  }
}

function getIfcSite(caller, ifcLine) {
  return baseConstructor(caller, IfcSite, ifcLine);
}

registerConstructorByType(t.ifcSite, getIfcSite);
