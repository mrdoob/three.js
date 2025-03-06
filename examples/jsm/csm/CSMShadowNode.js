import {
	Vector2,
	Vector3,
	MathUtils,
	Matrix4,
	Box3,
	Object3D,
	WebGLCoordinateSystem,
	ShadowBaseNode
} from 'three/webgpu';

import { CSMFrustum } from './CSMFrustum.js';
import { viewZToOrthographicDepth, reference, uniform, float, vec4, vec2, If, Fn, min, renderGroup, positionView, shadow } from 'three/tsl';

const _cameraToLightMatrix = new Matrix4();
const _lightSpaceFrustum = new CSMFrustum();
const _center = new Vector3();
const _bbox = new Box3();
const _uniformArray = [];
const _logArray = [];
const _lightDirection = new Vector3();
const _lightOrientationMatrix = new Matrix4();
const _lightOrientationMatrixInverse = new Matrix4();
const _up = new Vector3( 0, 1, 0 );

class LwLight extends Object3D {

	constructor() {

		super();

		this.target = new Object3D();

	}

}

/**
 * An implementation of Cascade Shadow Maps (CSM).
 *
 * This module can only be used with {@link WebGPURenderer}. When using {@link WebGLRenderer},
 * use {@link CSM} instead.
 *
 * @augments ShadowBaseNode
 */
class CSMShadowNode extends ShadowBaseNode {

	/**
	 * Constructs a new CSM shadow node.
	 *
	 * @param {DirectionalLight} light - The CSM light.
	 * @param {CSMShadowNode~Data} [data={}] - The CSM data.
	 */
	constructor( light, data = {} ) {

		super( light );

		/**
		 * The scene's camera.
		 *
		 * @type {?Camera}
		 * @default null
		 */
		this.camera = null;

		/**
		 * The number of cascades.
		 *
		 * @type {number}
		 * @default 3
		 */
		this.cascades = data.cascades || 3;

		/**
		 * The maximum far value.
		 *
		 * @type {number}
		 * @default 100000
		 */
		this.maxFar = data.maxFar || 100000;

		/**
		 * The frustum split mode.
		 *
		 * @type {('practical'|'uniform'|'logarithmic'|'custom')}
		 * @default 'practical'
		 */
		this.mode = data.mode || 'practical';

		/**
		 * The light margin.
		 *
		 * @type {number}
		 * @default 200
		 */
		this.lightMargin = data.lightMargin || 200;

		/**
		 * Custom split callback when using `mode='custom'`.
		 *
		 * @type {Function}
		 */
		this.customSplitsCallback = data.customSplitsCallback;

		/**
		 * Whether to fade between cascades or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.fade = false;

		/**
		 * An array of numbers in the range `[0,1]` the defines how the
		 * mainCSM frustum should be split up.
		 *
		 * @type {Array<number>}
		 */
		this.breaks = [];

		this._cascades = [];

		/**
		 * The main frustum.
		 *
		 * @type {?CSMFrustum}
		 * @default null
		 */
		this.mainFrustum = null;

		/**
		 * An array of frustums representing the cascades.
		 *
		 * @type {Array<CSMFrustum>}
		 */
		this.frustums = [];

		/**
		 * An array of directional lights which cast the shadows for
		 * the different cascades. There is one directional light for each
		 * cascade.
		 *
		 * @type {Array<DirectionalLight>}
		 */
		this.lights = [];

		this._shadowNodes = [];

	}

