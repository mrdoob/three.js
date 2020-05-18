/**
 * @author vHawk / https://github.com/vHawk/
 */

import {
	Vector2,
	Vector3,
	DirectionalLight,
	MathUtils,
	ShaderChunk,
	Matrix4,
	Box3
} from '../../../build/three.module.js';
import Frustum from './Frustum.js';
import Shader from './Shader.js';

const _cameraToLightMatrix = new Matrix4();
const _lightSpaceFrustum = new Frustum();
const _center = new Vector3();
const _bbox = new Box3();
const _uniformArray = [];
const _logArray = [];

export class CSM {

	constructor( data ) {

		data = data || {};

		this.camera = data.camera;
		this.parent = data.parent;
		this.cascades = data.cascades || 3;
		this.maxFar = data.maxFar || 100000;
		this.mode = data.mode || 'practical';
		this.shadowMapSize = data.shadowMapSize || 2048;
		this.shadowBias = data.shadowBias || 0.000001;
		this.lightDirection = data.lightDirection || new Vector3( 1, - 1, 1 ).normalize();
		this.lightIntensity = data.lightIntensity || 1;
		this.lightNear = data.lightNear || 1;
		this.lightFar = data.lightFar || 2000;
		this.lightMargin = data.lightMargin || 200;
		this.customSplitsCallback = data.customSplitsCallback;
		this.fade = false;
		this.mainFrustum = new Frustum();
		this.frustums = [];
		this.breaks = [];

		this.lights = [];
		this.shaders = new Map();

		this.createLights();
		this.updateFrustums();
		this.injectInclude();

	}

	createLights() {

		for ( let i = 0; i < this.cascades; i ++ ) {

			const light = new DirectionalLight( 0xffffff, this.lightIntensity );
			light.castShadow = true;
			light.shadow.mapSize.width = this.shadowMapSize;
			light.shadow.mapSize.height = this.shadowMapSize;

			light.shadow.camera.near = this.lightNear;
			light.shadow.camera.far = this.lightFar;
			light.shadow.bias = this.shadowBias;

			this.parent.add( light );
			this.parent.add( light.target );
			this.lights.push( light );

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
		for ( let i = 0; i < frustums.length; i ++ ) {

			const light = this.lights[ i ];
			const shadowCam = light.shadow.camera;
			const texelWidth = ( shadowCam.right - shadowCam.left ) / this.shadowMapSize;
			const texelHeight = ( shadowCam.top - shadowCam.bottom ) / this.shadowMapSize;
			light.shadow.camera.updateMatrixWorld( true );
			_cameraToLightMatrix.multiplyMatrices( light.shadow.camera.matrixWorldInverse, camera.matrixWorld );
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
			_center.applyMatrix4( light.shadow.camera.matrixWorld );

			light.position.copy( _center );
			light.target.position.copy( _center );

			light.target.position.x += this.lightDirection.x;
			light.target.position.y += this.lightDirection.y;
			light.target.position.z += this.lightDirection.z;

		}

	}

	injectInclude() {

		ShaderChunk.lights_fragment_begin = Shader.lights_fragment_begin;
		ShaderChunk.lights_pars_begin = Shader.lights_pars_begin;

	}

	setupMaterial( material ) {

		material.defines = material.defines || {};
		material.defines.USE_CSM = 1;
		material.defines.CSM_CASCADES = this.cascades;

		if ( this.fade ) {

			material.defines.CSM_FADE = '';

		}

		const breaksVec2 = [];
		const scope = this;
		const shaders = this.shaders;

		material.onBeforeCompile = function ( shader ) {

			const far = Math.min( scope.camera.far, scope.maxFar );
			scope.getExtendedBreaks( breaksVec2 );

			shader.uniforms.CSM_cascades = { value: breaksVec2 };
			shader.uniforms.cameraNear = { value: scope.camera.near };
			shader.uniforms.shadowFar = { value: far };

			shaders.set( material, shader );

		};

		shaders.set( material, null );

	}

	updateUniforms() {

		const far = Math.min( this.camera.far, this.maxFar );
		const shaders = this.shaders;

		shaders.forEach( function ( shader, material ) {

			if ( shader !== null ) {

				const uniforms = shader.uniforms;
				this.getExtendedBreaks( uniforms.CSM_cascades.value );
				uniforms.cameraNear.value = this.camera.near;
				uniforms.shadowFar.value = far;

			}

			if ( ! this.fade && 'CSM_FADE' in material.defines ) {

				delete material.defines.CSM_FADE;
				material.needsUpdate = true;

			} else if ( this.fade && ! ( 'CSM_FADE' in material.defines ) ) {

				material.defines.CSM_FADE = '';
				material.needsUpdate = true;

			}

		}, this );

	}

	getExtendedBreaks( target ) {

		while ( target.length < this.breaks.length ) {

			target.push( new Vector2() );

		}

		target.length = this.breaks.length;

		for ( let i = 0; i < this.cascades; i ++ ) {

			let amount = this.breaks[ i ];
			let prev = this.breaks[ i - 1 ] || 0;
			target[ i ].x = prev;
			target[ i ].y = amount;

		}

	}

	updateFrustums() {

		this.getBreaks();
		this.initCascades();
		this.updateShadowBounds();
		this.updateUniforms();

	}

	remove() {

		for ( let i = 0; i < this.lights.length; i ++ ) {

			this.parent.remove( this.lights[ i ] );

		}

	}

	dispose() {

		const shaders = this.shaders;
		shaders.forEach( function ( shader, material ) {

			delete material.onBeforeCompile;
			delete material.defines.USE_CSM;
			delete material.defines.CSM_CASCADES;
			delete material.defines.CSM_FADE;

			if ( shader !== null ) {

				delete shader.uniforms.CSM_cascades;
				delete shader.uniforms.cameraNear;
				delete shader.uniforms.shadowFar;

			}

			material.needsUpdate = true;

		} );
		shaders.clear();

	}

}
