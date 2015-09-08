/**
 * @author hughes
 */

module.exports = CircleGeometry;

var Face3 = require( "../../core/Face3" ),
	Geometry = require( "../../core/Geometry" ),
	Sphere = require( "../../math/Sphere" ),
	Vector2 = require( "../../math/Vector2" ),
	Vector3 = require( "../../math/Vector3" );

function CircleGeometry( radius, segments, thetaStart, thetaLength ) {

	Geometry.call( this );

	this.type = "CircleGeometry";

	this.parameters = {
		radius: radius,
		segments: segments,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

	radius = radius || 50;
	segments = segments !== undefined ? Math.max( 3, segments ) : 8;

	thetaStart = thetaStart !== undefined ? thetaStart : 0;
	thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2;

	var i, uvs = [],
		center = new Vector3(),
		centerUV = new Vector2( 0.5, 0.5 );

	this.vertices.push( center );
	uvs.push( centerUV );

	for ( i = 0; i <= segments; i ++ ) {

		var vertex = new Vector3();
		var segment = thetaStart + i / segments * thetaLength;

		vertex.x = radius * Math.cos( segment );
		vertex.y = radius * Math.sin( segment );

		this.vertices.push( vertex );
		uvs.push( new Vector2( ( vertex.x / radius + 1 ) / 2, ( vertex.y / radius + 1 ) / 2 ) );

	}

	var n = new Vector3( 0, 0, 1 );

	for ( i = 1; i <= segments; i ++ ) {

		this.faces.push( new Face3( i, i + 1, 0, [ n.clone(), n.clone(), n.clone() ] ) );
		this.faceVertexUvs[ 0 ].push( [ uvs[ i ].clone(), uvs[ i + 1 ].clone(), centerUV.clone() ] );

	}

	this.computeFaceNormals();

	this.boundingSphere = new Sphere( new Vector3(), radius );

}

CircleGeometry.prototype = Object.create( Geometry.prototype );
CircleGeometry.prototype.constructor = CircleGeometry;

CircleGeometry.prototype.clone = function () {

	var geometry = new CircleGeometry(
		this.parameters.radius,
		this.parameters.segments,
		this.parameters.thetaStart,
		this.parameters.thetaLength
	);

	return geometry;

};
