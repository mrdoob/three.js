/**
 * DFG LUT Generator (32x32)
 *
 * Generates a precomputed lookup table for the split-sum approximation
 * used in Image-Based Lighting. The 32x32 resolution provides a minimal
 * memory footprint for DataTexture usage.
 *
 * Reference: "Real Shading in Unreal Engine 4" by Brian Karis
 */

import * as fs from 'fs';

const LUT_SIZE = 32;
const SAMPLE_COUNT = 4096;

// Van der Corput sequence
function radicalInverse_VdC( bits ) {

	bits = ( bits << 16 ) | ( bits >>> 16 );
	bits = ( ( bits & 0x55555555 ) << 1 ) | ( ( bits & 0xAAAAAAAA ) >>> 1 );
	bits = ( ( bits & 0x33333333 ) << 2 ) | ( ( bits & 0xCCCCCCCC ) >>> 2 );
	bits = ( ( bits & 0x0F0F0F0F ) << 4 ) | ( ( bits & 0xF0F0F0F0 ) >>> 4 );
	bits = ( ( bits & 0x00FF00FF ) << 8 ) | ( ( bits & 0xFF00FF00 ) >>> 8 );
	return ( bits >>> 0 ) * 2.3283064365386963e-10;

}

function hammersley( i, N ) {

	return [ i / N, radicalInverse_VdC( i ) ];

}

function importanceSampleGGX( xi, N, roughness ) {

	const a = roughness * roughness;
	const phi = 2.0 * Math.PI * xi[ 0 ];
	const cosTheta = Math.sqrt( ( 1.0 - xi[ 1 ] ) / ( 1.0 + ( a * a - 1.0 ) * xi[ 1 ] ) );
	const sinTheta = Math.sqrt( 1.0 - cosTheta * cosTheta );

	const H = [
		Math.cos( phi ) * sinTheta,
		Math.sin( phi ) * sinTheta,
		cosTheta
	];

	const up = Math.abs( N[ 2 ] ) < 0.999 ? [ 0, 0, 1 ] : [ 1, 0, 0 ];
	const tangent = normalize( cross( up, N ) );
	const bitangent = cross( N, tangent );

	const sampleVec = [
		tangent[ 0 ] * H[ 0 ] + bitangent[ 0 ] * H[ 1 ] + N[ 0 ] * H[ 2 ],
		tangent[ 1 ] * H[ 0 ] + bitangent[ 1 ] * H[ 1 ] + N[ 1 ] * H[ 2 ],
		tangent[ 2 ] * H[ 0 ] + bitangent[ 2 ] * H[ 1 ] + N[ 2 ] * H[ 2 ]
	];

	return normalize( sampleVec );

}

function V_SmithGGXCorrelated( NdotV, NdotL, roughness ) {

	const a2 = Math.pow( roughness, 4.0 );
	const GGXV = NdotL * Math.sqrt( NdotV * NdotV * ( 1.0 - a2 ) + a2 );
	const GGXL = NdotV * Math.sqrt( NdotL * NdotL * ( 1.0 - a2 ) + a2 );
	return 0.5 / ( GGXV + GGXL );

}

function dot( a, b ) {

	return a[ 0 ] * b[ 0 ] + a[ 1 ] * b[ 1 ] + a[ 2 ] * b[ 2 ];

}

function cross( a, b ) {

	return [
		a[ 1 ] * b[ 2 ] - a[ 2 ] * b[ 1 ],
		a[ 2 ] * b[ 0 ] - a[ 0 ] * b[ 2 ],
		a[ 0 ] * b[ 1 ] - a[ 1 ] * b[ 0 ]
	];

}

function length( v ) {

	return Math.sqrt( dot( v, v ) );

}

function normalize( v ) {

	const len = length( v );
	return len > 0 ? [ v[ 0 ] / len, v[ 1 ] / len, v[ 2 ] / len ] : [ 0, 0, 0 ];

}

