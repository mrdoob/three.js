import TempNode from '../core/TempNode.js';
import { /*mix, step,*/ EPSILON } from '../math/MathNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, tslFn, nodeProxy, vec3 } from '../shadernode/ShaderNode.js';

export const BurnNode = tslFn( ( { base, blend } ) => {

	const fn = ( c ) => blend[ c ].lessThan( EPSILON ).cond( blend[ c ], base[ c ].oneMinus().div( blend[ c ] ).oneMinus().max( 0 ) );

	return vec3( fn( 'x' ), fn( 'y' ), fn( 'z' ) );

} ).setLayout( {
	name: 'burnColor',
	type: 'vec3',
	inputs: [
		{ name: 'base', type: 'vec3' },
		{ name: 'blend', type: 'vec3' }
	]
} );

export const DodgeNode = tslFn( ( { base, blend } ) => {

	const fn = ( c ) => blend[ c ].equal( 1.0 ).cond( blend[ c ], base[ c ].div( blend[ c ].oneMinus() ).max( 0 ) );

	return vec3( fn( 'x' ), fn( 'y' ), fn( 'z' ) );

} ).setLayout( {
	name: 'dodgeColor',
	type: 'vec3',
	inputs: [
		{ name: 'base', type: 'vec3' },
		{ name: 'blend', type: 'vec3' }
	]
} );

export const ScreenNode = tslFn( ( { base, blend } ) => {

	const fn = ( c ) => base[ c ].oneMinus().mul( blend[ c ].oneMinus() ).oneMinus();

	return vec3( fn( 'x' ), fn( 'y' ), fn( 'z' ) );

} ).setLayout( {
	name: 'screenColor',
	type: 'vec3',
	inputs: [
		{ name: 'base', type: 'vec3' },
		{ name: 'blend', type: 'vec3' }
	]
} );

export const OverlayNode = tslFn( ( { base, blend } ) => {

	const fn = ( c ) => base[ c ].lessThan( 0.5 ).cond( base[ c ].mul( blend[ c ], 2.0 ), base[ c ].oneMinus().mul( blend[ c ].oneMinus() ).oneMinus() );
	//const fn = ( c ) => mix( base[ c ].oneMinus().mul( blend[ c ].oneMinus() ).oneMinus(), base[ c ].mul( blend[ c ], 2.0 ), step( base[ c ], 0.5 ) );

	return vec3( fn( 'x' ), fn( 'y' ), fn( 'z' ) );

} ).setLayout( {
	name: 'overlayColor',
	type: 'vec3',
	inputs: [
		{ name: 'base', type: 'vec3' },
		{ name: 'blend', type: 'vec3' }
	]
} );

class BlendModeNode extends TempNode {

	constructor( blendMode, baseNode, blendNode ) {

		super();

		this.blendMode = blendMode;

		this.baseNode = baseNode;
		this.blendNode = blendNode;

	}

	setup() {

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

addNodeClass( 'BlendModeNode', BlendModeNode );
