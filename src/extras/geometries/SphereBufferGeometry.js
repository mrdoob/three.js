import { BufferGeometry } from '../../core/BufferGeometry';
import { Vector3 } from '../../math/Vector3';
import { Sphere } from '../../math/Sphere';
import { Uint16Attribute, Uint32Attribute, BufferAttribute } from '../../core/BufferAttribute';

/**
 * @author benaadams / https://twitter.com/ben_a_adams
 * based on THREE.SphereGeometry
 */

function SphereBufferGeometry( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength ) {

	BufferGeometry.call( this );

	this.type = 'SphereBufferGeometry';

	this.parameters = {
		radius: radius,
		widthSegments: widthSegments,
		heightSegments: heightSegments,
		phiStart: phiStart,
		phiLength: phiLength,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

	radius = radius || 50;

	widthSegments = Math.max( 3, Math.floor( widthSegments ) || 8 );
	heightSegments = Math.max( 2, Math.floor( heightSegments ) || 6 );

	phiStart = phiStart !== undefined ? phiStart : 0;
	phiLength = phiLength !== undefined ? phiLength : Math.PI * 2;

	thetaStart = thetaStart !== undefined ? thetaStart : 0;
	thetaLength = thetaLength !== undefined ? thetaLength : Math.PI;

	var thetaEnd = thetaStart + thetaLength;

	var vertexCount = ( ( widthSegments + 1 ) * ( heightSegments + 1 ) );

	var positions = new BufferAttribute( new Float32Array( vertexCount * 3 ), 3 );
	var normals = new BufferAttribute( new Float32Array( vertexCount * 3 ), 3 );
	var uvs = new BufferAttribute( new Float32Array( vertexCount * 2 ), 2 );

	var index = 0, vertices = [], normal = new Vector3();

	for ( var y = 0; y <= heightSegments; y ++ ) {

		var verticesRow = [];

		var v = y / heightSegments;

		for ( var x = 0; x <= widthSegments; x ++ ) {

			var u = x / widthSegments;

			var px = - radius * Math.cos( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
			var py = radius * Math.cos( thetaStart + v * thetaLength );
			var pz = radius * Math.sin( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );

			normal.set( px, py, pz ).normalize();

			positions.setXYZ( index, px, py, pz );
			normals.setXYZ( index, normal.x, normal.y, normal.z );
			uvs.setXY( index, u, 1 - v );

			verticesRow.push( index );

			index ++;

		}

		vertices.push( verticesRow );

	}

	var indices = [];

	var northPoleVertex = vertices[ 0 ][ 0 ];
	var southPoleVertex = vertices[ heightSegments ][ 0 ];
	var closedSides = phiLength === 2 * Math.PI;
	var closedTop = thetaStart === 0;
	var closedBottom = thetaEnd === Math.PI;
	for ( var y = 0; y < heightSegments; y ++ ) {

		for ( var x = 0; x < widthSegments; x ++ ) {

			var nextX = closedSides ? ( x + 1 ) % widthSegments : x + 1;
			var v1 = vertices[ y ][ nextX ];
			var v2 = vertices[ y ][ x ];
			var v3 = vertices[ y + 1 ][ x ];
			var v4 = vertices[ y + 1 ][ nextX ];

			if ( ( y === 0 && closedTop )
				|| ( y === heightSegments - 1 && closedBottom ) ) {

				if ( y === 0 ) {

					indices.push( northPoleVertex, v3, v4 );

				} else {

					indices.push( v1, v2, southPoleVertex );

				}

			} else {

				if ( y !== 0 ) indices.push( v1, v2, v4 );
				if ( y !== heightSegments - 1 ) indices.push( v2, v3, v4 );

			}

		}

	}

	this.setIndex( new ( positions.count > 65535 ? Uint32Attribute : Uint16Attribute )( indices, 1 ) );
	this.addAttribute( 'position', positions );
	this.addAttribute( 'normal', normals );
	this.addAttribute( 'uv', uvs );

	this.boundingSphere = new Sphere( new Vector3(), radius );

}

SphereBufferGeometry.prototype = Object.create( BufferGeometry.prototype );
SphereBufferGeometry.prototype.constructor = SphereBufferGeometry;


export { SphereBufferGeometry };
