import { NearestFilter, Vector4, TempNode, NodeUpdateType, PassNode } from 'three/webgpu';
import { nodeObject, Fn, float, uv, uniform, convertToTexture, vec2, vec3, clamp, floor, dot, smoothstep, If, sign, step, mrt, output, normalView, property } from 'three/tsl';

/**
 * A inner node definition that implements the actual pixelation TSL code.
 *
 * @inner
 * @augments TempNode
 */
class PixelationNode extends TempNode {

	static get type() {

		return 'PixelationNode';

	}

	/**
	 * Constructs a new pixelation node.
	 *
	 * @param {TextureNode} textureNode - The texture node that represents the beauty pass.
	 * @param {TextureNode} depthNode - The texture that represents the beauty's depth.
	 * @param {TextureNode} normalNode - The texture that represents the beauty's normals.
	 * @param {Node<float>} pixelSize - The pixel size.
	 * @param {Node<float>} normalEdgeStrength - The normal edge strength.
	 * @param {Node<float>} depthEdgeStrength - The depth edge strength.
	 */
	constructor( textureNode, depthNode, normalNode, pixelSize, normalEdgeStrength, depthEdgeStrength ) {

		super( 'vec4' );

		/**
		 * The texture node that represents the beauty pass.
		 *
		 * @type {TextureNode}
		 */
		this.textureNode = textureNode;

		/**
		 * The texture that represents the beauty's depth.
		 *
		 * @type {TextureNode}
		 */
		this.depthNode = depthNode;

		/**
		 * The texture that represents the beauty's normals.
		 *
		 * @type {TextureNode}
		 */
		this.normalNode = normalNode;

		/**
		 * The pixel size.
		 *
		 * @type {Node<float>}
		 */
		this.pixelSize = pixelSize;

		/**
		 * The pixel size.
		 *
		 * @type {Node<float>}
		 */
		this.normalEdgeStrength = normalEdgeStrength;

		/**
		 * The depth edge strength.
		 *
		 * @type {Node<float>}
		 */
		this.depthEdgeStrength = depthEdgeStrength;

		/**
		 * Uniform node that represents the resolution.
		 *
		 * @type {Node<vec4>}
		 */
		this._resolution = uniform( new Vector4() );

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node updates
		 * its internal uniforms once per frame in `updateBefore()`.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

	}

	/**
	 * This method is used to update uniforms once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore() {

		const map = this.textureNode.value;

		const width = map.image.width;
		const height = map.image.height;

		this._resolution.value.set( width, height, 1 / width, 1 / height );

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {ShaderCallNodeInternal}
	 */
	setup() {

		const { textureNode, depthNode, normalNode } = this;

		const uvNodeTexture = textureNode.uvNode || uv();
		const uvNodeDepth = depthNode.uvNode || uv();
		const uvNodeNormal = normalNode.uvNode || uv();

		const sampleTexture = () => textureNode.sample( uvNodeTexture );

		const sampleDepth = ( x, y ) => depthNode.sample( uvNodeDepth.add( vec2( x, y ).mul( this._resolution.zw ) ) ).r;

		const sampleNormal = ( x, y ) => normalNode.sample( uvNodeNormal.add( vec2( x, y ).mul( this._resolution.zw ) ) ).rgb.normalize();

		const depthEdgeIndicator = ( depth ) => {

			const diff = property( 'float', 'diff' );
			diff.addAssign( clamp( sampleDepth( 1, 0 ).sub( depth ) ) );
			diff.addAssign( clamp( sampleDepth( - 1, 0 ).sub( depth ) ) );
			diff.addAssign( clamp( sampleDepth( 0, 1 ).sub( depth ) ) );
			diff.addAssign( clamp( sampleDepth( 0, - 1 ).sub( depth ) ) );

			return floor( smoothstep( 0.01, 0.02, diff ).mul( 2 ) ).div( 2 );

		};

		const neighborNormalEdgeIndicator = ( x, y, depth, normal ) => {

			const depthDiff = sampleDepth( x, y ).sub( depth );
			const neighborNormal = sampleNormal( x, y );

			// Edge pixels should yield to faces who's normals are closer to the bias normal.

			const normalEdgeBias = vec3( 1, 1, 1 ); // This should probably be a parameter.
			const normalDiff = dot( normal.sub( neighborNormal ), normalEdgeBias );
			const normalIndicator = clamp( smoothstep( - 0.01, 0.01, normalDiff ), 0.0, 1.0 );

			// Only the shallower pixel should detect the normal edge.

			const depthIndicator = clamp( sign( depthDiff.mul( .25 ).add( .0025 ) ), 0.0, 1.0 );

			return float( 1.0 ).sub( dot( normal, neighborNormal ) ).mul( depthIndicator ).mul( normalIndicator );

		};

		const normalEdgeIndicator = ( depth, normal ) => {

			const indicator = property( 'float', 'indicator' );

			indicator.addAssign( neighborNormalEdgeIndicator( 0, - 1, depth, normal ) );
			indicator.addAssign( neighborNormalEdgeIndicator( 0, 1, depth, normal ) );
			indicator.addAssign( neighborNormalEdgeIndicator( - 1, 0, depth, normal ) );
			indicator.addAssign( neighborNormalEdgeIndicator( 1, 0, depth, normal ) );

			return step( 0.1, indicator );

		};

		const pixelation = Fn( () => {

			const texel = sampleTexture();

			const depth = property( 'float', 'depth' );
			const normal = property( 'vec3', 'normal' );

			If( this.depthEdgeStrength.greaterThan( 0.0 ).or( this.normalEdgeStrength.greaterThan( 0.0 ) ), () => {

				depth.assign( sampleDepth( 0, 0 ) );
				normal.assign( sampleNormal( 0, 0 ) );

			} );

			const dei = property( 'float', 'dei' );

			If( this.depthEdgeStrength.greaterThan( 0.0 ), () => {

				dei.assign( depthEdgeIndicator( depth ) );

			} );

			const nei = property( 'float', 'nei' );

			If( this.normalEdgeStrength.greaterThan( 0.0 ), () => {

				nei.assign( normalEdgeIndicator( depth, normal ) );

			} );

			const strength = dei.greaterThan( 0 ).select( float( 1.0 ).sub( dei.mul( this.depthEdgeStrength ) ), nei.mul( this.normalEdgeStrength ).add( 1 ) );

			return texel.mul( strength );

		} );

		const outputNode = pixelation();

		return outputNode;

	}

}

