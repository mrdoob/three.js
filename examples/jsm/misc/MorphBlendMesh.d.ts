import {
	BufferGeometry,
	Geometry,
	Material,
	Mesh
} from '../../../src/Three';

export class MorphBlendMesh extends Mesh {

	constructor( geometry: BufferGeometry | Geometry, material: Material );
	animationsMap: object;
	animationsList: object[];

	createAnimation( name: string, start: number, end: number, fps: number ): void;
	autoCreateAnimations( fps: number ): void;
	setAnimationDirectionForward( name: string ): void;
	setAnimationDirectionBackward( name: string ): void;
	setAnimationFPS( name: string, fps: number ): void;
	setAnimationDuration( name: string, duration: number ): void;
	setAnimationWeight( name: string, weight: number ): void;
	setAnimationTime( name: string, time: number ): void;
	getAnimationTime( name: string ): number;
	getAnimationDuration( name: string ): number;
	playAnimation( name: string ): void;
	stopAnimation( name: string ): void;
	update( delta: number ): void;

}
