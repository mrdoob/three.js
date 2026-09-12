import { NearestFilter, PassNode } from 'three/webgpu';
import { nodeObject, Fn, float, uv, vec2, vec3, clamp, floor, dot, smoothstep, If, sign, step, mrt, output, normalView, property, vec4, textureSize } from 'three/tsl';

/**
 * A special render pass node that renders the scene with a pixelation effect,
 * creating a visual presentation similar to that of a 2D pixel art game.
 *
 * The effect is achieved by rendering into a render target whose dimensions
 * are scaled down by {@link PixelationPassNode#pixelSize}.
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
	 * @param {number} [pixelSize=6] - The pixel size.
	 * @param {Node<float> | number} [normalEdgeStrength=0.3] - The normal edge strength.
	 * @param {Node<float> | number} [depthEdgeStrength=0.4] - The depth edge strength.
	 */
	constructor( scene, camera, pixelSize = 6, normalEdgeStrength = 0.3, depthEdgeStrength = 0.4 ) {

		super( PassNode.COLOR, scene, camera, { minFilter: NearestFilter, magFilter: NearestFilter } );

		/**
		 * The pixel size. This value scales the pass's render target.
		 *
		 * @type {number}
		 * @default 6
		 */
		this.pixelSize = pixelSize;

		/**
		 * The normal edge strength.
		 *
		 * @type {Node<float>}
		 * @default 0.3
		 */
		this.normalEdgeStrength = nodeObject( normalEdgeStrength );

		/**
		 * The depth edge strength.
		 *
		 * @type {Node<float>}
		 * @default 0.4
		 */
		this.depthEdgeStrength = nodeObject( depthEdgeStrength );

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
	 * `PassNode.updateBefore()` calls this method once per frame, so
	 * {@link PixelationPassNode#pixelSize} can be changed at any time.
	 *
	 * @param {number} width - The width of the pass.
	 * @param {number} height - The height of the pass.
	 */
	setSize( width, height ) {

		const adjustedWidth = Math.floor( width / this.pixelSize );
		const adjustedHeight = Math.floor( height / this.pixelSize );

		super.setSize( adjustedWidth, adjustedHeight );

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {ShaderCallNodeInternal}
	 */
	setup( /* builder */ ) {

		const textureNode = this.getTextureNode( 'output' );
		const depthNode = this.getTextureNode( 'depth' );
		const normalNode = this.getTextureNode( 'normal' );

		const uvNodeTexture = textureNode.uvNode || uv();
		const uvNodeDepth = depthNode.uvNode || uv();
		const uvNodeNormal = normalNode.uvNode || uv();

		const sampleTexture = () => textureNode.sample( uvNodeTexture );
		const sampleDepth = ( uv ) => depthNode.sample( uv ).r;
		const sampleNormal = ( uv ) => normalNode.sample( uv ).rgb.normalize();

		const depthEdgeIndicator = ( depth, depthE, depthW, depthN, depthS ) => {

			const diff = property( 'float', 'diff' );
			diff.addAssign( clamp( depthE.sub( depth ) ) );
			diff.addAssign( clamp( depthW.sub( depth ) ) );
			diff.addAssign( clamp( depthN.sub( depth ) ) );
			diff.addAssign( clamp( depthS.sub( depth ) ) );

			return floor( smoothstep( 0.01, 0.02, diff ).mul( 2 ) ).div( 2 );

		};

		const neighborNormalEdgeIndicator = ( x, y, neighborDepth, depth, normal, invSize ) => {

			const depthDiff = neighborDepth.sub( depth ).toConst();
			const neighborNormal = sampleNormal( uvNodeNormal.add( vec2( x, y ).mul( invSize ) ) ).toConst();

			// Edge pixels should yield to faces who's normals are closer to the bias normal.

			const normalEdgeBias = vec3( 1, 1, 1 ); // This should probably be a parameter.
			const normalDiff = dot( normal.sub( neighborNormal ), normalEdgeBias ).toConst();
			const normalIndicator = clamp( smoothstep( - 0.01, 0.01, normalDiff ), 0.0, 1.0 ).toConst();

			// Only the shallower pixel should detect the normal edge.

			const depthIndicator = clamp( sign( depthDiff.mul( .25 ).add( .0025 ) ), 0.0, 1.0 ).toConst();

			return float( 1.0 ).sub( dot( normal, neighborNormal ) ).mul( depthIndicator ).mul( normalIndicator );

		};

		const normalEdgeIndicator = ( depth, normal, depthE, depthW, depthN, depthS, invSize ) => {

			const indicator = property( 'float', 'indicator' );

			indicator.addAssign( neighborNormalEdgeIndicator( 0, - 1, depthS, depth, normal, invSize ) );
			indicator.addAssign( neighborNormalEdgeIndicator( 0, 1, depthN, depth, normal, invSize ) );
			indicator.addAssign( neighborNormalEdgeIndicator( - 1, 0, depthW, depth, normal, invSize ) );
			indicator.addAssign( neighborNormalEdgeIndicator( 1, 0, depthE, depth, normal, invSize ) );

			return step( 0.1, indicator );

		};

		const pixelation = Fn( () => {

			const texel = sampleTexture();

			const depth = property( 'float', 'depth' );
			const normal = property( 'vec3', 'normal' );

			const depthE = float().toVar();
			const depthW = float().toVar();
			const depthN = float().toVar();
			const depthS = float().toVar();

			const invSize = vec2( 1 ).div( textureSize( textureNode ) ).toConst();

			If( this.depthEdgeStrength.greaterThan( 0.0 ).or( this.normalEdgeStrength.greaterThan( 0.0 ) ), () => {

				depth.assign( sampleDepth( uvNodeDepth ) );
				normal.assign( sampleNormal( uvNodeNormal ) );

				depthE.assign( sampleDepth( uvNodeDepth.add( vec2( 1, 0 ).mul( invSize ) ) ) );
				depthW.assign( sampleDepth( uvNodeDepth.add( vec2( - 1, 0 ).mul( invSize ) ) ) );
				depthN.assign( sampleDepth( uvNodeDepth.add( vec2( 0, 1 ).mul( invSize ) ) ) );
				depthS.assign( sampleDepth( uvNodeDepth.add( vec2( 0, - 1 ).mul( invSize ) ) ) );

			} );

			const dei = property( 'float', 'dei' );

			If( this.depthEdgeStrength.greaterThan( 0.0 ), () => {

				dei.assign( depthEdgeIndicator( depth, depthE, depthW, depthN, depthS ) );

			} );

			const nei = property( 'float', 'nei' );

			If( this.normalEdgeStrength.greaterThan( 0.0 ).and( normal.length().greaterThan( 0 ) ), () => {

				nei.assign( normalEdgeIndicator( depth, normal, depthE, depthW, depthN, depthS, invSize ) );

			} );

			const strength = dei.greaterThan( 0 ).select( float( 1.0 ).sub( dei.mul( this.depthEdgeStrength ) ), nei.mul( this.normalEdgeStrength ).add( 1 ) );

			return vec4( texel.mul( strength ).rgb, texel.a );

		} );

		const outputNode = pixelation();

		return outputNode;

	}

}

/**
 * TSL function for creating a pixelation render pass node for post processing.
 *
 * @tsl
 * @function
 * @param {Scene} scene - The scene to render.
 * @param {Camera} camera - The camera to render the scene with.
 * @param {number} [pixelSize=6] - The pixel size.
 * @param {Node<float> | number} [normalEdgeStrength=0.3] - The normal edge strength.
 * @param {Node<float> | number} [depthEdgeStrength=0.4] - The depth edge strength.
 * @returns {PixelationPassNode}
 */
export const pixelationPass = ( scene, camera, pixelSize, normalEdgeStrength, depthEdgeStrength ) => new PixelationPassNode( scene, camera, pixelSize, normalEdgeStrength, depthEdgeStrength );

export default PixelationPassNode;
