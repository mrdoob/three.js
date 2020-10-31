import { IfcPropertyExtractor } from "../ifc-utils/ifc-property-extractor.js";
import * as p from "../ifc-utils/ifc-property-readers.js";
import { formatDate, solveUnicode } from "../ifc-utils/ifc-format.js";

let privateProperties = new WeakMap();
class IfcBase {
  constructor(ifcItemsFinder, ifcLine) {
    this.getPrivateProperties(ifcItemsFinder, ifcLine);
    this.registerItem(ifcLine);
    this.getIfcProperties();
  }

  getPrivateProperties(ifcItemsFinder, ifcLine) {
    privateProperties.set(this, {
      reader: new IfcPropertyExtractor(ifcItemsFinder, ifcLine),
    });
  }

  getIfcProperties() {}

  isLoaded(item) {
    return this.getFinder().isLoaded(item.id);
  }

  getLoaded(item) {
    return this.getFinder().getLoaded(item.id);
  }

  registerItem(ifcLine) {
    this.expressId = ifcLine.id;
    this.getFinder().register(this.expressId, this);
  }

  extractId() {
    return this.getReader().useIdReader();
  }

  extractIdSet() {
    return this.getReader().useIdSetReader();
  }

  extractGuid() {
    return this.getReader().use(p.GuidReader);
  }

  extractText() {
    return solveUnicode(this.getReader().use(p.TextReader));
  }

  extractEnum() {
    return this.getReader().use(p.EnumReader);
  }

  extractNumber() {
    return this.getReader().use(p.NumberReader);
  }

  extractIfcValue() {
    return this.getReader().use(p.IfcValueReader);
  }

  extractNumberSet() {
    return this.getReader().use(p.numberSetReader);
  }

  extractDefaultValue() {
    return this.getReader().use(p.defaultValueReader);
  }

  extractDate() {
    return formatDate(this.getReader().use(p.NumberReader));
  }

  getFinder() {
    return this.getReader().getFinder();
  }

  getReader() {
    return privateProperties.get(this).reader;
  }

  isDefaultValue() {
    return this.getReader().isDefaultValue();
  }

  isEmptySet() {
    return this.getReader().isEmptySet();
  }
}

export { IfcBase };
