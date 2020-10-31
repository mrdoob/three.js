/**
 * [https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2/HTML/schema/ifckernel/lexical/ifcreldecomposes.htm]
 */

import {
  baseConstructor,
  getItemByType,
  registerConstructorByType,
} from "../../ifc-utils/ifc-constructors.js";
import { ifcTypes as t } from "../../ifc-utils/ifc-types.js";
import { IfcRelDecomposes } from "./IfcRelDecomposes.js";

class IfcRelAggregates extends IfcRelDecomposes {
  getIfcProperties() {
    super.getIfcProperties();
    this.relatingObject = getItemByType(this, this.extractId());
    this.relatedObjects = this.extractIdSet().map((e) =>
      getItemByType(this, e)
    );
  }
}

function getIfcRelAggregates(caller, ifcLine) {
  return baseConstructor(caller, IfcRelAggregates, ifcLine);
}

registerConstructorByType(t.ifcRelAggregates, getIfcRelAggregates);
