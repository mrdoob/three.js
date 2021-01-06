import {
	CompressedTexture,
	Loader,
	LoadingManager,
	WebGLRenderer
} from '../../../src/Three';

export class BasisTextureLoader extends Loader {

	constructor( manager?: LoadingManager );
	transcoderBinary: ArrayBuffer | null;
	transcoderPath: string;
	transcoderPending: Promise<void> | null;

	workerConfig: {
		format: number;
		astcSupported: boolean;
		etcSupported: boolean;
		dxtSupported: boolean;
		pvrtcSupported: boolean;
	}
	workerLimit: number;
	workerNextTaskID: number;
	workerPool: object[];
	workerSourceURL: string;

	detectSupport( renderer: WebGLRenderer ): this;
	load( url: string, onLoad: ( texture: CompressedTexture ) => void, onProgress?: ( event: ProgressEvent ) => void, onError?: ( event: ErrorEvent ) => void ): void;
	loadAsync( url: string, onProgress?: ( event: ProgressEvent ) => void ): Promise<CompressedTexture>;
	setTranscoderPath( path: string ): this;
	setWorkerLimit( workerLimit: number ): this;
	dispose(): void;

}
