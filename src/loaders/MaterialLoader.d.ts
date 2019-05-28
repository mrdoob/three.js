import { LoadingManager } from './LoadingManager';
import { Texture } from './../textures/Texture';
import { Material } from './../materials/Material';

export class MaterialLoader {

	constructor( manager?: LoadingManager );

  manager: LoadingManager;
  textures: { [key: string]: Texture };

  load(
    url: string,
    onLoad: ( material: Material ) => void,
    onProgress?: ( event: ProgressEvent ) => void,
    onError?: ( event: Error | ErrorEvent ) => void
  ): void;
  setTextures( textures: { [key: string]: Texture } ): void;
  getTexture( name: string ): Texture;
  parse( json: any ): Material;

}
