import { Object3D } from './../core/Object3D';
import { Color } from './../math/Color';
import { LineSegments } from './../objects/LineSegments';

/**
 * @deprecated Use {@link BoxHelper THREE.BoxHelper} instead.
 */
// export class BoundingBoxHelper extends Mesh {
//   constructor(object?: Object3D, hex?: number);

//   object: Object3D;
//   box: Box3;

//   update(): void;
// }

export class BoxHelper extends LineSegments {

	constructor( object?: Object3D, color?: Color );

	update( object?: Object3D ): void;

}
