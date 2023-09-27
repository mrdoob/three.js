import {
	Color,
	LightProbe,
	LinearSRGBColorSpace,
	SphericalHarmonics3,
	Vector3,
	SRGBColorSpace,
	NoColorSpace
} from 'three';

class LightProbeGenerator {

	// https://www.ppsloan.org/publications/StupidSH36.pdf
	static fromCubeTexture( cubeTexture ) {

		let totalWeight = 0;

		const coord = new Vector3();

		const dir = new Vector3();

		const color = new Color();

		const shBasis = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];

		const sh = new SphericalHarmonics3();
		const shCoefficients = sh.coefficients;

		for ( let faceIndex = 0; faceIndex < 6; faceIndex ++ ) {

			const image = cubeTexture.image[ faceIndex ];

			const width = image.width;
			const height = image.height;

			const canvas = document.createElement( 'canvas' );

			canvas.width = width;
			canvas.height = height;

			const context = canvas.getContext( '2d' );

			context.drawImage( image, 0, 0, width, height );

			const imageData = context.getImageData( 0, 0, width, height );

			const data = imageData.data;

			const imageWidth = imageData.width; // assumed to be square

			const pixelSize = 2 / imageWidth;

			for ( let i = 0, il = data.length; i < il; i += 4 ) { // RGBA assumed

				// pixel color
				color.setRGB( data[ i ] / 255, data[ i + 1 ] / 255, data[ i + 2 ] / 255 );

				// convert to linear color space
				convertColorToLinear( color, cubeTexture.colorSpace );

				// pixel coordinate on unit cube

				const pixelIndex = i / 4;

				const col = - 1 + ( pixelIndex % imageWidth + 0.5 ) * pixelSize;

				const row = 1 - ( Math.floor( pixelIndex / imageWidth ) + 0.5 ) * pixelSize;

				switch ( faceIndex ) {

					case 0: coord.set( - 1, row, - col ); break;

					case 1: coord.set( 1, row, col ); break;

					case 2: coord.set( - col, 1, - row ); break;

					case 3: coord.set( - col, - 1, row ); break;

					case 4: coord.set( - col, row, 1 ); break;

					case 5: coord.set( col, row, - 1 ); break;

				}

				// weight assigned to this pixel

				const lengthSq = coord.lengthSq();

				const weight = 4 / ( Math.sqrt( lengthSq ) * lengthSq );

				totalWeight += weight;

				// direction vector to this pixel
				dir.copy( coord ).normalize();

				// evaluate SH basis functions in direction dir
				SphericalHarmonics3.getBasisAt( dir, shBasis );

				// accummuulate
				for ( let j = 0; j < 9; j ++ ) {

					shCoefficients[ j ].x += shBasis[ j ] * color.r * weight;
					shCoefficients[ j ].y += shBasis[ j ] * color.g * weight;
					shCoefficients[ j ].z += shBasis[ j ] * color.b * weight;

				}

			}

		}

		// normalize
		const norm = ( 4 * Math.PI ) / totalWeight;

		for ( let j = 0; j < 9; j ++ ) {

			shCoefficients[ j ].x *= norm;
			shCoefficients[ j ].y *= norm;
			shCoefficients[ j ].z *= norm;

		}

		return new LightProbe( sh );

	}

	static fromCubeRenderTarget( renderer, cubeRenderTarget ) {

		// The renderTarget must be set to RGBA in order to make readRenderTargetPixels works
		let totalWeight = 0;

		const coord = new Vector3();

		const dir = new Vector3();

		const color = new Color();

		const shBasis = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];

		const sh = new SphericalHarmonics3();
		const shCoefficients = sh.coefficients;

		for ( let faceIndex = 0; faceIndex < 6; faceIndex ++ ) {

			const imageWidth = cubeRenderTarget.width; // assumed to be square
			const data = new Uint8Array( imageWidth * imageWidth * 4 );
			renderer.readRenderTargetPixels( cubeRenderTarget, 0, 0, imageWidth, imageWidth, data, faceIndex );

			const pixelSize = 2 / imageWidth;

			for ( let i = 0, il = data.length; i < il; i += 4 ) { // RGBA assumed

				// pixel color
				color.setRGB( data[ i ] / 255, data[ i + 1 ] / 255, data[ i + 2 ] / 255 );

				// convert to linear color space
				convertColorToLinear( color, cubeRenderTarget.texture.colorSpace );

				// pixel coordinate on unit cube

				const pixelIndex = i / 4;

				const col = - 1 + ( pixelIndex % imageWidth + 0.5 ) * pixelSize;

				const row = 1 - ( Math.floor( pixelIndex / imageWidth ) + 0.5 ) * pixelSize;

				switch ( faceIndex ) {

					case 0: coord.set( 1, row, - col ); break;

					case 1: coord.set( - 1, row, col ); break;

					case 2: coord.set( col, 1, - row ); break;

					case 3: coord.set( col, - 1, row ); break;

					case 4: coord.set( col, row, 1 ); break;

					case 5: coord.set( - col, row, - 1 ); break;

				}

				// weight assigned to this pixel

				const lengthSq = coord.lengthSq();

				const weight = 4 / ( Math.sqrt( lengthSq ) * lengthSq );

				totalWeight += weight;

				// direction vector to this pixel
				dir.copy( coord ).normalize();

				// evaluate SH basis functions in direction dir
				SphericalHarmonics3.getBasisAt( dir, shBasis );

				// accummuulate
				for ( let j = 0; j < 9; j ++ ) {

					shCoefficients[ j ].x += shBasis[ j ] * color.r * weight;
					shCoefficients[ j ].y += shBasis[ j ] * color.g * weight;
					shCoefficients[ j ].z += shBasis[ j ] * color.b * weight;

				}

			}

		}

		// normalize
		const norm = ( 4 * Math.PI ) / totalWeight;

		for ( let j = 0; j < 9; j ++ ) {

			shCoefficients[ j ].x *= norm;
			shCoefficients[ j ].y *= norm;
			shCoefficients[ j ].z *= norm;

		}

		return new LightProbe( sh );

	}

}

function convertColorToLinear( color, colorSpace ) {

	switch ( colorSpace ) {

		case SRGBColorSpace:

			color.convertSRGBToLinear();
			break;

		case LinearSRGBColorSpace:
		case NoColorSpace:

			break;

		default:

			console.warn( 'WARNING: LightProbeGenerator convertColorToLinear() encountered an unsupported color space.' );
			break;

	}

	return color;

}

export { LightProbeGenerator };
