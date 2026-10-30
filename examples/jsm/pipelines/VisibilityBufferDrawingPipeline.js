import {
	StorageBufferAttribute,
	IndirectStorageBufferAttribute,
	Mesh,
	BoxGeometry,
	BufferGeometry,
	Float32BufferAttribute
} from 'three/webgpu';

import {
	Fn, If, Loop, vec2, vec3, vec4, mat3, uint, float, int, min, max, floor, sqrt, select, struct, transformNormal,
	storage, uniform, instanceIndex, vertexIndex, screenCoordinate, varyingProperty,
	positionGeometry, cameraViewMatrix, cameraProjectionMatrix, normalize, context, overrideNodes,
	positionLocal, positionWorld, positionWorldDirection, positionView, positionViewDirection,
	normalLocal, normalViewGeometry, normalWorldGeometry, tangentViewFrame, bitangentViewFrame, modelWorldMatrix, modelViewMatrix, modelPosition, atomicMax, atomicAdd, atomicStore, atomicLoad
} from 'three/tsl';

import { MeshletDrawingPipeline, MeshletBatch, cacheAttributes, createDebugMaterial, createDrawMaterial, createOcclusion } from './MeshletDrawingPipeline.js';
import { MESHLET_SIZE } from '../utils/MeshletGeometryUtils.js';

// visibility buffer packing — the depth occupies the bits above each payload

const TRIANGLE_INDEX_BITS = 16;
const INSTANCE_INDEX_BITS = 17;
const TRIANGLE_INDEX_MASK = 2 ** TRIANGLE_INDEX_BITS - 1;
const INSTANCE_INDEX_MASK = 2 ** INSTANCE_INDEX_BITS - 1;
const DEPTH_TRI_MAX = 2 ** ( 32 - TRIANGLE_INDEX_BITS ) - 1;
const DEPTH_INST_MAX = 2 ** ( 32 - INSTANCE_INDEX_BITS ) - 1;

const MAX_TRIANGLES = TRIANGLE_INDEX_MASK + 1;
const MAX_INSTANCES = INSTANCE_INDEX_MASK + 1;

// the large triangles of one batch drawn by the hardware rasterizer per frame, limited by the vertices of the pulled geometry

const MAX_HW_TRIANGLES = 65536;

let _resolveGeometry = null;
let _fullscreenGeometry = null;

// the corners of a triangle deformed by the position node of the material, see deformTriangle()

const DeformedTriangle = /*@__PURE__*/ struct( { positions: 'mat3', normals: 'mat3' }, 'DeformedTriangle' );

const edgeFunction = /*@__PURE__*/ Fn( ( [ a, b, c ] ) => {

	return c.y.sub( a.y ).mul( b.x.sub( a.x ) ).sub( c.x.sub( a.x ).mul( b.y.sub( a.y ) ) );

} );

/**
 * Returns the positions and the normals of the corners of a triangle deformed by the position node of the material, in
 * the space of the object: the node is evaluated per corner with the position, the normal and the attributes of the
 * vertex, and the position and the normal transformed by the instance matrix, like the regular instancing of node
 * materials. The normal assigned to `normalLocal` by the position node is the normal of the corner.
 *
 * @private
 * @param {Node<vec3>} positionNode - The position node of the material.
 * @param {Object} vertex - The functions reading the position, the normal and the attributes of a vertex.
 * @param {Array<Node<uint>>} corners - The addresses of the vertices of the corners.
 * @param {Node<mat4>} instanceMatrix - The instance matrix, identity for objects which are not instanced meshes.
 * @param {Node<uint>} instance - The instance index of the material.
 * @return {Node} The deformed positions and normals, one column per corner, see DeformedTriangle.
 */
function deformTriangle( positionNode, { position, normal, vertexUv, hasAttribute, attribute }, corners, instanceMatrix, instance ) {

	return Fn( () => {

		const address = uint( 0 ).toVar();
		const cornerNormal = vec3( 0 ).toVar();
		const positions = [ vec3( 0 ).toVar(), vec3( 0 ).toVar(), vec3( 0 ).toVar() ];
		const normals = [ vec3( 0 ).toVar(), vec3( 0 ).toVar(), vec3( 0 ).toVar() ];

		const geometryPosition = position( address );
		const geometryNormal = normal( address );

		const getAttribute = cacheAttributes( ( name ) => {

			if ( name === 'position' ) return geometryPosition;
			if ( name === 'normal' ) return geometryNormal;
			if ( name === 'uv' ) return vertexUv( address );

			return hasAttribute( name ) ? attribute( name, address ) : null;

		} );

		const deformed = context( positionNode.overrideNodes( [
			[ positionLocal, instanceMatrix.mul( vec4( geometryPosition, 1.0 ) ).xyz ],
			[ normalLocal, cornerNormal ],
			[ instanceIndex, instance ]
		] ), { getAttribute } );

		// the node is built once, in the loop over the corners

		Loop( { start: 0, end: 3, type: 'int' }, ( { i } ) => {

			address.assign( select( i.equal( 0 ), corners[ 0 ], select( i.equal( 1 ), corners[ 1 ], corners[ 2 ] ) ) );
			cornerNormal.assign( transformNormal( geometryNormal, instanceMatrix ) );

			const value = vec3( deformed ).toVar();

			If( i.equal( 0 ), () => {

				positions[ 0 ].assign( value );
				normals[ 0 ].assign( cornerNormal );

			} ).ElseIf( i.equal( 1 ), () => {

				positions[ 1 ].assign( value );
				normals[ 1 ].assign( cornerNormal );

			} ).Else( () => {

				positions[ 2 ].assign( value );
				normals[ 2 ].assign( cornerNormal );

			} );

		} );

		return DeformedTriangle( mat3( positions[ 0 ], positions[ 1 ], positions[ 2 ] ), mat3( normals[ 0 ], normals[ 1 ], normals[ 2 ] ) );

	} )();

}

