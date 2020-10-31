import { regexp } from "./ifc-regexp.js";
import * as p from "./ifc-property-readers.js";
import {
  isDefaultValue,
  isEmptySet,
  isAsterisk,
} from "../ifc-utils/ifc-property-constants.js";

class IfcPropertyExtractor {
  constructor(ifcEntityFinder, ifcLine) {
    this.buffer = ifcLine.properties;
    this.finder = ifcEntityFinder;
  }

  use(reader) {
    reader = this.validate(reader);
    const readedProperty = reader.read(this.buffer);
    this.updateBuffer(reader.filter);
    return readedProperty;
  }

  useIdReader() {
    return this.finder.findById(this.use(p.IdReader));
  }

  useIdSetReader() {
    if (this.isDefaultValue()) return this.use(p.defaultValueReader);
    if (this.isEmptySet()) return this.use(p.emptySetReader);
    return this.use(p.IdSetReader).map((e) => {
      return this.finder.findById(e);
    });
  }

  updateBuffer(filter) {
    this.buffer = this.buffer.replace(filter, "");
    this.buffer = this.buffer.replace(regexp.initialComma, "");
  }

  validate(propertyReader) {
    if (this.isDefaultValue()) return p.defaultValueReader;
    if (this.isAsterisk()) return p.asteriskReader;
    if (this.isEmptySet()) return p.emptySetReader;
    return propertyReader;
  }

  getBuffer() {
    return this.buffer;
  }

  isDefaultValue() {
    return isDefaultValue(this.buffer);
  }

  isEmptySet() {
    return isEmptySet(this.buffer);
  }

  isAsterisk() {
    return isAsterisk(this.buffer);
  }

  getFinder() {
    return this.finder;
  }
}

export { IfcPropertyExtractor };
