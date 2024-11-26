import { RenderTarget, Vector2, TempNode, NodeUpdateType, QuadMesh, PostProcessingUtils, NodeMaterial } from 'three/webgpu';
import { convertToTexture, nodeObject, Fn, passTexture, uv, vec2, vec3, vec4, max, float, sub, int, Loop, fract, pow, distance } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();
let _rendererState;

/**
 * References:
 * https://john-chapman-graphics.blogspot.com/2013/02/pseudo-lens-flare.html
 * https://john-chapman.github.io/2017/11/05/pseudo-lens-flare.html
 */
class LensflareNode extends TempNode {

	static get type() {

		return 'LensflareNode';

	}

	constructor( textureNode, params = {} ) {

		super( 'vec4' );

		this.textureNode = textureNode;

		const {
			ghostTint = vec3( 1, 1, 1 ),
			threshold = float( 0.5 ),
			ghostSamples = float( 4 ),
			ghostSpacing = float( 0.25 ),
			ghostAttenuationFactor = float( 25 ),
			downSampleRatio = 4
		} = params;

		this.ghostTintNode = nodeObject( ghostTint );
		this.thresholdNode = nodeObject( threshold );
		this.ghostSamplesNode = nodeObject( ghostSamples );
		this.ghostSpacingNode = nodeObject( ghostSpacing );
		this.ghostAttenuationFactorNode = nodeObject( ghostAttenuationFactor );
		this.downSampleRatio = downSampleRatio;

		this.updateBeforeType = NodeUpdateType.FRAME;

		// render targets

		this._renderTarget = new RenderTarget( 1, 1, { depthBuffer: false } );
		this._renderTarget.texture.name = 'LensflareNode';

		// materials

		this._material = new NodeMaterial();
		this._material.name = 'LensflareNode';

		//

		this._textureNode = passTexture( this, this._renderTarget.texture );

	}

	getTextureNode() {

		return this._textureNode;

	}

	setSize( width, height ) {

		const resx = Math.round( width / this.downSampleRatio );
		const resy = Math.round( height / this.downSampleRatio );

		this._renderTarget.setSize( resx, resy );

	}

	updateBefore( frame ) {

		const { renderer } = frame;

		const size = renderer.getDrawingBufferSize( _size );
		this.setSize( size.width, size.height );

		_rendererState = PostProcessingUtils.resetRendererState( renderer, _rendererState );

		_quadMesh.material = this._material;

		// clear

		renderer.setMRT( null );

		// lensflare

		renderer.setRenderTarget( this._renderTarget );
		_quadMesh.render( renderer );

		// restore

		PostProcessingUtils.restoreRendererState( renderer, _rendererState );

	}

	setup( builder ) {

		const lensflare = Fn( () => {

			// flip uvs so lens flare pivot around the image center

			const texCoord = uv().oneMinus().toVar();

			// ghosts are positioned along this vector

			const ghostVec = sub( vec2( 0.5 ), texCoord ).mul( this.ghostSpacingNode ).toVar();

			// sample ghosts

			const result = vec4().toVar();

			Loop( { start: int( 0 ), end: int( this.ghostSamplesNode ), type: 'int', condition: '<' }, ( { i } ) => {

				// use fract() to ensure that the texture coordinates wrap around

				const sampleUv = fract( texCoord.add( ghostVec.mul( float( i ) ) ) ).toVar();

				// reduce contributions from samples at the screen edge

				const d = distance( sampleUv, vec2( 0.5 ) );
				const weight = pow( d.oneMinus(), this.ghostAttenuationFactorNode );

				// accumulate

				let sample = this.textureNode.uv( sampleUv ).rgb;

				sample = max( sample.sub( this.thresholdNode ), vec3( 0 ) ).mul( this.ghostTintNode );

				result.addAssign( sample.mul( weight ) );

			} );

			return result;

		} );

		this._material.fragmentNode = lensflare().context( builder.getSharedContext() );
		this._material.needsUpdate = true;

		return this._textureNode;

	}

	dispose() {

		this._renderTarget.dispose();
		this._material.dispose();

	}

}

export default LensflareNode;

export const lensflare = ( inputNode, params ) => nodeObject( new LensflareNode( convertToTexture( inputNode ), params ) );
