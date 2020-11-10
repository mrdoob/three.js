import { Geometry } from '../core/Geometry.js';
import { TorusKnotBufferGeometry } from './TorusKnotBufferGeometry.js';

class TorusKnotGeometry extends Geometry {

	constructor( radius, tube, tubularSegments, radialSegments, p, q, heightScale ) {

		super();
		this.type = 'TorusKnotGeometry';

		this.parameters = {
			radius: radius,
			tube: tube,
			tubularSegments: tubularSegments,
			radialSegments: radialSegments,
			p: p,
			q: q
		};

		if ( heightScale !== undefined ) console.warn( 'THREE.TorusKnotGeometry: heightScale has been deprecated. Use .scale( x, y, z ) instead.' );

		this.fromBufferGeometry( new TorusKnotBufferGeometry( radius, tube, tubularSegments, radialSegments, p, q ) );
		this.mergeVertices();

	}

}

export { TorusKnotGeometry };
