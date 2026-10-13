import {
	Compatibility,
	DepthTexture,
	GreaterEqualCompare,
	LessEqualCompare,
	LinearFilter,
	NearestFilter,
	PCFShadowMap,
	ShadowNode,
	Vector2,
	VSMShadowMap
} from 'three/webgpu';
import { Fn, If, float, mix, normalWorld, positionView, reference, renderGroup, shadowPositionWorld, smoothstep, texture, uniform, vec4 } from 'three/tsl';

let _vsmWarned = false;

/**
 * Represents the cascaded shadow map of a {@link SunLight}.
 *
 * The two cascade cameras are fitted by {@link SunLightShadow} and rendered
 * into the viewports of a single shadow map atlas. Each fragment walks the
 * cascades back to front, blending across the fade bands between them.
 *
 * @augments ShadowNode
 * @three_import import { sunShadow } from 'three/addons/lights/SunShadowNode.js';
 */
class SunShadowNode extends ShadowNode {

	static get type() {

		return 'SunShadowNode';

	}

	/**
	 * Constructs a new sun shadow node.
	 *
	 * @param {SunLight} light - The shadow casting sun light.
	 * @param {?SunLightShadow} [shadow=null] - An optional sun light shadow.
	 */
	constructor( light, shadow = null ) {

		super( light, shadow );

		/**
		 * The size of the shadow map atlas.
		 *
		 * @type {Vector2}
		 * @private
		 */
		this._atlasSize = new Vector2();

		const lightShadow = this.shadow;

		/**
		 * Shadow filters read their texel offsets from `mapSize`, so they must
		 * be given the atlas size rather than the cascade map size. This proxy
		 * stands in for the shadow when the filter function is set up.
		 *
		 * @type {Object}
		 * @private
		 */
		this._filterShadow = {

			mapSize: this._atlasSize,

			get radius() {

				return lightShadow.radius;

			}

		};

	}

	/**
	 * Overwrites the default implementation to size the render target as the cascade atlas.
	 *
	 * @param {SunLightShadow} shadow - The light shadow object.
	 * @param {NodeBuilder} builder - A reference to the current node builder.
	 * @return {Object} An object containing the shadow map and depth texture.
	 */
	setupRenderTarget( shadow, builder ) {

		const frameExtents = shadow.getFrameExtents();
		const width = shadow.mapSize.width * frameExtents.x;
		const height = shadow.mapSize.height * frameExtents.y;

		const depthTexture = new DepthTexture( width, height );
		depthTexture.name = 'SunShadowDepthTexture';
		depthTexture.compareFunction = builder.renderer.reversedDepthBuffer ? GreaterEqualCompare : LessEqualCompare;

		const shadowMap = builder.createRenderTarget( width, height );
		shadowMap.texture.name = 'SunShadowMap';
		shadowMap.texture.type = shadow.mapType;
		shadowMap.depthTexture = depthTexture;

		return { shadowMap, depthTexture };

	}

	/**
	 * Builds the per-fragment cascade blending.
	 *
	 * @private
	 * @param {NodeBuilder} builder - A reference to the current node builder.
	 * @param {Function} filterFn - The shadow filtering function.
	 * @return {Node<float>} The shadow value node.
	 */
	_setupCascades( builder, filterFn ) {

		// Full node updates refresh resized atlas bindings, even for stationary objects.

		builder.observer.hasNode = true;

		const { shadow, shadowMap } = this;
		const depthTexture = shadowMap.depthTexture;

		const shadowIntensity = reference( 'intensity', 'float', shadow ).setGroup( renderGroup );
		const normalBias = reference( 'normalBias', 'float', shadow ).setGroup( renderGroup );

		// evaluated outside the cascade branches so nodes shared with the rest of
		// the shader, like the world normal, are not trapped in a branch scope

		const shadowPosition = vec4( shadowPositionWorld.add( normalWorld.mul( normalBias ) ), 1 ).toVar();
		const viewDepth = positionView.z.negate().toVar();

		const shadowValue = float( 1 ).toVar( 'shadowValue' );

		// walk the cascades back to front so each fade band can blend with the shadow behind it

		for ( let i = shadow.getViewportCount() - 1; i >= 0; i -- ) {

			const shadowMatrix = uniform( 'mat4' ).setGroup( renderGroup ).onRenderUpdate( () => shadow.getMatrix( i ) );

			// ( begin, end, fade start ) view depths of the cascade

			const cascade = uniform( 'vec4' ).setGroup( renderGroup ).onRenderUpdate( () => shadow._cascadeData[ i ] );

			If( viewDepth.greaterThanEqual( cascade.x ).and( viewDepth.lessThan( cascade.y ) ), () => {

				const shadowCoord = this.setupShadowCoord( builder, shadowMatrix.mul( shadowPosition ) );

				const cascadeShadow = this.setupShadowFilter( builder, {
					filterFn,
					shadowTexture: shadowMap.texture,
					depthTexture,
					shadowCoord,
					shadow: this._filterShadow,
					depthLayer: this.depthLayer
				} );

				shadowValue.assign( mix( cascadeShadow, shadowValue, smoothstep( cascade.z, cascade.y, viewDepth ) ) );

			} );

		}

		return mix( 1, shadowValue, shadowIntensity );

	}

