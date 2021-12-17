import PositionNode from '../accessors/PositionNode.js';
import NormalNode from '../accessors/NormalNode.js';
import UVNode from '../accessors/UVNode.js';
import MathNode from '../math/MathNode.js';
import OperatorNode from '../math/OperatorNode.js';
import FloatNode from '../inputs/FloatNode.js';
import TempNode from '../core/TempNode.js';
import ModelNode from '../accessors/ModelNode.js';
import { ShaderNode, cond, add, mul, dFdx, dFdy, cross, max, dot, normalize, inversesqrt, equal } from '../ShaderNode.js';

import { TangentSpaceNormalMap, ObjectSpaceNormalMap } from '../../../../../build/three.module.js';

// Normal Mapping Without Precomputed Tangents
// http://www.thetenthplanet.de/archives/1180

const perturbNormal2ArbNode = new ShaderNode( ( inputs ) => {

	const { eye_pos, surf_norm, mapN, faceDirection, uv } = inputs;

	const q0 = dFdx( eye_pos.xyz );
	const q1 = dFdy( eye_pos.xyz );
	const st0 = dFdx( uv.st );
	const st1 = dFdy( uv.st );

	const N = surf_norm; // normalized

	const q1perp = cross( q1, N );
	const q0perp = cross( N, q0 );

	const T = add( mul( q1perp, st0.x ), mul( q0perp, st1.x ) );
	const B = add( mul( q1perp, st0.y ), mul( q0perp, st1.y ) );

	const det = max( dot( T, T ), dot( B, B ) );
	const scale = cond( equal( det, 0 ), 0, mul( faceDirection, inversesqrt( det ) ) );

	return normalize( add( mul( T, mul( mapN.x, scale ) ), mul( B, mul( mapN.y, scale ) ), mul( N, mapN.z ) ) );

} );

class NormalMapNode extends TempNode {

	constructor( node ) {

		super( 'vec3' );

		this.node = node;

		this.normalMapType = TangentSpaceNormalMap;

	}

	generate( builder ) {

		const type = this.getNodeType( builder );

		const normalMapType = this.normalMapType;

		const normalOP = new OperatorNode( '*', this.node, new FloatNode( 2.0 ).setConst( true ) );
		const normalMap = new OperatorNode( '-', normalOP, new FloatNode( 1.0 ).setConst( true ) );

		if ( normalMapType === ObjectSpaceNormalMap ) {

			const vertexNormalNode = new OperatorNode( '*', new ModelNode( ModelNode.NORMAL_MATRIX ), normalMap );

			const normal = new MathNode( MathNode.NORMALIZE, vertexNormalNode );

			return normal.build( builder, type );

		} else if ( normalMapType === TangentSpaceNormalMap ) {

			const perturbNormal2ArbCall = perturbNormal2ArbNode( {
				eye_pos: new PositionNode( PositionNode.VIEW ),
				surf_norm: new NormalNode( NormalNode.VIEW ),
				mapN: normalMap,
				faceDirection: new FloatNode( 1.0 ).setConst( true ),
				uv: new UVNode()
			} );

			return perturbNormal2ArbCall.build( builder, type );

		}

	}

}

export default NormalMapNode;