/**
 * Returns a context which feeds the surface of the merged object covering the current fragment into
 * the material graph: position and normal in local, world and view space, the model matrices and the
 * first uv channel. The nodes of the material evaluate the merged object instead of the drawing mesh.
 * If a uv gradient is given, textures sampled with the first uv channel use it instead of the hardware
 * derivatives, which are invalid if neighbor fragments belong to other triangles. The same applies to
 * the tangent frame of normal maps without precomputed tangents. Other attributes of the geometry are
 * provided by the given attribute function. The surface only exists in the fragment stage, so the nodes
 * are overridden in the fragment stage and the varyings derived from them are evaluated there as well.
 *
 * @private
 * @param {Object} surface - The reconstructed surface.
 * @return {ContextNode} The context node.
 */
function createSurfaceContext( { localPosition, localNormal, worldPosition, worldNormal, uv, uvGradient = null, tangentFrame = null, matrixWorld, attribute } ) {

	const viewPosition = cameraViewMatrix.mul( vec4( worldPosition, 1.0 ) ).xyz;

	const overrides = [
		[ positionLocal, localPosition ],
		[ positionWorld, worldPosition ],
		[ positionWorldDirection, normalize( matrixWorld.mul( vec4( localPosition, 0.0 ) ).xyz ) ],
		[ positionView, viewPosition ],
		[ positionViewDirection, viewPosition.negate().normalize() ],
		[ normalLocal, normalize( localNormal ) ],
		[ normalWorldGeometry, normalize( worldNormal ) ],
		[ normalViewGeometry, cameraViewMatrix.mul( vec4( worldNormal, 0.0 ) ).xyz.normalize() ],
		[ modelWorldMatrix, matrixWorld ],
		[ modelViewMatrix, cameraViewMatrix.mul( matrixWorld ) ],
		[ modelPosition, matrixWorld.mul( vec4( 0.0, 0.0, 0.0, 1.0 ) ).xyz ]
	];

	if ( tangentFrame !== null ) overrides.push( [ tangentViewFrame, tangentFrame[ 0 ] ], [ bitangentViewFrame, tangentFrame[ 1 ] ] );

	return overrideNodes( overrides, context( {
		getAttribute: cacheAttributes( ( name ) => name === 'uv' ? uv : attribute( name ) ),
		getTextureGradient: uvGradient !== null ? () => uvGradient : null
	} ), 'fragment' );

}

/**
 * Creates the visibility buffers of a view, shared by all batches of a render list, and the compute
 * node clearing them. The instances of all batches share one index range, each batch owns a slice.
 *
 * @private
 * @param {number} width - The width of the view in pixels.
 * @param {number} height - The height of the view in pixels.
 * @return {Object} The view.
 */
function createView( width, height ) {

	const pixels = width * height;

	// depth(16) | triangle(16) and depth(15) | instance(17)

	const screenTriAttribute = new StorageBufferAttribute( new Uint32Array( pixels ), 1 );
	const screenInstAttribute = new StorageBufferAttribute( new Uint32Array( pixels ), 1 );

	const screenTriAtomic = storage( screenTriAttribute, 'uint', pixels ).toAtomic();
	const screenInstAtomic = storage( screenInstAttribute, 'uint', pixels ).toAtomic();

	const computeClear = Fn( () => {

		atomicStore( screenTriAtomic.element( instanceIndex ), uint( 0 ) );
		atomicStore( screenInstAtomic.element( instanceIndex ), uint( 0 ) );

	} )().compute( pixels, [ 256 ] ).setName( 'VisibilityBufferDrawingPipeline Clear' );

	return {
		width,
		height,
		screenTriAtomic,
		screenTriRead: storage( screenTriAttribute, 'uint', pixels ).toReadOnly(),
		screenInstAtomic,
		screenInstRead: storage( screenInstAttribute, 'uint', pixels ).toReadOnly(),
		computeClear,
		dispose() {

			computeClear.dispose();
			screenTriAttribute.dispose();
			screenInstAttribute.dispose();

		}
	};

}


/**
 * A batch drawing the visible clusters into a visibility buffer: a compute shader rasterizes the small
 * triangles in software and queues the large ones for the hardware rasterizer. A resolve draws the bounding
 * box of each object and shades the fragments whose visible triangle belongs to the object.
 *
 * @private
 * @augments MeshletBatch
 */
class VisibilityBufferBatch extends MeshletBatch {

