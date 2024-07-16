import Node, { addNodeClass } from '../core/Node.js';
import { normalLocal } from './NormalNode.js';
import { positionLocal } from './PositionNode.js';
import { nodeProxy, vec3, mat3, mat4, int, ivec2, float, tslFn } from '../shadernode/ShaderNode.js';
import { textureLoad } from './TextureNode.js';
import { textureSize } from './TextureSizeNode.js';
import { tangentLocal } from './TangentNode.js';
import { instanceIndex, drawIndex } from '../core/IndexNode.js';

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

			if ( builder.getDrawIndex() === null ) {

				this.batchingIdNode = instanceIndex;

			} else {

				this.batchingIdNode = drawIndex;

			}

		}

		const getIndirectIndex = tslFn( ( [ id ] ) => {

			const size = textureSize( textureLoad( this.batchMesh._indirectTexture ), 0 );
			const x = int( id ).remainder( int( size ) );
			const y = int( id ).div( int( size ) );
			return textureLoad( this.batchMesh._indirectTexture, ivec2( x, y ) ).x;

		} ).setLayout( {
			name: 'getIndirectIndex',
			type: 'uint',
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

		const bm = mat3( batchingMatrix );

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
