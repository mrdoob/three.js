import Node, { addNodeClass } from '../core/Node.js';
import { normalLocal } from './NormalNode.js';
import { positionLocal } from './PositionNode.js';
import { nodeProxy, vec3, mat3, mat4, int, ivec2, float, tslFn } from '../shadernode/ShaderNode.js';
import { textureLoad } from './TextureNode.js';
import { textureSize } from './TextureSizeNode.js';
import { tangentLocal } from './TangentNode.js';
import { batchingIndex } from '../core/IndexNode.js';
import { uniform } from '../core/UniformNode.js';

class BatchNode extends Node {

	constructor( batchMesh ) {

		super( 'void' );

		this.batchMesh = batchMesh;


		this.instanceColorNode = null;

		this.batchingIdNode = null;

	}

	setup( builder ) {

		// POSITION

		if ( this.batchingIdNode === null ) {

			if ( builder.getBatchingIndex() === false ) {

				const gl_DrawID = uniform( 0, 'uint' ).label( 'gl_DrawID' );
				this.batchMesh.gl_DrawID = gl_DrawID;

				this.batchingIdNode = gl_DrawID;

			} else {

				this.batchingIdNode = batchingIndex;

			}

		}

		const getIndirectIndex = tslFn( ( [ id ] ) => {

			const size = textureSize( textureLoad( this.batchMesh._indirectTexture ), 0 );
			const x = int( id ).remainder( int( size ) );
			const y = int( id ).div( int( size ) );
			return textureLoad( this.batchMesh._indirectTexture, ivec2( x, y ) ).x.toFloat();

		} ).setLayout( {
			name: 'getIndirectIndex',
			type: 'float',
			inputs: [
				{ name: 'id', type: 'int' }
			]
		} );

		const matriceTexture = this.batchMesh._matricesTexture;

		const size = textureSize( textureLoad( matriceTexture ), 0 );
		const j = float( getIndirectIndex( int( this.batchingIdNode ) ) ).mul( 4 ).toVar();

		const x = int( j.mod( size ) );
		const y = int( j ).div( int( size ) );
		const batchingMatrix = mat4(
			textureLoad( matriceTexture, ivec2( x, y ) ),
			textureLoad( matriceTexture, ivec2( x.add( 1 ), y ) ),
			textureLoad( matriceTexture, ivec2( x.add( 2 ), y ) ),
			textureLoad( matriceTexture, ivec2( x.add( 3 ), y ) )
		);

		const bm = mat3(
			batchingMatrix[ 0 ].xyz,
			batchingMatrix[ 1 ].xyz,
			batchingMatrix[ 2 ].xyz
		 );

		positionLocal.assign( batchingMatrix.mul( positionLocal ) );

		const transformedNormal = normalLocal.div( vec3( bm[ 0 ].dot( bm[ 0 ] ), bm[ 1 ].dot( bm[ 1 ] ), bm[ 2 ].dot( bm[ 2 ] ) ) );

		const batchingNormal = bm.mul( transformedNormal ).xyz;

		normalLocal.assign( batchingNormal );

		if ( builder.hasGeometryAttribute( 'tangent' ) ) {

			tangentLocal.mulAssign( bm );

		}

	}

}

export default BatchNode;

export const batch = nodeProxy( BatchNode );

addNodeClass( 'batch', BatchNode );