	/**
	 * Sets up the atlas render target and shadow output node.
	 *
	 * @param {NodeBuilder} builder - A reference to the current node builder.
	 * @return {Node<float>} The shadow output node.
	 */
	setupShadow( builder ) {

		const { renderer, camera } = builder;
		const { light, shadow } = this;

		let shadowMapType = renderer.shadowMap.type;

		if ( shadowMapType === VSMShadowMap ) {

			// the cascade atlas cannot be blurred as one map

			if ( _vsmWarned === false ) {

				console.warn( 'THREE.SunShadowNode: VSM is not supported, falling back to PCF.' );
				_vsmWarned = true;

			}

			shadowMapType = PCFShadowMap;

		}

		const filterFn = shadow.filterNode || this.getShadowFilterFn( shadowMapType ) || null;

		if ( filterFn === null ) {

			throw new Error( 'THREE.SunShadowNode: Shadow map type not supported.' );

		}

		const { depthTexture, shadowMap } = this.setupRenderTarget( shadow, builder );
		const hasTextureCompare = renderer.hasCompatibility( Compatibility.TEXTURE_COMPARE );

		if ( shadowMapType === PCFShadowMap && hasTextureCompare ) {

			depthTexture.minFilter = LinearFilter;
			depthTexture.magFilter = LinearFilter;

		} else {

			depthTexture.minFilter = NearestFilter;
			depthTexture.magFilter = NearestFilter;

		}

		this.shadowMap = shadowMap;
		shadow.map = shadowMap;

		this._atlasSize.set( shadowMap.width, shadowMap.height );

		// the cascade cameras inherit the coordinate system and depth mode from the shadow camera

		shadow.camera.coordinateSystem = camera.coordinateSystem;
		shadow.camera._reversedDepth = renderer.reversedDepthBuffer;

		// rebuild the cascade statements for each shader so their variables
		// and branches belong to that shader's scope

		const node = Fn( ( builder ) => this._setupCascades( builder, filterFn ) )().toVar();

		const inspectName = `${ light.type } Shadow [ ${ light.name || 'ID: ' + light.id } ]`;

		// the cascade cameras are orthographic, so the stored depth is linear already

		return node.toInspector( `${ inspectName } / Depth`, () => texture( depthTexture ).r.oneMinus() );

	}

	/**
	 * Renders the two cascades into the viewports of the shadow map atlas.
	 *
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 */
	renderShadow( frame ) {

		const { shadow, shadowMap, light } = this;
		const { renderer, scene, camera } = frame;

		shadow.updateMatrices( light, camera );

		const tileWidth = shadow.mapSize.width;
		const tileHeight = shadow.mapSize.height;
		const frameExtents = shadow.getFrameExtents();
		const width = tileWidth * frameExtents.x;
		const height = tileHeight * frameExtents.y;

		shadowMap.setSize( width, height );
		this._atlasSize.set( width, height );

		const currentSceneName = scene.name;

		scene.name = `Shadow Map [ ${ light.name || 'ID: ' + light.id } ]`;

		// clear once, the cascades share the atlas

		renderer.autoClear = false;
		renderer.clear();

		const cascadeCount = shadow.getViewportCount();

		for ( let i = 0; i < cascadeCount; i ++ ) {

			const viewport = shadow.getViewport( i );

			// viewports are measured from the top: flip the rows so the shadow
			// matrices, which bake their offsets bottom-up, sample the correct tile

			shadowMap.viewport.set(
				tileWidth * viewport.x,
				shadowMap.height - tileHeight * ( viewport.y + viewport.w ),
				tileWidth * viewport.z,
				tileHeight * viewport.w
			);

			renderer.render( scene, shadow.getCamera( i ) );

		}

		scene.name = currentSceneName;

	}

	/**
	 * Overwritten as a no-op since VSM is not supported for cascaded shadow maps.
	 *
	 * @param {Renderer} renderer - A reference to the current renderer.
	 */
	vsmPass( /*renderer*/ ) { }

}

export { SunShadowNode };

/**
 * TSL function for creating an instance of `SunShadowNode`.
 *
 * @tsl
 * @function
 * @param {SunLight} light - The shadow casting sun light.
 * @param {?SunLightShadow} [shadow=null] - An optional sun light shadow.
 * @return {SunShadowNode} The created sun shadow node.
 */
export const sunShadow = ( light, shadow ) => new SunShadowNode( light, shadow );
