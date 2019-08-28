import { Box3 } from './../math/Box3';
import { Color } from './../math/Color';
import { LineSegments } from './../objects/LineSegments';

export class Box3Helper extends LineSegments {

	constructor( box: Box3, color?: Color );

	box: Box3;

}
