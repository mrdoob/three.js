/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { NodeUtils } from '../core/NodeUtils.js';

export class MathNode extends TempNode {

	constructor( method, a, b, c ) {

		super();

		this.method = method;

		this.a = NodeBuilder.resolve( a );
		this.b = NodeBuilder.resolve( b );
		this.c = NodeBuilder.resolve( c );

		this.nodeType = "Math";

	}

	getNumInputs() {

		switch ( this.method ) {

			case MathNode.MIX:
			case MathNode.CLAMP:
			case MathNode.REFRACT:
			case MathNode.SMOOTHSTEP:
			case MathNode.FACEFORWARD:

				return 3;

			case MathNode.MIN:
			case MathNode.MAX:
			case MathNode.MOD:
			case MathNode.STEP:
			case MathNode.REFLECT:
			case MathNode.DISTANCE:
			case MathNode.DOT:
			case MathNode.CROSS:
			case MathNode.POW:

				return 2;

			default:

				return 1;

		}

	};

	getInputType( builder ) {

		var a = builder.getTypeLength( this.a.getType( builder ) );
		var b = this.b ? builder.getTypeLength( this.b.getType( builder ) ) : 0;
		var c = this.c ? builder.getTypeLength( this.c.getType( builder ) ) : 0;

		if ( a > b && a > c ) {

			return this.a.getType( builder );

		} else if ( b > c ) {

			return this.b.getType( builder );

		}

		return this.c.getType( builder );

	};

	getType( builder ) {

		switch ( this.method ) {

			case MathNode.LENGTH:
			case MathNode.DISTANCE:
			case MathNode.DOT:

				return 'f';

			case MathNode.CROSS:

				return 'v3';

		}

		return this.getInputType( builder );

	};

	generate( builder, output ) {

		var a, b, c,
			al = this.a ? builder.getTypeLength( this.a.getType( builder ) ) : 0,
			bl = this.b ? builder.getTypeLength( this.b.getType( builder ) ) : 0,
			cl = this.c ? builder.getTypeLength( this.c.getType( builder ) ) : 0,
			inputType = this.getInputType( builder ),
			nodeType = this.getType( builder );

		switch ( this.method ) {

			// 1 input

			case MathNode.NEGATE:

				return builder.format( '( -' + this.a.build( builder, inputType ) + ' )', inputType, output );

			case MathNode.INVERT:

				return builder.format( '( 1.0 - ' + this.a.build( builder, inputType ) + ' )', inputType, output );

				// 2 inputs

			case MathNode.CROSS:

				a = this.a.build( builder, 'v3' );
				b = this.b.build( builder, 'v3' );

				break;

			case MathNode.STEP:

				a = this.a.build( builder, al === 1 ? 'f' : inputType );
				b = this.b.build( builder, inputType );

				break;

			case MathNode.MIN:
			case MathNode.MAX:
			case MathNode.MOD:

				a = this.a.build( builder, inputType );
				b = this.b.build( builder, bl === 1 ? 'f' : inputType );

				break;

				// 3 inputs

			case MathNode.REFRACT:

				a = this.a.build( builder, inputType );
				b = this.b.build( builder, inputType );
				c = this.c.build( builder, 'f' );

				break;

			case MathNode.MIX:

				a = this.a.build( builder, inputType );
				b = this.b.build( builder, inputType );
				c = this.c.build( builder, cl === 1 ? 'f' : inputType );

				break;

				// default

			default:

				a = this.a.build( builder, inputType );
				if ( this.b ) b = this.b.build( builder, inputType );
				if ( this.c ) c = this.c.build( builder, inputType );

				break;

		}

		// build function call

		var params = [];
		params.push( a );
		if ( b ) params.push( b );
		if ( c ) params.push( c );

		var numInputs = this.getNumInputs( builder );

		if ( params.length !== numInputs ) {

			throw Error( `Arguments not match used in "${this.method}". Require ${numInputs}, currently ${params.length}.` );

		}

		return builder.format( this.method + '( ' + params.join( ', ' ) + ' )', nodeType, output );

	}

	copy( source ) {

		super.copy( source );

		this.method = source.method;

		this.a = source.a;
		this.b = source.b;
		this.c = source.c;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.method = this.method;

			data.a = this.a.toJSON( meta ).uuid;
			if ( this.b ) data.b = this.b.toJSON( meta ).uuid;
			if ( this.c ) data.c = this.c.toJSON( meta ).uuid;

		}

		return data;

	}

}

// 1 input

MathNode.RAD = 'radians';
MathNode.DEG = 'degrees';
MathNode.EXP = 'exp';
MathNode.EXP2 = 'exp2';
MathNode.LOG = 'log';
MathNode.LOG2 = 'log2';
MathNode.SQRT = 'sqrt';
MathNode.INV_SQRT = 'inversesqrt';
MathNode.FLOOR = 'floor';
MathNode.CEIL = 'ceil';
MathNode.NORMALIZE = 'normalize';
MathNode.FRACT = 'fract';
MathNode.SATURATE = 'saturate';
MathNode.SIN = 'sin';
MathNode.COS = 'cos';
MathNode.TAN = 'tan';
MathNode.ASIN = 'asin';
MathNode.ACOS = 'acos';
MathNode.ARCTAN = 'atan';
MathNode.ABS = 'abs';
MathNode.SIGN = 'sign';
MathNode.LENGTH = 'length';
MathNode.NEGATE = 'negate';
MathNode.INVERT = 'invert';

