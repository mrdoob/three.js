import TempNode from '../core/TempNode.js';
import { ShaderNode, positionView, normalView, uv, vec3, add, sub, mul, dFdx, dFdy, cross, max, dot, normalize, inversesqrt, faceDirection, modelNormalMatrix, TBNViewMatrix } from '../shadernode/ShaderNodeBaseElements.js';

import { TangentSpaceNormalMap, ObjectSpaceNormalMap } from 'three';

// Normal Mapping Without Precomputed Tangents
// http://www.thetenthplanet.de/archives/1180

const perturbNormal2ArbNode = new ShaderNode( ( inputs ) => {

	const { eye_pos, surf_norm, mapN, uv } = inputs;

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
	const scale = mul( faceDirection, inversesqrt( det ) );

	return normalize( add( mul( T, mul( mapN.x, scale ) ), mul( B, mul( mapN.y, scale ) ), mul( N, mapN.z ) ) );

} );

class NormalMapNode extends TempNode {

	constructor( node, scaleNode = null ) {

		super( 'vec3' );

		this.node = node;
		this.scaleNode = scaleNode;

		this.normalMapType = TangentSpaceNormalMap;

	}

	construct( builder ) {

		const { normalMapType, scaleNode } = this;

		const normalOP = mul( this.node, 2.0 );
		let normalMap = sub( normalOP, 1.0 );

		if ( scaleNode !== null ) {

			const normalMapScale = mul( normalMap.xy, scaleNode );
			normalMap = vec3( normalMapScale, normalMap.z );

		}

		let outputNode = null;

		if ( normalMapType === ObjectSpaceNormalMap ) {

			outputNode = normalize( mul( modelNormalMatrix, normalMap ) );

		} else if ( normalMapType === TangentSpaceNormalMap ) {

			const tangent = builder.hasGeometryAttribute( 'tangent' );

			if ( tangent === true ) {

				outputNode = normalize( mul( TBNViewMatrix, normalMap ) );

			} else {

				outputNode = perturbNormal2ArbNode.call( {
					eye_pos: positionView,
					surf_norm: normalView,
					mapN: normalMap,
					uv: uv()
				} );

			}

		}

		return outputNode;

	}

}

export default NormalMapNode;
