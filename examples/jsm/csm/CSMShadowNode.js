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

class CSMShadowNode extends ShadowBaseNode {

	constructor( light, data = {} ) {

		super( light );

		this.camera = null;
		this.cascades = data.cascades || 3;
		this.maxFar = data.maxFar || 100000;
		this.mode = data.mode || 'practical';
		this.lightMargin = data.lightMargin || 200;
		this.customSplitsCallback = data.customSplitsCallback;

		this.fade = false;

		this.breaks = [];

		this._cascades = [];
		this.mainFrustum = null;
		this.frustums = [];

		this.lights = [];

		this._shadowNodes = [];

	}

	init( { camera, renderer } ) {

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

	initCascades() {

		const camera = this.camera;
		camera.updateProjectionMatrix();

		this.mainFrustum.setFromProjectionMatrix( camera.projectionMatrix, this.maxFar );
		this.mainFrustum.split( this.breaks, this.frustums );

	}

	getBreaks() {

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

	setLightBreaks() {

		for ( let i = 0, l = this.cascades; i < l; i ++ ) {

			const amount = this.breaks[ i ];
			const prev = this.breaks[ i - 1 ] || 0;

			this._cascades[ i ].set( prev, amount );

		}

	}

	updateShadowBounds() {

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

	updateFrustums() {

		this.getBreaks();
		this.initCascades();
		this.updateShadowBounds();
		this.setLightBreaks();

	}

	setupFade() {

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

	setupStandard() {

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

		if ( this.camera === null ) this.init( builder );

		return this.fade === true ? this.setupFade() : this.setupStandard();

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

export { CSMShadowNode };