const pixelation = ( node, depthNode, normalNode, pixelSize = 6, normalEdgeStrength = 0.3, depthEdgeStrength = 0.4 ) => nodeObject( new PixelationNode( convertToTexture( node ), convertToTexture( depthNode ), convertToTexture( normalNode ), nodeObject( pixelSize ), nodeObject( normalEdgeStrength ), nodeObject( depthEdgeStrength ) ) );

/**
 * A special render pass node that renders the scene with a pixelation effect.
 *
 * @augments PassNode
 * @three_import import { pixelationPass } from 'three/addons/tsl/display/PixelationPassNode.js';
 */
class PixelationPassNode extends PassNode {

	static get type() {

		return 'PixelationPassNode';

	}

	/**
	 * Constructs a new pixelation pass node.
	 *
	 * @param {Scene} scene - The scene to render.
	 * @param {Camera} camera - The camera to render the scene with.
	 * @param {Node<float> | number} [pixelSize=6] - The pixel size.
	 * @param {Node<float> | number} [normalEdgeStrength=0.3] - The normal edge strength.
	 * @param {Node<float> | number} [depthEdgeStrength=0.4] - The depth edge strength.
	 */
	constructor( scene, camera, pixelSize = 6, normalEdgeStrength = 0.3, depthEdgeStrength = 0.4 ) {

		super( PassNode.COLOR, scene, camera, { minFilter: NearestFilter, magFilter: NearestFilter } );

		/**
		 * The pixel size.
		 *
		 * @type {number}
		 * @default 6
		 */
		this.pixelSize = pixelSize;

		/**
		 * The normal edge strength.
		 *
		 * @type {number}
		 * @default 0.3
		 */
		this.normalEdgeStrength = normalEdgeStrength;

		/**
		 * The depth edge strength.
		 *
		 * @type {number}
		 * @default 0.4
		 */
		this.depthEdgeStrength = depthEdgeStrength;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isPixelationPassNode = true;

		this._mrt = mrt( {
			output: output,
			normal: normalView
		} );

	}

	/**
	 * Sets the size of the pass.
	 *
	 * @param {number} width - The width of the pass.
	 * @param {number} height - The height of the pass.
	 */
	setSize( width, height ) {

		const pixelSize = this.pixelSize.value ? this.pixelSize.value : this.pixelSize;

		const adjustedWidth = Math.floor( width / pixelSize );
		const adjustedHeight = Math.floor( height / pixelSize );

		super.setSize( adjustedWidth, adjustedHeight );

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {PixelationNode}
	 */
	setup() {

		const color = super.getTextureNode( 'output' );
		const depth = super.getTextureNode( 'depth' );
		const normal = super.getTextureNode( 'normal' );

		return pixelation( color, depth, normal, this.pixelSize, this.normalEdgeStrength, this.depthEdgeStrength );

	}

}

/**
 * TSL function for creating a pixelation render pass node for post processing.
 *
 * @tsl
 * @function
 * @param {Scene} scene - The scene to render.
 * @param {Camera} camera - The camera to render the scene with.
 * @param {Node<float> | number} [pixelSize=6] - The pixel size.
 * @param {Node<float> | number} [normalEdgeStrength=0.3] - The normal edge strength.
 * @param {Node<float> | number} [depthEdgeStrength=0.4] - The depth edge strength.
 * @returns {PixelationPassNode}
 */
export const pixelationPass = ( scene, camera, pixelSize, normalEdgeStrength, depthEdgeStrength ) => nodeObject( new PixelationPassNode( scene, camera, pixelSize, normalEdgeStrength, depthEdgeStrength ) );

export default PixelationPassNode;
