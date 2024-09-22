import {
	Vector2,
	Vector3,
	DirectionalLight,
	MathUtils,
	Matrix4,
	Box3
} from 'three';

import { CSMFrustum } from './CSMFrustum.js';
import { CSMLightingModel } from './CSMLightingModel.js';
import { CSMFadeLightingModel } from './CSMFadeLightingModel.js';

const _cameraToLightMatrix = new Matrix4();
const _lightSpaceFrustum = new CSMFrustum();
const _center = new Vector3();
const _bbox = new Box3();
const _uniformArray = [];
const _logArray = [];
const _lightOrientationMatrix = new Matrix4();
const _lightOrientationMatrixInverse = new Matrix4();
const _up = new Vector3( 0, 1, 0 );

export class CSM {

	constructor( data ) {

		this.camera = data.camera;
		this.parent = data.parent;
		this.cascades = data.cascades || 3;
		this.maxFar = data.maxFar || 100000;
		this.mode = data.mode || 'practical';
		this.shadowMapSize = data.shadowMapSize || 2048;
		this.shadowBias = data.shadowBias || - 0.00002;
		this.lightDirection = data.lightDirection || new Vector3( 1, - 1, 1 ).normalize();
		this.lightIntensity = data.lightIntensity || 3;
		this.lightNear = data.lightNear || 1;
		this.lightFar = data.lightFar || 2000;
		this.lightMargin = data.lightMargin || 200;
		this.customSplitsCallback = data.customSplitsCallback;
		this.fade = false;
		this.enabled = true;
		this.mainFrustum = new CSMFrustum();
		this.frustums = [];
		this.breaks = [];

		this.lights = [];

		this.createLights();
		this.updateFrustums();

	}

	createLights() {

		this._currentFade = this.fade;

		for ( let i = 0; i < this.cascades; i ++ ) {

			const light = new DirectionalLight( 0xFFFFFF, this.lightIntensity );

			light.castShadow = true;
			light.shadow.mapSize.width = this.shadowMapSize;
			light.shadow.mapSize.height = this.shadowMapSize;

			light.shadow.camera.near = this.lightNear;
			light.shadow.camera.far = this.lightFar;
			light.shadow.bias = this.shadowBias;

			light.lightingModel = this.fade === true ? new CSMFadeLightingModel() : new CSMLightingModel();

			light.userData.csmIndex = i;
			light.userData.csmLastCascade = this.cascades - 1;
			light.userData.csmCascade = new Vector2();
			light.userData.csm = this;

			this.parent.add( light );
			this.parent.add( light.target );
			this.lights.push( light );

		}

	}

	updateLights( enable = true ) {

		if ( this.fade !== this._currentFade || this.enabled !== enable ) {

			const lightingModel = enable ? ( this.fade === true ? new CSMFadeLightingModel() : new CSMLightingModel() ) : null;

			const lights = this.lights;

			for ( let i = 0; i < lights.length; i ++ ) {

				const light = lights[ i ];

				light.lightingModel = lightingModel;
				light.visible = enable || i === 0;

			}

			this._currentFade = this.fade;
			this.enabled = enable;

		}

	}

	initCascades() {

		const camera = this.camera;
		camera.updateProjectionMatrix();

		this.mainFrustum.setFromProjectionMatrix( camera.projectionMatrix, this.maxFar );
		this.mainFrustum.split( this.breaks, this.frustums );

	}

	updateShadowBounds() {

		const frustums = this.frustums;

		for ( let i = 0; i < frustums.length; i ++ ) {

			const light = this.lights[ i ];
			const shadowCam = light.shadow.camera;
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

	update() {

		const camera = this.camera;
		const frustums = this.frustums;

		// for each frustum we need to find its min-max box aligned with the light orientation
		// the position in _lightOrientationMatrix does not matter, as we transform there and back
		_lightOrientationMatrix.lookAt( new Vector3(), this.lightDirection, _up );
		_lightOrientationMatrixInverse.copy( _lightOrientationMatrix ).invert();

		for ( let i = 0; i < frustums.length; i ++ ) {

			const light = this.lights[ i ];
			const shadowCam = light.shadow.camera;
			const texelWidth = ( shadowCam.right - shadowCam.left ) / this.shadowMapSize;
			const texelHeight = ( shadowCam.top - shadowCam.bottom ) / this.shadowMapSize;

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

			light.position.copy( _center );
			light.target.position.copy( _center );

			light.target.position.x += this.lightDirection.x;
			light.target.position.y += this.lightDirection.y;
			light.target.position.z += this.lightDirection.z;

		}

	}

	updateUniforms() {

		this.setLightBreaks();
		this.shadowFar = Math.min( this.camera.far, this.maxFar );

	}

	setLightBreaks() {

		for ( let i = 0; i < this.cascades; i ++ ) {

			const light = this.lights[ i ];

			const amount = this.breaks[ i ];
			const prev = this.breaks[ i - 1 ] || 0;

			light.userData.csmCascade.set( prev, amount );

		}

	}

	updateFrustums() {

		this.getBreaks();
		this.initCascades();
		this.updateShadowBounds();
		this.updateUniforms();
		this.updateLights( this.enabled );

	}

	remove() {

		for ( let i = 0; i < this.lights.length; i ++ ) {

			this.parent.remove( this.lights[ i ].target );
			this.parent.remove( this.lights[ i ] );

		}

	}

	dispose() {

	}

}