	/**
	 * Creates the software rasterizer, the hardware path of the large triangles and the resolve.
	 *
	 * @param {Object} shared - The nodes and resources of the batch.
	 */
	setupDraw( shared ) {

		const {
			createAttribute, clusters, material, renderer, receiveShadow, debug,
			position, normal, vertexUv, hasAttribute, attribute, indexBuffer, instanceWorld, instanceMvp, objectWorld, instanceLocal, instanceData,
			workQueue, workQueueCountRead, maxWorkItems, projScreenMatrix, viewSize
		} = shared;

		// the position node of the material is evaluated per corner of the triangles by the software rasterizer and by the
		// resolve. the world matrices of the culling approximate the deformation, the real ones are the matrices of the
		// objects. the instance index of the material is the index of the instance in its instanced mesh

		const deformed = this.deformed;
		const vertex = { position, normal, vertexUv, hasAttribute, attribute };
		const stride = this.instanceDataStride;

		const deformCorners = ( corners, instId ) => deformTriangle( material.positionNode, vertex, corners, instanceLocal.element( instId ), uint( instanceData.element( instId.mul( stride ) ).x ) );

		// the batches of the visibility buffer draw one geometry, the triangles of the visibility buffer are indexed
		// from the first triangle of the geometry in the geometry pool

		const triangleBase = this.triangleBase = uniform( this.pool.add( clusters ), 'uint' );

		this.maxRasterSize = uniform( 8, 'int' );

		// the slice of the instance index range of the view owned by this batch

		this.instanceOffset = uniform( 0, 'uint' );

		const { maxRasterSize, instanceOffset } = this;

		// visibility buffers shared by all batches of the view

		const { screenTriAtomic, screenTriRead, screenInstAtomic, screenInstRead } = this.view;

		const dispatchAttribute = createAttribute( new Uint32Array( 3 ), 3, IndirectStorageBufferAttribute );
		const dispatchBuffer = storage( dispatchAttribute, 'uint', 3 );

		// the software rasterizer sends large triangles to the hardware queue, the counter followed by [ instance, triangle ] pairs

		const hwQueueAttribute = createAttribute( new Uint32Array( 1 + MAX_HW_TRIANGLES * 2 ), 1 );
		const hwQueueAtomic = storage( hwQueueAttribute, 'uint', 1 + MAX_HW_TRIANGLES * 2 ).toAtomic();
		const hwQueueRead = storage( hwQueueAttribute, 'uint', 1 + MAX_HW_TRIANGLES * 2 ).toReadOnly();

		const hwDrawAttribute = createAttribute( new Uint32Array( 4 ), 4, IndirectStorageBufferAttribute );
		const hwDrawBuffer = storage( hwDrawAttribute, 'uint', 4 );

		const computeHWReset = Fn( () => {

			atomicStore( hwQueueAtomic.element( 0 ), uint( 0 ) );

		} )().compute( 1 ).setName( 'VisibilityBufferDrawingPipeline Reset' );

		// indirect dispatch arguments, split into 2D if exceeding 65535 workgroups

		const computeDispatch = Fn( () => {

			const workgroups = min( workQueueCountRead.element( 0 ), maxWorkItems );
			const maxDimension = uint( 65535 );

			dispatchBuffer.element( 0 ).assign( min( workgroups, maxDimension ) );
			dispatchBuffer.element( 1 ).assign( workgroups.add( maxDimension ).sub( 1 ).div( maxDimension ) );
			dispatchBuffer.element( 2 ).assign( 1 );

		} )().compute( 1 ).setName( 'VisibilityBufferDrawingPipeline Dispatch' );

		// software rasterizer — one thread per triangle of a cluster

		const computeRasterize = Fn( () => {

			const totalThreads = min( workQueueCountRead.element( 0 ), maxWorkItems ).mul( MESHLET_SIZE );

			If( instanceIndex.lessThan( totalThreads ), () => {

				const workItem = workQueue.element( instanceIndex.div( MESHLET_SIZE ) );
				const instId = workItem.x;
				const lodTriangleStart = workItem.y;
				const lodNumTriangles = workItem.z;
				const chunk = workItem.w;

				const lodTriangle = chunk.mul( MESHLET_SIZE ).add( instanceIndex.mod( MESHLET_SIZE ) );

				If( lodTriangle.lessThan( lodNumTriangles ), () => {

					const megaTriangleIndex = lodTriangleStart.add( lodTriangle );
					const indexOffset = megaTriangleIndex.mul( 3 );

					const corners = [ indexBuffer.element( indexOffset ), indexBuffer.element( indexOffset.add( 1 ) ), indexBuffer.element( indexOffset.add( 2 ) ) ];

					let p0, p1, p2;

					if ( deformed === true ) {

						const deformedPositions = deformCorners( corners, instId ).get( 'positions' );
						const mvp = projScreenMatrix.mul( objectWorld.element( instId ) ).toVar();

						p0 = mvp.mul( vec4( deformedPositions.element( 0 ), 1.0 ) );
						p1 = mvp.mul( vec4( deformedPositions.element( 1 ), 1.0 ) );
						p2 = mvp.mul( vec4( deformedPositions.element( 2 ), 1.0 ) );

					} else {

						const mvp = instanceMvp.element( instId );

						p0 = mvp.mul( vec4( position( corners[ 0 ] ), 1.0 ) );
						p1 = mvp.mul( vec4( position( corners[ 1 ] ), 1.0 ) );
						p2 = mvp.mul( vec4( position( corners[ 2 ] ), 1.0 ) );

					}

					const enqueueHardware = () => {

						const hwCount = atomicAdd( hwQueueAtomic.element( 0 ), 1 );

						If( hwCount.lessThan( MAX_HW_TRIANGLES ), () => {

							const slot = hwCount.mul( 2 ).add( 1 );

							atomicStore( hwQueueAtomic.element( slot ), instId );
							atomicStore( hwQueueAtomic.element( slot.add( 1 ) ), megaTriangleIndex );

						} );

					};

					// triangles crossing the near plane need clipping, so they go to the hardware rasterizer

					If( p0.w.greaterThan( 0.0 ).and( p1.w.greaterThan( 0.0 ) ).and( p2.w.greaterThan( 0.0 ) ), () => {

						const ndc0 = p0.xyz.div( p0.w );
						const ndc1 = p1.xyz.div( p1.w );
						const ndc2 = p2.xyz.div( p2.w );

						// back-face culling

						If( edgeFunction( ndc0, ndc1, ndc2 ).greaterThan( 0.0 ), () => {

							const ndcMinX = min( ndc0.x, min( ndc1.x, ndc2.x ) );
							const ndcMaxX = max( ndc0.x, max( ndc1.x, ndc2.x ) );
							const ndcMinY = min( ndc0.y, min( ndc1.y, ndc2.y ) );
							const ndcMaxY = max( ndc0.y, max( ndc1.y, ndc2.y ) );

							If( ndcMaxX.greaterThan( - 1.0 ).and( ndcMinX.lessThan( 1.0 ) ).and( ndcMaxY.greaterThan( - 1.0 ) ).and( ndcMinY.lessThan( 1.0 ) ), () => {

								const w = viewSize.x;
								const h = viewSize.y;

								const s0 = ndc0.xy.add( 1.0 ).mul( 0.5 ).mul( vec2( w, h ) );
								const s1 = ndc1.xy.add( 1.0 ).mul( 0.5 ).mul( vec2( w, h ) );
								const s2 = ndc2.xy.add( 1.0 ).mul( 0.5 ).mul( vec2( w, h ) );

								const startX = int( floor( max( 0.0, min( s0.x, min( s1.x, s2.x ) ) ) ) );
								const endX = int( floor( min( w.sub( 1.0 ), max( s0.x, max( s1.x, s2.x ) ) ) ) );
								const startY = int( floor( max( 0.0, min( s0.y, min( s1.y, s2.y ) ) ) ) );
								const endY = int( floor( min( h.sub( 1.0 ), max( s0.y, max( s1.y, s2.y ) ) ) ) );

								// only small triangles are rasterized in software, the others go to the hardware queue

								If( startX.lessThanEqual( endX ).and( startY.lessThanEqual( endY ) ).and( endX.sub( startX ).lessThanEqual( maxRasterSize ) ).and( endY.sub( startY ).lessThanEqual( maxRasterSize ) ), () => {

									const area = edgeFunction( s0, s1, s2 );

									const stepX_w0 = s1.y.sub( s2.y );
									const stepY_w0 = s2.x.sub( s1.x );
									const stepX_w1 = s2.y.sub( s0.y );
									const stepY_w1 = s0.x.sub( s2.x );
									const stepX_w2 = s0.y.sub( s1.y );
									const stepY_w2 = s1.x.sub( s0.x );

									// top-left rule for watertight edges

									const bias0 = stepX_w0.lessThan( 0.0 ).or( stepX_w0.equal( 0.0 ).and( stepY_w0.greaterThan( 0.0 ) ) ).select( 0.0, - 1e-5 );
									const bias1 = stepX_w1.lessThan( 0.0 ).or( stepX_w1.equal( 0.0 ).and( stepY_w1.greaterThan( 0.0 ) ) ).select( 0.0, - 1e-5 );
									const bias2 = stepX_w2.lessThan( 0.0 ).or( stepX_w2.equal( 0.0 ).and( stepY_w2.greaterThan( 0.0 ) ) ).select( 0.0, - 1e-5 );

									const pStart = vec2( float( startX ).add( 0.5 ), float( startY ).add( 0.5 ) );

									const row_w0 = edgeFunction( s1, s2, pStart ).add( bias0 ).toVar();
									const row_w1 = edgeFunction( s2, s0, pStart ).add( bias1 ).toVar();
									const row_w2 = edgeFunction( s0, s1, pStart ).add( bias2 ).toVar();

									// incremental depth

									const row_z = row_w0.div( area ).mul( ndc0.z ).add( row_w1.div( area ).mul( ndc1.z ) ).add( row_w2.div( area ).mul( ndc2.z ) ).toVar();

									const stepX_z = stepX_w0.div( area ).mul( ndc0.z ).add( stepX_w1.div( area ).mul( ndc1.z ) ).add( stepX_w2.div( area ).mul( ndc2.z ) );
									const stepY_z = stepY_w0.div( area ).mul( ndc0.z ).add( stepY_w1.div( area ).mul( ndc1.z ) ).add( stepY_w2.div( area ).mul( ndc2.z ) );

									Loop( { name: 'y', type: 'int', start: startY, end: endY, condition: '<=' }, ( { y } ) => {

										const w0 = row_w0.toVar();
										const w1 = row_w1.toVar();
										const w2 = row_w2.toVar();
										const z = row_z.toVar();

										Loop( { name: 'x', type: 'int', start: startX, end: endX, condition: '<=' }, ( { x } ) => {

											If( w0.greaterThanEqual( 0.0 ).and( w1.greaterThanEqual( 0.0 ) ).and( w2.greaterThanEqual( 0.0 ) ).and( z.greaterThanEqual( 0.0 ) ).and( z.lessThanEqual( 1.0 ) ), () => {

												// depth with a fourth-root distribution, packed above each payload

												const zEncoded = sqrt( sqrt( float( 1.0 ).sub( z ) ) );
												const depthTri = uint( zEncoded.mul( DEPTH_TRI_MAX ) );
												const depthInst = uint( zEncoded.mul( DEPTH_INST_MAX ) );

												const pixelIndex = uint( y ).mul( uint( w ) ).add( uint( x ) );

												// the depth occupies the high bits, so atomicMax resolves the depth test and the payload together

												If( depthTri.greaterThanEqual( atomicLoad( screenTriAtomic.element( pixelIndex ) ).shiftRight( TRIANGLE_INDEX_BITS ) ), () => {

													atomicMax( screenTriAtomic.element( pixelIndex ), depthTri.shiftLeft( TRIANGLE_INDEX_BITS ).bitOr( megaTriangleIndex.sub( triangleBase ).bitAnd( TRIANGLE_INDEX_MASK ) ) );
													atomicMax( screenInstAtomic.element( pixelIndex ), depthInst.shiftLeft( INSTANCE_INDEX_BITS ).bitOr( instanceOffset.add( instId ) ) );

												} );

											} );

											w0.addAssign( stepX_w0 );
											w1.addAssign( stepX_w1 );
											w2.addAssign( stepX_w2 );
											z.addAssign( stepX_z );

										} );

										row_w0.addAssign( stepY_w0 );
										row_w1.addAssign( stepY_w1 );
										row_w2.addAssign( stepY_w2 );
										row_z.addAssign( stepY_z );

									} );

								} ).ElseIf( startX.lessThanEqual( endX ).and( startY.lessThanEqual( endY ) ), enqueueHardware );

							} );

						} );

					} ).ElseIf( p0.w.greaterThan( 0.0 ).or( p1.w.greaterThan( 0.0 ) ).or( p2.w.greaterThan( 0.0 ) ), enqueueHardware );

				} );

			} );

		} )().compute( dispatchAttribute ).setName( 'VisibilityBufferDrawingPipeline Rasterize' );

		// indirect draw arguments of the hardware path

		const computeHWArgs = Fn( () => {

			hwDrawBuffer.element( 0 ).assign( min( atomicLoad( hwQueueAtomic.element( 0 ) ), uint( MAX_HW_TRIANGLES ) ).mul( 3 ) );
			hwDrawBuffer.element( 1 ).assign( uint( 1 ) );
			hwDrawBuffer.element( 2 ).assign( uint( 0 ) );
			hwDrawBuffer.element( 3 ).assign( uint( 0 ) );

		} )().compute( 1 ).setName( 'VisibilityBufferDrawingPipeline HW Args' );


		this.computeNodes.push( computeHWReset, computeDispatch, computeRasterize, computeHWArgs );

		// hardware path — the large triangles queued by the software rasterizer

		const slot = vertexIndex.div( 3 ).mul( 2 ).add( 1 );

		this.hwMesh = this.createPulledMesh( hwDrawAttribute, {
			instance: hwQueueRead.element( slot ),
			triangle: hwQueueRead.element( slot.add( 1 ) ),
			corner: vertexIndex.mod( 3 )
		}, shared );

		// resolve — shades the visibility buffer through the material graph

		// the resolve draws the bounding box of each object, so every fragment is only shaded by the box of
		// the object visible in it — a fullscreen resolve would run the material for the whole screen per batch.
		// the back faces cover the object even if the camera is inside its box. the winding of the box is
		// reversed instead of using BackSide, which would negate the normals of the material.

		if ( _resolveGeometry === null ) {

			_resolveGeometry = new BoxGeometry();

			const index = _resolveGeometry.index;

			for ( let i = 0; i < index.count; i += 3 ) {

				const b = index.getX( i + 1 );

				index.setX( i + 1, index.getX( i + 2 ) );
				index.setX( i + 2, b );

			}

		}

		const vResolveInstance = varyingProperty( 'uint', 'vVisibilityBufferInstance' );

		const boxMin = uniform( clusters.boundingBox.min.clone() );
		const boxSize = uniform( clusters.boundingBox.max.clone().sub( clusters.boundingBox.min ) );

		const resolveVertex = Fn( () => {

			vResolveInstance.assign( instanceIndex );

			if ( deformed === true ) {

				// the box of the deformed positions: the world matrix of the culling approximates the deformation, the box
				// grows by the margin of the deformation. deformations which can't be bounded are resolved fullscreen

				const bounds = this.culling.instanceBounds.element( this.rangeNodes.dataOffset.add( instanceIndex ) );
				const margin = bounds.x.div( bounds.w.abs() );
				const boxPosition = positionGeometry.add( 0.5 ).mul( boxSize.add( margin.mul( 2 ) ) ).add( boxMin.sub( margin ) );
				const clipPosition = cameraProjectionMatrix.mul( cameraViewMatrix ).mul( instanceWorld.element( instanceIndex ) ).mul( vec4( boxPosition, 1.0 ) );

				return select( this.unbounded.greaterThan( 0 ), vec4( 0 ), clipPosition );

			}

			const boxPosition = positionGeometry.add( 0.5 ).mul( boxSize ).add( boxMin );

			return cameraProjectionMatrix.mul( cameraViewMatrix ).mul( instanceWorld.element( instanceIndex ) ).mul( vec4( boxPosition, 1.0 ) );

		} )();

		// the rasterizer addresses the screen bottom-up, screenCoordinate is top-down

		const flippedY = viewSize.y.sub( screenCoordinate.y );
		const pixelIndex = uint( flippedY ).mul( uint( viewSize.x ) ).add( uint( screenCoordinate.x ) );

		const packedTri = screenTriRead.element( pixelIndex );
		const megaTriangleIndex = packedTri.bitAnd( TRIANGLE_INDEX_MASK ).add( triangleBase );
		// the fragment is shaded if the object visible in it is the object of the box

		const globalInstance = screenInstRead.element( pixelIndex ).bitAnd( INSTANCE_INDEX_MASK );
		const ownedByBox = globalInstance.equal( instanceOffset.add( vResolveInstance ) );
		const instId = globalInstance.sub( instanceOffset );

		// the fullscreen resolve shades the fragments of all objects of the batch

		this.resolveCount = uniform( 0, 'uint' );

		const ownedByBatch = instId.lessThan( this.resolveCount );

		const i0 = indexBuffer.element( megaTriangleIndex.mul( 3 ) );
		const i1 = indexBuffer.element( megaTriangleIndex.mul( 3 ).add( 1 ) );
		const i2 = indexBuffer.element( megaTriangleIndex.mul( 3 ).add( 2 ) );

		let matrixWorld, l0, l1, l2, n0, n1, n2;

		if ( deformed === true ) {

			const deformedTriangle = deformCorners( [ i0, i1, i2 ], instId );
			const deformedPositions = deformedTriangle.get( 'positions' );
			const deformedNormals = deformedTriangle.get( 'normals' );

			matrixWorld = objectWorld.element( instId );

			l0 = deformedPositions.element( 0 );
			l1 = deformedPositions.element( 1 );
			l2 = deformedPositions.element( 2 );

			n0 = deformedNormals.element( 0 );
			n1 = deformedNormals.element( 1 );
			n2 = deformedNormals.element( 2 );

		} else {

			matrixWorld = instanceWorld.element( instId );

			l0 = position( i0 );
			l1 = position( i1 );
			l2 = position( i2 );

			n0 = normal( i0 );
			n1 = normal( i1 );
			n2 = normal( i2 );

		}

		const p0 = projScreenMatrix.mul( matrixWorld ).mul( vec4( l0, 1.0 ) );
		const p1 = projScreenMatrix.mul( matrixWorld ).mul( vec4( l1, 1.0 ) );
		const p2 = projScreenMatrix.mul( matrixWorld ).mul( vec4( l2, 1.0 ) );

		const screenScale = vec2( viewSize.x, viewSize.y );
		const s0 = p0.xy.div( p0.w ).add( 1.0 ).mul( 0.5 ).mul( screenScale );
		const s1 = p1.xy.div( p1.w ).add( 1.0 ).mul( 0.5 ).mul( screenScale );
		const s2 = p2.xy.div( p2.w ).add( 1.0 ).mul( 0.5 ).mul( screenScale );

		const p = vec2( screenCoordinate.x, flippedY );

		// perspective correct barycentrics from the edge functions weighted by the inverse clip w

		const e0 = edgeFunction( s1, s2, p );
		const e1 = edgeFunction( s2, s0, p );
		const e2 = edgeFunction( s0, s1, p );

		const q0 = float( 1.0 ).div( p0.w );
		const q1 = float( 1.0 ).div( p1.w );
		const q2 = float( 1.0 ).div( p2.w );

		const sum = e0.mul( q0 ).add( e1.mul( q1 ) ).add( e2.mul( q2 ) );
		const safeSum = sum.equal( 0.0 ).select( 1.0, sum );

		const interpolate = ( a0, a1, a2 ) => a0.mul( e0.mul( q0 ) ).add( a1.mul( e1.mul( q1 ) ) ).add( a2.mul( e2.mul( q2 ) ) ).div( safeSum );

		// analytic screen-space derivatives, neighbor fragments can belong to other triangles —
		// the derivatives of the edge functions along the screen x and y axes, with the same
		// orientation as the hardware derivatives

		const dx = ( a0, a1, a2, value ) => derivative( a0, a1, a2, value, s2.y.sub( s1.y ), s0.y.sub( s2.y ), s1.y.sub( s0.y ) );
		const dy = ( a0, a1, a2, value ) => derivative( a0, a1, a2, value, s1.x.sub( s2.x ), s2.x.sub( s0.x ), s0.x.sub( s1.x ) );

		const derivative = ( a0, a1, a2, value, d0, d1, d2 ) => d0.mul( q0 ).mul( a0.sub( value ) ).add( d1.mul( q1 ).mul( a1.sub( value ) ) ).add( d2.mul( q2 ).mul( a2.sub( value ) ) ).div( safeSum );

		const uv0 = vertexUv( i0 );
		const uv1 = vertexUv( i1 );
		const uv2 = vertexUv( i2 );

		const uv = interpolate( uv0, uv1, uv2 );
		const uvDx = dx( uv0, uv1, uv2, uv );
		const uvDy = dy( uv0, uv1, uv2, uv );

		const localPosition = interpolate( l0, l1, l2 );
		const localNormal = interpolate( n0, n1, n2 );
		const worldPosition = matrixWorld.mul( vec4( localPosition, 1.0 ) ).xyz;
		const worldNormal = matrixWorld.mul( vec4( localNormal, 0.0 ) ).xyz;

		// tangent frame of normal maps from the analytic derivatives, see TangentUtils

		const modelView = cameraViewMatrix.mul( matrixWorld );

		const v0 = modelView.mul( vec4( l0, 1.0 ) ).xyz;
		const v1 = modelView.mul( vec4( l1, 1.0 ) ).xyz;
		const v2 = modelView.mul( vec4( l2, 1.0 ) ).xyz;

		const viewPosition = interpolate( v0, v1, v2 );
		const viewNormal = cameraViewMatrix.mul( vec4( worldNormal, 0.0 ) ).xyz.normalize();

		const q1perp = dy( v0, v1, v2, viewPosition ).cross( viewNormal );
		const q0perp = viewNormal.cross( dx( v0, v1, v2, viewPosition ) );

		const tangent = q1perp.mul( uvDx.x ).add( q0perp.mul( uvDy.x ) );
		const bitangent = q1perp.mul( uvDx.y ).add( q0perp.mul( uvDy.y ) );

		const det = tangent.dot( tangent ).max( bitangent.dot( bitangent ) );
		const frameScale = det.equal( 0.0 ).select( 0.0, det.inverseSqrt() );

		// depth from the high bits with the fourth-root distribution reversed, zero means not covered

		const depthTri = packedTri.shiftRight( TRIANGLE_INDEX_BITS );
		const depthEncoded = float( depthTri ).div( DEPTH_TRI_MAX );
		const depthSquared = depthEncoded.mul( depthEncoded );

		const createResolveMaterial = ( vertexNode, owned ) => {

			let resolveMaterial;

			if ( debug === true ) {

				resolveMaterial = createDebugMaterial( megaTriangleIndex.div( MESHLET_SIZE ), instId );

			} else {

				resolveMaterial = createDrawMaterial( material, renderer );
				resolveMaterial.positionNode = null;
				resolveMaterial.receivedShadowPositionNode = worldPosition;
				resolveMaterial.contextNode = createSurfaceContext( {
					localPosition,
					localNormal,
					worldPosition,
					worldNormal,
					uv,
					uvGradient: [ uvDx, uvDy ],
					tangentFrame: [ tangent.mul( frameScale ), bitangent.mul( frameScale ) ],
					matrixWorld,
					attribute: ( name ) => {

						return hasAttribute( name ) ? interpolate( attribute( name, i0 ), attribute( name, i1 ), attribute( name, i2 ) ) : null;

					}
				} );

			}

			resolveMaterial.vertexNode = vertexNode;
			resolveMaterial.depthNode = float( 1.0 ).sub( depthSquared.mul( depthSquared ) );
			resolveMaterial.maskNode = depthTri.notEqual( uint( 0 ) ).and( owned );

			return resolveMaterial;

		};

		this.resolveMesh = new Mesh( _resolveGeometry, createResolveMaterial( resolveVertex, ownedByBox ) );
		this.resolveMesh.frustumCulled = false;
		this.resolveMesh.receiveShadow = receiveShadow;

		this.meshes.push( this.resolveMesh, this.hwMesh );

		// deformations which can't be bounded are resolved by one fullscreen triangle instead of the boxes

		if ( deformed === true ) {

			if ( _fullscreenGeometry === null ) {

				_fullscreenGeometry = new BufferGeometry();
				_fullscreenGeometry.setAttribute( 'position', new Float32BufferAttribute( [ - 1, - 1, 0, 3, - 1, 0, - 1, 3, 0 ], 3 ) );

			}

			const fullscreenVertex = select( this.unbounded.greaterThan( 0 ), vec4( positionGeometry.xy, 0.0, 1.0 ), vec4( 0 ) );

			this.fullscreenMesh = new Mesh( _fullscreenGeometry, createResolveMaterial( fullscreenVertex, ownedByBatch ) );
			this.fullscreenMesh.frustumCulled = false;
			this.fullscreenMesh.receiveShadow = receiveShadow;

			this.meshes.push( this.fullscreenMesh );

		}

	}

