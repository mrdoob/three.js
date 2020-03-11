/**
 * @author munrocket / https://twitter.com/munrocket_twit
 */

import {
	BufferGeometry,
	Float32BufferAttribute
} from "../../../build/three.module.js";

var SpiralSphereGeometry = function ( radius, turns, gapX, gapY, tileX, tileY, tiles ) {

	gapX = gapX / turns || 0;
	gapY = gapY / turns || 0;
	tileX = tileX || 8;
	tileY = tileY || 8;
	tiles = tiles || Math.floor( 4 * turns * turns / Math.PI );

	var vertices = [];
	var indices = [];
	var ids = [];
	var uvs = [];

	function parameter( i ) {

		return Math.acos( Math.cos( Math.PI / 2 / turns ) * ( 1 - 2 * i / ( ( tiles - 2 ) * tileX ) ) )
				- ( turns + 1 ) * Math.PI / 2 / turns;

	}

	function pushVert( theta, phi ) {

		var x = radius * Math.cos( theta ) * Math.cos( phi )
		var y = - radius * Math.sin( theta );
		var z = radius * Math.cos( theta ) * Math.sin( phi );
		vertices.push( x, y, z );

	}

	for ( var id = 0; id < tiles - 2; id ++ ) {

		for ( var i = 0; i <= tileX; i ++ ) {

			var u = i / tileX;
			var t = parameter( id * tileX + i + 2 * turns * ( gapY - 2 * gapY * u + ( gapY - 2 * gapY * id / ( tiles - 2 ) ) / 3 ) );

			for ( var j = 0; j <= tileY; j ++ ) {

				var v = j / tileY;
				pushVert( t + gapX - ( 2 * gapX - Math.PI / turns ) * v, ( Math.PI + 2 * t ) * turns );
				ids.push( id + 1 );
				uvs.push( u, 1 - v );

			}

		}

		for ( var i = 0; i < tileX; i ++ ) {

			for ( var j = 0; j < tileY; j ++ ) {

				var k = ( tileY + 1 ) * ( id * ( tileX + 1 ) + i ) + j;
				indices.push( k + tileY + 1, k + 1, k );
				indices.push( k + tileY + 2, k + 1, k + tileY + 1 );

			}

		}

	}

	/* Special case for the poles */

	var iMax = 1 + Math.floor( ( tiles - 2 ) * tileX / 4 *
			( 1 - Math.sin( ( turns + 3 ) * Math.PI / 2 / turns ) / Math.cos( Math.PI / 2 / turns ) ) );
	var skip = ( tiles - 2 ) * ( tileX + 1 ) * ( tileY + 1 );
	var t0 = - Math.PI / 2;

	for ( var pol = 0; pol < 2; pol ++ ) {

		var sign = 1 - 2 * pol;

		for ( var i = 0; i <= iMax; i ++ ) {

			var u = i / iMax;
			var t = t0 + u * ( Math.PI / turns ) - gapY * u / turns;
			var t1 = t0 + ( gapX ? gapX * Math.pow( u, 0.15 / gapX ) : 0 );
			var t2 = Math.max( t0, t - gapX );
			t2 = ( t1 < t2 ) ? t2 : t1;

			for ( var j = 0; j <= tileY; j ++ ) {

				var v = j / tileY;
				pushVert( sign * ( t1 * ( 1 - v ) + t2 * v ), turns * ( Math.PI + sign * 2 * t ) );
				ids.push( pol * ( tiles - 1 ) );
				uvs.push( u, 1 - pol - sign * v );

			}

		}

		for ( var i = 0; i < iMax; i ++ ) {

			for ( var j = 0; j < tileY; j ++ ) {

				var k = skip + ( tileY + 1 ) * ( pol * ( iMax + 1 ) + i ) + j;
				indices.push( k + tileY + 1, k + 1, k );
				indices.push( k + tileY + 2, k + 1, k + tileY + 1 );

			}

		}

	}

	var geometry = new BufferGeometry();
	geometry.setIndex( indices );
	geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
	geometry.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );
	geometry.setAttribute( 'id', new Float32BufferAttribute( ids, 1 ) );

	return geometry;

}

SpiralSphereGeometry.prototype = Object.create( BufferGeometry.prototype );
SpiralSphereGeometry.prototype.constructor = SpiralSphereGeometry;

export { SpiralSphereGeometry };
