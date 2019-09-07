import { Loader } from './Loader';
import { LoadingManager } from './LoadingManager';
import { BufferGeometry } from './../core/BufferGeometry';

export class BufferGeometryLoader extends Loader {

	constructor( manager?: LoadingManager );

	load(
		url: string,
		onLoad: ( bufferGeometry: BufferGeometry ) => void,
		onProgress?: ( event: any ) => void,
		onError?: ( event: any ) => void
	): void;
	parse( json: any ): BufferGeometry;

}
