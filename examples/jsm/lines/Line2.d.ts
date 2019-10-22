import { LineGeometry } from './LineGeometry';
import { LineSegments2 } from './LineSegments2';
import { LineMaterial } from './LineMaterial';

export class Line2 extends LineSegments2 {

	constructor( geometry?: LineGeometry, material?: LineMaterial );
	isLine2: boolean;

}