	update( ...parameters ) {

		super.update( ...parameters );

		// Compaction can move this geometry without rebuilding its batch.

		this.triangleBase.value = this.pool.add( this.clusters );

		const pipeline = parameters[ 1 ];

		this.maxRasterSize.value = pipeline.maxRasterSize;
		this.resolveCount.value = this.count;

	}

}

/**
 * A meshlet drawing pipeline with a hybrid rasterizer. Like {@link MeshletDrawingPipeline}, compute shaders select the
 * level of detail and cull objects and clusters, but the visible clusters are rasterized into a visibility
 * buffer: small triangles in software by a compute shader, large triangles by the hardware rasterizer. A
 * resolve pass shades the visibility buffer with the material of the meshes: its node graph is evaluated on
 * the reconstructed surface (position, normal, model matrices and the attributes of the geometry) with
 * analytic derivatives, so custom nodes, lights, shadows and the environment work as usual and the meshes
 * depth test against other objects.
 *
 * The visibility buffer stores the triangle in 16 bits, so only the levels of detail whose triangles fit
 * into this range are used. Geometries whose most detailed level doesn't fit are drawn by the hardware
 * pipeline of {@link MeshletDrawingPipeline}. The resolve only writes the color, so render calls with MRT, like the
 * velocity of TRAA, draw all clusters with the hardware pipeline. The position node of the material is evaluated
 * per corner of the triangles by the software rasterizer and by the resolve.
 *
 * ```js
 * renderer.drawingPipeline = new VisibilityBufferDrawingPipeline();
 * ```
 *
 * This class is experimental and its interface might change.
 *
 * @augments MeshletDrawingPipeline
 */
