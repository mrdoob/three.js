import {
	WireframeGeometry
} from '../../../build/three.module.js';
import { LineSegmentsGeometry } from '../lines/LineSegmentsGeometry.js';

class WireframeGeometry2 extends LineSegmentsGeometry {

	constructor( geometry ) {

		super();

		this.type = 'WireframeGeometry2';

		this.fromWireframeGeometry( new WireframeGeometry( geometry ) );

		// set colors, maybe

	}

}

WireframeGeometry2.prototype.isWireframeGeometry2 = true;

export { WireframeGeometry2 };
