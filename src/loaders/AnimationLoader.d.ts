import { LoadingManager } from './LoadingManager';
import { Loader } from './Loader';
import { AnimationClip } from './../animation/AnimationClip';

export class AnimationLoader extends Loader {

	constructor( manager?: LoadingManager );

	load(
		url: string,
		onLoad?: ( response: string | ArrayBuffer ) => void,
		onProgress?: ( request: ProgressEvent ) => void,
		onError?: ( event: ErrorEvent ) => void
	): any;
	parse( json: any ): AnimationClip[];

}
