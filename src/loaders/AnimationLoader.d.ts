import { LoadingManager } from './LoadingManager';
import { AnimationClip } from './../animation/AnimationClip';

export class AnimationLoader {

	constructor( manager?: LoadingManager );

	manager: LoadingManager;

	load(
		url: string,
		onLoad?: ( response: string | ArrayBuffer ) => void,
		onProgress?: ( request: ProgressEvent ) => void,
		onError?: ( event: ErrorEvent ) => void
	): any;
	parse( json: any ): AnimationClip[];
	setPath( path: string ): AnimationLoader;

}