function add( a, b ) {

	return [ a[ 0 ] + b[ 0 ], a[ 1 ] + b[ 1 ], a[ 2 ] + b[ 2 ] ];

}

function scale( v, s ) {

	return [ v[ 0 ] * s, v[ 1 ] * s, v[ 2 ] * s ];

}

// Convert float32 to float16 (half float)
function floatToHalf( float ) {

	const floatView = new Float32Array( 1 );
	const int32View = new Int32Array( floatView.buffer );

	floatView[ 0 ] = float;
	const x = int32View[ 0 ];

	let bits = ( x >> 16 ) & 0x8000; // sign bit
	let m = ( x >> 12 ) & 0x07ff; // mantissa
	const e = ( x >> 23 ) & 0xff; // exponent

	// Handle special cases
	if ( e < 103 ) return bits; // Zero or denormal (too small)
	if ( e > 142 ) {

		bits |= 0x7c00; // Infinity
		bits |= ( ( e == 255 ) ? 0 : ( x & 0x007fffff ) ) >> 13; // NaN if e == 255 and mantissa != 0
		return bits;

	}

	if ( e < 113 ) {

		m |= 0x0800; // Add implicit leading bit
		bits |= ( m >> ( 114 - e ) ) + ( ( m >> ( 113 - e ) ) & 1 ); // Denormal with rounding
		return bits;

	}

	bits |= ( ( e - 112 ) << 10 ) | ( m >> 1 );
	bits += m & 1; // Rounding
	return bits;

}

function integrateBRDF( NdotV, roughness ) {

	const V = [
		Math.sqrt( 1.0 - NdotV * NdotV ),
		0.0,
		NdotV
	];

	let A = 0.0;
	let B = 0.0;
	const N = [ 0.0, 0.0, 1.0 ];

	for ( let i = 0; i < SAMPLE_COUNT; i ++ ) {

		const xi = hammersley( i, SAMPLE_COUNT );
		const H = importanceSampleGGX( xi, N, roughness );
		const L = normalize( add( scale( H, 2.0 * dot( V, H ) ), scale( V, - 1.0 ) ) );

		const NdotL = Math.max( L[ 2 ], 0.0 );
		const NdotH = Math.max( H[ 2 ], 0.0 );
		const VdotH = Math.max( dot( V, H ), 0.0 );

		if ( NdotL > 0.0 ) {

			const V_pdf = V_SmithGGXCorrelated( NdotV, NdotL, roughness ) * VdotH * NdotL / NdotH;
			const Fc = Math.pow( 1.0 - VdotH, 5.0 );

			A += ( 1.0 - Fc ) * V_pdf;
			B += Fc * V_pdf;

		}

	}

	return [ 4.0 * A / SAMPLE_COUNT, 4.0 * B / SAMPLE_COUNT ];

}

function generateDFGLUT() {

	console.log( `Generating ${LUT_SIZE}x${LUT_SIZE} DFG LUT with ${SAMPLE_COUNT} samples...` );

	const data = [];

	for ( let y = 0; y < LUT_SIZE; y ++ ) {

		const NdotV = ( y + 0.5 ) / LUT_SIZE;

		for ( let x = 0; x < LUT_SIZE; x ++ ) {

			const roughness = ( x + 0.5 ) / LUT_SIZE;
			const result = integrateBRDF( NdotV, roughness );

			data.push( result[ 0 ], result[ 1 ] );

		}

		if ( ( y + 1 ) % 8 === 0 ) {

			console.log( `Progress: ${( ( y + 1 ) / LUT_SIZE * 100 ).toFixed( 1 )}%` );

		}

	}

	console.log( 'Generation complete!' );
	return data;

}

