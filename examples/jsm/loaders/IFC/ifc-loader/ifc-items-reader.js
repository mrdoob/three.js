import { regexp } from "../ifc-utils/ifc-regexp.js";

class IfcItemsReader {
  constructor(ifcFile) {
    this.ifcFile = ifcFile;
  }

  readItems() {
    const { dataSection } = this.extractSections(this.ifcFile);
    return this.constructRawIfcItems(dataSection);
  }

  extractSections() {
    const ifcPlaneText = this.removeAllNewLines(this.ifcFile);
    return {
      headerSection: this.readHeaderSection(ifcPlaneText),
      dataSection: this.readDataSection(ifcPlaneText),
    };
  }

  constructRawIfcItems(dataSection) {
    const flatIfcItemList = this.separateIfcEntities(dataSection);
    return flatIfcItemList.map((e) => {
      return {
        id: this.getId(e),
        type: this.getIfcType(e),
        properties: this.getIfcRawProperties(e),
      };
    });
  }

  readHeaderSection(ifcLine) {
    return ifcLine.match(regexp.headerSection)[0];
  }

  readDataSection(ifcLine) {
    return ifcLine.match(regexp.dataSection)[0];
  }

  removeAllNewLines(ifcFile) {
    return ifcFile.replace(regexp.allNewLines, " ");
  }

  separateIfcEntities(dataSection) {
    return dataSection.match(regexp.singleIfcItems);
  }

  getId(rawIfcLine) {
    return parseInt(rawIfcLine.match(regexp.expressId).toString().slice(1));
  }

  getIfcType(rawIfcLine) {
    return rawIfcLine.match(regexp.rawIfcType).toString();
  }

  getIfcRawProperties(ifcLine) {
    return ifcLine.match(regexp.rawIfcProperties).toString().slice(1, -1);
  }
}

function readIfcItems(loadedIfc) {
  const ifcReader = new IfcItemsReader(loadedIfc);
  return ifcReader.readItems();
}

export { readIfcItems };
