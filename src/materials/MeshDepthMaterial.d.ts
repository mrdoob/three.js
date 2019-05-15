import { DepthPackingStrategies } from '../constants';
import { MaterialParameters, Material } from './Material';

export interface MeshDepthMaterialParameters extends MaterialParameters {
  wireframe?: boolean;
  wireframeLinewidth?: number;
}

export class MeshDepthMaterial extends Material {
  constructor(parameters?: MeshDepthMaterialParameters);

  wireframe: boolean;
  wireframeLinewidth: number;
  depthPacking: DepthPackingStrategies;

  setValues(parameters: MeshDepthMaterialParameters): void;
}
