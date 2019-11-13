import {
	PerspectiveCamera,
	ShaderMaterial,
	Scene,
	WebGLRenderer
} from '../../../src/Three';

export class CinematicCamera extends PerspectiveCamera {

	constructor( fov: number, aspect: number, near: number, far: number );

	postprocessing: {
		enabled: boolean;
	};
	shaderSettings: {
		rings: number;
		samples: number;
	};
	materialDepth: ShaderMaterial;
	coc: number;
	aperture: number;
	fNumber: number;
	hyperFocal: number;
	filmGauge: number;

	linearize( depth: number ): number;
	smoothstep( near: number, far: number, depth: number ): number;
	saturate( x: number ): number;
	focusAt( focusDistance: number ): void;
	initPostProcessing(): void;
	renderCinematic( scene: Scene, renderer: WebGLRenderer ): void;

}
