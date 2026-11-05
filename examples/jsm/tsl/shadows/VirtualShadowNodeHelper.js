import { GreaterEqualCompare, Mesh, NodeMaterial, PlaneGeometry } from 'three/webgpu';
import { float, max, mix, positionGeometry, screenSize, step, texture, uv, vec2, vec3, vec4 } from 'three/tsl';

/**
 * A helper that shows the physical atlas of a {@link VirtualShadowNode} in the bottom left
 * corner of the screen. Geometry in the pages is dark, empty space is white and the slot
 * borders are red.
 *
 * ```js
 * const helper = new VirtualShadowNodeHelper( virtualShadowNode );
 * scene.add( helper );
 *
 * // in the animation loop
 * helper.update();
 * ```
 *
 * @augments Mesh
 * @three_import import { VirtualShadowNodeHelper } from 'three/addons/tsl/shadows/VirtualShadowNodeHelper.js';
 */
class VirtualShadowNodeHelper extends Mesh {

	/**
	 * Constructs a new virtual shadow node helper.
	 *
	 * @param {VirtualShadowNode} virtualShadowNode - The virtual shadow node.
	 * @param {number} [size=0.4] - The height of the atlas view, relative to the screen height.
	 */
	constructor( virtualShadowNode, size = 0.4 ) {

		const material = new NodeMaterial();
		material.name = 'VirtualShadowNodeHelper';
		material.depthTest = false;
		material.depthWrite = false;
		material.fog = false;
		material.lights = false;

		super( new PlaneGeometry( 2, 2 ), material );

		/**
		 * The virtual shadow node.
		 *
		 * @type {VirtualShadowNode}
		 */
		this.virtualShadowNode = virtualShadowNode;

		/**
		 * The height of the atlas view, relative to the screen height.
		 *
		 * @type {number}
		 */
		this.size = size;

		this.type = 'VirtualShadowNodeHelper';
		this.frustumCulled = false;
		this.renderOrder = Infinity;
		this.material.visible = false;

		this._depthTexture = null;

	}

	/**
	 * Updates the helper. Call this method once per frame. The atlas shows when it exists.
	 */
	update() {

		const shadowMap = this.virtualShadowNode.shadowMap;
		const depthTexture = shadowMap !== null ? shadowMap.depthTexture : null;

		if ( depthTexture === this._depthTexture ) return;

		this._depthTexture = depthTexture;
		this.material.visible = depthTexture !== null;

		if ( depthTexture === null ) return;

		const material = this.material;
		const physicalPages = this.virtualShadowNode.physicalPages;
		const reversed = depthTexture.compareFunction === GreaterEqualCompare;

		// A square in the bottom left corner of the screen.

		const height = float( this.size * 2 );
		const width = height.mul( screenSize.y ).div( screenSize.x );
		const margin = float( 0.04 );
		const corner = positionGeometry.xy.mul( 0.5 ).add( 0.5 );

		material.vertexNode = vec4(
			corner.x.mul( width ).add( margin.mul( screenSize.y ).div( screenSize.x ) ).sub( 1 ),
			corner.y.mul( height ).add( margin ).sub( 1 ),
			0,
			1
		);

		// A depth comparison close to the far plane separates the geometry from the cleared depth.

		const atlasUV = uv().flipY();
		const empty = texture( depthTexture ).sample( atlasUV ).compare( reversed ? 0.001 : 0.999 );

		// Red lines at the borders of the slots.

		const slotUV = atlasUV.mul( physicalPages ).fract();
		const lineWidth = 0.02;
		const line = max( step( slotUV, vec2( lineWidth ) ), step( vec2( 1 - lineWidth ), slotUV ) );

		material.outputNode = vec4( mix( vec3( empty.mul( 0.8 ).add( 0.1 ) ), vec3( 1, 0, 0 ), max( line.x, line.y ) ), 1 );
		material.needsUpdate = true;

	}

	/**
	 * Frees the GPU resources of this helper.
	 */
	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}

export { VirtualShadowNodeHelper };
