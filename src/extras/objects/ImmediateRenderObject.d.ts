import { Object3D } from './../../core/Object3D';
import { Material } from './../../materials/Material';

// Extras / Objects /////////////////////////////////////////////////////////////////////

export class ImmediateRenderObject extends Object3D {

	constructor( material: Material );

	readonly isImmediateRenderObject: true;

	material: Material;

	hasPositions: boolean;
	hasNormals: boolean;
	hasColors: boolean;
	hasUvs: boolean;

	positionArray: null | Float32Array;
	normalArray: null | Float32Array;
	colorArray: null | Float32Array;
	uvArray: null | Float32Array;

	count: number;

	render( renderCallback: Function ): void;

}
