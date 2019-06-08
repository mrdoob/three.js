import { Object3D } from './../../core/Object3D';
import { Material } from './../../materials/Material';

// Extras / Objects /////////////////////////////////////////////////////////////////////

export class ImmediateRenderObject extends Object3D {

	constructor( material: Material );

	material: Material;
	render( renderCallback: Function ): void;

}
