import {
	BufferGeometry,
	Geometry
} from '../../../src/Three';

import { LineSegmentsGeometry } from './LineSegmentsGeometry';

export class WireframeGeometry2 extends LineSegmentsGeometry {

	constructor( geometry: Geometry | BufferGeometry );
	readonly sWireframeGeometry2: boolean;

}
