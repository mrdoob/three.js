import TempNode from '../core/TempNode.js';
import { EPSILON } from '../math/MathNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, tslFn, nodeProxy, vec3 } from '../shadernode/ShaderNode.js';

export const BurnNode = tslFn( ( { base, blend } ) => {

	const fn = ( c ) => blend[ c ].lessThan( EPSILON ).cond( blend[ c ], base[ c ].oneMinus().div( blend[ c ] ).oneMinus().max( 0 ) );

	return vec3( fn( 'x' ), fn( 'y' ), fn( 'z' ) );

} );

export const DodgeNode = tslFn( ( { base, blend } ) => {

	const fn = ( c ) => blend[ c ].equal( 1.0 ).cond( blend[ c ], base[ c ].div( blend[ c ].oneMinus() ).max( 0 ) );

	return vec3( fn( 'x' ), fn( 'y' ), fn( 'z' ) );

} );

export const ScreenNode = tslFn( ( { base, blend } ) => {

	const fn = ( c ) => base[ c ].oneMinus().mul( blend[ c ].oneMinus() ).oneMinus();

	return vec3( fn( 'x' ), fn( 'y' ), fn( 'z' ) );

} );

export const OverlayNode = tslFn( ( { base, blend } ) => {

	const fn = ( c ) => base[ c ].lessThan( 0.5 ).cond( base[ c ].mul( blend[ c ], 2.0 ), base[ c ].oneMinus().mul( blend[ c ].oneMinus() ).oneMinus() );

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

			outputNode = BurnNode( params );

		} else if ( blendMode === BlendModeNode.DODGE ) {

			outputNode = DodgeNode( params );

		} else if ( blendMode === BlendModeNode.SCREEN ) {

			outputNode = ScreenNode( params );

		} else if ( blendMode === BlendModeNode.OVERLAY ) {

			outputNode = OverlayNode( params );

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