class VisibilityBufferDrawingPipeline extends MeshletDrawingPipeline {

	/**
	 * Constructs a new visibility buffer drawing pipeline.
	 *
	 * @param {Object} [parameters] - The configuration parameter.
	 * @param {number} [parameters.lodThreshold=1] - The projected error in pixels below which a simpler level of detail is selected.
	 * @param {number} [parameters.shadowLodThreshold=1] - The projected error in shadow map texels below which a simpler level of detail is selected for shadow casters.
	 * @param {number} [parameters.maxRasterSize=8] - The maximum screen-space size in pixels of triangles rasterized in software.
	 * @param {boolean} [parameters.debug=false] - Whether the clusters should be shown with a flat color each instead of the material.
	 * @param {boolean} [parameters.occlusionCulling=true] - Whether the clusters hidden by other clusters should be culled.
	 */
	constructor( { lodThreshold, shadowLodThreshold, maxRasterSize = 8, debug, occlusionCulling } = {} ) {

		super( { lodThreshold, shadowLodThreshold, debug, occlusionCulling } );

		this._hardware = false;

		/**
		 * The maximum screen-space size in pixels of triangles rasterized in software.
		 * Larger triangles are drawn by the hardware rasterizer. The software rasterizer
		 * loops over the pixels of a triangle in one thread, so it only pays off for small
		 * triangles.
		 *
		 * @type {number}
		 * @default 8
		 */
		this.maxRasterSize = maxRasterSize;

	}

