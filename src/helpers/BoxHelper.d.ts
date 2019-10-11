import { Object3D } from './../core/Object3D';
import { Color } from './../math/Color';
import { LineSegments } from './../objects/LineSegments';

export class BoxHelper extends LineSegments {

	constructor( object: Object3D, color?: Color );

	update( object?: Object3D ): void;

	setFromObject( object: Object3D ): this;

}
