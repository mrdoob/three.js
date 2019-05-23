import { Color } from './../math/Color';
import { Texture } from './../textures/Texture';
import { MaterialParameters, Material } from './Material';
import { Combine } from '../constants';
/**
 * parameters is an object with one or more properties defining the material's appearance.
 */
export interface MeshBasicMaterialParameters extends MaterialParameters {
  color?: Color | string | number;
  opacity?: number;
  map?: Texture;
  aoMap?: Texture;
  aoMapIntensity?: number;
  specularMap?: Texture;
  alphaMap?: Texture;
  envMap?: Texture;
  combine?: Combine;
  reflectivity?: number;
  refractionRatio?: number;
  wireframe?: boolean;
  wireframeLinewidth?: number;
  wireframeLinecap?: string;
  wireframeLinejoin?: string;
  skinning?: boolean;
  morphTargets?: boolean;
}

export class MeshBasicMaterial extends Material {
  constructor(parameters?: MeshBasicMaterialParameters);

  color: Color;
  map: Texture | null;
  aoMap: Texture | null;
  aoMapIntensity: number;
  specularMap: Texture | null;
  alphaMap: Texture | null;
  envMap: Texture | null;
  combine: Combine;
  reflectivity: number;
  refractionRatio: number;
  wireframe: boolean;
  wireframeLinewidth: number;
  wireframeLinecap: string;
  wireframeLinejoin: string;
  skinning: boolean;
  morphTargets: boolean;

  setValues(parameters: MeshBasicMaterialParameters): void;
}
