import {
	Vector2
} from 'three';

/**
 * tool for "unwrapping" and debugging three.js geometries UV mapping
 *
 * Sample usage:
 *	document.body.appendChild( UVsDebug( new THREE.SphereGeometry( 10, 10, 10, 10 ) );
 *
 */

function UVsDebug( geometry, size = 1024 ) {

	// handles wrapping of uv.x > 1 only

	const abc = 'abc';
	const a = new Vector2();
	const b = new Vector2();

	const uvs = [
		new Vector2(),
		new Vector2(),
		new Vector2()
	];

	const face = [];

	const canvas = document.createElement( 'canvas' );
	const width = size; // power of 2 required for wrapping
	const height = size;
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext( '2d' );
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'rgb( 63, 63, 63 )';
	ctx.textAlign = 'center';

	// paint background white

	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.fillRect( 0, 0, width, height );

	if ( geometry.isGeometry ) {

		console.error( 'THREE.UVsDebug no longer supports Geometry. Use THREE.BufferGeometry instead.' );
		return;

	} else {

		const index = geometry.index;
		const uvAttribute = geometry.attributes.uv;

		if ( index ) {

			// indexed geometry

			for ( let i = 0, il = index.count; i < il; i += 3 ) {

				face[ 0 ] = index.getX( i );
				face[ 1 ] = index.getX( i + 1 );
				face[ 2 ] = index.getX( i + 2 );

				uvs[ 0 ].fromBufferAttribute( uvAttribute, face[ 0 ] );
				uvs[ 1 ].fromBufferAttribute( uvAttribute, face[ 1 ] );
				uvs[ 2 ].fromBufferAttribute( uvAttribute, face[ 2 ] );

				processFace( face, uvs, i / 3 );

			}

		} else {

			// non-indexed geometry

			for ( let i = 0, il = uvAttribute.count; i < il; i += 3 ) {

				face[ 0 ] = i;
				face[ 1 ] = i + 1;
				face[ 2 ] = i + 2;

				uvs[ 0 ].fromBufferAttribute( uvAttribute, face[ 0 ] );
				uvs[ 1 ].fromBufferAttribute( uvAttribute, face[ 1 ] );
				uvs[ 2 ].fromBufferAttribute( uvAttribute, face[ 2 ] );

				processFace( face, uvs, i / 3 );

			}

		}

	}

	return canvas;

	function processFace( face, uvs, index ) {

		// draw contour of face

		ctx.beginPath();

		a.set( 0, 0 );

		for ( let j = 0, jl = uvs.length; j < jl; j ++ ) {

			const uv = uvs[ j ];

			a.x += uv.x;
			a.y += uv.y;

			if ( j === 0 ) {

				ctx.moveTo( uv.x * ( width - 2 ) + 0.5, ( 1 - uv.y ) * ( height - 2 ) + 0.5 );

			} else {

				ctx.lineTo( uv.x * ( width - 2 ) + 0.5, ( 1 - uv.y ) * ( height - 2 ) + 0.5 );

			}

		}

		ctx.closePath();
		ctx.stroke();

		// calculate center of face

		a.divideScalar( uvs.length );

		// label the face number

		ctx.font = '18px Arial';
		ctx.fillStyle = 'rgb( 63, 63, 63 )';
		ctx.fillText( index, a.x * width, ( 1 - a.y ) * height );

		if ( a.x > 0.95 ) {

			// wrap x // 0.95 is arbitrary

			ctx.fillText( index, ( a.x % 1 ) * width, ( 1 - a.y ) * height );

		}

		//

		ctx.font = '12px Arial';
		ctx.fillStyle = 'rgb( 191, 191, 191 )';

		// label uv edge orders

		for ( let j = 0, jl = uvs.length; j < jl; j ++ ) {

			const uv = uvs[ j ];
			b.addVectors( a, uv ).divideScalar( 2 );

			const vnum = face[ j ];
			ctx.fillText( abc[ j ] + vnum, b.x * width, ( 1 - b.y ) * height );

			if ( b.x > 0.95 ) {

				// wrap x

				ctx.fillText( abc[ j ] + vnum, ( b.x % 1 ) * width, ( 1 - b.y ) * height );

			}

		}

	}

}

export { UVsDebug };
