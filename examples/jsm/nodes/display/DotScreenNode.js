import TempNode from '../core/TempNode.js';
import { nodeObject, addNodeElement, tslFn, vec2, vec3, vec4 } from '../shadernode/ShaderNode.js';
import { uniform } from '../core/UniformNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { uv } from '../accessors/UVNode.js';
import { texturePass } from './PassNode.js';
import { sin, cos } from '../math/MathNode.js';
import { add } from '../math/OperatorNode.js';
import { Vector2, RenderTarget } from 'three';
import QuadMesh from '../../objects/QuadMesh.js';

const quadMesh = new QuadMesh();

class DotScreenNode extends TempNode {

	constructor( colorNode, center = new Vector2( 0.5, 0.5 ), angle = 1.57, scale = 1 ) {

		super( 'vec4' );

		this.colorNode = colorNode;
		this.center = uniform( center );
		this.angle = uniform( angle );
		this.scale = uniform( scale );

		this._renderTarget = new RenderTarget();
		this._renderTarget.texture.name = 'dotScreen';

		this._size = uniform( new Vector2() );

		this._textureNode = texturePass( this, this._renderTarget.texture );

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	getTextureNode() {

		return this._textureNode;

	}

	setSize( width, height ) {

		this._size.value.set( width, height );
		this._renderTarget.setSize( width, height );

	}

	updateBefore( frame ) {

		const { renderer } = frame;

		const colorNode = this.colorNode;
		const map = colorNode.value;

		this._renderTarget.texture.type = map.type;

		const currentRenderTarget = renderer.getRenderTarget();
		const currentTexture = colorNode.value;

		quadMesh.material = this._material;

		this.setSize( map.image.width, map.image.height );

		// render

		renderer.setRenderTarget( this._renderTarget );

		quadMesh.render( renderer );

		// restore

		renderer.setRenderTarget( currentRenderTarget );
		colorNode.value = currentTexture;

	}

	setup( builder ) {

		const colorNode = this.colorNode;

		const pattern = tslFn( () => {

			const s = sin( this.angle );
			const c = cos( this.angle );

			const tex = uv().mul( this._size ).sub( this.center );
			const point = vec2( c.mul( tex.x ).sub( s.mul( tex.y ) ), s.mul( tex.x ).add( c.mul( tex.y ) ) ).mul( this.scale );

			return sin( point.x ).mul( sin( point.y ) ).mul( 4 );

		} );

		const dotScreen = tslFn( () => {

			const color = colorNode;

			const average = add( color.r, color.g, color.b ).div( 3 );

			return vec4( vec3( average.mul( 10 ).sub( 5 ).add( pattern() ) ), color.a );

		} );

		//

		const material = this._material || ( this._material = builder.createNodeMaterial() );
		material.fragmentNode = dotScreen();

		//

		const properties = builder.getNodeProperties( this );
		properties.textureNode = colorNode;

		//

		return this._textureNode;

	}

}

export const dotScreen = ( node, center, angle, scale ) => nodeObject( new DotScreenNode( nodeObject( node ), center, angle, scale ) );

addNodeElement( 'dotScreen', dotScreen );

export default DotScreenNode;

