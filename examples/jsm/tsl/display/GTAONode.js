import { DataTexture, RenderTarget, RepeatWrapping, Vector2, Vector3, TempNode, QuadMesh, NodeMaterial, PostProcessingUtils } from 'three/webgpu';
import { reference, logarithmicDepthToViewZ, viewZToPerspectiveDepth, getNormalFromDepth, getScreenPosition, getViewPosition, nodeObject, Fn, float, NodeUpdateType, uv, uniform, Loop, vec2, vec3, vec4, int, dot, max, pow, abs, If, textureSize, sin, cos, PI, texture, passTexture, mat3, add, normalize, mul, cross, div, mix, sqrt, sub, acos, clamp } from 'three/tsl';

/** @module GTAONode **/

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

let _rendererState;

/**
 * Post processing node for applying Ground Truth Ambient Occlusion (GTAO) to a scene.
 * ```js
 * const postProcessing = new THREE.PostProcessing( renderer );
 *
 * const scenePass = pass( scene, camera );
 * scenePass.setMRT( mrt( {
 * 	output: output,
 * 	normal: normalView
 * } ) );
 *
 * const scenePassColor = scenePass.getTextureNode( 'output' );
 * const scenePassNormal = scenePass.getTextureNode( 'normal' );
 * const scenePassDepth = scenePass.getTextureNode( 'depth' );
 *
 * const aoPass = ao( scenePassDepth, scenePassNormal, camera );
 *
 * postProcessing.outputNod = aoPass.getTextureNode().mul( scenePassColor );
 * ```
 *
 * Reference: {@link https://www.activision.com/cdn/research/Practical_Real_Time_Strategies_for_Accurate_Indirect_Occlusion_NEW%20VERSION_COLOR.pdf}.
 *
 * @augments TempNode
 */
class GTAONode extends TempNode {

	static get type() {

		return 'GTAONode';

	}

	/**
	 * Constructs a new GTAO node.
	 *
	 * @param {Node<float>} depthNode - A node that represents the scene's depth.
	 * @param {Node<vec3>?} normalNode - A node that represents the scene's normals.
	 * @param {Camera} camera - The camera the scene is rendered with.
	 */
	constructor( depthNode, normalNode, camera ) {

		super( 'vec4' );

		/**
		 * A node that represents the scene's depth.
		 *
		 * @type {Node<float>}
		 */
		this.depthNode = depthNode;

		/**
		 * A node that represents the scene's normals. If no normals are passed to the
		 * constructor (because MRT is not available), normals can be automatically
		 * reconstructed from depth values in the shader.
		 *
		 * @type {Node<vec3>?}
		 */
		this.normalNode = normalNode;

		/**
		 * The resolution scale. By default the effect is rendered in full resolution
		 * for best quality but a value of `0.5` should be sufficient for most scenes.
		 *
		 * @type {Number}
		 * @default 1
		 */
		this.resolutionScale = 1;

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders
		 * its effect once per frame in `updateBefore()`.
		 *
		 * @type {String}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

		/**
		 * The render target the ambient occlusion is rendered into.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._aoRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false } );
		this._aoRenderTarget.texture.name = 'GTAONode.AO';

		// uniforms

		/**
		 * The radius of the ambient occlusion.
		 *
		 * @type {UniformNode<float>}
		 */
		this.radius = uniform( 0.25 );

		/**
		 * The resolution of the effect. Can be scaled via
		 * `resolutionScale`.
		 *
		 * @type {UniformNode<vec2>}
		 */
		this.resolution = uniform( new Vector2() );

		/**
		 * The thickness of the ambient occlusion.
		 *
		 * @type {UniformNode<float>}
		 */
		this.thickness = uniform( 1 );

		/**
		 * Another option to tweak the occlusion. The recommended range is
		 * `[1,2]` for attenuating the AO.
		 *
		 * @type {UniformNode<float>}
		 */
		this.distanceExponent = uniform( 1 );

		/**
		 * The distance fall off value of the ambient occlusion.
		 * A lower value leads to a larger AO effect. The value
		 * should lie in the range `[0,1]`.
		 *
		 * @type {UniformNode<float>}
		 */
		this.distanceFallOff = uniform( 1 );

		/**
		 * The scale of the ambient occlusion.
		 *
		 * @type {UniformNode<float>}
		 */
		this.scale = uniform( 1 );

		/**
		 * How many samples are used to compute the AO.
		 * A higher value results in better quality but also
		 * in a more expensive runtime behavior.
		 *
		 * @type {UniformNode<float>}
		 */
		this.samples = uniform( 16 );

		/**
		 * The node represents the internal noise texture used by the AO.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._noiseNode = texture( generateMagicSquareNoise() );

		/**
		 * Represents the projection matrix of the scene's camera.
		 *
		 * @private
		 * @type {UniformNode<mat4>}
		 */
		this._cameraProjectionMatrix = uniform( camera.projectionMatrix );

		/**
		 * Represents the inverse projection matrix of the scene's camera.
		 *
		 * @private
		 * @type {UniformNode<mat4>}
		 */
		this._cameraProjectionMatrixInverse = uniform( camera.projectionMatrixInverse );

		/**
		 * Represents the near value of the scene's camera.
		 *
		 * @private
		 * @type {ReferenceNode<float>}
		 */
		this._cameraNear = reference( 'near', 'float', camera );

		/**
		 * Represents the far value of the scene's camera.
		 *
		 * @private
		 * @type {ReferenceNode<float>}
		 */
		this._cameraFar = reference( 'far', 'float', camera );

		/**
		 * The material that is used to render the effect.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._material = new NodeMaterial();
		this._material.name = 'GTAO';

		/**
		 * The result of the effect is represented as a separate texture node.
		 *
		 * @private
		 * @type {PassTextureNode}
		 */
		this._textureNode = passTexture( this, this._aoRenderTarget.texture );

	}

