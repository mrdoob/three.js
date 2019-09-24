import { FileLoader } from "../loaders/FileLoader.js";

export function XHRLoader( manager ) {

	console.warn( 'THREE.XHRLoader has been renamed to THREE.FileLoader.' );
	return new FileLoader( manager );

}
