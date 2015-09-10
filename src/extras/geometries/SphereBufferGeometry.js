/**
 * @author benaadams / https://twitter.com/ben_a_adams
 * based on SphereGeometry
 */

module.exports = SphereBufferGeometry;

var BufferAttribute = require( "../../core/BufferAttribute" ),
	BufferGeometry = require( "../../core/BufferGeometry" ),
	Sphere = require( "../../math/Sphere" ),
	Vector3 = require( "../../math/Vector3" );

function SphereBufferGeometry( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength ) {

	BufferGeometry.call( this );

	this.type = "SphereBufferGeometry";

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

	var x, y, indices = [],
		v1, v2, v3, v4,
		v, verticesRow,
		u, px, py, pz;

	for ( y = 0; y <= heightSegments; y ++ ) {

		verticesRow = [];

		v = y / heightSegments;

		for ( x = 0; x <= widthSegments; x ++ ) {

			u = x / widthSegments;

			px = - radius * Math.cos( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
			py = radius * Math.cos( thetaStart + v * thetaLength );
			pz = radius * Math.sin( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );

			normal.set( px, py, pz ).normalize();

			positions.setXYZ( index, px, py, pz );
			normals.setXYZ( index, normal.x, normal.y, normal.z );
			uvs.setXY( index, u, 1 - v );

			verticesRow.push( index );

			index ++;

		}

		vertices.push( verticesRow );

	}

	for ( y = 0; y < heightSegments; y ++ ) {

		for ( x = 0; x < widthSegments; x ++ ) {

			v1 = vertices[ y ][ x + 1 ];
			v2 = vertices[ y ][ x ];
			v3 = vertices[ y + 1 ][ x ];
			v4 = vertices[ y + 1 ][ x + 1 ];

			if ( y !== 0 || thetaStart > 0 ) { indices.push( v1, v2, v4 ); }
			if ( y !== heightSegments - 1 || thetaEnd < Math.PI ) { indices.push( v2, v3, v4 ); }

		}

	}

	this.addIndex( new BufferAttribute( new Uint16Array( indices ), 1 ) );
	this.addAttribute( "position", positions );
	this.addAttribute( "normal", normals );
	this.addAttribute( "uv", uvs );

	this.boundingSphere = new Sphere( new Vector3(), radius );

}

SphereBufferGeometry.prototype = Object.create( BufferGeometry.prototype );
SphereBufferGeometry.prototype.constructor = SphereBufferGeometry;

SphereBufferGeometry.prototype.clone = function () {

	var geometry = new SphereBufferGeometry(
		this.parameters.radius,
		this.parameters.widthSegments,
		this.parameters.heightSegments,
		this.parameters.phiStart,
		this.parameters.phiLength,
		this.parameters.thetaStart,
		this.parameters.thetaLength
	);

	geometry.copy( this );

	return geometry;

};
