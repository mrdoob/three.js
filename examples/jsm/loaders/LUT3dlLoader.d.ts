import {
	Loader,
	LoadingManager,
	DataTexture,
	DataTexture3D,
} from '../../../src/Three';

export interface LUT3dlResult {

	size: number;
	texture: DataTexture;
	texture3D: DataTexture3D;

}

export class LUT3dlLoader extends Loader {

	constructor( manager?: LoadingManager );

	load(
		url: string,
		onLoad: ( result: LUT3dlResult ) => void,
		onProgress?: ( event: ProgressEvent ) => void,
		onError?: ( event: Error ) => void
	);
	parse( data: string ): LUT3dlResult;

}
