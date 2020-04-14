import {
	AnimationClip,
	BufferAttribute,
	Loader,
	LoadingManager
} from '../../../src/Three';

export interface MDD {
	morphTargets: BufferAttribute[];
	clip: AnimationClip;
}

export class MDDLoader extends Loader {

	constructor( manager?: LoadingManager );

	load( url: string, onLoad: ( result: MDD ) => void, onProgress?: ( event: ProgressEvent ) => void, onError?: ( event: ErrorEvent ) => void ) : void;
	parse( data: ArrayBuffer ) : MDD;

}
