/**
 * @author WestLangley / http://github.com/WestLangley
 */

THREE.LightProbeGenerator = {

	// https://www.ppsloan.org/publications/StupidSH36.pdf
	fromCubeTexture: function ( cubeTexture ) {

		var norm, lengthSq, weight, totalWeight = 0;

		var coord = new THREE.Vector3();

		var dir = new THREE.Vector3();

		var color = new THREE.Color();

		var shBasis = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];

		var sh = new THREE.SphericalHarmonics3();
		var shCoefficients = sh.coefficients;

		for ( var faceIndex = 0; faceIndex < 6; faceIndex ++ ) {

			var image = cubeTexture.image[ faceIndex ];

			var width = image.width;
			var height = image.height;

			var canvas = document.createElement( 'canvas' );

			canvas.width = width;
			canvas.height = height;

			var context = canvas.getContext( '2d' );

			context.drawImage( image, 0, 0, width, height );

			var imageData = context.getImageData( 0, 0, width, height );

			var data = imageData.data;

			var imageWidth = imageData.width; // assumed to be square

			var pixelSize = 2 / imageWidth;

			for ( var i = 0, il = data.length; i < il; i += 4 ) { // RGBA assumed

				// pixel color
				color.setRGB( data[ i ] / 255, data[ i + 1 ] / 255, data[ i + 2 ] / 255 );

				// convert to linear color space
				convertColorToLinear( color, cubeTexture.encoding );

				// pixel coordinate on unit cube

				var pixelIndex = i / 4;

				var col = - 1 + ( pixelIndex % imageWidth + 0.5 ) * pixelSize;

				var row = 1 - ( Math.floor( pixelIndex / imageWidth ) + 0.5 ) * pixelSize;

				switch ( faceIndex ) {

					case 0: coord.set( - 1, row, - col ); break;

					case 1: coord.set( 1, row, col ); break;

					case 2: coord.set( - col, 1, - row ); break;

					case 3: coord.set( - col, - 1, row ); break;

					case 4: coord.set( - col, row, 1 ); break;

					case 5: coord.set( col, row, - 1 ); break;

				}

				// weight assigned to this pixel

				lengthSq = coord.lengthSq();

				weight = 4 / ( Math.sqrt( lengthSq ) * lengthSq );

				totalWeight += weight;

				// direction vector to this pixel
				dir.copy( coord ).normalize();

				// evaluate SH basis functions in direction dir
				THREE.SphericalHarmonics3.getBasisAt( dir, shBasis );

				// accummuulate
				for ( var j = 0; j < 9; j ++ ) {

					shCoefficients[ j ].x += shBasis[ j ] * color.r * weight;
					shCoefficients[ j ].y += shBasis[ j ] * color.g * weight;
					shCoefficients[ j ].z += shBasis[ j ] * color.b * weight;

				}

			}

		}

		// normalize
		norm = ( 4 * Math.PI ) / totalWeight;

		for ( var j = 0; j < 9; j ++ ) {

			shCoefficients[ j ].x *= norm;
			shCoefficients[ j ].y *= norm;
			shCoefficients[ j ].z *= norm;

		}

		return new THREE.LightProbe( sh );

	},

	fromCubeRenderTarget: function ( renderer, cubeRenderTarget ) {

		// The renderTarget must be set to RGBA in order to make readRenderTargetPixels works
		var norm, lengthSq, weight, totalWeight = 0;

		var coord = new THREE.Vector3();

		var dir = new THREE.Vector3();

		var color = new THREE.Color();

		var shBasis = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];

		var sh = new THREE.SphericalHarmonics3();
		var shCoefficients = sh.coefficients;

		for ( var faceIndex = 0; faceIndex < 6; faceIndex ++ ) {

			var imageWidth = cubeRenderTarget.width; // assumed to be square
			var data = new Uint8Array( imageWidth * imageWidth * 4 );
			renderer.readRenderTargetPixels( cubeRenderTarget, 0, 0, imageWidth, imageWidth, data, faceIndex );

			var pixelSize = 2 / imageWidth;

			for ( var i = 0, il = data.length; i < il; i += 4 ) { // RGBA assumed

				// pixel color
				color.setRGB( data[ i ] / 255, data[ i + 1 ] / 255, data[ i + 2 ] / 255 );

				// convert to linear color space
				convertColorToLinear( color, cubeRenderTarget.texture.encoding );

				// pixel coordinate on unit cube

				var pixelIndex = i / 4;

				var col = - 1 + ( pixelIndex % imageWidth + 0.5 ) * pixelSize;

				var row = 1 - ( Math.floor( pixelIndex / imageWidth ) + 0.5 ) * pixelSize;

				switch ( faceIndex ) {

					case 0: coord.set( 1, row, - col ); break;

					case 1: coord.set( - 1, row, col ); break;

					case 2: coord.set( col, 1, - row ); break;

					case 3: coord.set( col, - 1, row ); break;

					case 4: coord.set( col, row, 1 ); break;

					case 5: coord.set( - col, row, - 1 ); break;

				}

				// weight assigned to this pixel

				lengthSq = coord.lengthSq();

				weight = 4 / ( Math.sqrt( lengthSq ) * lengthSq );

				totalWeight += weight;

				// direction vector to this pixel
				dir.copy( coord ).normalize();

				// evaluate SH basis functions in direction dir
				THREE.SphericalHarmonics3.getBasisAt( dir, shBasis );

				// accummuulate
				for ( var j = 0; j < 9; j ++ ) {

					shCoefficients[ j ].x += shBasis[ j ] * color.r * weight;
					shCoefficients[ j ].y += shBasis[ j ] * color.g * weight;
					shCoefficients[ j ].z += shBasis[ j ] * color.b * weight;

				}

			}

		}

		// normalize
		norm = ( 4 * Math.PI ) / totalWeight;

		for ( var j = 0; j < 9; j ++ ) {

			shCoefficients[ j ].x *= norm;
			shCoefficients[ j ].y *= norm;
			shCoefficients[ j ].z *= norm;

		}

		return new THREE.LightProbe( sh );

	}

};

var convertColorToLinear = function ( color, encoding ) {

	switch ( encoding ) {

		case THREE.sRGBEncoding:

			color.convertSRGBToLinear();
			break;

		case THREE.LinearEncoding:

			break;

		default:

			console.warn( 'WARNING: LightProbeGenerator convertColorToLinear() encountered an unsupported encoding.' );
			break;

	}

	return color;

};
