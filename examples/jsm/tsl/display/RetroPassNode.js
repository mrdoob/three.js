import { MeshBasicNodeMaterial, PassNode, UnsignedByteType, NearestFilter, CubeMapNode, MeshPhongNodeMaterial } from 'three/webgpu';
import { float, vec2, vec4, Fn, uv, varying, cameraProjectionMatrix, cameraViewMatrix, positionWorld, screenSize, materialColor, uint, texture, uniform, context, reflectVector } from 'three/tsl';

const _affineUv = varying( vec2() );
const _w = varying( float() );

const _clipSpaceRetro = Fn( () => {

	const defaultPosition = cameraProjectionMatrix
		.mul( cameraViewMatrix )
		.mul( positionWorld );

	const roundedPosition = defaultPosition.xy
		.div( defaultPosition.w.mul( 2 ) )
		.mul( screenSize.xy )
		.round()
		.div( screenSize.xy )
		.mul( defaultPosition.w.mul( 2 ) );

	_affineUv.assign( uv().mul( defaultPosition.w ) );
	_w.assign( defaultPosition.w );

	return vec4( roundedPosition.xy, defaultPosition.zw );

} )();

/**
 * A post-processing pass that applies a retro PS1-style effect to the scene.
 *
 * This node renders the scene with classic PlayStation 1 visual characteristics:
 * - **Vertex snapping**: Vertices are snapped to screen pixels, creating the iconic "wobbly" geometry
 * - **Affine texture mapping**: Textures are sampled without perspective correction, resulting in distortion effects
 * - **Low resolution**: Default 0.25 scale (typical 320x240 equivalent)
 * - **Nearest-neighbor filtering**: Sharp pixelated textures without smoothing
 *
 * @augments PassNode
 */
class RetroPassNode extends PassNode {

	/**
	 * Creates a new RetroPassNode instance.
	 *
	 * @param {Scene} scene - The scene to render.
	 * @param {Camera} camera - The camera to render from.
	 * @param {Object} [options={}] - Additional options for the retro pass.
	 * @param {Node} [options.affineDistortion=null] - An optional node to apply affine distortion to UVs.
	 */
	constructor( scene, camera, options = {} ) {

		super( PassNode.COLOR, scene, camera );

		const {
			affineDistortion = null,
			filterTextures = false
		} = options;

		this.setResolutionScale( .25 );

		this.renderTarget.texture.type = UnsignedByteType;
		this.renderTarget.texture.magFilter = NearestFilter;
		this.renderTarget.texture.minFilter = NearestFilter;

		this.affineDistortionNode = affineDistortion;

		this.filterTextures = filterTextures;

		this._materialCache = new Map();

	}

	/**
	 * Updates the retro pass before rendering.
	 *
	 * @override
	 * @param {Frame} frame - The current frame information.
	 * @returns {void}
	 */
	updateBefore( frame ) {

		const renderer = frame.renderer;

		const currentRenderObjectFunction = renderer.getRenderObjectFunction();

		renderer.setRenderObjectFunction( ( object, scene, camera, geometry, material, ...params ) => {

			const retroMaterialData = this._materialCache.get( material );

			let retroMaterial;

			if ( retroMaterialData === undefined || retroMaterialData.version !== material.version ) {

				if ( retroMaterialData !== undefined ) {

					retroMaterialData.material.dispose();

				}

				if ( material.isMeshBasicMaterial || material.isMeshBasicNodeMaterial ) {

					retroMaterial = new MeshBasicNodeMaterial();

				} else {

					retroMaterial = new MeshPhongNodeMaterial();

				}

				retroMaterial.colorNode = material.colorNode || null;
				retroMaterial.opacityNode = material.opacityNode || null;
				retroMaterial.positionNode = material.positionNode || null;
				retroMaterial.vertexNode = material.vertexNode || _clipSpaceRetro;

				let colorNode = material.colorNode || materialColor;

				if ( material.isMeshStandardNodeMaterial || material.isMeshStandardMaterial ) {

					const envMap = material.envMap || scene.environment;

					if ( envMap ) {

						const reflection = new CubeMapNode( texture( envMap ) );

						let metalness;

						if ( material.metalnessNode ) {

							metalness = material.metalnessNode;

						} else {

							metalness = uniform( material.metalness ).onRenderUpdate( ( { material } ) => material.metalness );

							if ( material.metalnessMap ) {

								const textureUniform = texture( material.metalnessMap ).onRenderUpdate( ( { material } ) => material.metalnessMap );

								metalness = metalness.mul( textureUniform.b );

							}

						}

						colorNode = metalness.mix( colorNode, reflection );

					}

				}

				retroMaterial.colorNode = colorNode;

				//

				const contextData = {};

				if ( this.affineDistortionNode ) {

					contextData.getUV = ( texture ) => {

						let finalUV;

						if ( texture.isCubeTextureNode ) {

							finalUV = reflectVector;

						} else {

							finalUV = this.affineDistortionNode.mix( uv(), _affineUv.div( _w ) );

						}

						return finalUV;

					};

				}

				if ( this.filterTextures !== true ) {

					contextData.getTextureLevel = () => uint( 0 );

				}

				retroMaterial.contextNode = context( contextData );

				//

				this._materialCache.set( material, {
					material: retroMaterial,
					version: material.version
				} );

			} else {

				retroMaterial = retroMaterialData.material;

			}

			for ( const property in material ) {

				if ( retroMaterial[ property ] === undefined ) continue;

				retroMaterial[ property ] = material[ property ];

			}

			renderer.renderObject( object, scene, camera, geometry, retroMaterial, ...params );

		} );

		super.updateBefore( frame );

		renderer.setRenderObjectFunction( currentRenderObjectFunction );

	}

	/**
	 * Disposes the retro pass and its internal resources.
	 *
	 * @override
	 * @returns {void}
	 */
	dispose() {

		super.dispose();

		this._materialCache.forEach( ( data ) => {

			data.material.dispose();

		} );

		this._materialCache.clear();

	}

}

export default RetroPassNode;

/**
 * Creates a new RetroPassNode instance for PS1-style rendering.
 *
 * The retro pass applies vertex snapping, affine texture mapping, and low-resolution
 * rendering to achieve an authentic PlayStation 1 aesthetic. Combine with other
 * post-processing effects like dithering, posterization, and scanlines for full retro look.
 *
 * ```js
 * // Combined with other effects
 * let pipeline = retroPass( scene, camera );
 * pipeline = bayerDither( pipeline, 32 );
 * pipeline = posterize( pipeline, 32 );
 * renderPipeline.outputNode = pipeline;
 * ```
 *
 * @tsl
 * @function
 * @param {Scene} scene - The scene to render.
 * @param {Camera} camera - The camera to render from.
 * @param {Object} [options={}] - Additional options for the retro pass.
 * @param {Node} [options.affineDistortion=null] - An optional node to apply affine distortion to UVs.
 * @return {RetroPassNode} A new RetroPassNode instance.
 */
export const retroPass = ( scene, camera, options = {} ) => new RetroPassNode( scene, camera, options );
