/**
 * @author Kaleb Murphy
 */

module.exports = RingGeometry;

var Face3 = require( "../../core/Face3" ),
	Geometry = require( "../../core/Geometry" ),
	Sphere = require( "../../math/Sphere" ),
	Vector2 = require( "../../math/Vector2" ),
	Vector3 = require( "../../math/Vector3" );

function RingGeometry( innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength ) {

	Geometry.call( this );

	this.type = "RingGeometry";

	this.parameters = {
		innerRadius: innerRadius,
		outerRadius: outerRadius,
		thetaSegments: thetaSegments,
		phiSegments: phiSegments,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

	innerRadius = innerRadius || 0;
	outerRadius = outerRadius || 50;

	thetaStart = thetaStart !== undefined ? thetaStart : 0;
	thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2;

	thetaSegments = thetaSegments !== undefined ? Math.max( 3, thetaSegments ) : 8;
	phiSegments = phiSegments !== undefined ? Math.max( 1, phiSegments ) : 8;

	var i, segment, vertex, o, uvs = [], radius = innerRadius, radiusStep = ( ( outerRadius - innerRadius ) / phiSegments );

	for ( i = 0; i < phiSegments + 1; i ++ ) {

		// concentric circles inside ring

		for ( o = 0; o < thetaSegments + 1; o ++ ) {

			// number of segments per circle

			vertex = new Vector3();
			segment = thetaStart + o / thetaSegments * thetaLength;
			vertex.x = radius * Math.cos( segment );
			vertex.y = radius * Math.sin( segment );

			this.vertices.push( vertex );
			uvs.push( new Vector2( ( vertex.x / outerRadius + 1 ) / 2, ( vertex.y / outerRadius + 1 ) / 2 ) );

		}

		radius += radiusStep;

	}

	var n = new Vector3( 0, 0, 1 ),
		thetaSegment, v1, v2, v3;

	for ( i = 0; i < phiSegments; i ++ ) {

		// concentric circles inside ring

		thetaSegment = i * ( thetaSegments + 1 );

		for ( o = 0; o < thetaSegments ; o ++ ) {

			// number of segments per circle

			segment = o + thetaSegment;

			v1 = segment;
			v2 = segment + thetaSegments + 1;
			v3 = segment + thetaSegments + 2;

			this.faces.push( new Face3( v1, v2, v3, [ n.clone(), n.clone(), n.clone() ] ) );
			this.faceVertexUvs[ 0 ].push( [ uvs[ v1 ].clone(), uvs[ v2 ].clone(), uvs[ v3 ].clone() ] );

			v1 = segment;
			v2 = segment + thetaSegments + 2;
			v3 = segment + 1;

			this.faces.push( new Face3( v1, v2, v3, [ n.clone(), n.clone(), n.clone() ] ) );
			this.faceVertexUvs[ 0 ].push( [ uvs[ v1 ].clone(), uvs[ v2 ].clone(), uvs[ v3 ].clone() ] );

		}
	}

	this.computeFaceNormals();

	this.boundingSphere = new Sphere( new Vector3(), radius );

}

RingGeometry.prototype = Object.create( Geometry.prototype );
RingGeometry.prototype.constructor = RingGeometry;

RingGeometry.prototype.clone = function () {

	var geometry = new RingGeometry(
		this.parameters.innerRadius,
		this.parameters.outerRadius,
		this.parameters.thetaSegments,
		this.parameters.phiSegments,
		this.parameters.thetaStart,
		this.parameters.thetaLength
	);

	return geometry;

};
