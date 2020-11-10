import {
	LoadingManager,
	CompressedTextureLoader,
	CompressedTexture,
	WebGLRenderer
} from '../../../src/Three';

export class KTX2Loader extends CompressedTextureLoader {

	constructor( manager?: LoadingManager );

	detectSupport( renderer: WebGLRenderer ): KTX2Loader;
	initModule(): void;

	parse(
		buffer: ArrayBuffer,
		onLoad: ( texture: CompressedTexture ) => void,
		onError?: ( event: ErrorEvent ) => void
	): KTX2Loader;

}
