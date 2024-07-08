import { LineSegments2 } from './LineSegments2.js';
import { LineGeometry } from '../LineGeometry.js';

import { Line2NodeMaterial } from 'three';

class Line2 extends LineSegments2 {

	constructor( geometry = new LineGeometry(), material = new Line2NodeMaterial( { color: Math.random() * 0xffffff } ) ) {

		super( geometry, material );

		this.isLine2 = true;

		this.type = 'Line2';

	}

}

export { Line2 };
