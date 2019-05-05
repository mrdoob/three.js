import { Color } from './../math/Color';
import { Texture } from './../textures/Texture';
import { Vector2 } from './../math/Vector2';
import { MaterialParameters, Material } from './Material';
import { Combine, NormalMapTypes } from '../constants';

export interface MeshPhongMaterialParameters extends MaterialParameters {
  /** geometry color in hexadecimal. Default is 0xffffff. */
  color?: Color | string | number;
  specular?: Color | string | number;
  shininess?: number;
  opacity?: number;
  map?: Texture;
  lightMap?: Texture;
  lightMapIntensity?: number;
  aoMap?: Texture;
  aoMapIntensity?: number;
  emissive?: Color | string | number;
  emissiveIntensity?: number;
  emissiveMap?: Texture;
  bumpMap?: Texture;
  bumpScale?: number;
  normalMap?: Texture;
  normalMapType?: NormalMapTypes;
  normalScale?: Vector2;
  displacementMap?: Texture;
  displacementScale?: number;
  displacementBias?: number;
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
  morphNormals?: boolean;
}

export class MeshPhongMaterial extends Material {
  constructor(parameters?: MeshPhongMaterialParameters);

  color: Color;
  specular: Color;
  shininess: number;
  map: Texture | null;
  lightMap: Texture | null;
  lightMapIntensity: number;
  aoMap: Texture | null;
  aoMapIntensity: number;
  emissive: Color;
  emissiveIntensity: number;
  emissiveMap: Texture | null;
  bumpMap: Texture | null;
  bumpScale: number;
  normalMap: Texture | null;
  normalMapType: NormalMapTypes;
  normalScale: Vector2;
  displacementMap: Texture | null;
  displacementScale: number;
  displacementBias: number;
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
  morphNormals: boolean;
  /**
   * @deprecated Use {@link MeshStandardMaterial THREE.MeshStandardMaterial} instead.
   */
  metal: boolean;

  setValues(parameters: MeshPhongMaterialParameters): void;
}
