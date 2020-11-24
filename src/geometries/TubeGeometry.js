import { Geometry } from '../core/Geometry.js';
import { TubeBufferGeometry } from './TubeBufferGeometry.js';

class TubeGeometry extends Geometry {

	constructor( path, tubularSegments, radius, radialSegments, closed, taper ) {

		super();
		this.type = 'TubeGeometry';

		this.parameters = {
			path: path,
			tubularSegments: tubularSegments,
			radius: radius,
			radialSegments: radialSegments,
			closed: closed
		};

		if ( taper !== undefined ) console.warn( 'THREE.TubeGeometry: taper has been removed.' );

		const bufferGeometry = new TubeBufferGeometry( path, tubularSegments, radius, radialSegments, closed );

		// expose internals

		this.tangents = bufferGeometry.tangents;
		this.normals = bufferGeometry.normals;
		this.binormals = bufferGeometry.binormals;

		// create geometry

		this.fromBufferGeometry( bufferGeometry );
		this.mergeVertices();

	}

}

export { TubeGeometry };
