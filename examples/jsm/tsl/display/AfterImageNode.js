import { RenderTarget, Vector2, PostProcessingUtils } from 'three';
import { TempNode, nodeObject, Fn, float, vec4, NodeUpdateType, uv, texture, passTexture, uniform, sign, max, convertToTexture, QuadMesh, NodeMaterial } from 'three/tsl';

const _size = /*@__PURE__*/ new Vector2();
const _quadMeshComp = /*@__PURE__*/ new QuadMesh();

let _rendererState;

class AfterImageNode extends TempNode {

	static get type() {

		return 'AfterImageNode';

	}

	constructor( textureNode, damp = 0.96 ) {

		super( textureNode );

		this.textureNode = textureNode;
		this.textureNodeOld = texture();
		this.damp = uniform( damp );

		this._compRT = new RenderTarget( 1, 1, { depthBuffer: false } );
		this._compRT.texture.name = 'AfterImageNode.comp';

		this._oldRT = new RenderTarget( 1, 1, { depthBuffer: false } );
		this._oldRT.texture.name = 'AfterImageNode.old';

		this._textureNode = passTexture( this, this._compRT.texture );

		this.updateBeforeType = NodeUpdateType.FRAME;

	}

	getTextureNode() {

		return this._textureNode;

	}

	setSize( width, height ) {

		this._compRT.setSize( width, height );
		this._oldRT.setSize( width, height );

	}

	updateBefore( frame ) {

		const { renderer } = frame;

		_rendererState = PostProcessingUtils.resetRendererState( renderer, _rendererState );

		//

		const textureNode = this.textureNode;
		const map = textureNode.value;

		const textureType = map.type;

		this._compRT.texture.type = textureType;
		this._oldRT.texture.type = textureType;

		renderer.getDrawingBufferSize( _size );

		this.setSize( _size.x, _size.y );

		const currentTexture = textureNode.value;

		this.textureNodeOld.value = this._oldRT.texture;

		// comp

		renderer.setRenderTarget( this._compRT );
		_quadMeshComp.render( renderer );

		// Swap the textures

		const temp = this._oldRT;
		this._oldRT = this._compRT;
		this._compRT = temp;

		//

		textureNode.value = currentTexture;

		PostProcessingUtils.restoreRendererState( renderer, _rendererState );

	}

	setup( builder ) {

		const textureNode = this.textureNode;
		const textureNodeOld = this.textureNodeOld;

		//

		const uvNode = textureNode.uvNode || uv();

		textureNodeOld.uvNode = uvNode;

		const sampleTexture = ( uv ) => textureNode.uv( uv );

		const when_gt = Fn( ( [ x_immutable, y_immutable ] ) => {

			const y = float( y_immutable ).toVar();
			const x = vec4( x_immutable ).toVar();

			return max( sign( x.sub( y ) ), 0.0 );

		} );

		const afterImg = Fn( () => {

			const texelOld = vec4( textureNodeOld );
			const texelNew = vec4( sampleTexture( uvNode ) );

			texelOld.mulAssign( this.damp.mul( when_gt( texelOld, 0.1 ) ) );
			return max( texelNew, texelOld );

		} );

		//

		const materialComposed = this._materialComposed || ( this._materialComposed = new NodeMaterial() );
		materialComposed.name = 'AfterImage';
		materialComposed.fragmentNode = afterImg();

		_quadMeshComp.material = materialComposed;

		//

		const properties = builder.getNodeProperties( this );
		properties.textureNode = textureNode;

		//

		return this._textureNode;

	}

	dispose() {

		this._compRT.dispose();
		this._oldRT.dispose();

	}

}

export const afterImage = ( node, damp ) => nodeObject( new AfterImageNode( convertToTexture( node ), damp ) );

export default AfterImageNode;
