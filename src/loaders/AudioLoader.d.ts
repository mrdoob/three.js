import { Loader } from './Loader';
import { LoadingManager } from './LoadingManager';

export class AudioLoader extends Loader {

	constructor( manager?: LoadingManager );

	load(
		url: string,
		onLoad: Function,
		onPrgress: Function,
		onError: Function
	): void;

}