	/**
	 * Inits the CSM shadow node.
	 *
	 * @private
	 * @param {NodeBuilder} builder - The node builder.
	 */
	_init( { camera, renderer } ) {

		this.camera = camera;

		const data = { webGL: renderer.coordinateSystem === WebGLCoordinateSystem };
		this.mainFrustum = new CSMFrustum( data );

		const light = this.light;
		const parent = light.parent;

		for ( let i = 0; i < this.cascades; i ++ ) {

			const lwLight = new LwLight();
			lwLight.castShadow = true;

			const lShadow = light.shadow.clone();
			lShadow.bias = lShadow.bias * ( i + 1 );

			this.lights.push( lwLight );

			parent.add( lwLight );
			parent.add( lwLight.target );

			lwLight.shadow = lShadow;

			this._shadowNodes.push( shadow( lwLight, lShadow ) );

			this._cascades.push( new Vector2() );

		}

		this.updateFrustums();

	}

	/**
	 * Inits the cascades according to the scene's camera and breaks configuration.
	 *
	 * @private
	 */
	_initCascades() {

		const camera = this.camera;
		camera.updateProjectionMatrix();

		this.mainFrustum.setFromProjectionMatrix( camera.projectionMatrix, this.maxFar );
		this.mainFrustum.split( this.breaks, this.frustums );

	}

	/**
	 * Computes the breaks of this CSM instance based on the scene's camera, number of cascades
	 * and the selected split mode.
	 *
	 * @private
	 */
	_getBreaks() {

		const camera = this.camera;
		const far = Math.min( camera.far, this.maxFar );

		this.breaks.length = 0;

		switch ( this.mode ) {

			case 'uniform':
				uniformSplit( this.cascades, camera.near, far, this.breaks );
				break;

			case 'logarithmic':
				logarithmicSplit( this.cascades, camera.near, far, this.breaks );
				break;

			case 'practical':
				practicalSplit( this.cascades, camera.near, far, 0.5, this.breaks );
				break;

			case 'custom':
				if ( this.customSplitsCallback === undefined ) console.error( 'CSM: Custom split scheme callback not defined.' );
				this.customSplitsCallback( this.cascades, camera.near, far, this.breaks );
				break;

		}

		function uniformSplit( amount, near, far, target ) {

			for ( let i = 1; i < amount; i ++ ) {

				target.push( ( near + ( far - near ) * i / amount ) / far );

			}

			target.push( 1 );

		}

		function logarithmicSplit( amount, near, far, target ) {

			for ( let i = 1; i < amount; i ++ ) {

				target.push( ( near * ( far / near ) ** ( i / amount ) ) / far );

			}

			target.push( 1 );

		}

		function practicalSplit( amount, near, far, lambda, target ) {

			_uniformArray.length = 0;
			_logArray.length = 0;
			logarithmicSplit( amount, near, far, _logArray );
			uniformSplit( amount, near, far, _uniformArray );

			for ( let i = 1; i < amount; i ++ ) {

				target.push( MathUtils.lerp( _uniformArray[ i - 1 ], _logArray[ i - 1 ], lambda ) );

			}

			target.push( 1 );

		}

	}

	/**
	 * Sets the light breaks.
	 *
	 * @private
	 */
	_setLightBreaks() {

		for ( let i = 0, l = this.cascades; i < l; i ++ ) {

			const amount = this.breaks[ i ];
			const prev = this.breaks[ i - 1 ] || 0;

			this._cascades[ i ].set( prev, amount );

		}

	}

	/**
	 * Updates the shadow bounds of this CSM instance.
	 *
	 * @private
	 */
	_updateShadowBounds() {

		const frustums = this.frustums;

		for ( let i = 0; i < frustums.length; i ++ ) {

			const shadowCam = this.lights[ i ].shadow.camera;
			const frustum = this.frustums[ i ];

			// Get the two points that represent that furthest points on the frustum assuming
			// that's either the diagonal across the far plane or the diagonal across the whole
			// frustum itself.
			const nearVerts = frustum.vertices.near;
			const farVerts = frustum.vertices.far;
			const point1 = farVerts[ 0 ];

			let point2;

			if ( point1.distanceTo( farVerts[ 2 ] ) > point1.distanceTo( nearVerts[ 2 ] ) ) {

				point2 = farVerts[ 2 ];

			} else {

				point2 = nearVerts[ 2 ];

			}

			let squaredBBWidth = point1.distanceTo( point2 );

			if ( this.fade ) {

				// expand the shadow extents by the fade margin if fade is enabled.
				const camera = this.camera;
				const far = Math.max( camera.far, this.maxFar );
				const linearDepth = frustum.vertices.far[ 0 ].z / ( far - camera.near );
				const margin = 0.25 * Math.pow( linearDepth, 2.0 ) * ( far - camera.near );

				squaredBBWidth += margin;

			}

			shadowCam.left = - squaredBBWidth / 2;
			shadowCam.right = squaredBBWidth / 2;
			shadowCam.top = squaredBBWidth / 2;
			shadowCam.bottom = - squaredBBWidth / 2;
			shadowCam.updateProjectionMatrix();

		}

	}

