/**
 * @author oosmoxiecode
 * @author mrdoob / http://mrdoob.com/
 * based on http://code.google.com/p/away3d/source/browse/trunk/fp10/Away3DLite/src/away3dlite/primitives/Torus.as?r=2888
 */

module.exports = TorusGeometry;

var Face3 = require( "../../core/Face3" ),
	Geometry = require( "../../core/Geometry" ),
	Vector2 = require( "../../math/Vector2" ),
	Vector3 = require( "../../math/Vector3" );

function TorusGeometry( radius, tube, radialSegments, tubularSegments, arc ) {

	Geometry.call( this );

	this.type = "TorusGeometry";

	this.parameters = {
		radius: radius,
		tube: tube,
		radialSegments: radialSegments,
		tubularSegments: tubularSegments,
		arc: arc
	};

	radius = radius || 100;
	tube = tube || 40;
	radialSegments = radialSegments || 8;
	tubularSegments = tubularSegments || 6;
	arc = arc || Math.PI * 2;

	var i, j, u, v, vertex,
		center = new Vector3(), uvs = [], normals = [],
		a, b, c, d, face;

	for ( j = 0; j <= radialSegments; j ++ ) {

		for ( i = 0; i <= tubularSegments; i ++ ) {

			u = i / tubularSegments * arc;
			v = j / radialSegments * Math.PI * 2;

			center.x = radius * Math.cos( u );
			center.y = radius * Math.sin( u );

			vertex = new Vector3();
			vertex.x = ( radius + tube * Math.cos( v ) ) * Math.cos( u );
			vertex.y = ( radius + tube * Math.cos( v ) ) * Math.sin( u );
			vertex.z = tube * Math.sin( v );

			this.vertices.push( vertex );

			uvs.push( new Vector2( i / tubularSegments, j / radialSegments ) );
			normals.push( vertex.clone().sub( center ).normalize() );

		}

	}

	for ( j = 1; j <= radialSegments; j ++ ) {

		for ( i = 1; i <= tubularSegments; i ++ ) {

			a = ( tubularSegments + 1 ) * j + i - 1;
			b = ( tubularSegments + 1 ) * ( j - 1 ) + i - 1;
			c = ( tubularSegments + 1 ) * ( j - 1 ) + i;
			d = ( tubularSegments + 1 ) * j + i;

			face = new Face3( a, b, d, [ normals[ a ].clone(), normals[ b ].clone(), normals[ d ].clone() ] );
			this.faces.push( face );
			this.faceVertexUvs[ 0 ].push( [ uvs[ a ].clone(), uvs[ b ].clone(), uvs[ d ].clone() ] );

			face = new Face3( b, c, d, [ normals[ b ].clone(), normals[ c ].clone(), normals[ d ].clone() ] );
			this.faces.push( face );
			this.faceVertexUvs[ 0 ].push( [ uvs[ b ].clone(), uvs[ c ].clone(), uvs[ d ].clone() ] );

		}

	}

	this.computeFaceNormals();

}

TorusGeometry.prototype = Object.create( Geometry.prototype );
TorusGeometry.prototype.constructor = TorusGeometry;

TorusGeometry.prototype.clone = function () {

	var geometry = new TorusGeometry(
		this.parameters.radius,
		this.parameters.tube,
		this.parameters.radialSegments,
		this.parameters.tubularSegments,
		this.parameters.arc
	);

	return geometry;

};
