import {
	Geometry,
	Loader,
	LoadingManager,
	Material
} from '../../../../src/Three';

export interface LegacyJSONLoaderResult {
	geometry: Geometry;
	materials: Material[];
}

export class LegacyJSONLoader extends Loader {

	constructor( manager?: LoadingManager );
	withCredentials: boolean;

	load( url: string, onLoad: ( geometry: Geometry, materials: Material[] ) => void, onProgress?: ( event: ProgressEvent ) => void, onError?: ( event: ErrorEvent ) => void ): void;
	parse( json: object, path: string ): LegacyJSONLoaderResult;

}
