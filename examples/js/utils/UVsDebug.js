/*
 * @author zz85 / http://github.com/zz85
 * @author WestLangley / http://github.com/WestLangley
 * @author Mugen87 / https://github.com/Mugen87
 *
 * tool for "unwrapping" and debugging three.js geometries UV mapping
 *
 * Sample usage:
 *	document.body.appendChild( THREE.UVsDebug( new THREE.SphereBufferGeometry( 10, 10, 10, 10 ) );
 *
 */

THREE.UVsDebug = function ( geometry, size ) {

	// handles wrapping of uv.x > 1 only

	var abc = 'abc';
	var a = new THREE.Vector2();
	var b = new THREE.Vector2();

	var geo = geometry;

	if ( geo.isGeometry ) geo = new THREE.BufferGeometry().fromGeometry( geo );

	var uvs = geo.attributes.uv;
	var uv = new THREE.Vector2();

	var canvas = document.createElement( 'canvas' );
	var width = size || 1024; // power of 2 required for wrapping
	var height = size || 1024;
	canvas.width = width;
	canvas.height = height;

	var ctx = canvas.getContext( '2d' );
	ctx.lineWidth = 2;
	ctx.strokeStyle = 'rgba( 0, 0, 0, 1.0 )';
	ctx.textAlign = 'center';

	// paint background white

	ctx.fillStyle = 'rgba( 255, 255, 255, 1.0 )';
	ctx.fillRect( 0, 0, width, height );

	var index = geo.index;
	var face = [];

	if ( index ) {

		// indexed geometry

		for ( var i = 0, il = index.count; i < il; i += 3 ) {

			face[ 0 ] = index.getX( i );
			face[ 1 ] = index.getX( i + 1 );
			face[ 2 ] = index.getX( i + 2 );

			processFace( face, i );

		}

	} else {

		// non-indexed geometry

		for ( var i = 0, il = uvs.count; i < il; i += 3 ) {

			face[ 0 ] = i;
			face[ 1 ] = i + 1;
			face[ 2 ] = i + 2;

			processFace( face, i );

		}

	}

	return canvas;

	function processFace( face, index ) {

		var indexCount = face.length;

		// draw contour of face

		ctx.beginPath();

		a.set( 0, 0 );

		for ( var j = 0, jl = indexCount; j < jl; j ++ ) {

			uv.fromBufferAttribute( uvs, face[ j ] );

			a.x += uv.x;
			a.y += uv.y;

			if ( j === 0 ) {

				ctx.moveTo( uv.x * width, ( 1 - uv.y ) * height );

			} else {

				ctx.lineTo( uv.x * width, ( 1 - uv.y ) * height );

			}

		}

		ctx.closePath();
		ctx.stroke();

		// calculate center of face

		a.divideScalar( indexCount );

		// label the face number

		ctx.font = '12pt Arial bold';
		ctx.fillStyle = 'rgba( 0, 0, 0, 1.0 )';
		ctx.fillText( i / 3, a.x * width, ( 1 - a.y ) * height );

		if ( a.x > 0.95 ) {

			// wrap x // 0.95 is arbitrary

			ctx.fillText( index, ( a.x % 1 ) * width, ( 1 - a.y ) * height );

		}

		//

		ctx.font = '8pt Arial bold';
		ctx.fillStyle = 'rgba( 0, 0, 0, 1.0 )';

		// label uv edge orders

		for ( j = 0, jl = face.length; j < jl; j ++ ) {

			uv.fromBufferAttribute( uvs, face[ j ] );
			b.addVectors( a, uv ).divideScalar( 2 );

			var vnum = face[ j ];
			ctx.fillText( abc[ j ] + vnum, b.x * width, ( 1 - b.y ) * height );

			if ( b.x > 0.95 ) {

				// wrap x

				ctx.fillText( abc[ j ] + vnum, ( b.x % 1 ) * width, ( 1 - b.y ) * height );

			}

		}

	}

};
