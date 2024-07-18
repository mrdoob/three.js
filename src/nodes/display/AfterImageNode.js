import TempNode from '../core/TempNode.js';
import { nodeObject, addNodeElement, tslFn, float, vec4 } from '../shadernode/ShaderNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { uv } from '../accessors/UVNode.js';
import { texture } from '../accessors/TextureNode.js';
import { passTexture } from './PassNode.js';
import { uniform } from '../core/UniformNode.js';
import { sign, max } from '../math/MathNode.js';
import QuadMesh from '../../renderers/common/QuadMesh.js';

import { Vector2 } from '../../math/Vector2.js';
import { RenderTarget } from '../../core/RenderTarget.js';

const _size = /*@__PURE__*/ new Vector2();

const _quadMeshComp = /*@__PURE__*/ new QuadMesh();

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

		this._textureNode = passTexture( this, this._compRT.texture );

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

		const currentRenderTarget = renderer.getRenderTarget();
		const currentTexture = textureNode.value;

		this.textureNodeOld.value = this._oldRT.texture;

		// comp
		renderer.setRenderTarget( this._compRT );
		_quadMeshComp.render( renderer );

		// Swap the textures
		const temp = this._oldRT;
		this._oldRT = this._compRT;
		this._compRT = temp;

		renderer.setRenderTarget( currentRenderTarget );
		textureNode.value = currentTexture;

	}

	setup( builder ) {

		const textureNode = this.textureNode;
		const textureNodeOld = this.textureNodeOld;

		//

		const uvNode = textureNode.uvNode || uv();

		textureNodeOld.uvNode = uvNode;

		const sampleTexture = ( uv ) => textureNode.uv( uv );

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

export const afterImage = ( node, damp ) => nodeObject( new AfterImageNode( nodeObject( node ).toTexture(), damp ) );

addNodeElement( 'afterImage', afterImage );

export default AfterImageNode;