	/**
	 * The maximum number of objects per render list, limited by the instance index of the visibility buffer.
	 *
	 * @type {number}
	 * @readonly
	 */
	get maxInstances() {

		return MAX_INSTANCES;

	}

	updateView( record, width, height ) {

		// shadow passes are drawn by the hardware rasterizer of the base pipeline

		if ( this._shadowPass === true ) return null;

		// the resolve only writes the color and the software rasterizer doesn't apply the deformation of the render call:
		// render calls with MRT or deformed positions draw all clusters with the hardware rasterizer

		const hardware = this.renderer.getMRT() !== null || this._boundsNode !== null;

		if ( record.view !== null && record.view.hardware !== hardware ) {

			record.view.dispose();
			record.view = null;

		}

		this._hardware = hardware;

		return super.updateView( record, width, height );

	}

	_isSupportedMaterial( material ) {

		// the software rasterizer doesn't discard fragments

		// the resolve doesn't write the MRT outputs of the material

		if ( material.isNodeMaterial === true && ( ( material.maskNode !== null && material.maskNode !== undefined ) || ( material.mrtNode !== null && material.mrtNode !== undefined ) ) ) return false;

		return super._isSupportedMaterial( material );

	}

	_canMergeLevels() {

		// the resolve shades a batch with one material, the levels of LOD objects are drawn as separate objects

		return false;

	}