// 2 inputs

MathNode.MIN = 'min';
MathNode.MAX = 'max';
MathNode.MOD = 'mod';
MathNode.STEP = 'step';
MathNode.REFLECT = 'reflect';
MathNode.DISTANCE = 'distance';
MathNode.DOT = 'dot';
MathNode.CROSS = 'cross';
MathNode.POW = 'pow';

// 3 inputs

MathNode.MIX = 'mix';
MathNode.CLAMP = 'clamp';
MathNode.REFRACT = 'refract';
MathNode.SMOOTHSTEP = 'smoothstep';
MathNode.FACEFORWARD = 'faceforward';

// proxys

const RadianNode = NodeUtils.createProxyClass( MathNode, MathNode.RADIANS );
const DegreesNode = NodeUtils.createProxyClass( MathNode, MathNode.DEGREES );
const ExpNode = NodeUtils.createProxyClass( MathNode, MathNode.EXP );
const Exp2Node = NodeUtils.createProxyClass( MathNode, MathNode.EXP2 );
const LogNode = NodeUtils.createProxyClass( MathNode, MathNode.LOG );
const Log2Node = NodeUtils.createProxyClass( MathNode, MathNode.LOG2 );
const SqrtNode = NodeUtils.createProxyClass( MathNode, MathNode.SQRT );
const InvSqrtNode = NodeUtils.createProxyClass( MathNode, MathNode.INV_SQRT );
const FloorNode = NodeUtils.createProxyClass( MathNode, MathNode.FLOOR );
const CeilNode = NodeUtils.createProxyClass( MathNode, MathNode.CEIL );
const NormalizeNode = NodeUtils.createProxyClass( MathNode, MathNode.NORMALIZE );
const FractNode = NodeUtils.createProxyClass( MathNode, MathNode.FRACT );
const SaturateNode = NodeUtils.createProxyClass( MathNode, MathNode.SATURATE );
const SinNode = NodeUtils.createProxyClass( MathNode, MathNode.SIN );
const CosNode = NodeUtils.createProxyClass( MathNode, MathNode.COS );
const TanNode = NodeUtils.createProxyClass( MathNode, MathNode.TAN );
const AsinNode = NodeUtils.createProxyClass( MathNode, MathNode.ASIN );
const AcosNode = NodeUtils.createProxyClass( MathNode, MathNode.ACOS );
const ArctanNode = NodeUtils.createProxyClass( MathNode, MathNode.ARCTAN );
const AbsNode = NodeUtils.createProxyClass( MathNode, MathNode.ABS );
const SignNode = NodeUtils.createProxyClass( MathNode, MathNode.SIGN );
const LengthNode = NodeUtils.createProxyClass( MathNode, MathNode.LENGTH );
const NegateNode = NodeUtils.createProxyClass( MathNode, MathNode.NEGATE );
const InvertNode = NodeUtils.createProxyClass( MathNode, MathNode.INVERT );

const MinNode = NodeUtils.createProxyClass( MathNode, MathNode.MIN );
const MaxNode = NodeUtils.createProxyClass( MathNode, MathNode.MAX );
const ModNode = NodeUtils.createProxyClass( MathNode, MathNode.MOD );
const StepNode = NodeUtils.createProxyClass( MathNode, MathNode.STEP );
const MathReflectNode = NodeUtils.createProxyClass( MathNode, MathNode.REFLECT );
const DistanceNode = NodeUtils.createProxyClass( MathNode, MathNode.DISTANCE );
const DotNode = NodeUtils.createProxyClass( MathNode, MathNode.DOT );
const CrossNode = NodeUtils.createProxyClass( MathNode, MathNode.CROSS );
const PowNode = NodeUtils.createProxyClass( MathNode, MathNode.POW );

const MixNode = NodeUtils.createProxyClass( MathNode, MathNode.MIX );
const ClampNode = NodeUtils.createProxyClass( MathNode, MathNode.CLAMP );
const MathRefractNode = NodeUtils.createProxyClass( MathNode, MathNode.REFRACT );
const SmoothstepNode = NodeUtils.createProxyClass( MathNode, MathNode.SMOOTHSTEP );
const FaceforwardNode = NodeUtils.createProxyClass( MathNode, MathNode.FACEFORWARD );

export { 
	RadianNode,
	DegreesNode,
	ExpNode, 
	Exp2Node,
	LogNode,
	Log2Node,
	SqrtNode,
	InvSqrtNode,
	FloorNode,
	CeilNode,
	NormalizeNode,
	FractNode,
	SaturateNode,
	SinNode,
	CosNode,
	TanNode,
	AsinNode,
	AcosNode,
	ArctanNode,
	AbsNode,
	SignNode,
	LengthNode,
	NegateNode,
	InvertNode,
	MinNode,
	MaxNode,
	ModNode,
	StepNode,
	MathReflectNode,
	DistanceNode,
	DotNode,
	CrossNode,
	PowNode,
	MixNode,
	ClampNode,
	MathRefractNode,
	SmoothstepNode,
	FaceforwardNode
};