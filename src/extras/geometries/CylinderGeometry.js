/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = CylinderGeometry;

var Face3 = require( "../../core/Face3" ),
	Geometry = require( "../../core/Geometry" ),
	Vector2 = require( "../../math/Vector2" ),
	Vector3 = require( "../../math/Vector3" );

function CylinderGeometry( radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength ) {

	Geometry.call( this );

	this.type = "CylinderGeometry";

	this.parameters = {
		radiusTop: radiusTop,
		radiusBottom: radiusBottom,
		height: height,
		radialSegments: radialSegments,
		heightSegments: heightSegments,
		openEnded: openEnded,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

	radiusTop = radiusTop !== undefined ? radiusTop : 20;
	radiusBottom = radiusBottom !== undefined ? radiusBottom : 20;
	height = height !== undefined ? height : 100;

	radialSegments = radialSegments || 8;
	heightSegments = heightSegments || 1;

	openEnded = openEnded !== undefined ? openEnded : false;
	thetaStart = thetaStart !== undefined ? thetaStart : 0;
	thetaLength = thetaLength !== undefined ? thetaLength : 2 * Math.PI;

	var heightHalf = height / 2;

	var x, y, vertices = [], uvs = [];

	for ( y = 0; y <= heightSegments; y ++ ) {

		var verticesRow = [];
		var uvsRow = [];

		var v = y / heightSegments;
		var radius = v * ( radiusBottom - radiusTop ) + radiusTop;

		for ( x = 0; x <= radialSegments; x ++ ) {

			var u = x / radialSegments;

			var vertex = new Vector3();
			vertex.x = radius * Math.sin( u * thetaLength + thetaStart );
			vertex.y = - v * height + heightHalf;
			vertex.z = radius * Math.cos( u * thetaLength + thetaStart );

			this.vertices.push( vertex );

			verticesRow.push( this.vertices.length - 1 );
			uvsRow.push( new Vector2( u, 1 - v ) );

		}

		vertices.push( verticesRow );
		uvs.push( uvsRow );

	}

	var tanTheta = ( radiusBottom - radiusTop ) / height,
		na, nb,
		v1, v2, v3, v4,
		n1, n2, n3, n4,
		uv1, uv2, uv3, uv4;

	for ( x = 0; x < radialSegments; x ++ ) {

		if ( radiusTop !== 0 ) {

			na = this.vertices[ vertices[ 0 ][ x ] ].clone();
			nb = this.vertices[ vertices[ 0 ][ x + 1 ] ].clone();

		} else {

			na = this.vertices[ vertices[ 1 ][ x ] ].clone();
			nb = this.vertices[ vertices[ 1 ][ x + 1 ] ].clone();

		}

		na.setY( Math.sqrt( na.x * na.x + na.z * na.z ) * tanTheta ).normalize();
		nb.setY( Math.sqrt( nb.x * nb.x + nb.z * nb.z ) * tanTheta ).normalize();

		for ( y = 0; y < heightSegments; y ++ ) {

			v1 = vertices[ y ][ x ];
			v2 = vertices[ y + 1 ][ x ];
			v3 = vertices[ y + 1 ][ x + 1 ];
			v4 = vertices[ y ][ x + 1 ];

			n1 = na.clone();
			n2 = na.clone();
			n3 = nb.clone();
			n4 = nb.clone();

			uv1 = uvs[ y ][ x ].clone();
			uv2 = uvs[ y + 1 ][ x ].clone();
			uv3 = uvs[ y + 1 ][ x + 1 ].clone();
			uv4 = uvs[ y ][ x + 1 ].clone();

			this.faces.push( new Face3( v1, v2, v4, [ n1, n2, n4 ] ) );
			this.faceVertexUvs[ 0 ].push( [ uv1, uv2, uv4 ] );

			this.faces.push( new Face3( v2, v3, v4, [ n2.clone(), n3, n4.clone() ] ) );
			this.faceVertexUvs[ 0 ].push( [ uv2.clone(), uv3, uv4.clone() ] );

		}

	}

	// top cap

	if ( openEnded === false && radiusTop > 0 ) {

		this.vertices.push( new Vector3( 0, heightHalf, 0 ) );

		for ( x = 0; x < radialSegments; x ++ ) {

			v1 = vertices[ 0 ][ x ];
			v2 = vertices[ 0 ][ x + 1 ];
			v3 = this.vertices.length - 1;

			n1 = new Vector3( 0, 1, 0 );
			n2 = new Vector3( 0, 1, 0 );
			n3 = new Vector3( 0, 1, 0 );

			uv1 = uvs[ 0 ][ x ].clone();
			uv2 = uvs[ 0 ][ x + 1 ].clone();
			uv3 = new Vector2( uv2.x, 0 );

			this.faces.push( new Face3( v1, v2, v3, [ n1, n2, n3 ], undefined, 1 ) );
			this.faceVertexUvs[ 0 ].push( [ uv1, uv2, uv3 ] );

		}

	}

	// bottom cap

	if ( openEnded === false && radiusBottom > 0 ) {

		this.vertices.push( new Vector3( 0, - heightHalf, 0 ) );

		for ( x = 0; x < radialSegments; x ++ ) {

			v1 = vertices[ heightSegments ][ x + 1 ];
			v2 = vertices[ heightSegments ][ x ];
			v3 = this.vertices.length - 1;

			n1 = new Vector3( 0, - 1, 0 );
			n2 = new Vector3( 0, - 1, 0 );
			n3 = new Vector3( 0, - 1, 0 );

			uv1 = uvs[ heightSegments ][ x + 1 ].clone();
			uv2 = uvs[ heightSegments ][ x ].clone();
			uv3 = new Vector2( uv2.x, 1 );

			this.faces.push( new Face3( v1, v2, v3, [ n1, n2, n3 ], undefined, 2 ) );
			this.faceVertexUvs[ 0 ].push( [ uv1, uv2, uv3 ] );

		}

	}

	this.computeFaceNormals();

}

CylinderGeometry.prototype = Object.create( Geometry.prototype );
CylinderGeometry.prototype.constructor = CylinderGeometry;

CylinderGeometry.prototype.clone = function () {

	var geometry = new CylinderGeometry(
		this.parameters.radiusTop,
		this.parameters.radiusBottom,
		this.parameters.height,
		this.parameters.radialSegments,
		this.parameters.heightSegments,
		this.parameters.openEnded,
		this.parameters.thetaStart,
		this.parameters.thetaLength
	);

	return geometry;

};
