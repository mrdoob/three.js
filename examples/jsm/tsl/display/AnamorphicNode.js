import { RenderTarget, Vector2, PostProcessingUtils } from 'three';
import { TempNode, nodeObject, Fn, float, NodeUpdateType, uv, passTexture, uniform, convertToTexture, QuadMesh, NodeMaterial, vec2, vec3, Loop, threshold } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();

let _rendererState;

class AnamorphicNode extends TempNode {

	static get type() {

		return 'AnamorphicNode';

	}

	constructor( textureNode, tresholdNode, scaleNode, samples ) {

		super( 'vec4' );

		this.textureNode = textureNode;
		this.tresholdNode = tresholdNode;
		this.scaleNode = scaleNode;
		this.colorNode = vec3( 0.1, 0.0, 1.0 );
		this.samples = samples;
		this.resolution = new Vector2( 1, 1 );

		this._renderTarget = new RenderTarget( 1, 1, { depthBuffer: false } );
		this._renderTarget.texture.name = 'anamorphic';

		this._invSize = uniform( new Vector2() );

		this._textureNode = passTexture( this, this._renderTarget.texture );

		this.updateBeforeType = NodeUpdateType.FRAME;

	}

	getTextureNode() {

		return this._textureNode;

	}

	setSize( width, height ) {

		this._invSize.value.set( 1 / width, 1 / height );

		width = Math.max( Math.round( width * this.resolution.x ), 1 );
		height = Math.max( Math.round( height * this.resolution.y ), 1 );

		this._renderTarget.setSize( width, height );

	}

	updateBefore( frame ) {

		const { renderer } = frame;

		_rendererState = PostProcessingUtils.resetRendererState( renderer, _rendererState );

		//

		const textureNode = this.textureNode;
		const map = textureNode.value;

		this._renderTarget.texture.type = map.type;

		const currentTexture = textureNode.value;

		_quadMesh.material = this._material;

		this.setSize( map.image.width, map.image.height );

		// render

		renderer.setRenderTarget( this._renderTarget );

		_quadMesh.render( renderer );

		// restore

		textureNode.value = currentTexture;

		PostProcessingUtils.restoreRendererState( renderer, _rendererState );

	}

	setup( builder ) {

		const textureNode = this.textureNode;
		const uvNode = textureNode.uvNode || uv();

		const sampleTexture = ( uv ) => textureNode.uv( uv );

		const anamorph = Fn( () => {

			const samples = this.samples;
			const halfSamples = Math.floor( samples / 2 );

			const total = vec3( 0 ).toVar();

			Loop( { start: - halfSamples, end: halfSamples }, ( { i } ) => {

				const softness = float( i ).abs().div( halfSamples ).oneMinus();

				const uv = vec2( uvNode.x.add( this._invSize.x.mul( i ).mul( this.scaleNode ) ), uvNode.y );
				const color = sampleTexture( uv );
				const pass = threshold( color, this.tresholdNode ).mul( softness );

				total.addAssign( pass );

			} );

			return total.mul( this.colorNode );

		} );

		//

		const material = this._material || ( this._material = new NodeMaterial() );
		material.name = 'Anamorphic';
		material.fragmentNode = anamorph();

		//

		const properties = builder.getNodeProperties( this );
		properties.textureNode = textureNode;

		//

		return this._textureNode;

	}

	dispose() {

		this._renderTarget.dispose();

	}

}

export const anamorphic = ( node, threshold = .9, scale = 3, samples = 32 ) => nodeObject( new AnamorphicNode( convertToTexture( node ), nodeObject( threshold ), nodeObject( scale ), samples ) );

export default AnamorphicNode;
