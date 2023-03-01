import TempNode from '../core/TempNode.js';
import { addNodeClass } from '../core/Node.js';
import { ShaderNode, nodeObject, float, vec3, mat3 } from '../shadernode/ShaderNode.js';

import { NoToneMapping, LinearToneMapping, ReinhardToneMapping, CineonToneMapping, ACESFilmicToneMapping } from 'three';

// exposure only
const LinearToneMappingNode = new ShaderNode( ( { color, exposure } ) => {

	return color.mul( exposure );

} );

// source: https://www.cs.utah.edu/docs/techreports/2002/pdf/UUCS-02-001.pdf
const ReinhardToneMappingNode = new ShaderNode( ( { color, exposure } ) => {

	color = color.mul( exposure );

	return color.div( color.add( 1.0 ) ).clamp();

} );

// source: http://filmicworlds.com/blog/filmic-tonemapping-operators/
const OptimizedCineonToneMappingNode = new ShaderNode( ( { color, exposure } ) => {

	// optimized filmic operator by Jim Hejl and Richard Burgess-Dawson
	color = color.mul( exposure );
	color = color.sub( 0.004 ).max( 0.0 );

	const a = color.mul( color.mul( 6.2 ).add( 0.5 ) );
	const b = color.mul( color.mul( 6.2 ).add( 1.7 ) ).add( 0.06 );

	return a.div( b ).pow( 2.2 );

} );

// source: https://github.com/selfshadow/ltc_code/blob/master/webgl/shaders/ltc/ltc_blit.fs
const RRTAndODTFit = new ShaderNode( ( { color } ) => {

	const a = color.mul( color.add( 0.0245786 ) ).sub( 0.000090537 );
	const b = color.mul( color.add( 0.4329510 ).mul( 0.983729 ) ).add( 0.238081 );

	return a.div( b );

} );

// source: https://github.com/selfshadow/ltc_code/blob/master/webgl/shaders/ltc/ltc_blit.fs
const ACESFilmicToneMappingNode = new ShaderNode( ( { color, exposure } ) => {

	// sRGB => XYZ => D65_2_D60 => AP1 => RRT_SAT
	const ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ), // transposed from source
		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);

	// ODT_SAT => XYZ => D60_2_D65 => sRGB
	const ACESOutputMat = mat3(
		vec3( 1.60475, - 0.10208, - 0.00327 ), // transposed from source
		vec3( - 0.53108, 1.10813, - 0.07276 ),
		vec3( - 0.07367, - 0.00605, 1.07602 )
	);

	color = color.mul( exposure ).div( 0.6 );

	color = ACESInputMat.mul( color );

	// Apply RRT and ODT
	color = RRTAndODTFit.call( { color } );

	color = ACESOutputMat.mul( color );

	// Clamp to [0, 1]
	return color.clamp();

} );

const toneMappingLib = {
	[ LinearToneMapping ]: LinearToneMappingNode,
	[ ReinhardToneMapping ]: ReinhardToneMappingNode,
	[ CineonToneMapping ]: OptimizedCineonToneMappingNode,
	[ ACESFilmicToneMapping ]: ACESFilmicToneMappingNode
};

class ToneMappingNode extends TempNode {

	constructor( toneMapping = NoToneMapping, exposureNode = float( 1 ), colorNode = null ) {

		super( 'vec3' );

		this.toneMapping = toneMapping;

		this.exposureNode = exposureNode;
		this.colorNode = colorNode;

	}

	construct( builder ) {

		const colorNode = this.colorNode || builder.context.color;
		const toneMapping = this.toneMapping;

		if ( toneMapping === NoToneMapping ) return colorNode;

		const toneMappingParams = { exposure: this.exposureNode, color: colorNode };
		const toneMappingNode = toneMappingLib[ toneMapping ];

		let outputNode = null;

		if ( toneMappingNode ) {

			outputNode = toneMappingNode.call( toneMappingParams );

		} else {

			console.error( 'ToneMappingNode: Unsupported Tone Mapping configuration.', toneMapping );

			outputNode = colorNode;

		}

		return outputNode;

	}

}

export default ToneMappingNode;

export const toneMapping = ( mapping, exposure, color ) => nodeObject( new ToneMappingNode( mapping, nodeObject( exposure ), nodeObject( color ) ) );

addNodeClass( ToneMappingNode );
