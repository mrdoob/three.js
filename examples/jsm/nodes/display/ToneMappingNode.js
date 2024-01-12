import TempNode from '../core/TempNode.js';
import { addNodeClass } from '../core/Node.js';
import { tslFn, nodeObject, float, mat3, vec3 } from '../shadernode/ShaderNode.js';

import { NoToneMapping, LinearToneMapping, ReinhardToneMapping, CineonToneMapping, ACESFilmicToneMapping, AgXToneMapping } from 'three';
import { clamp, log2, max, pow } from '../math/MathNode.js';
import { mul } from '../math/OperatorNode.js';

// exposure only
const LinearToneMappingNode = tslFn( ( { color, exposure } ) => {

	return color.mul( exposure ).clamp();

} );

// source: https://www.cs.utah.edu/docs/techreports/2002/pdf/UUCS-02-001.pdf
const ReinhardToneMappingNode = tslFn( ( { color, exposure } ) => {

	color = color.mul( exposure );

	return color.div( color.add( 1.0 ) ).clamp();

} );

// source: http://filmicworlds.com/blog/filmic-tonemapping-operators/
const OptimizedCineonToneMappingNode = tslFn( ( { color, exposure } ) => {

	// optimized filmic operator by Jim Hejl and Richard Burgess-Dawson
	color = color.mul( exposure );
	color = color.sub( 0.004 ).max( 0.0 );

	const a = color.mul( color.mul( 6.2 ).add( 0.5 ) );
	const b = color.mul( color.mul( 6.2 ).add( 1.7 ) ).add( 0.06 );

	return a.div( b ).pow( 2.2 );

} );

// source: https://github.com/selfshadow/ltc_code/blob/master/webgl/shaders/ltc/ltc_blit.fs
const RRTAndODTFit = tslFn( ( { color } ) => {

	const a = color.mul( color.add( 0.0245786 ) ).sub( 0.000090537 );
	const b = color.mul( color.add( 0.4329510 ).mul( 0.983729 ) ).add( 0.238081 );

	return a.div( b );

} );

// source: https://github.com/selfshadow/ltc_code/blob/master/webgl/shaders/ltc/ltc_blit.fs
const ACESFilmicToneMappingNode = tslFn( ( { color, exposure } ) => {

	// sRGB => XYZ => D65_2_D60 => AP1 => RRT_SAT
	const ACESInputMat = mat3(
		0.59719, 0.35458, 0.04823,
		0.07600, 0.90834, 0.01566,
		0.02840, 0.13383, 0.83777
	);

	// ODT_SAT => XYZ => D60_2_D65 => sRGB
	const ACESOutputMat = mat3(
		1.60475, - 0.53108, - 0.07367,
		- 0.10208, 1.10813, - 0.00605,
		- 0.00327, - 0.07276, 1.07602
	);

	color = color.mul( exposure ).div( 0.6 );

	color = ACESInputMat.mul( color );

	// Apply RRT and ODT
	color = RRTAndODTFit( { color } );

	color = ACESOutputMat.mul( color );

	// Clamp to [0, 1]
	return color.clamp();

} );



const LINEAR_REC2020_TO_LINEAR_SRGB = mat3( vec3( 1.6605, - 0.1246, - 0.0182 ), vec3( - 0.5876, 1.1329, - 0.1006 ), vec3( - 0.0728, - 0.0083, 1.1187 ) );
const LINEAR_SRGB_TO_LINEAR_REC2020 = mat3( vec3( 0.6274, 0.0691, 0.0164 ), vec3( 0.3293, 0.9195, 0.0880 ), vec3( 0.0433, 0.0113, 0.8956 ) );

const agxDefaultContrastApprox = tslFn( ( [ x_immutable ] ) => {

	const x = vec3( x_immutable ).toVar();
	const x2 = vec3( x.mul( x ) ).toVar();
	const x4 = vec3( x2.mul( x2 ) ).toVar();

	return float( 15.5 ).mul( x4.mul( x2 ) ).sub( mul( 40.14, x4.mul( x ) ) ).add( mul( 31.96, x4 ).sub( mul( 6.868, x2.mul( x ) ) ).add( mul( 0.4298, x2 ).add( mul( 0.1191, x ).sub( 0.00232 ) ) ) );

} );

const AGXToneMappingNode = tslFn( ( { color, exposure } ) => {

	const colortone = vec3( color ).toVar();
	const AgXInsetMatrix = mat3( vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ), vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ), vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 ) );
	const AgXOutsetMatrix = mat3( vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ), vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ), vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 ) );
	const AgxMinEv = float( - 12.47393 );
	const AgxMaxEv = float( 4.026069 );
	colortone.mulAssign( exposure );
	colortone.assign( LINEAR_SRGB_TO_LINEAR_REC2020.mul( colortone ) );
	colortone.assign( AgXInsetMatrix.mul( colortone ) );
	colortone.assign( max( colortone, 1e-10 ) );
	colortone.assign( log2( colortone ) );
	colortone.assign( colortone.sub( AgxMinEv ).div( AgxMaxEv.sub( AgxMinEv ) ) );
	colortone.assign( clamp( colortone, 0.0, 1.0 ) );
	colortone.assign( agxDefaultContrastApprox( colortone ) );
	colortone.assign( AgXOutsetMatrix.mul( colortone ) );
	colortone.assign( pow( max( vec3( 0.0 ), colortone ), vec3( 2.2 ) ) );
	colortone.assign( LINEAR_REC2020_TO_LINEAR_SRGB.mul( colortone ) );
	colortone.assign( clamp( colortone, 0.0, 1.0 ) );

	return colortone;

} );


const toneMappingLib = {
	[ LinearToneMapping ]: LinearToneMappingNode,
	[ ReinhardToneMapping ]: ReinhardToneMappingNode,
	[ CineonToneMapping ]: OptimizedCineonToneMappingNode,
	[ ACESFilmicToneMapping ]: ACESFilmicToneMappingNode,
	[ AgXToneMapping ]: AGXToneMappingNode
};

class ToneMappingNode extends TempNode {

	constructor( toneMapping = NoToneMapping, exposureNode = float( 1 ), colorNode = null ) {

		super( 'vec3' );

		this.toneMapping = toneMapping;

		this.exposureNode = exposureNode;
		this.colorNode = colorNode;

	}

	getCacheKey() {

		let cacheKey = super.getCacheKey();
		cacheKey = '{toneMapping:' + this.toneMapping + ',nodes:' + cacheKey + '}';

		return cacheKey;

	}

	setup( builder ) {

		const colorNode = this.colorNode || builder.context.color;
		const toneMapping = this.toneMapping;

		if ( toneMapping === NoToneMapping ) return colorNode;

		const toneMappingParams = { exposure: this.exposureNode, color: colorNode };
		const toneMappingNode = toneMappingLib[ toneMapping ];

		let outputNode = null;

		if ( toneMappingNode ) {

			outputNode = toneMappingNode( toneMappingParams );

		} else {

			console.error( 'ToneMappingNode: Unsupported Tone Mapping configuration.', toneMapping );

			outputNode = colorNode;

		}

		return outputNode;

	}

}

export default ToneMappingNode;

export const toneMapping = ( mapping, exposure, color ) => nodeObject( new ToneMappingNode( mapping, nodeObject( exposure ), nodeObject( color ) ) );

addNodeClass( 'ToneMappingNode', ToneMappingNode );
