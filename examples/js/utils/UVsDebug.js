/* 
 * @author zz85 / http://github.com/zz85
 * @author WestLangley / http://github.com/WestLangley
 *
 * tool for "unwrapping" and debugging three.js 
 * geometries UV mapping
 *
 * Sample usage:
 *	document.body.appendChild(
 *		THREE.UVsDebug(
 *			new THREE.SphereGeometry(10,10,10,10));
 *
 */
 
THREE.UVsDebug = function( geometry, size ) {

    // handles wrapping of uv.x > 1 only
    
	var abc = 'abcd';

	var uv, u, ax, ay;
	var i, il, j, jl;
	var vnum;

	var a = new THREE.Vector2();
	var b = new THREE.Vector2();

	var faces = geometry.faces;
	var uvs = geometry.faceVertexUvs[ 0 ];

	var canvas = document.createElement( 'canvas' );
	var width = size || 1024;   // power of 2 required for wrapping
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

	for ( i = 0, il = uvs.length; i < il; i ++ ) {

		uv = uvs[ i ];

        // draw lines

		ctx.beginPath();

		a.set( 0, 0 );

		for ( j = 0, jl = uv.length; j < jl; j ++ ) {

			u = uv[ j ];

			a.x += u.x;
			a.y += u.y;

			if ( j == 0 ) {

				ctx.moveTo( u.x * width, ( 1 - u.y ) * height );

			} else {

				ctx.lineTo( u.x * width, ( 1 - u.y ) * height );

			}

		}

		ctx.closePath();
		ctx.stroke();

		a.divideScalar( jl );

        // label the face number

		ctx.font = "12pt Arial bold";
		ctx.fillStyle = 'rgba( 0, 0, 0, 1.0 )';
		ctx.fillText( i, a.x * width, ( 1 - a.y ) * height );

		if ( a.x > 0.95 ) { // wrap x // 0.95 is arbitrary

			ctx.fillText( i, ( a.x % 1 ) * width, ( 1 - a.y ) * height );

		}

		ctx.font = "8pt Arial bold";
		ctx.fillStyle = 'rgba( 0, 0, 0, 1.0 )';

        // label uv edge orders

		for ( j = 0, jl = uv.length; j < jl; j ++ ) {

			u = uv[ j ];
			b.addVectors( a, u ).divideScalar( 2 );

			vnum = faces[ i ][ abc[ j ] ];
			ctx.fillText( abc[ j ] + vnum, b.x * width, ( 1 - b.y ) * height );

			if ( b.x > 0.95 ) {  // wrap x

				ctx.fillText( abc[ j ] + vnum, ( b.x % 1 ) * width, ( 1 - b.y ) * height );

			}

		}

	}

	return canvas;

}

