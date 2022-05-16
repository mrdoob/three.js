import { Loader } from './Loader';
import { LoadingManager } from './LoadingManager';
import { Object3D } from './../core/Object3D';
import { Texture } from './../textures/Texture';
import { Material } from './../materials/Material';
import { AnimationClip } from './../animation/AnimationClip';
import { InstancedBufferGeometry } from '../core/InstancedBufferGeometry';
import { BufferGeometry } from '../core/BufferGeometry';

export class ObjectLoader extends Loader {
    constructor(manager?: LoadingManager);

    load(
        url: string,
        // tslint:disable-next-line:no-unnecessary-generics
        onLoad?: <ObjectType extends Object3D>(object: ObjectType) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: Error | ErrorEvent) => void,
    ): void;
    loadAsync<ObjectType extends Object3D>(
        url: string,
        onProgress?: (event: ProgressEvent) => void,
    ): // tslint:disable-next-line:no-unnecessary-generics
    Promise<ObjectType>;
    // tslint:disable-next-line:no-unnecessary-generics
    parse<T extends Object3D>(json: any, onLoad?: (object: Object3D) => void): T;
    // tslint:disable-next-line:no-unnecessary-generics
    parseAsync<T extends Object3D>(json: any): Promise<T>;
    parseGeometries(json: any): { [key: string]: InstancedBufferGeometry | BufferGeometry }; // Array of BufferGeometry or Geometry or Geometry2.
    parseMaterials(json: any, textures: Texture[]): Material[]; // Array of Classes that inherits from Matrial.
    parseAnimations(json: any): AnimationClip[];
    parseImages(json: any, onLoad: () => void): { [key: string]: HTMLImageElement };
    parseImagesAsync(json: any): Promise<{ [key: string]: HTMLImageElement }>;
    parseTextures(json: any, images: any): Texture[];
    parseObject<T extends Object3D>(
        data: any,
        geometries: any[],
        materials: Material[],
        animations: AnimationClip[],
    ): // tslint:disable-next-line:no-unnecessary-generics
    T;
}
