/**
 * @author munrocket / https://github.com/munrocket
 */

import {
	BufferGeometry,
	Float32BufferAttribute
} from "../../../build/three.module.js";

var SpiralSphereGeometry = function ( radius, turns, tiles, tilesQuads, gap ) {

	gap = 0.5 * gap;
	var vertices = [];
	var indices = [];
	var tileIds = [];
	var uvs = [];

	function parameter( i ) {

		return Math.acos( Math.cos( Math.PI / 2 / turns ) * ( 1 - 2 * i / ( tiles * tilesQuads ) ) )
			- ( turns + 1 ) * Math.PI / 2 / turns;

	}

	function pushAttibutes( theta, phi, id ) {

		var x = Math.cos( theta ) * Math.cos( phi )
		var y = - Math.sin( theta );
		var z = Math.cos( theta ) * Math.sin( phi );

		vertices.push( radius * x );
		vertices.push( radius * y );
		vertices.push( radius * z );

		var manhattan = Math.abs( x ) + Math.abs( y ) + Math.abs( z );
		x = x / manhattan;
		y = y / manhattan;
		z = - z / manhattan;

		if ( y < 0 ) {
			var t = x;
			x = ( 1 - Math.abs( z ) ) * Math.sign( x );
			z = ( 1 - Math.abs( t ) ) * Math.sign( z );
		}

		uvs.push( x * 0.5 + 0.5, z * 0.5 + 0.5 );
		tileIds.push( id );

	}

	for ( var i = 0; i <= tiles * tilesQuads; i ++ ) {

		var t = parameter( i );
		var id = Math.floor( i / tilesQuads ) + 1;
		pushAttibutes( t + gap, turns * Math.PI + 2 * turns * t, id );
		t += Math.PI / turns ;
		pushAttibutes( t - gap, turns * Math.PI + 2 * turns * t, id );

	}

	for ( var i = 0; i < 2 * tiles * tilesQuads; i += 2 ) {

		indices.push( i + 3, i + 1, i );
		indices.push( i + 2, i + 3, i );

	}

	// special case for the poles

	var skip = 2 * tiles * tilesQuads + 2;
	var count = 0;

	for ( var i = 1; parameter( i ) < parameter( 0 ) + Math.PI / turns; i += 2 ) {

		var t = parameter( i );
		pushAttibutes( t - gap, turns * Math.PI + 2 * turns * t, 0 );
		pushAttibutes( gap - t, turns * Math.PI - 2 * turns * t, tiles + 1 );
		count ++;

	}

	for ( var i = 0; i < count - 1; i ++ ) {

		var j = skip + 2 * i;
		indices.push( 0, j + 2, j );
		indices.push( skip - 1, j + 3, j + 1 );

	}

	indices.push( 0, 1, skip + 2 * ( count - 2 ) + 2 );
	indices.push( skip - 1, skip - 2, skip + 2 * ( count - 1 ) + 1 );

	// build geometry

	var geometry = new BufferGeometry();
	geometry.setIndex( indices );
	geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
	geometry.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );
	geometry.setAttribute( 'tile_id', new Float32BufferAttribute( tileIds, 1 ) );

	return geometry;

}

SpiralSphereGeometry.prototype = Object.create( BufferGeometry.prototype );
SpiralSphereGeometry.prototype.constructor = SpiralSphereGeometry;

export { SpiralSphereGeometry };
