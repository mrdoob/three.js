/**
 * @author vHawk / https://github.com/vHawk/
 */

import {
	Vector2,
	Vector3,
	DirectionalLight,
	MathUtils,
	ShaderChunk,
	LineBasicMaterial,
	Object3D,
	BufferGeometry,
	BufferAttribute,
	Line
} from '../../../build/three.module.js';
import Frustum from './Frustum.js';
import FrustumBoundingBox from './FrustumBoundingBox.js';
import Shader from './Shader.js';

export default class CSM {

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

		this.lights = [];
		this.materials = [];
		this.createLights();

		this.getBreaks();
		this.initCascades();

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

		// TODO: Handle orthographic camera
		const camera = this.camera;
		const far = Math.min(camera.far, this.maxFar);
		this.mainFrustum = new Frustum( {
			fov: camera.fov,
			near: camera.near,
			far: far,
			aspect: camera.aspect
		} );

		this.mainFrustum.getViewSpaceVertices();

		this.frustums = this.mainFrustum.split( this.breaks );

	}

	getBreaks() {

		const camera = this.camera;
		const far = Math.min(camera.far, this.maxFar);
		this.breaks = [];

		switch ( this.mode ) {

			case 'uniform':
				this.breaks = uniformSplit( this.cascades, camera.near, far );
				break;
			case 'logarithmic':
				this.breaks = logarithmicSplit( this.cascades, camera.near, far );
				break;
			case 'practical':
				this.breaks = practicalSplit( this.cascades, camera.near, far, 0.5 );
				break;
			case 'custom':
				if ( this.customSplitsCallback === undefined ) console.error( 'CSM: Custom split scheme callback not defined.' );
				this.breaks = this.customSplitsCallback( this.cascades, camera.near, far );
				break;

		}

		function uniformSplit( amount, near, far ) {

			const r = [];

			for ( let i = 1; i < amount; i ++ ) {

				r.push( ( near + ( far - near ) * i / amount ) / far );

			}

			r.push( 1 );
			return r;

		}

		function logarithmicSplit( amount, near, far ) {

			const r = [];

			for ( let i = 1; i < amount; i ++ ) {

				r.push( ( near * ( far / near ) ** ( i / amount ) ) / far );

			}

			r.push( 1 );
			return r;

		}

		function practicalSplit( amount, near, far, lambda ) {

			const log = logarithmicSplit( amount, near, far );
			const uni = uniformSplit( amount, near, far );
			const r = [];

			for ( let i = 1; i < amount; i ++ ) {

				r.push( MathUtils.lerp( uni[ i - 1 ], log[ i - 1 ], lambda ) );

			}

			r.push( 1 );
			return r;

		}

	}

	update( cameraMatrix ) {

		for ( let i = 0; i < this.frustums.length; i ++ ) {

			const worldSpaceFrustum = this.frustums[ i ].toSpace( cameraMatrix );
			const light = this.lights[ i ];
			const lightSpaceFrustum = worldSpaceFrustum.toSpace( light.shadow.camera.matrixWorldInverse );

			light.shadow.camera.updateMatrixWorld( true );

			const bbox = new FrustumBoundingBox().fromFrustum( lightSpaceFrustum );
			bbox.getSize();
			bbox.getCenter( this.lightMargin );

			const squaredBBWidth = Math.max( bbox.size.x, bbox.size.y );

			let center = new Vector3( bbox.center.x, bbox.center.y, bbox.center.z );
			center.applyMatrix4( light.shadow.camera.matrixWorld );

			light.shadow.camera.left = - squaredBBWidth / 2;
			light.shadow.camera.right = squaredBBWidth / 2;
			light.shadow.camera.top = squaredBBWidth / 2;
			light.shadow.camera.bottom = - squaredBBWidth / 2;

			light.position.copy( center );
			light.target.position.copy( center );

			light.target.position.x += this.lightDirection.x;
			light.target.position.y += this.lightDirection.y;
			light.target.position.z += this.lightDirection.z;

			light.shadow.camera.updateProjectionMatrix();
			light.shadow.camera.updateMatrixWorld();

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

		const breaksVec2 = [];

		for ( let i = 0; i < this.cascades; i ++ ) {

			let amount = this.breaks[ i ];
			let prev = this.breaks[ i - 1 ] || 0;
			breaksVec2.push( new Vector2( prev, amount ) );

		}

		const self = this;
		const far = Math.min(this.camera.far, this.maxFar);

		material.onBeforeCompile = function ( shader ) {

			shader.uniforms.CSM_cascades = { value: breaksVec2 };
			shader.uniforms.cameraNear = { value: self.camera.near };
			shader.uniforms.shadowFar = { value: far };

			self.materials.push( shader );

		};

	}

	updateUniforms() {

		const far = Math.min(this.camera.far, this.maxFar);

		for ( let i = 0; i < this.materials.length; i ++ ) {

			this.materials[ i ].uniforms.CSM_cascades.value = this.getExtendedBreaks();
			this.materials[ i ].uniforms.cameraNear.value = this.camera.near;
			this.materials[ i ].uniforms.shadowFar.value = far;

		}

	}

	getExtendedBreaks() {

		let breaksVec2 = [];

		for ( let i = 0; i < this.cascades; i ++ ) {

			let amount = this.breaks[ i ];
			let prev = this.breaks[ i - 1 ] || 0;
			breaksVec2.push( new Vector2( prev, amount ) );

		}

		return breaksVec2;

	}

	updateFrustums() {

		this.getBreaks();
		this.initCascades();
		this.updateUniforms();

	}

	helper( cameraMatrix ) {

		let frustum;
		let geometry, vertices;
		const material = new LineBasicMaterial( { color: 0xffffff } );
		const object = new Object3D();

		for ( let i = 0; i < this.frustums.length; i ++ ) {

			frustum = this.frustums[ i ].toSpace( cameraMatrix );

			geometry = new BufferGeometry();
			vertices = [];


			for ( let i = 0; i < 5; i ++ ) {

				const point = frustum.vertices.near[ i === 4 ? 0 : i ];
				vertices.push( point.x, point.y, point.z );

			}

			geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 3 ) );

			object.add( new Line( geometry, material ) );

			geometry = new BufferGeometry();
			vertices = [];

			for ( let i = 0; i < 5; i ++ ) {

				const point = frustum.vertices.far[ i === 4 ? 0 : i ];
				vertices.push( point.x, point.y, point.z );

			}

			geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 3 ) );

			object.add( new Line( geometry, material ) );

			for ( let i = 0; i < 4; i ++ ) {

				geometry = new BufferGeometry();
				vertices = [];

				const near = frustum.vertices.near[ i ];
				const far = frustum.vertices.far[ i ];

				vertices.push( near.x, near.y, near.z );
				vertices.push( far.x, far.y, far.z );

				geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 3 ) );

				object.add( new Line( geometry, material ) );

			}

		}

		return object;

	}

	remove() {

		for ( let i = 0; i < this.lights.length; i ++ ) {

			this.parent.remove( this.lights[ i ] );

		}

	}

}
