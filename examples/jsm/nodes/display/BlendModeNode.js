import TempNode from '../core/Node.js';
import { ShaderNode, EPSILON, vec3, sub, mul, div, cond, lessThan, equal, max } from '../shadernode/ShaderNodeBaseElements.js';

export const BurnNode = new ShaderNode( ( { base, blend } ) => {

	const fn = ( c ) => cond( lessThan( blend[ c ], EPSILON ), blend[ c ], max( sub( 1.0, div( sub( 1.0, base[ c ] ), blend[ c ] ) ), 0 ) );

	return vec3( fn( 'x' ), fn( 'y' ), fn( 'z' ) );

} );

export const DodgeNode = new ShaderNode( ( { base, blend } ) => {

	const fn = ( c ) => cond( equal( blend[ c ], 1.0 ), blend[ c ], max( div( base[ c ], sub( 1.0, blend[ c ] ) ), 0 ) );

	return vec3( fn( 'x' ), fn( 'y' ), fn( 'z' ) );

} );

export const ScreenNode = new ShaderNode( ( { base, blend } ) => {

	const fn = ( c ) => sub( 1.0, mul( sub( 1.0, base[ c ] ), sub( 1.0, blend[ c ] ) ) );

	return vec3( fn( 'x' ), fn( 'y' ), fn( 'z' ) );

} );

export const OverlayNode = new ShaderNode( ( { base, blend } ) => {

	const fn = ( c ) => cond( lessThan( base[ c ], 0.5 ), mul( 2.0, base[ c ], blend[ c ] ), sub( 1.0, mul( sub( 1.0, base[ c ] ), sub( 1.0, blend[ c ] ) ) ) );

	return vec3( fn( 'x' ), fn( 'y' ), fn( 'z' ) );

} );

class BlendModeNode extends TempNode {

	constructor( blendMode, baseNode, blendNode ) {

		super();

		this.blendMode = blendMode;

		this.baseNode = baseNode;
		this.blendNode = blendNode;

	}

	construct() {

		const { blendMode, baseNode, blendNode } = this;
		const params = { base: baseNode, blend: blendNode };

		let outputNode = null;

		if ( blendMode === BlendModeNode.BURN ) {

			outputNode = BurnNode.call( params );

		} else if ( blendMode === BlendModeNode.DODGE ) {

			outputNode = DodgeNode.call( params );

		} else if ( blendMode === BlendModeNode.SCREEN ) {

			outputNode = ScreenNode.call( params );

		} else if ( blendMode === BlendModeNode.OVERLAY ) {

			outputNode = OverlayNode.call( params );

		}

		return outputNode;

	}

}

BlendModeNode.BURN = 'burn';
BlendModeNode.DODGE = 'dodge';
BlendModeNode.SCREEN = 'screen';
BlendModeNode.OVERLAY = 'overlay';

export default BlendModeNode;
