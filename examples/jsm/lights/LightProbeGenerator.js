import {
	Color,
	LightProbe,
	LinearSRGBColorSpace,
	SphericalHarmonics3,
	Vector3,
	SRGBColorSpace,
	NoColorSpace,
	HalfFloatType,
	DataUtils,
	WebGLCoordinateSystem,
	FloatType
} from 'three';

/**
 * Utility class for creating instances of {@link LightProbe}.
 *
 * @hideconstructor
 * @three_import import { LightProbeGenerator } from 'three/addons/lights/LightProbeGenerator.js';
 */
class LightProbeGenerator {

	/**
	 * Creates a light probe from the given (radiance) environment map.
	 * The method expects that the environment map is represented as a cube texture.
	 *
	 * @param {CubeTexture} cubeTexture - The environment map.
	 * @return {LightProbe} The created light probe.
	 */
	static fromCubeTexture( cubeTexture ) {

		// https://www.ppsloan.org/publications/StupidSH36.pdf

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

				// accumulate
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

	/**
	 * Creates a light probe from the given (radiance) environment map.
	 * The method expects that the environment map is represented as a cube render target.
	 *
	 * The cube render target must be in RGBA so `cubeRenderTarget.texture.format` must be
	 * set to {@link RGBAFormat}.
	 *
	 * @async
	 * @param {WebGPURenderer|WebGLRenderer} renderer - The renderer.
	 * @param {CubeRenderTarget|WebGLCubeRenderTarget} cubeRenderTarget - The environment map.
	 * @return {Promise<LightProbe>} A Promise that resolves with the created light probe.
	 */
	static async fromCubeRenderTarget( renderer, cubeRenderTarget ) {

		const flip = renderer.coordinateSystem === WebGLCoordinateSystem ? - 1 : 1;

		// The renderTarget must be set to RGBA in order to make readRenderTargetPixels works
		let totalWeight = 0;

		const coord = new Vector3();

		const dir = new Vector3();

		const color = new Color();

		const shBasis = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];

		const sh = new SphericalHarmonics3();
		const shCoefficients = sh.coefficients;

		const dataType = cubeRenderTarget.texture.type;
		const imageWidth = cubeRenderTarget.width; // assumed to be square

		let data;

		if ( renderer.isWebGLRenderer ) {

			if ( dataType === FloatType ) {

				data = new Float32Array( imageWidth * imageWidth * 4 );

			} else if ( dataType === HalfFloatType ) {

				data = new Uint16Array( imageWidth * imageWidth * 4 );

			} else {

				// assuming UnsignedByteType

				data = new Uint8Array( imageWidth * imageWidth * 4 );

			}

		}

		for ( let faceIndex = 0; faceIndex < 6; faceIndex ++ ) {

			if ( renderer.isWebGLRenderer ) {

				await renderer.readRenderTargetPixelsAsync( cubeRenderTarget, 0, 0, imageWidth, imageWidth, data, faceIndex );

			} else {

				data = await renderer.readRenderTargetPixelsAsync( cubeRenderTarget, 0, 0, imageWidth, imageWidth, 0, faceIndex );

			}

			const pixelSize = 2 / imageWidth;

			for ( let i = 0, il = data.length; i < il; i += 4 ) { // RGBA assumed

				let r, g, b;

				if ( dataType === FloatType ) {

					r = data[ i ];
					g = data[ i + 1 ];
					b = data[ i + 2 ];

				} else if ( dataType === HalfFloatType ) {

					r = DataUtils.fromHalfFloat( data[ i ] );
					g = DataUtils.fromHalfFloat( data[ i + 1 ] );
					b = DataUtils.fromHalfFloat( data[ i + 2 ] );

				} else {

					r = data[ i ] / 255;
					g = data[ i + 1 ] / 255;
					b = data[ i + 2 ] / 255;

				}

				// pixel color
				color.setRGB( r, g, b );

				// convert to linear color space
				convertColorToLinear( color, cubeRenderTarget.texture.colorSpace );

				// pixel coordinate on unit cube

				const pixelIndex = i / 4;

				const col = ( 1 - ( pixelIndex % imageWidth + 0.5 ) * pixelSize ) * flip;

				const row = 1 - ( Math.floor( pixelIndex / imageWidth ) + 0.5 ) * pixelSize;

				switch ( faceIndex ) {

					case 0: coord.set( - 1 * flip, row, col * flip ); break;

					case 1: coord.set( 1 * flip, row, - col * flip ); break;

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

				// accumulate
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
