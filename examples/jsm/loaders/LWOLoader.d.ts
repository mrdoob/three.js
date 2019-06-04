import {
	LoadingManager,
	Material,
	Object3D
} from '../../../src/Three';

export interface LWO {
	materials: Material[];
	meshes: Object3D[];
}

export interface LWOLoaderParameters {

	/**
	* Base content delivery folder path, use when it differs from Lightwave default structure
	*/
	resourcePath?: string;

}

export class LWOLoader {
	constructor(manager?: LoadingManager, parameters?: LWOLoaderParameters);
	crossOrigin: string;
	path: string;
	resourcePath: string;

	load(url: string, onLoad: (lwo: LWO) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void) : void;
	setPath(path: string): this;
	setResourcePath(path: string): this;
	setCrossOrigin(value: string): this;
	parse(data: ArrayBuffer, path: string, modelName: string): LWO;
}
