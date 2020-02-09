import * as THREE from '../../../build/three.module.js';
import Frustum from './Frustum.js';
import FrustumBoundingBox from './FrustumBoundingBox.js';
import Shader from './Shader.js';

export default class CSM {

	constructor( data ) {

		data = data || {};

		this.camera = data.camera;
		this.parent = data.parent;
		this.fov = data.fov || this.camera.fov;
		this.near = this.camera.near;
		this.far = data.far || this.camera.far;
		this.aspect = data.aspect || this.camera.aspect;
		this.cascades = data.cascades || 3;
		this.mode = data.mode || 'practical';
		this.shadowMapSize = data.shadowMapSize || 2048;
		this.shadowBias = data.shadowBias || 0.000001;
		this.lightDirection = data.lightDirection || new THREE.Vector3( 1, - 1, 1 ).normalize();
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

			const light = new THREE.DirectionalLight( 0xffffff, this.lightIntensity );
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

		this.mainFrustum = new Frustum( {
			fov: this.fov,
			near: this.near,
			far: this.far,
			aspect: this.aspect
		} );

		this.mainFrustum.getViewSpaceVertices();

		this.frustums = this.mainFrustum.split( this.breaks );

	}

	getBreaks() {

		this.breaks = [];

		switch ( this.mode ) {

			case 'uniform':
				this.breaks = uniformSplit( this.cascades, this.near, this.far );
				break;
			case 'logarithmic':
				this.breaks = logarithmicSplit( this.cascades, this.near, this.far );
				break;
			case 'practical':
				this.breaks = practicalSplit( this.cascades, this.near, this.far, 0.5 );
				break;
			case 'custom':
				if ( this.customSplitsCallback === undefined ) console.error( 'CSM: Custom split scheme callback not defined.' );
				this.breaks = this.customSplitsCallback( this.cascades, this.near, this.far );
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

				r.push( THREE.MathUtils.lerp( uni[ i - 1 ], log[ i - 1 ], lambda ) );

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

			let center = new THREE.Vector3( bbox.center.x, bbox.center.y, bbox.center.z );
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

		THREE.ShaderChunk.lights_fragment_begin = Shader.lights_fragment_begin;
		THREE.ShaderChunk.lights_pars_begin = Shader.lights_pars_begin;

	}

	setupMaterial( material ) {

		material.defines = material.defines || {};
		material.defines.USE_CSM = 1;
		material.defines.CSM_CASCADES = this.cascades;

		const breaksVec2 = [];

		for ( let i = 0; i < this.cascades; i ++ ) {

			let amount = this.breaks[ i ];
			let prev = this.breaks[ i - 1 ] || 0;
			breaksVec2.push( new THREE.Vector2( prev, amount ) );

		}

		const self = this;

		material.onBeforeCompile = function ( shader ) {

			shader.uniforms.CSM_cascades = { value: breaksVec2 };
			shader.uniforms.cameraNear = { value: self.camera.near };
			shader.uniforms.shadowFar = { value: self.far };

			self.materials.push( shader );

		};

	}

	updateUniforms() {

		for ( let i = 0; i < this.materials.length; i ++ ) {

			this.materials[ i ].uniforms.CSM_cascades.value = this.getExtendedBreaks();
			this.materials[ i ].uniforms.cameraNear.value = this.camera.near;
			this.materials[ i ].uniforms.shadowFar.value = this.far;

		}

	}

	getExtendedBreaks() {

		let breaksVec2 = [];

		for ( let i = 0; i < this.cascades; i ++ ) {

			let amount = this.breaks[ i ];
			let prev = this.breaks[ i - 1 ] || 0;
			breaksVec2.push( new THREE.Vector2( prev, amount ) );

		}

		return breaksVec2;

	}

	setAspect( aspect ) {

		this.aspect = aspect;
		this.initCascades();

	}

	updateFrustums() {

		this.getBreaks();
		this.initCascades();
		this.updateUniforms();

	}

	helper( cameraMatrix ) {

		let frustum;
		let geometry, vertices;
		const material = new THREE.LineBasicMaterial( { color: 0xffffff } );
		const object = new THREE.Object3D();

		for ( let i = 0; i < this.frustums.length; i ++ ) {

			frustum = this.frustums[ i ].toSpace( cameraMatrix );

			geometry = new THREE.BufferGeometry();
			vertices = [];
			

			for ( let i = 0; i < 5; i ++ ) {

				const point = frustum.vertices.near[ i === 4 ? 0 : i ];
				vertices.push( point.x, point.y, point.z );

			}
			
			geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( vertices ), 3 ) );

			object.add( new THREE.Line( geometry, material ) );

			geometry = new THREE.BufferGeometry();
			vertices = [];

			for ( let i = 0; i < 5; i ++ ) {

				const point = frustum.vertices.far[ i === 4 ? 0 : i ];
				vertices.push( point.x, point.y, point.z );

			}
			
			geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( vertices ), 3 ) );

			object.add( new THREE.Line( geometry, material ) );

			for ( let i = 0; i < 4; i ++ ) {

				geometry = new THREE.BufferGeometry();
				vertices = [];

				const near = frustum.vertices.near[ i ];
				const far = frustum.vertices.far[ i ];

				vertices.push( near.x, near.y, near.z );
				vertices.push( far.x, far.y, far.z );
				
				geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( vertices ), 3 ) );

				object.add( new THREE.Line( geometry, material ) );

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
