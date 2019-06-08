import { Object3D } from './../../core/Object3D';
import { Material } from './../../materials/Material';

/**
 * @deprecated Use {@link WireframeGeometry THREE.WireframeGeometry} instead.
 */
// export class WireframeHelper extends LineSegments {
//	 constructor(object: Object3D, hex?: number);
// }

// Extras / Objects /////////////////////////////////////////////////////////////////////

export class ImmediateRenderObject extends Object3D {

	constructor( material: Material );

	material: Material;
	render( renderCallback: Function ): void;

}
