import { Line } from './Line.js';
import { Vector3 } from '../math/Vector3.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';

const _start = new Vector3();
const _end = new Vector3();

class LineSegments extends Line {

	constructor( geometry, material ) {

		super( geometry, material );
		Object.defineProperty( this, "isLineSegments", { value: true } );
		this.type = 'LineSegments';

	}

	computeLineDistances() {

		const geometry = this.geometry;

		if ( geometry.isBufferGeometry ) {

			// we assume non-indexed geometry

			if ( geometry.index === null ) {

				const positionAttribute = geometry.attributes.position;
				const lineDistances = [];

				for ( let i = 0, l = positionAttribute.count; i < l; i += 2 ) {

					_start.fromBufferAttribute( positionAttribute, i );
					_end.fromBufferAttribute( positionAttribute, i + 1 );

					lineDistances[ i ] = ( i === 0 ) ? 0 : lineDistances[ i - 1 ];
					lineDistances[ i + 1 ] = lineDistances[ i ] + _start.distanceTo( _end );

				}

				geometry.setAttribute( 'lineDistance', new Float32BufferAttribute( lineDistances, 1 ) );

			} else {

				console.warn( 'THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.' );

			}

		} else if ( geometry.isGeometry ) {

			const vertices = geometry.vertices;
			const lineDistances = geometry.lineDistances;

			for ( let i = 0, l = vertices.length; i < l; i += 2 ) {

				_start.copy( vertices[ i ] );
				_end.copy( vertices[ i + 1 ] );

				lineDistances[ i ] = ( i === 0 ) ? 0 : lineDistances[ i - 1 ];
				lineDistances[ i + 1 ] = lineDistances[ i ] + _start.distanceTo( _end );

			}

		}

		return this;

	}

}


export { LineSegments };
