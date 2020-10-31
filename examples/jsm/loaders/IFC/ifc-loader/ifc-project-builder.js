import { constructIfcProject } from "../ifc-models/ifc-spatial-structure/IfcProject.js";

function buildIfcProject(loadedIfc) {
  console.log(constructIfcProject(loadedIfc));
}

export { buildIfcProject };