	/**
	 * Returns the result of the effect as a texture node.
	 *
	 * @return {PassTextureNode} A texture node that represents the result of the effect.
	 */
	getTextureNode() {

		return this._textureNode;

	}

	/**
	 * Sets the size of the effect.
	 *
	 * @param {Number} width - The width of the effect.
	 * @param {Number} height - The height of the effect.
	 */
	setSize( width, height ) {

		width = Math.round( this.resolutionScale * width );
		height = Math.round( this.resolutionScale * height );

		this.resolution.value.set( width, height );
		this._aoRenderTarget.setSize( width, height );

	}

	/**
	 * This method is used to render the effect once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( frame ) {

		const { renderer } = frame;

		_rendererState = PostProcessingUtils.resetRendererState( renderer, _rendererState );

		//

		const size = renderer.getDrawingBufferSize( _size );
		this.setSize( size.width, size.height );

		_quadMesh.material = this._material;

		// clear

		renderer.setClearColor( 0xffffff, 1 );

		// ao

		renderer.setRenderTarget( this._aoRenderTarget );
		_quadMesh.render( renderer );

		// restore

		PostProcessingUtils.restoreRendererState( renderer, _rendererState );

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {PassTextureNode}
	 */
	setup( builder ) {

		const uvNode = uv();

		const sampleDepth = ( uv ) => {

			const depth = this.depthNode.sample( uv ).r;

			if ( builder.renderer.logarithmicDepthBuffer === true ) {

				const viewZ = logarithmicDepthToViewZ( depth, this._cameraNear, this._cameraFar );

				return viewZToPerspectiveDepth( viewZ, this._cameraNear, this._cameraFar );

			}

			return depth;

		};

		const sampleNoise = ( uv ) => this._noiseNode.sample( uv );
		const sampleNormal = ( uv ) => ( this.normalNode !== null ) ? this.normalNode.sample( uv ).rgb.normalize() : getNormalFromDepth( uv, this.depthNode.value, this._cameraProjectionMatrixInverse );

		const ao = Fn( () => {

			const depth = sampleDepth( uvNode ).toVar();

			depth.greaterThanEqual( 1.0 ).discard();

			const viewPosition = getViewPosition( uvNode, depth, this._cameraProjectionMatrixInverse ).toVar();
			const viewNormal = sampleNormal( uvNode ).toVar();

			const radiusToUse = this.radius;

			const noiseResolution = textureSize( this._noiseNode, 0 );
			let noiseUv = vec2( uvNode.x, uvNode.y.oneMinus() );
			noiseUv = noiseUv.mul( this.resolution.div( noiseResolution ) );
			const noiseTexel = sampleNoise( noiseUv );
			const randomVec = noiseTexel.xyz.mul( 2.0 ).sub( 1.0 );
			const tangent = vec3( randomVec.xy, 0.0 ).normalize();
			const bitangent = vec3( tangent.y.mul( - 1.0 ), tangent.x, 0.0 );
			const kernelMatrix = mat3( tangent, bitangent, vec3( 0.0, 0.0, 1.0 ) );

			const DIRECTIONS = this.samples.lessThan( 30 ).select( 3, 5 ).toVar();
			const STEPS = add( this.samples, DIRECTIONS.sub( 1 ) ).div( DIRECTIONS ).toVar();

			const ao = float( 0 ).toVar();

			Loop( { start: int( 0 ), end: DIRECTIONS, type: 'int', condition: '<' }, ( { i } ) => {

				const angle = float( i ).div( float( DIRECTIONS ) ).mul( PI ).toVar();
				const sampleDir = vec4( cos( angle ), sin( angle ), 0., add( 0.5, mul( 0.5, noiseTexel.w ) ) );
				sampleDir.xyz = normalize( kernelMatrix.mul( sampleDir.xyz ) );

				const viewDir = normalize( viewPosition.xyz.negate() ).toVar();
				const sliceBitangent = normalize( cross( sampleDir.xyz, viewDir ) ).toVar();
				const sliceTangent = cross( sliceBitangent, viewDir );
				const normalInSlice = normalize( viewNormal.sub( sliceBitangent.mul( dot( viewNormal, sliceBitangent ) ) ) );

				const tangentToNormalInSlice = cross( normalInSlice, sliceBitangent ).toVar();
				const cosHorizons = vec2( dot( viewDir, tangentToNormalInSlice ), dot( viewDir, tangentToNormalInSlice.negate() ) ).toVar();

				Loop( { end: STEPS, type: 'int', name: 'j', condition: '<' }, ( { j } ) => {

					const sampleViewOffset = sampleDir.xyz.mul( radiusToUse ).mul( sampleDir.w ).mul( pow( div( float( j ).add( 1.0 ), float( STEPS ) ), this.distanceExponent ) );

					// x

					const sampleScreenPositionX = getScreenPosition( viewPosition.add( sampleViewOffset ), this._cameraProjectionMatrix ).toVar();
					const sampleDepthX = sampleDepth( sampleScreenPositionX ).toVar();
					const sampleSceneViewPositionX = getViewPosition( sampleScreenPositionX, sampleDepthX, this._cameraProjectionMatrixInverse ).toVar();
					const viewDeltaX = sampleSceneViewPositionX.sub( viewPosition ).toVar();

					If( abs( viewDeltaX.z ).lessThan( this.thickness ), () => {

						const sampleCosHorizon = dot( viewDir, normalize( viewDeltaX ) );
						cosHorizons.x.addAssign( max( 0, mul( sampleCosHorizon.sub( cosHorizons.x ), mix( 1.0, float( 2.0 ).div( float( j ).add( 2 ) ), this.distanceFallOff ) ) ) );

					} );

					// y

					const sampleScreenPositionY = getScreenPosition( viewPosition.sub( sampleViewOffset ), this._cameraProjectionMatrix ).toVar();
					const sampleDepthY = sampleDepth( sampleScreenPositionY ).toVar();
					const sampleSceneViewPositionY = getViewPosition( sampleScreenPositionY, sampleDepthY, this._cameraProjectionMatrixInverse ).toVar();
					const viewDeltaY = sampleSceneViewPositionY.sub( viewPosition ).toVar();

					If( abs( viewDeltaY.z ).lessThan( this.thickness ), () => {

						const sampleCosHorizon = dot( viewDir, normalize( viewDeltaY ) );
						cosHorizons.y.addAssign( max( 0, mul( sampleCosHorizon.sub( cosHorizons.y ), mix( 1.0, float( 2.0 ).div( float( j ).add( 2 ) ), this.distanceFallOff ) ) ) );

					} );

				} );

				const sinHorizons = sqrt( sub( 1.0, cosHorizons.mul( cosHorizons ) ) ).toVar();
				const nx = dot( normalInSlice, sliceTangent );
				const ny = dot( normalInSlice, viewDir );
				const nxb = mul( 0.5, acos( cosHorizons.y ).sub( acos( cosHorizons.x ) ).add( sinHorizons.x.mul( cosHorizons.x ).sub( sinHorizons.y.mul( cosHorizons.y ) ) ) );
				const nyb = mul( 0.5, sub( 2.0, cosHorizons.x.mul( cosHorizons.x ) ).sub( cosHorizons.y.mul( cosHorizons.y ) ) );
				const occlusion = nx.mul( nxb ).add( ny.mul( nyb ) );
				ao.addAssign( occlusion );

			} );

			ao.assign( clamp( ao.div( DIRECTIONS ), 0, 1 ) );
			ao.assign( pow( ao, this.scale ) );

			return vec4( vec3( ao ), 1.0 );

		} );

		this._material.fragmentNode = ao().context( builder.getSharedContext() );
		this._material.needsUpdate = true;

		//

		return this._textureNode;

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the effect is no longer required.
	 */
	dispose() {

		this._aoRenderTarget.dispose();

		this._material.dispose();

	}

}

export default GTAONode;

/**
 * Generates the AO's noise texture for the given size.
 *
 * @param {Number} [size=5] - The noise size.
 * @return {DataTexture} The generated noise texture.
 */
function generateMagicSquareNoise( size = 5 ) {

	const noiseSize = Math.floor( size ) % 2 === 0 ? Math.floor( size ) + 1 : Math.floor( size );
	const magicSquare = generateMagicSquare( noiseSize );
	const noiseSquareSize = magicSquare.length;
	const data = new Uint8Array( noiseSquareSize * 4 );

	for ( let inx = 0; inx < noiseSquareSize; ++ inx ) {

		const iAng = magicSquare[ inx ];
		const angle = ( 2 * Math.PI * iAng ) / noiseSquareSize;
		const randomVec = new Vector3(
			Math.cos( angle ),
			Math.sin( angle ),
			0
		).normalize();
		data[ inx * 4 ] = ( randomVec.x * 0.5 + 0.5 ) * 255;
		data[ inx * 4 + 1 ] = ( randomVec.y * 0.5 + 0.5 ) * 255;
		data[ inx * 4 + 2 ] = 127;
		data[ inx * 4 + 3 ] = 255;

	}

	const noiseTexture = new DataTexture( data, noiseSize, noiseSize );
	noiseTexture.wrapS = RepeatWrapping;
	noiseTexture.wrapT = RepeatWrapping;
	noiseTexture.needsUpdate = true;

	return noiseTexture;

}

/**
 * Computes an array of magic square values required to generate the noise texture.
 *
 * @param {Number} size - The noise size.
 * @return {Array<Number>} The magic square values.
 */
function generateMagicSquare( size ) {

	const noiseSize = Math.floor( size ) % 2 === 0 ? Math.floor( size ) + 1 : Math.floor( size );
	const noiseSquareSize = noiseSize * noiseSize;
	const magicSquare = Array( noiseSquareSize ).fill( 0 );
	let i = Math.floor( noiseSize / 2 );
	let j = noiseSize - 1;

	for ( let num = 1; num <= noiseSquareSize; ) {

		if ( i === - 1 && j === noiseSize ) {

			j = noiseSize - 2;
			i = 0;

		} else {

			if ( j === noiseSize ) {

				j = 0;

			}

			if ( i < 0 ) {

				i = noiseSize - 1;

			}

		}

		if ( magicSquare[ i * noiseSize + j ] !== 0 ) {

			j -= 2;
			i ++;
			continue;

		} else {

			magicSquare[ i * noiseSize + j ] = num ++;

		}

		j ++;
		i --;

	}

	return magicSquare;

}

/**
 * TSL function for creating a Ground Truth Ambient Occlusion (GTAO) effect.
 *
 * @function
 * @param {Node<float>} depthNode - A node that represents the scene's depth.
 * @param {Node<vec3>?} normalNode - A node that represents the scene's normals.
 * @param {Camera} camera - The camera the scene is rendered with.
 * @returns {GTAONode}
 */
export const ao = ( depthNode, normalNode, camera ) => nodeObject( new GTAONode( nodeObject( depthNode ), nodeObject( normalNode ), camera ) );
