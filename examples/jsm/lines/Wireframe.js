import {
	InstancedInterleavedBuffer,
	InterleavedBufferAttribute,
	Mesh,
	Vector3
} from 'three';
import { LineSegmentsGeometry } from '../lines/LineSegmentsGeometry.js';
import { LineMaterial } from '../lines/LineMaterial.js';

const _start = new Vector3();
const _end = new Vector3();

class Wireframe extends Mesh {

	constructor( geometry = new LineSegmentsGeometry(), material = new LineMaterial( { color: Math.random() * 0xffffff } ) ) {

		super( geometry, material );

		this.isWireframe = true;

		this.type = 'Wireframe';

	}

	// for backwards-compatibility, but could be a method of LineSegmentsGeometry...

	computeLineDistances() {

		const geometry = this.geometry;

		const instanceStart = geometry.attributes.instanceStart;
		const instanceEnd = geometry.attributes.instanceEnd;
		const lineDistances = new Float32Array( 2 * instanceStart.count );

		for ( let i = 0, j = 0, l = instanceStart.count; i < l; i ++, j += 2 ) {

			_start.fromBufferAttribute( instanceStart, i );
			_end.fromBufferAttribute( instanceEnd, i );

			lineDistances[ j ] = ( j === 0 ) ? 0 : lineDistances[ j - 1 ];
			lineDistances[ j + 1 ] = lineDistances[ j ] + _start.distanceTo( _end );

		}

		const instanceDistanceBuffer = new InstancedInterleavedBuffer( lineDistances, 2, 1 ); // d0, d1

		geometry.setAttribute( 'instanceDistanceStart', new InterleavedBufferAttribute( instanceDistanceBuffer, 1, 0 ) ); // d0
		geometry.setAttribute( 'instanceDistanceEnd', new InterleavedBufferAttribute( instanceDistanceBuffer, 1, 1 ) ); // d1

		return this;

	}

}

export { Wireframe };
