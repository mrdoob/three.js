/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */

THREE.WebGLShadowMap = function ( _renderer, _lights, _objects ) {

	var _gl = _renderer.context,
	_state = _renderer.state,
	_frustum = new THREE.Frustum(),
	_projScreenMatrix = new THREE.Matrix4(),

	_min = new THREE.Vector3(),
	_max = new THREE.Vector3(),

	_lookTarget = new THREE.Vector3(),
	_lightPosition = new THREE.Vector3(),

	_renderList = [];

	var _depthMaterial, _depthMaterialMorph, _depthMaterialSkin, _depthMaterialMorphSkin,
	_distanceMaterial, _distanceMaterialMorph, _distanceMaterialSkin, _distanceMaterialMorphSkin;

	var cubeDirections = [new THREE.Vector3(1,0,0), new THREE.Vector3(-1,0,0), new THREE.Vector3(0,1,0),
						  new THREE.Vector3(0,-1,0), new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,-1)];

	var cubeUps = [new THREE.Vector3(0,-1,0), new THREE.Vector3(0,-1,0), new THREE.Vector3(0,0,1),
				   new THREE.Vector3(0,0,-1), new THREE.Vector3(0,-1,0), new THREE.Vector3(0,-1,0)];

    var _vector4 = new THREE.Vector4();

	// init

	var depthShader = THREE.ShaderLib[ "depthRGBA" ];
	var depthUniforms = THREE.UniformsUtils.clone( depthShader.uniforms );

	_depthMaterial = new THREE.ShaderMaterial( {
		uniforms: depthUniforms,
		vertexShader: depthShader.vertexShader,
		fragmentShader: depthShader.fragmentShader
	 } );

	_depthMaterialMorph = new THREE.ShaderMaterial( {
		uniforms: depthUniforms,
		vertexShader: depthShader.vertexShader,
		fragmentShader: depthShader.fragmentShader,
		morphTargets: true
	} );

	_depthMaterialSkin = new THREE.ShaderMaterial( {
		uniforms: depthUniforms,
		vertexShader: depthShader.vertexShader,
		fragmentShader: depthShader.fragmentShader,
		skinning: true
	} );

	_depthMaterialMorphSkin = new THREE.ShaderMaterial( {
		uniforms: depthUniforms,
		vertexShader: depthShader.vertexShader,
		fragmentShader: depthShader.fragmentShader,
		morphTargets: true,
		skinning: true
	} );

	_depthMaterial._shadowPass = true;
	_depthMaterialMorph._shadowPass = true;
	_depthMaterialSkin._shadowPass = true;
	_depthMaterialMorphSkin._shadowPass = true;


	var distanceShader = THREE.ShaderLib[ "distanceRGBA" ];
	var distanceUniforms = THREE.UniformsUtils.clone( distanceShader.uniforms );

	_distanceMaterial = new THREE.ShaderMaterial( {
		uniforms: distanceUniforms,
		vertexShader: distanceShader.vertexShader,
		fragmentShader: distanceShader.fragmentShader
	 } );

	_distanceMaterialMorph = new THREE.ShaderMaterial( {
		uniforms: distanceUniforms,
		vertexShader: distanceShader.vertexShader,
		fragmentShader: distanceShader.fragmentShader,
		morphTargets: true
	} );

	_distanceMaterialSkin = new THREE.ShaderMaterial( {
		uniforms: distanceUniforms,
		vertexShader: distanceShader.vertexShader,
		fragmentShader: distanceShader.fragmentShader,
		skinning: true
	} );

	_distanceMaterialMorphSkin = new THREE.ShaderMaterial( {
		uniforms: distanceUniforms,
		vertexShader: distanceShader.vertexShader,
		fragmentShader: distanceShader.fragmentShader,
		morphTargets: true,
		skinning: true
	} );

	_distanceMaterial._shadowPass = true;
	_distanceMaterialMorph._shadowPass = true;
	_distanceMaterialSkin._shadowPass = true;
	_distanceMaterialMorphSkin._shadowPass = true;

	//

	var scope = this;

	this.enabled = false;

	this.autoUpdate = true;
	this.needsUpdate = false;

	this.type = THREE.PCFShadowMap;
	this.cullFace = THREE.CullFaceFront;

	this.render = function ( scene ) {

		var faceCount, isCube;

		if ( scope.enabled === false ) return;
		if ( scope.autoUpdate === false && scope.needsUpdate === false ) return;

		// set GL state for depth map

		_gl.clearColor( 1, 1, 1, 1 );
		_state.disable( _gl.BLEND );

		_state.enable( _gl.CULL_FACE );
		_gl.frontFace( _gl.CCW );

		if ( scope.cullFace === THREE.CullFaceFront ) {

			_gl.cullFace( _gl.FRONT );

		} else {

			_gl.cullFace( _gl.BACK );

		}

		_state.setDepthTest( true );

		// render depth map

		for ( var i = 0, il = _lights.length; i < il; i ++ ) {

			var light = _lights[ i ];

			if ( light instanceof THREE.PointLight ) {
				faceCount = 6;
				isCube = true;
			} else {
				faceCount = 1;
				isCube = false;
			}

			if ( ! light.castShadow ) continue;

			if ( ! light.shadowMap ) {

				var shadowFilter = THREE.LinearFilter;

				if ( scope.type === THREE.PCFSoftShadowMap ) {

					shadowFilter = THREE.NearestFilter;

				}

				var pars = { minFilter: shadowFilter, magFilter: shadowFilter, format: THREE.RGBAFormat };

				if ( isCube ) {
					light.shadowMap = new THREE.WebGLRenderTargetCube( light.shadowMapWidth, light.shadowMapWidth, pars );
					light.shadowMapSize = new  THREE.Vector2( light.shadowMapWidth, light.shadowMapWidth );
				} else {
					light.shadowMap = new THREE.WebGLRenderTarget( light.shadowMapWidth, light.shadowMapHeight, pars );
					light.shadowMapSize = new THREE.Vector2( light.shadowMapWidth, light.shadowMapHeight );
				}	

				light.shadowMatrix = new THREE.Matrix4();

			}

			if ( ! light.shadowCamera ) {

				if ( light instanceof THREE.SpotLight ) {

					light.shadowCamera = new THREE.PerspectiveCamera( light.shadowCameraFov, light.shadowMapWidth / light.shadowMapHeight, light.shadowCameraNear, light.shadowCameraFar );

				} else if ( light instanceof THREE.DirectionalLight ) {

					light.shadowCamera = new THREE.OrthographicCamera( light.shadowCameraLeft, light.shadowCameraRight, light.shadowCameraTop, light.shadowCameraBottom, light.shadowCameraNear, light.shadowCameraFar );

				} else {

					light.shadowCamera = new THREE.PerspectiveCamera( light.shadowCameraFov, light.shadowMapWidth / light.shadowMapHeight, light.shadowCameraNear, light.shadowCameraFar );

				}

				scene.add( light.shadowCamera );

				if ( scene.autoUpdate === true ) scene.updateMatrixWorld();

			}

			if ( light.shadowCameraVisible && ! light.cameraHelper ) {

				light.cameraHelper = new THREE.CameraHelper( light.shadowCamera );
				scene.add( light.cameraHelper );

			}

			var shadowMap = light.shadowMap;
			var shadowMatrix = light.shadowMatrix;
			var shadowCamera = light.shadowCamera;

			_lightPosition.setFromMatrixPosition( light.matrixWorld );
			shadowCamera.position.copy(_lightPosition);

			// render shadow map for each cube face (if omni-directional) or
			// run a single pass if not

			for(var face = 0; face < faceCount; face ++){				
		
				if( isCube){
					_lookTarget.copy(shadowCamera.position);
					_lookTarget.add(cubeDirections[face]);
					shadowCamera.up.copy(cubeUps[face]);
					shadowCamera.lookAt(_lookTarget);				
				} else {
					_lookTarget.setFromMatrixPosition( light.target.matrixWorld );
					shadowCamera.lookAt( _lookTarget);
				}	

				shadowCamera.updateMatrixWorld();
				shadowCamera.matrixWorldInverse.getInverse( shadowCamera.matrixWorld );

				if ( light.cameraHelper ) light.cameraHelper.visible = light.shadowCameraVisible;
				if ( light.shadowCameraVisible ) light.cameraHelper.update();

				// compute shadow matrix

				shadowMatrix.set(
					0.5, 0.0, 0.0, 0.5,
					0.0, 0.5, 0.0, 0.5,
					0.0, 0.0, 0.5, 0.5,
					0.0, 0.0, 0.0, 1.0
				);

				shadowMatrix.multiply( shadowCamera.projectionMatrix );
				shadowMatrix.multiply( shadowCamera.matrixWorldInverse );

				// update camera matrices and frustum

				_projScreenMatrix.multiplyMatrices( shadowCamera.projectionMatrix, shadowCamera.matrixWorldInverse );
				_frustum.setFromMatrix( _projScreenMatrix );

				// render shadow map

				if(isCube){
					shadowMap.activeCubeFace = face;
				}	

				_renderer.setRenderTarget( shadowMap );
				_renderer.clear();

				// set object matrices & frustum culling

				_renderList.length = 0;

				projectObject( scene, shadowCamera );

				// render regular objects

				for ( var j = 0, jl = _renderList.length; j < jl; j ++ ) {

					var object = _renderList[ j ];
					var geometry = _objects.update( object );
					var material = object.material;

					if ( material instanceof THREE.MeshFaceMaterial ) {

						var groups = geometry.groups;
						var materials = material.materials;

						for ( var k = 0, kl = groups.length; k < kl; k ++ ) {

							var group = groups[ k ];
							var groupMaterial = materials[ group.materialIndex ];

							if ( groupMaterial.visible === true ) {

								var depthMaterial = getDepthMaterial( object, groupMaterial, isCube, _lightPosition);
								_renderer.renderBufferDirect( shadowCamera, _lights, null, geometry, depthMaterial , object, group );

							}

						}

					} else {
						var depthMaterial = getDepthMaterial( object, material, isCube, _lightPosition);						
						_renderer.renderBufferDirect( shadowCamera, _lights, null, geometry, depthMaterial, object, null );
					}

				}

			}
		}

		// restore GL state

		var clearColor = _renderer.getClearColor(),
		clearAlpha = _renderer.getClearAlpha();

		_renderer.setClearColor( clearColor, clearAlpha );
		_state.enable( _gl.BLEND );

		if ( scope.cullFace === THREE.CullFaceFront ) {

			_gl.cullFace( _gl.BACK );

		}

		_renderer.resetGLState();

		scope.needsUpdate = false;

	};

	function getDepthMaterial( object, material, isCube, lightPosition) {

		var geometry = object.geometry;

		var useMorphing = geometry.morphTargets !== undefined && geometry.morphTargets.length > 0 && material.morphTargets;
		var useSkinning = object instanceof THREE.SkinnedMesh && material.skinning;

		var newMaterial;

		var depthMaterial = _depthMaterial;
		var depthMaterialMorph = _depthMaterialMorph; 
		var depthMaterialSkin = _depthMaterialSkin; 
		var depthMaterialMorphSkin = _depthMaterialMorphSkin;

		if ( isCube ){
			depthMaterial = _distanceMaterial;
			depthMaterialMorph = _distanceMaterialMorph; 
			depthMaterialSkin = _distanceMaterialSkin; 
			depthMaterialMorphSkin = _distanceMaterialMorphSkin;
		}

		if ( object.customDepthMaterial || object.customDistanceMaterial) {

			if( isCube ){
				newMaterial = object.customDistanceMaterial;
			} else {
				newMaterial = object.customDepthMaterial;
			}

		} else if ( useSkinning ) {

			newMaterial = useMorphing ? depthMaterialMorphSkin : depthMaterialSkin;

		} else if ( useMorphing ) {

			newMaterial = depthMaterialMorph;

		} else {

			newMaterial = depthMaterial;

		}

		newMaterial.visible = material.visible;
		newMaterial.wireframe = material.wireframe;
		newMaterial.wireframeLinewidth = material.wireframeLinewidth;

		if ( isCube ){
			if(newMaterial.uniforms.lightPos)
			{
				newMaterial.uniforms.lightPos.value.copy(lightPosition);
			}
		}

		return newMaterial;

	}

	function projectObject( object, camera ) {


		if ( object.visible === false ) return;

		if ( object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points ) {

			if ( object.castShadow && ( object.frustumCulled === false || _frustum.intersectsObject( object ) === true ) ) {

				var material = object.material;

				if ( material.visible === true ) {
					object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
					_renderList.push( object );

				}

			}

		}

		var children = object.children;

		for ( var i = 0, l = children.length; i < l; i ++ ) {

			projectObject( children[ i ], camera );

		}

	}

};
