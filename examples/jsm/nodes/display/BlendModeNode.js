import TempNode from '../core/TempNode.js';
import { EPSILON } from '../math/MathNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, ShaderNode, nodeProxy, vec3 } from '../shadernode/ShaderNode.js';

export const BurnNode = new ShaderNode( ( { base, blend } ) => {

	const fn = ( c ) => blend[ c ].lessThan( EPSILON ).cond( blend[ c ], base[ c ].invert().div( blend[ c ] ).invert().max( 0 ) );

	return vec3( fn( 'x' ), fn( 'y' ), fn( 'z' ) );

} );

export const DodgeNode = new ShaderNode( ( { base, blend } ) => {

	const fn = ( c ) => blend[ c ].equal( 1.0 ).cond( blend[ c ], base[ c ].div( blend[ c ].invert() ).max( 0 ) );

	return vec3( fn( 'x' ), fn( 'y' ), fn( 'z' ) );

} );

export const ScreenNode = new ShaderNode( ( { base, blend } ) => {

	const fn = ( c ) => base[ c ].invert().mul( blend[ c ].invert() ).invert();

	return vec3( fn( 'x' ), fn( 'y' ), fn( 'z' ) );

} );

export const OverlayNode = new ShaderNode( ( { base, blend } ) => {

	const fn = ( c ) => base[ c ].lessThan( 0.5 ).cond( base[ c ].mul( blend[ c ], 2.0 ), base[ c ].invert().mul( blend[ c ].invert() ).invert() );

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

export const burn = nodeProxy( BlendModeNode, BlendModeNode.BURN );
export const dodge = nodeProxy( BlendModeNode, BlendModeNode.DODGE );
export const overlay = nodeProxy( BlendModeNode, BlendModeNode.OVERLAY );
export const screen = nodeProxy( BlendModeNode, BlendModeNode.SCREEN );

addNodeElement( 'burn', burn );
addNodeElement( 'dodge', dodge );
addNodeElement( 'overlay', overlay );
addNodeElement( 'screen', screen );

addNodeClass( BlendModeNode );
