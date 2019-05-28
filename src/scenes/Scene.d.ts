import { IFog } from './Fog';
import { Material } from './../materials/Material';
import { Object3D } from './../core/Object3D';
import { Color } from '../math/Color';
import { Texture } from '../textures/Texture';
// Scenes /////////////////////////////////////////////////////////////////////

/**
 * Scenes allow you to set up what and where is to be rendered by three.js. This is where you place objects, lights and cameras.
 */
export class Scene extends Object3D {

	constructor();

  type: 'Scene';

  /**
   * A fog instance defining the type of fog that affects everything rendered in the scene. Default is null.
   */
  fog: IFog | null;

  /**
   * If not null, it will force everything in the scene to be rendered with that material. Default is null.
   */
  overrideMaterial: Material | null;
  autoUpdate: boolean;
  background: null | Color | Texture;

  copy( source: this, recursive?: boolean ): this;
  toJSON( meta?: any ): any;
  dispose(): void;

}
