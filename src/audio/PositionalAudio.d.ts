import { AudioListener } from './AudioListener';
import { AudioWeaken } from './Audio';

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
