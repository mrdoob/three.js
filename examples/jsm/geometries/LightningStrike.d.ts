import {
	Vector3
} from '../../../src/Three';

export interface RandomGenerator {
	random(): number;
	getSeed(): number;
	setSeed( seed: number ): void;
}

export interface LightningSegment {
	iteration: number;
	pos0: Vector3;
	pos1: Vector3;
	linPos0: Vector3;
	linPos1: Vector3;
	up0: Vector3;
	up1: Vector3;
	radius0: number;
	radius1: number;
	fraction0: number;
	fraction1: number;
	positionVariationFactor: number;
}

export interface LightningSubray {
	seed: number;
	maxIterations: number;
	recursion: number;
	pos0: Vector3;
	pos1: Vector3;
	linPos0: Vector3;
	linPos1: Vector3;
	up0: Vector3;
	up1: Vector3;
	radius0: number;
	radius1: number;
	birthTime: number;
	deathTime: number;
	timeScale: number;
	roughness: number;
	straightness: number;
	propagationTimeFactor: number;
	vanishingTimeFactor: number;
	endPropagationTime: number;
	beginVanishingTime: number;
}

export interface RayParameters {
	sourceOffset?: Vector3;
	destOffset?: Vector3;

	timeScale?: number;
	roughness?: number;
	straightness?: number;

	up0?: Vector3;
	up1?: Vector3;
	radius0?: number;
	radius1?: number;
	radius0Factor? : number;
	radius1Factor? : number;
	minRadius? : number;

	isEternal?: boolean;
	birthTime?: number;
	deathTime?: number;
	propagationTimeFactor?: number;
	vanishingTimeFactor?: number;
	subrayPeriod?: number;
	subrayDutyCycle?: number;

	maxIterations?: number;
	isStatic?: boolean;
	ramification?: number;
	maxSubrayRecursion?: number;
	recursionProbability?: number;
	generateUVs?: boolean;

	randomGenerator?: RandomGenerator;
	noiseSeed?: number;

	onDecideSubrayCreation?: ( segment: LightningSegment, lightningStrike: LightningStrike ) => void;
	onSubrayCreation?: ( segment: LightningSegment, parentSubray: LightningSubray, childSubray: LightningSubray, lightningStrike: LightningStrike ) => void;
}

export class LightningStrike {

	constructor( rayParameters?: RayParameters );
	copyParameters( dest?: RayParameters, source?: RayParameters ): RayParameters;

	// Ray states
	static readonly RAY_INITIALIZED: number;
	static readonly RAY_UNBORN: number;
	static readonly RAY_PROPAGATING: number;
	static readonly RAY_STEADY: number;
	static readonly RAY_VANISHING: number;
	static readonly RAY_EXTINGUISHED: number;

	state: number;

	update( time: number ): void;

	copy( source: LightningStrike ): LightningStrike;
	clone(): LightningStrike;

}
