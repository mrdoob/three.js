import { Object3D } from './../core/Object3D';
import { Box3 } from './../math/Box3';
import { Color } from './../math/Color';
import { LineSegments } from './../objects/LineSegments';

export class Box3Helper extends LineSegments {

	constructor( object?: Object3D, color?: Color );

  box: Box3;

}
