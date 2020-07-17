import { Object3D } from './../core/Object3D';
import { AudioContext } from './AudioContext';

export class AudioListener extends Object3D {

	constructor();

	type: 'AudioListener';
	context: AudioContext;
	gain: GainNode;
	filter: null | any;
	timeDelta: number;

	getInput(): GainNode;
	removeFilter(): this;
	setFilter( value: any ): this;
	getFilter(): any;
	setMasterVolume( value: number ): this;
	getMasterVolume(): number;
	updateMatrixWorld( force?: boolean ): void;

}
