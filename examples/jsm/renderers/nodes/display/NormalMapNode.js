import PositionNode from '../accessors/PositionNode.js';
import NormalNode from '../accessors/NormalNode.js';
import UVNode from '../accessors/UVNode.js';
import MathNode from '../math/MathNode.js';
import OperatorNode from '../math/OperatorNode.js';
import FloatNode from '../inputs/FloatNode.js';
import TempNode from '../core/TempNode.js';
import FunctionNode from '../core/FunctionNode.js';
import ModelNode from '../accessors/ModelNode.js';

import { TangentSpaceNormalMap, ObjectSpaceNormalMap } from 'three';

// Normal Mapping Without Precomputed Tangents
// http://www.thetenthplanet.de/archives/1180

export const perturbNormal2Arb = new FunctionNode( `
vec3 ( vec3 eye_pos, vec3 surf_norm, vec3 mapN, float faceDirection, const in vec2 uv ) {

	// Workaround for Adreno 3XX dFd*( vec3 ) bug. See #9988

	vec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );
	vec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );
	vec2 st0 = dFdx( uv.st );
	vec2 st1 = dFdy( uv.st );

	vec3 N = surf_norm; // normalized

	vec3 q1perp = cross( q1, N );
	vec3 q0perp = cross( N, q0 );

	vec3 T = q1perp * st0.x + q0perp * st1.x;
	vec3 B = q1perp * st0.y + q0perp * st1.y;

	float det = max( dot( T, T ), dot( B, B ) );
	float scale = ( det == 0.0 ) ? 0.0 : faceDirection * inversesqrt( det );

	return normalize( T * ( mapN.x * scale ) + B * ( mapN.y * scale ) + N * mapN.z );

}` );

class NormalMapNode extends TempNode {

	constructor( value ) {

		super( 'vec3' );

		this.value = value;

		this.normalMapType = TangentSpaceNormalMap;

	}

	generate( builder ) {

		const type = this.getNodeType( builder );

		const normalMapType = this.normalMapType;

		const normalOP = new OperatorNode( '*', this.value, new FloatNode( 2.0 ).setConst( true ) );
		const normalMap = new OperatorNode( '-', normalOP, new FloatNode( 1.0 ).setConst( true ) );

		if ( normalMapType === ObjectSpaceNormalMap ) {

			const vertexNormalNode = new OperatorNode( '*', new ModelNode( ModelNode.NORMAL_MATRIX ), normalMap );

			const normal = new MathNode( MathNode.NORMALIZE, vertexNormalNode );

			return normal.build( builder, type );

		} else if ( normalMapType === TangentSpaceNormalMap ) {

			const perturbNormal2ArbCall = perturbNormal2Arb.call( {
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