	_usesDepthPrepass() {

		// the resolve shades every pixel once, the large triangles of the hardware path are drawn directly

		return false;

	}

	createView( width, height, occlusion ) {

		if ( this._hardware === true ) {

			const view = super.createView( width, height, occlusion );

			if ( view !== null ) view.hardware = true;

			return view;

		}

		const view = createView( width, height );
		view.hardware = false;
		const disposeBuffers = view.dispose;

		view.occlusion = occlusion === true ? createOcclusion( width, height ) : null;
		view.dispose = () => {

			disposeBuffers();

			if ( view.occlusion !== null ) view.occlusion.dispose();

		};

		return view;

	}

	/**
	 * The batches of the software rasterizer index the triangles of one geometry, each geometry has its own batches.
	 *
	 * @param {Object} clusters - The cluster data of the geometry.
	 * @return {Object} The key.
	 */
	_getBatchKey( clusters ) {

		return clusters;

	}

	createBatch( entry, capacity, view, culling ) {

		// the levels of detail whose triangles fit into the triangle index of the visibility buffer,
		// the levels are ordered from the most detailed one

		// the instances of instanced meshes are drawn as objects, their world matrices are computed on the GPU. the resolve
		// doesn't read the instanced attributes of the geometry and the instance colors, these instanced meshes are drawn by the hardware rasterizer

		// the software rasterizer doesn't evaluate the alpha of alpha-tested materials

		if ( this._shadowPass === true || ( entry.instanced === true && ( entry.clusters.instancedAttributes.length > 0 || entry.instanceColor === true ) ) || entry.material.alphaTest > 0 || view === null || view.hardware === true ) return super.createBatch( entry, capacity, view, culling );

		const lodTriangleEnds = entry.clusters.lodTriangleEnds;

		let lodCount = 0;

		while ( lodCount < lodTriangleEnds.length && lodTriangleEnds[ lodCount ] <= MAX_TRIANGLES ) lodCount ++;

		if ( lodCount === 0 ) return super.createBatch( entry, capacity, view, culling );

		const source = entry.source !== null ? entry.source.batch : null;

		return new VisibilityBufferBatch( entry.clusters, entry.material, entry.receiveShadow, capacity, this.renderer, culling, { debug: this.debug, lodCount, view, instanced: entry.instanced, source, queueBudget: entry.queueBudget, maxChunks: entry.maxChunks, pool: this._geometryPool } );

	}

}

export { VisibilityBufferDrawingPipeline };
