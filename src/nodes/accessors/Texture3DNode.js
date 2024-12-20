import TextureNode from './TextureNode.js';
import { nodeProxy, vec3, Fn, If, int } from '../tsl/TSLBase.js';
import { textureSize } from './TextureSizeNode.js';

/** @module Texture3DNode **/

const normal = Fn( ( { texture, uv } ) => {

	const epsilon = 0.0001;

	const ret = vec3().toVar();

	If( uv.x.lessThan( epsilon ), () => {

		ret.assign( vec3( 1, 0, 0 ) );

	} ).ElseIf( uv.y.lessThan( epsilon ), () => {

		ret.assign( vec3( 0, 1, 0 ) );

	} ).ElseIf( uv.z.lessThan( epsilon ), () => {

		ret.assign( vec3( 0, 0, 1 ) );

	} ).ElseIf( uv.x.greaterThan( 1 - epsilon ), () => {

		ret.assign( vec3( - 1, 0, 0 ) );

	} ).ElseIf( uv.y.greaterThan( 1 - epsilon ), () => {

		ret.assign( vec3( 0, - 1, 0 ) );

	} ).ElseIf( uv.z.greaterThan( 1 - epsilon ), () => {

		ret.assign( vec3( 0, 0, - 1 ) );

	} ).Else( () => {

		const step = 0.01;

		const x = texture.sample( uv.add( vec3( - step, 0.0, 0.0 ) ) ).r.sub( texture.sample( uv.add( vec3( step, 0.0, 0.0 ) ) ).r );
		const y = texture.sample( uv.add( vec3( 0.0, - step, 0.0 ) ) ).r.sub( texture.sample( uv.add( vec3( 0.0, step, 0.0 ) ) ).r );
		const z = texture.sample( uv.add( vec3( 0.0, 0.0, - step ) ) ).r.sub( texture.sample( uv.add( vec3( 0.0, 0.0, step ) ) ).r );

		ret.assign( vec3( x, y, z ) );

	} );

	return ret.normalize();

} );

/**
 * This type of uniform node represents a 3D texture.
 *
 * @augments module:TextureNode~TextureNode
 */
class Texture3DNode extends TextureNode {

	static get type() {

		return 'Texture3DNode';

	}

	/**
	 * Constructs a new 3D texture node.
	 *
	 * @param {Data3DTexture} value - The 3D texture.
	 * @param {Node<vec2|vec3>?} [uvNode=null] - The uv node.
	 * @param {Node<int>?} [levelNode=null] - The level node.
	 */
	constructor( value, uvNode = null, levelNode = null ) {

		super( value, uvNode, levelNode );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isTexture3DNode = true;

	}

	/**
	 * Overwrites the default implementation to return a fixed value `'texture3D'`.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The input type.
	 */
	getInputType( /*builder*/ ) {

		return 'texture3D';

	}

	/**
	 * Returns a default uv node which is in context of 3D textures a three-dimensional
	 * uv node.
	 *
	 * @return {Node<vec3>} The default uv node.
	 */
	getDefaultUV() {

		return vec3( 0.5, 0.5, 0.5 );

	}

	/**
	 * Overwritten with an empty implementation since the `updateMatrix` flag is ignored
	 * for 3D textures. The uv transformation matrix is not applied to 3D textures.
	 *
	 * @param {Boolean} value - The update toggle.
	 */
	setUpdateMatrix( /*updateMatrix*/ ) { } // Ignore .updateMatrix for 3d TextureNode

	/**
	 * Overwrites the default implementation to return the unmodified uv node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {Node} uvNode - The uv node to setup.
	 * @return {Node} The unmodified uv node.
	 */
	setupUV( builder, uvNode ) {

		const texture = this.value;

		if ( builder.isFlipY() && ( texture.isRenderTargetTexture === true || texture.isFramebufferTexture === true ) ) {

			if ( this.sampler ) {

				uvNode = uvNode.flipY();

			} else {

				uvNode = uvNode.setY( int( textureSize( this, this.levelNode ).y ).sub( uvNode.y ).sub( 1 ) );

			}

		}

		return uvNode;

	}

	/**
	 * Generates the uv code snippet.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {Node} uvNode - The uv node to generate code for.
	 * @return {String} The generated code snippet.
	 */
	generateUV( builder, uvNode ) {

		return uvNode.build( builder, 'vec3' );

	}

	/**
	 * TODO.
	 *
	 * @param {Node<vec3>} uvNode - The uv node .
	 * @return {Node<vec3>} TODO.
	 */
	normal( uvNode ) {

		return normal( { texture: this, uv: uvNode } );

	}

}

export default Texture3DNode;

/**
 * TSL function for creating a 3D texture node.
 *
 * @function
 * @param {Data3DTexture} value - The 3D texture.
 * @param {Node<vec2|vec3>?} [uvNode=null] - The uv node.
 * @param {Node<int>?} [levelNode=null] - The level node.
 * @returns {Texture3DNode}
 */
export const texture3D = /*@__PURE__*/ nodeProxy( Texture3DNode );
