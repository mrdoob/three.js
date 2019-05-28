import { LoadingManager } from './LoadingManager';

export class AudioLoader {

	constructor( manager?: LoadingManager );

	load(
    url: string,
    onLoad: Function,
    onPrgress: Function,
    onError: Function
  ): void;

}