	/**
	 * Applications must call this method every time they change camera or CSM settings.
	 */
	updateFrustums() {

		this._getBreaks();
		this._initCascades();
		this._updateShadowBounds();
		this._setLightBreaks();

	}

	/**
	 * Setups the TSL when using fading.
	 *
	 * @private
	 * @return {ShaderCallNodeInternal}
	 */
	_setupFade() {

		const cameraNear = reference( 'camera.near', 'float', this ).setGroup( renderGroup );
		const cascades = reference( '_cascades', 'vec2', this ).setGroup( renderGroup ).label( 'cascades' );

		const shadowFar = uniform( 'float' ).setGroup( renderGroup ).label( 'shadowFar' )
			.onRenderUpdate( () => Math.min( this.maxFar, this.camera.far ) );

		const linearDepth = viewZToOrthographicDepth( positionView.z, cameraNear, shadowFar ).toVar( 'linearDepth' );
		const lastCascade = this.cascades - 1;

		return Fn( ( builder ) => {

			this.setupShadowPosition( builder );

			const ret = vec4( 1, 1, 1, 1 ).toVar( 'shadowValue' );

			const cascade = vec2().toVar( 'cascade' );
			const cascadeCenter = float().toVar( 'cascadeCenter' );

			const margin = float().toVar( 'margin' );

			const csmX = float().toVar( 'csmX' );
			const csmY = float().toVar( 'csmY' );

			for ( let i = 0; i < this.cascades; i ++ ) {

				const isLastCascade = i === lastCascade;

				cascade.assign( cascades.element( i ) );

				cascadeCenter.assign( cascade.x.add( cascade.y ).div( 2.0 ) );

				const closestEdge = linearDepth.lessThan( cascadeCenter ).select( cascade.x, cascade.y );

				margin.assign( float( 0.25 ).mul( closestEdge.pow( 2.0 ) ) );

				csmX.assign( cascade.x.sub( margin.div( 2.0 ) ) );

				if ( isLastCascade ) {

					csmY.assign( cascade.y );

				} else {

					csmY.assign( cascade.y.add( margin.div( 2.0 ) ) );

				}

				const inRange = linearDepth.greaterThanEqual( csmX ).and( linearDepth.lessThanEqual( csmY ) );

				If( inRange, () => {

					const dist = min( linearDepth.sub( csmX ), csmY.sub( linearDepth ) ).toVar();

					let ratio = dist.div( margin ).clamp( 0.0, 1.0 );

					if ( i === 0 ) {

						// don't fade at nearest edge
						ratio = linearDepth.greaterThan( cascadeCenter ).select( ratio, 1 );

					}

					ret.subAssign( this._shadowNodes[ i ].oneMinus().mul( ratio ) );

				} );

			}

			return ret;

		} )();

	}

