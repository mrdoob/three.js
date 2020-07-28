import { LineSegmentsGeometry } from './LineSegmentsGeometry';
import { LineSegments2 } from './LineSegments2';
import { LineMaterial } from './LineMaterial';

export class Line2 extends LineSegments2 {

	constructor( geometry?: LineSegmentsGeometry, material?: LineMaterial );
	readonly isLine2: true;

}
