/**
 * @author oosmoxiecode
 * based on http://code.google.com/p/away3d/source/browse/trunk/fp10/Away3D/src/away3d/primitives/TorusKnot.as?spec=svn2473&r=2473
 */

module.exports = TorusKnotGeometry;

var Face3 = require( "../../core/Face3" ),
	Geometry = require( "../../core/Geometry" ),
	Vector2 = require( "../../math/Vector2" ),
	Vector3 = require( "../../math/Vector3" );

function TorusKnotGeometry( radius, tube, radialSegments, tubularSegments, p, q, heightScale ) {

	Geometry.call( this );

	this.type = "TorusKnotGeometry";

	this.parameters = {
		radius: radius,
		tube: tube,
		radialSegments: radialSegments,
		tubularSegments: tubularSegments,
		p: p,
		q: q,
		heightScale: heightScale
	};

	radius = radius || 100;
	tube = tube || 40;
	radialSegments = radialSegments || 64;
	tubularSegments = tubularSegments || 8;
	p = p || 2;
	q = q || 3;
	heightScale = heightScale || 1;

	var grid = new Array( radialSegments );
	var tang = new Vector3();
	var n = new Vector3();
	var bitan = new Vector3();
	var i, j, u, p1, p2,
		v, cx, cy, pos,
		ip, jp, a, b, c, d,
		uva, uvb, uvc, uvd;

	for ( i = 0; i < radialSegments; ++ i ) {

		grid[ i ] = new Array( tubularSegments );
		u = i / radialSegments * 2 * p * Math.PI;
		p1 = getPos( u, q, p, radius, heightScale );
		p2 = getPos( u + 0.01, q, p, radius, heightScale );
		tang.subVectors( p2, p1 );
		n.addVectors( p2, p1 );

		bitan.crossVectors( tang, n );
		n.crossVectors( bitan, tang );
		bitan.normalize();
		n.normalize();

		for ( j = 0; j < tubularSegments; ++ j ) {

			v = j / tubularSegments * 2 * Math.PI;
			cx = - tube * Math.cos( v ); // TODO: Hack: Negating it so it faces outside.
			cy = tube * Math.sin( v );

			pos = new Vector3();
			pos.x = p1.x + cx * n.x + cy * bitan.x;
			pos.y = p1.y + cx * n.y + cy * bitan.y;
			pos.z = p1.z + cx * n.z + cy * bitan.z;

			grid[ i ][ j ] = this.vertices.push( pos ) - 1;

		}

	}

	for ( i = 0; i < radialSegments; ++ i ) {

		for ( j = 0; j < tubularSegments; ++ j ) {

			ip = ( i + 1 ) % radialSegments;
			jp = ( j + 1 ) % tubularSegments;

			a = grid[ i ][ j ];
			b = grid[ ip ][ j ];
			c = grid[ ip ][ jp ];
			d = grid[ i ][ jp ];

			uva = new Vector2( i / radialSegments, j / tubularSegments );
			uvb = new Vector2( ( i + 1 ) / radialSegments, j / tubularSegments );
			uvc = new Vector2( ( i + 1 ) / radialSegments, ( j + 1 ) / tubularSegments );
			uvd = new Vector2( i / radialSegments, ( j + 1 ) / tubularSegments );

			this.faces.push( new Face3( a, b, d ) );
			this.faceVertexUvs[ 0 ].push( [ uva, uvb, uvd ] );

			this.faces.push( new Face3( b, c, d ) );
			this.faceVertexUvs[ 0 ].push( [ uvb.clone(), uvc, uvd.clone() ] );

		}

	}

	this.computeFaceNormals();
	this.computeVertexNormals();

	function getPos( u, in_q, in_p, radius, heightScale ) {

		var cu = Math.cos( u );
		var su = Math.sin( u );
		var quOverP = in_q / in_p * u;
		var cs = Math.cos( quOverP );

		var tx = radius * ( 2 + cs ) * 0.5 * cu;
		var ty = radius * ( 2 + cs ) * su * 0.5;
		var tz = heightScale * radius * Math.sin( quOverP ) * 0.5;

		return new Vector3( tx, ty, tz );

	}

}

TorusKnotGeometry.prototype = Object.create( Geometry.prototype );
TorusKnotGeometry.prototype.constructor = TorusKnotGeometry;

TorusKnotGeometry.prototype.clone = function () {

	var geometry = new TorusKnotGeometry(
		this.parameters.radius,
		this.parameters.tube,
		this.parameters.radialSegments,
		this.parameters.tubularSegments,
		this.parameters.p,
		this.parameters.q,
		this.parameters.heightScale
	);

	return geometry;

};
