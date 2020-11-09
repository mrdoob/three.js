import { Geometry } from '../core/Geometry.js';
import { TorusBufferGeometry } from './TorusBufferGeometry.js';

class TorusGeometry extends Geometry {

	constructor( radius, tube, radialSegments, tubularSegments, arc ) {

		super();
		this.type = 'TorusGeometry';

		this.parameters = {
			radius: radius,
			tube: tube,
			radialSegments: radialSegments,
			tubularSegments: tubularSegments,
			arc: arc
		};

		this.fromBufferGeometry( new TorusBufferGeometry( radius, tube, radialSegments, tubularSegments, arc ) );
		this.mergeVertices();

	}

}

export { TorusGeometry };
