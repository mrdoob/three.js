import TempNode from '../core/TempNode.js';
import { nodeObject, addNodeElement, tslFn, float, vec4 } from '../shadernode/ShaderNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { uv } from '../accessors/UVNode.js';
import { texture } from '../accessors/TextureNode.js';
import { texturePass } from './PassNode.js';
import { uniform } from '../core/UniformNode.js';
import { RenderTarget } from 'three';
import { sign, max } from '../math/MathNode.js';
import QuadMesh from '../../objects/QuadMesh.js';
import { NoToneMapping, Vector2 } from 'three';

const _size = new Vector2();

const quadMeshComp = new QuadMesh();

class AfterImageNode extends TempNode {

	constructor( textureNode, damp = 0.96 ) {

		super( textureNode );

		this.textureNode = textureNode;
		this.textureNodeOld = texture();
		this.damp = uniform( damp );

		this._compRT = new RenderTarget();
		this._compRT.texture.name = 'AfterImageNode.comp';

		this._oldRT = new RenderTarget();
		this._oldRT.texture.name = 'AfterImageNode.old';

		this._textureNode = texturePass( this, this._compRT.texture );

		this.updateBeforeType = NodeUpdateType.RENDER;

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

		const textureNode = this.textureNode;
		const map = textureNode.value;

		const textureType = map.type;

		this._compRT.texture.type = textureType;
		this._oldRT.texture.type = textureType;

		renderer.getDrawingBufferSize( _size );

		this.setSize( _size.x, _size.y );


		const currentToneMapping = renderer.toneMapping;
		const currentToneMappingNode = renderer.toneMappingNode;
		const currentRenderTarget = renderer.getRenderTarget();
		const currentTexture = textureNode.value;

		this.textureNodeOld.value = this._oldRT.texture;

		// comp
		renderer.toneMapping = NoToneMapping;
		renderer.toneMappingNode = null;
		renderer.setRenderTarget( this._compRT );
		quadMeshComp.render( renderer );

		// Swap the textures
		const temp = this._oldRT;
		this._oldRT = this._compRT;
		this._compRT = temp;


		renderer.toneMapping = currentToneMapping;
		renderer.toneMappingNode = currentToneMappingNode;
		renderer.setRenderTarget( currentRenderTarget );
		textureNode.value = currentTexture;

	}

	setup( builder ) {

		const textureNode = this.textureNode;
		const textureNodeOld = this.textureNodeOld;

		if ( textureNode.isTextureNode !== true ) {

			console.error( 'AfterImageNode requires a TextureNode.' );

			return vec4();

		}

		//

		const uvNode = textureNode.uvNode || uv();

		textureNodeOld.uvNode = uvNode;

		const sampleTexture = ( uv ) => textureNode.cache().context( { getUV: () => uv, forceUVContext: true } );

		const when_gt = tslFn( ( [ x_immutable, y_immutable ] ) => {

			const y = float( y_immutable ).toVar();
			const x = vec4( x_immutable ).toVar();

			return max( sign( x.sub( y ) ), 0.0 );

		} );

		const afterImg = tslFn( () => {

			const texelOld = vec4( textureNodeOld );
			const texelNew = vec4( sampleTexture( uvNode ) );

			texelOld.mulAssign( this.damp.mul( when_gt( texelOld, 0.1 ) ) );
			return max( texelNew, texelOld );

		} );

		//

		const materialComposed = this._materialComposed || ( this._materialComposed = builder.createNodeMaterial() );
		materialComposed.fragmentNode = afterImg();

		quadMeshComp.material = materialComposed;

		//

		const properties = builder.getNodeProperties( this );
		properties.textureNode = textureNode;

		//

		return this._textureNode;

	}

}

export const afterImage = ( node, damp ) => nodeObject( new AfterImageNode( nodeObject( node ), damp ) );

addNodeElement( 'afterImage', afterImage );

export default AfterImageNode;