	/**
	 * Setups the TSL when no fading (default).
	 *
	 * @private
	 * @return {ShaderCallNodeInternal}
	 */
	_setupStandard() {

		const cameraNear = reference( 'camera.near', 'float', this ).setGroup( renderGroup );
		const cascades = reference( '_cascades', 'vec2', this ).setGroup( renderGroup ).label( 'cascades' );

		const shadowFar = uniform( 'float' ).setGroup( renderGroup ).label( 'shadowFar' )
			.onRenderUpdate( () => Math.min( this.maxFar, this.camera.far ) );

		const linearDepth = viewZToOrthographicDepth( positionView.z, cameraNear, shadowFar ).toVar( 'linearDepth' );

		return Fn( ( builder ) => {

			this.setupShadowPosition( builder );

			const ret = vec4( 1, 1, 1, 1 ).toVar( 'shadowValue' );
			const cascade = vec2().toVar( 'cascade' );

			for ( let i = 0; i < this.cascades; i ++ ) {

				cascade.assign( cascades.element( i ) );

				If( linearDepth.greaterThanEqual( cascade.x ).and( linearDepth.lessThanEqual( cascade.y ) ), () => {

					ret.assign( this._shadowNodes[ i ] );

				} );

			}

			return ret;

		} )();

	}

	setup( builder ) {

		if ( this.camera === null ) this._init( builder );

		return this.fade === true ? this._setupFade() : this._setupStandard();

	}

	updateBefore( /*builder*/ ) {

		const light = this.light;
		const camera = this.camera;
		const frustums = this.frustums;

		_lightDirection.subVectors( light.target.position, light.position ).normalize();

		// for each frustum we need to find its min-max box aligned with the light orientation
		// the position in _lightOrientationMatrix does not matter, as we transform there and back
		_lightOrientationMatrix.lookAt( light.position, light.target.position, _up );
		_lightOrientationMatrixInverse.copy( _lightOrientationMatrix ).invert();

		for ( let i = 0; i < frustums.length; i ++ ) {

			const lwLight = this.lights[ i ];
			const shadow = lwLight.shadow;
			const shadowCam = shadow.camera;
			const texelWidth = ( shadowCam.right - shadowCam.left ) / shadow.mapSize.width;
			const texelHeight = ( shadowCam.top - shadowCam.bottom ) / shadow.mapSize.height;

			_cameraToLightMatrix.multiplyMatrices( _lightOrientationMatrixInverse, camera.matrixWorld );
			frustums[ i ].toSpace( _cameraToLightMatrix, _lightSpaceFrustum );

			const nearVerts = _lightSpaceFrustum.vertices.near;
			const farVerts = _lightSpaceFrustum.vertices.far;

			_bbox.makeEmpty();

			for ( let j = 0; j < 4; j ++ ) {

				_bbox.expandByPoint( nearVerts[ j ] );
				_bbox.expandByPoint( farVerts[ j ] );

			}

			_bbox.getCenter( _center );
			_center.z = _bbox.max.z + this.lightMargin;
			_center.x = Math.floor( _center.x / texelWidth ) * texelWidth;
			_center.y = Math.floor( _center.y / texelHeight ) * texelHeight;
			_center.applyMatrix4( _lightOrientationMatrix );

			lwLight.position.copy( _center );
			lwLight.target.position.copy( _center );
			lwLight.target.position.add( _lightDirection );

		}

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		for ( let i = 0; i < this.lights.length; i ++ ) {

			const light = this.lights[ i ];
			const parent = light.parent;

			parent.remove( light.target );
			parent.remove( light );

		}

		super.dispose();

	}

}

/**
 * Constructor data of `CSMShadowNode`.
 *
 * @typedef {Object} CSMShadowNode~Data
 * @property {number} [cascades=3] - The number of cascades.
 * @property {number} [maxFar=100000] - The maximum far value.
 * @property {('practical'|'uniform'|'logarithmic'|'custom')} [mode='practical'] - The frustum split mode.
 * @property {Function} [customSplitsCallback] - Custom split callback when using `mode='custom'`.
 * @property {number} [lightMargin=200] - The light margin.
 **/

export { CSMShadowNode };