// Save as JavaScript module
function saveAsJavaScript( data ) {

	// Convert float32 data to half floats (uint16)
	const halfFloatData = [];

	for ( let i = 0; i < data.length; i ++ ) {

		halfFloatData.push( floatToHalf( data[ i ] ) );

	}

	const rows = [];

	for ( let y = 0; y < LUT_SIZE; y ++ ) {

		const rowData = [];
		for ( let x = 0; x < LUT_SIZE; x ++ ) {

			const idx = ( y * LUT_SIZE + x ) * 2;
			rowData.push( `0x${halfFloatData[ idx ].toString( 16 ).padStart( 4, '0' )}`, `0x${halfFloatData[ idx + 1 ].toString( 16 ).padStart( 4, '0' )}` );

		}

		rows.push( `\t${rowData.join( ', ' )}` );

	}

	const webgl = `/**
 * Precomputed DFG LUT for Image-Based Lighting
 * Resolution: ${LUT_SIZE}x${LUT_SIZE}
 * Samples: ${SAMPLE_COUNT} per texel
 * Format: RG16F (2 half floats per texel: scale, bias)
 */

import { DataTexture } from '../../textures/DataTexture.js';
import { RGFormat, HalfFloatType, LinearFilter, ClampToEdgeWrapping } from '../../constants.js';

const DATA = new Uint16Array( [
${rows.join( ',\n' )}
] );

let lut = null;

export function getDFGLUT() {

	if ( lut === null ) {

		lut = new DataTexture( DATA, ${LUT_SIZE}, ${LUT_SIZE}, RGFormat, HalfFloatType );
		lut.minFilter = LinearFilter;
		lut.magFilter = LinearFilter;
		lut.wrapS = ClampToEdgeWrapping;
		lut.wrapT = ClampToEdgeWrapping;
		lut.generateMipmaps = false;
		lut.needsUpdate = true;

	}

	return lut;

}
`;

	const webgpu = `import { Fn, vec2 } from '../../tsl/TSLBase.js';
import { texture } from '../../accessors/TextureNode.js';

import { DataTexture } from '../../../textures/DataTexture.js';
import { RGFormat, HalfFloatType, LinearFilter, ClampToEdgeWrapping } from '../../../constants.js';

/**
 * Precomputed DFG LUT for Image-Based Lighting
 * Resolution: ${LUT_SIZE}x${LUT_SIZE}
 * Samples: ${SAMPLE_COUNT} per texel
 * Format: RG16F (2 half floats per texel: scale, bias)
 */

const DATA = new Uint16Array( [
${rows.join( ',\n' )}
] );

let lut = null;

const DFGApprox = /*@__PURE__*/ Fn( ( { roughness, dotNV } ) => {

	if ( lut === null ) {

		lut = new DataTexture( DATA, ${LUT_SIZE}, ${LUT_SIZE}, RGFormat, HalfFloatType );
		lut.minFilter = LinearFilter;
		lut.magFilter = LinearFilter;
		lut.wrapS = ClampToEdgeWrapping;
		lut.wrapT = ClampToEdgeWrapping;
		lut.generateMipmaps = false;
		lut.needsUpdate = true;

	}

	const uv = vec2( roughness, dotNV );

	return texture( lut, uv ).rg;

} );

export default DFGApprox;
`;

	fs.writeFileSync( './src/renderers/shaders/DFGLUTData.js', webgl );
	console.log( 'Saved WebGL version to ./src/renderers/shaders/DFGLUTData.js' );

	fs.writeFileSync( './src/nodes/functions/BSDF/DFGApprox.js', webgpu );
	console.log( 'Saved WebGPU version to ./src/nodes/functions/BSDF/DFGApprox.js' );

}

// Generate and save
const lutData = generateDFGLUT();
saveAsJavaScript( lutData );

console.log( '\nDFG LUT generation complete!' );
console.log( `Size: ${LUT_SIZE}x${LUT_SIZE} = ${LUT_SIZE * LUT_SIZE} texels` );
console.log( `Data size: ${( lutData.length * 2 / 1024 ).toFixed( 2 )} KB (Uint16/Half Float)` );
console.log( '\nThe LUT is used as a DataTexture in the renderer.' );
