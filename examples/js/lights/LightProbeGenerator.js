/**
 * @author WestLangley / http://github.com/WestLangley
 */

THREE.LightProbeGenerator = {

	fromAmbientLight: function ( light ) {

		var color = light.color;
		var intensity = light.intensity;

		var sh = new THREE.SphericalHarmonics3();

		// without extra factor of PI in the shader, would be 2 / Math.sqrt( Math.PI );
		sh.coefficients[ 0 ].set( color.r, color.g, color.b ).multiplyScalar(  2 * Math.sqrt( Math.PI ) );

		return new THREE.LightProbe( sh, intensity );

	},

	fromHemisphereLight: function ( light ) {

		// up-direction hardwired

		// up-direction hardwired

		var color1 = light.color;
		var color2 = light.groundColor;

		var sky = new THREE.Vector3( color1.r, color1.g, color1.b );
		var ground = new THREE.Vector3( color2.r, color2.g, color2.b );
		var intensity = light.intensity;

		// without extra factor of PI in the shader, should = 1 / Math.sqrt( Math.PI );
		var c0 = Math.sqrt( Math.PI );
		var c1 = c0 * Math.sqrt( 0.75 );

		var sh = new THREE.SphericalHarmonics3();
		sh.coefficients[ 0 ].copy( sky ).add( ground ).multiplyScalar( c0 );
		sh.coefficients[ 1 ].copy( sky ).sub( ground ).multiplyScalar( c1 );

		return new THREE.LightProbe( sh, intensity );

	},

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
				color.copySRGBToLinear( color );

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

	}

};
