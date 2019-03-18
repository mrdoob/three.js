import { MaterialParameters, Material } from './Material';

export interface MeshNormalMaterialParameters extends MaterialParameters {
  /** Render geometry as wireframe. Default is false (i.e. render as smooth shaded). */
  wireframe?: boolean;
  /** Controls wireframe thickness. Default is 1. */
  wireframeLinewidth?: number;
  morphTargets?: boolean;
}

export class MeshNormalMaterial extends Material {
  constructor(parameters?: MeshNormalMaterialParameters);

  wireframe: boolean;
  wireframeLinewidth: number;
  morphTargets: boolean;

  setValues(parameters: MeshNormalMaterialParameters): void;
}
