import { AudioListener } from './AudioListener';
import { Audio } from './Audio';

export class AudioWeaken extends Audio {

	getOutput(): any;

}

export class PositionalAudio extends AudioWeaken {

	constructor( listener: AudioListener );

	panner: PannerNode;

	getOutput(): PannerNode;
	setRefDistance( value: number ): this;
	getRefDistance(): number;
	setRolloffFactor( value: number ): this;
	getRolloffFactor(): number;
	setDistanceModel( value: DistanceModelType ): this;
	getDistanceModel(): DistanceModelType;
	setMaxDistance( value: number ): this;
	getMaxDistance(): number;
	setDirectionalCone(
		coneInnerAngle: number,
		coneOuterAngle: number,
		coneOuterGain: number
	): this;
	updateMatrixWorld( force?: boolean ): void;

}
