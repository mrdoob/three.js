/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShadowMapPlugin = function ( ) {

	var _gl, _renderer,

	_depthMaterial, _depthMaterialMorph,

	_cameraLight,

	_frustum = new THREE.Frustum(),

	_projScreenMatrix = new THREE.Matrix4();

	this.shadowMatrix = [];
	this.shadowMap = [];

	this.init = function ( renderer ) {

		_gl = renderer.context;
		_renderer = renderer;

		var depthShader = THREE.ShaderLib[ "depthRGBA" ];
		var depthUniforms = THREE.UniformsUtils.clone( depthShader.uniforms );

		_depthMaterial = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms } );
		_depthMaterialMorph = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms, morphTargets: true } );

		_depthMaterial._shadowPass = true;
		_depthMaterialMorph._shadowPass = true;

	};

	this.render = function ( scene, camera ) {

		if ( ! ( _renderer.shadowMapEnabled && _renderer.shadowMapAutoUpdate ) ) return;

		this.update( scene, camera );

	};

	this.update = function ( scene, camera ) {

		var i, il, j, jl,

		shadowMap, shadowMatrix,
		program, buffer, material,
		webglObject, object, light,
		renderList,

		shadowIndex = 0,

		lights = scene.lights,
		fog = null;

		if ( ! _cameraLight ) {

			_cameraLight = new THREE.PerspectiveCamera( _renderer.shadowCameraFov, _renderer.shadowMapWidth / _renderer.shadowMapHeight, _renderer.shadowCameraNear, _renderer.shadowCameraFar );

		}

		for ( i = 0, il = lights.length; i < il; i ++ ) {

			light = lights[ i ];

			if ( light.castShadow && light instanceof THREE.SpotLight ) {

				if ( ! this.shadowMap[ shadowIndex ] ) {

					var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };

					this.shadowMap[ shadowIndex ] = new THREE.WebGLRenderTarget( _renderer.shadowMapWidth, _renderer.shadowMapHeight, pars );
					this.shadowMatrix[ shadowIndex ] = new THREE.Matrix4();

				}

				shadowMap = this.shadowMap[ shadowIndex ];
				shadowMatrix = this.shadowMatrix[ shadowIndex ];

				_cameraLight.position.copy( light.position );
				_cameraLight.lookAt( light.target.position );

				if ( _cameraLight.parent == null ) {

					console.warn( "Camera is not on the Scene. Adding it..." );
					scene.add( _cameraLight );

					if ( _renderer.autoUpdateScene ) scene.updateMatrixWorld();

				}

				_cameraLight.matrixWorldInverse.getInverse( _cameraLight.matrixWorld );

				// compute shadow matrix

				shadowMatrix.set( 0.5, 0.0, 0.0, 0.5,
								  0.0, 0.5, 0.0, 0.5,
								  0.0, 0.0, 0.5, 0.5,
								  0.0, 0.0, 0.0, 1.0 );

				shadowMatrix.multiplySelf( _cameraLight.projectionMatrix );
				shadowMatrix.multiplySelf( _cameraLight.matrixWorldInverse );

				// render shadow map

				if ( ! _cameraLight._viewMatrixArray ) _cameraLight._viewMatrixArray = new Float32Array( 16 );
				_cameraLight.matrixWorldInverse.flattenToArray( _cameraLight._viewMatrixArray );

				if ( ! _cameraLight._projectionMatrixArray ) _cameraLight._projectionMatrixArray = new Float32Array( 16 );
				_cameraLight.projectionMatrix.flattenToArray( _cameraLight._projectionMatrixArray );

				_projScreenMatrix.multiply( _cameraLight.projectionMatrix, _cameraLight.matrixWorldInverse );
				_frustum.setFromMatrix( _projScreenMatrix );

				_renderer.setRenderTarget( shadowMap );

				// using arbitrary clear color in depth pass
				// creates variance in shadows

				_gl.clearColor( 1, 0, 1, 1 );
				//_gl.clearColor( 0, 0, 0, 1 );

				_renderer.clear();

				var clearColor = _renderer.getClearColor(),
					clearAlpha = _renderer.getClearAlpha();

				_gl.clearColor( clearColor.r, clearColor.g, clearColor.b, clearAlpha );

				// set matrices & frustum culling

				renderList = scene.__webglObjects;

				for ( j = 0, jl = renderList.length; j < jl; j ++ ) {

					webglObject = renderList[ j ];
					object = webglObject.object;

					webglObject.render = false;

					if ( object.visible && object.castShadow ) {

						if ( ! ( object instanceof THREE.Mesh ) || ! ( object.frustumCulled ) || _frustum.contains( object ) ) {

							object.matrixWorld.flattenToArray( object._objectMatrixArray );
							object._modelViewMatrix.multiplyToArray( _cameraLight.matrixWorldInverse, object.matrixWorld, object._modelViewMatrixArray );

							webglObject.render = true;

						}

					}

				}

				// render regular objects

				_renderer.setDepthTest( true );
				_renderer.setBlending( THREE.NormalBlending ); // maybe blending should be just disabled?

				//_gl.cullFace( _gl.FRONT );

				for ( j = 0, jl = renderList.length; j < jl; j ++ ) {

					webglObject = renderList[ j ];

					if ( webglObject.render ) {

						object = webglObject.object;
						buffer = webglObject.buffer;

						_renderer.setObjectFaces( object );

						if ( object.customDepthMaterial ) {

							material = object.customDepthMaterial;

						} else if ( object.geometry.morphTargets.length ) {

							material = _depthMaterialMorph;

						} else {

							material = _depthMaterial;

						}

						_renderer.renderBuffer( _cameraLight, lights, fog, material, buffer, object );

					}

				}

				// set matrices and render immediate objects

				renderList = scene.__webglObjectsImmediate;

				for ( j = 0, jl = renderList.length; j < jl; j ++ ) {

					webglObject = renderList[ j ];
					object = webglObject.object;

					if ( object.visible && object.castShadow ) {

						if( object.matrixAutoUpdate ) {

							object.matrixWorld.flattenToArray( object._objectMatrixArray );

						}

						object._modelViewMatrix.multiplyToArray( _cameraLight.matrixWorldInverse, object.matrixWorld, object._modelViewMatrixArray );

						_renderer.renderImmediateObject( _cameraLight, lights, fog, _depthMaterial, object );

					}

				}

				//_gl.cullFace( _gl.BACK );

				shadowIndex ++;

			}

		}

	};

};