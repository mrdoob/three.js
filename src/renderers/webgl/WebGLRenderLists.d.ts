import { Object3D } from './../../core/Object3D';
import { Material } from './../../materials/Material';
import { WebGLProgram } from './WebGLProgram';
import { Group } from './../../objects/Group';
import { Scene } from './../../scenes/Scene';
import { Camera } from './../../cameras/Camera';
import { BufferGeometry } from '../../core/BufferGeometry';

export interface RenderTarget {} // not defined in the code, used in LightShadow and WebGRenderer classes

export interface RenderItem {
  id: number;
  object: Object3D;
  geometry: BufferGeometry;
  material: Material;
  program: WebGLProgram;
  groupOrder: number;
  renderOrder: number;
  z: number;
  group: Group;
}

export class WebGLRenderList {
  opaque: Array<RenderItem>;
  transparent: Array<RenderItem>;
  init(): void;
  push(
    object: Object3D,
    geometry: BufferGeometry,
    material: Material,
    groupOrder: number,
    z: number,
    group: Group
  ): void;
  unshift(
    object: Object3D,
    geometry: BufferGeometry,
    material: Material,
    groupOrder: number,
    z: number,
    group: Group
  ): void;
  sort(): void;
}

export class WebGLRenderLists {
  dispose(): void;
  /**
   *
   * returns {<String> : <WebGLRenderList>}
   */
  get(scene: Scene, camera: Camera): WebGLRenderList;
}
