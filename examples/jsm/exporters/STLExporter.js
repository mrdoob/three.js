import {
	Vector3
} from 'three';

/**
 * Usage:
 *  const exporter = new STLExporter();
 *
 *  // second argument is a list of options
 *  const data = exporter.parse( mesh, { binary: true } );
 *
 */

class STLExporter {

	parse( scene, options = {} ) {

		const binary = options.binary !== undefined ? options.binary : false;

		//

		const objects = [];
		let triangles = 0;

		scene.traverse( function ( object ) {

			if ( object.isMesh ) {

				const geometry = object.geometry;

				if ( geometry.isBufferGeometry !== true ) {

					throw new Error( 'THREE.STLExporter: Geometry is not of type THREE.BufferGeometry.' );

				}

				const index = geometry.index;
				const positionAttribute = geometry.getAttribute( 'position' );

				triangles += ( index !== null ) ? ( index.count / 3 ) : ( positionAttribute.count / 3 );

				objects.push( {
					object3d: object,
					geometry: geometry
				} );

			}

		} );

		let output;
		let offset = 80; // skip header

		if ( binary === true ) {

			const bufferLength = triangles * 2 + triangles * 3 * 4 * 4 + 80 + 4;
			const arrayBuffer = new ArrayBuffer( bufferLength );
			output = new DataView( arrayBuffer );
			output.setUint32( offset, triangles, true ); offset += 4;

		} else {

			output = '';
			output += 'solid exported\n';

		}

		const vA = new Vector3();
		const vB = new Vector3();
		const vC = new Vector3();
		const cb = new Vector3();
		const ab = new Vector3();
		const normal = new Vector3();

		for ( let i = 0, il = objects.length; i < il; i ++ ) {

			const object = objects[ i ].object3d;
			const geometry = objects[ i ].geometry;

			const index = geometry.index;
			const positionAttribute = geometry.getAttribute( 'position' );

			if ( index !== null ) {

				// indexed geometry

				for ( let j = 0; j < index.count; j += 3 ) {

					const a = index.getX( j + 0 );
					const b = index.getX( j + 1 );
					const c = index.getX( j + 2 );

					writeFace( a, b, c, positionAttribute, object );

				}

			} else {

				// non-indexed geometry

				for ( let j = 0; j < positionAttribute.count; j += 3 ) {

					const a = j + 0;
					const b = j + 1;
					const c = j + 2;

					writeFace( a, b, c, positionAttribute, object );

				}

			}

		}

		if ( binary === false ) {

			output += 'endsolid exported\n';

		}

		return output;

		function writeFace( a, b, c, positionAttribute, object ) {

			vA.fromBufferAttribute( positionAttribute, a );
			vB.fromBufferAttribute( positionAttribute, b );
			vC.fromBufferAttribute( positionAttribute, c );

			if ( object.isSkinnedMesh === true ) {

				object.boneTransform( a, vA );
				object.boneTransform( b, vB );
				object.boneTransform( c, vC );

			}

			vA.applyMatrix4( object.matrixWorld );
			vB.applyMatrix4( object.matrixWorld );
			vC.applyMatrix4( object.matrixWorld );

			writeNormal( vA, vB, vC );

			writeVertex( vA );
			writeVertex( vB );
			writeVertex( vC );

			if ( binary === true ) {

				output.setUint16( offset, 0, true ); offset += 2;

			} else {

				output += '\t\tendloop\n';
				output += '\tendfacet\n';

			}

		}

		function writeNormal( vA, vB, vC ) {

			cb.subVectors( vC, vB );
			ab.subVectors( vA, vB );
			cb.cross( ab ).normalize();

			normal.copy( cb ).normalize();

			if ( binary === true ) {

				output.setFloat32( offset, normal.x, true ); offset += 4;
				output.setFloat32( offset, normal.y, true ); offset += 4;
				output.setFloat32( offset, normal.z, true ); offset += 4;

			} else {

				output += '\tfacet normal ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';
				output += '\t\touter loop\n';

			}

		}

		function writeVertex( vertex ) {

			if ( binary === true ) {

				output.setFloat32( offset, vertex.x, true ); offset += 4;
				output.setFloat32( offset, vertex.y, true ); offset += 4;
				output.setFloat32( offset, vertex.z, true ); offset += 4;

			} else {

				output += '\t\t\tvertex ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';

			}

		}

	}

}

export { STLExporter };
