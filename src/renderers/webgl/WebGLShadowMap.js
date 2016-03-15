/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */

THREE.WebGLShadowMap = function ( _renderer, _lights, _objects ) {

	var _gl = _renderer.context,
	_state = _renderer.state,
	_frustum = new THREE.Frustum(),
	_projScreenMatrix = new THREE.Matrix4(),

	_shadowMapSize = new THREE.Vector2(),

	_lookTarget = new THREE.Vector3(),
	_lightPositionWorld = new THREE.Vector3(),

	_renderList = [],

	_MorphingFlag = 1,
	_SkinningFlag = 2,

	_NumberOfMaterialVariants = ( _MorphingFlag | _SkinningFlag ) + 1,

	_depthMaterials = new Array( _NumberOfMaterialVariants ),
	_distanceMaterials = new Array( _NumberOfMaterialVariants );

	var cubeDirections = [
		new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( - 1, 0, 0 ), new THREE.Vector3( 0, 0, 1 ),
		new THREE.Vector3( 0, 0, - 1 ), new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, - 1, 0 )
	];

	var cubeUps = [
		new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, 1, 0 ),
		new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, 0, 1 ),	new THREE.Vector3( 0, 0, - 1 )
	];

	var cube2DViewPorts = [
		new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4(),
		new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4()
	];

	// init

	var depthShader = THREE.ShaderLib[ "depthRGBA" ];
	var depthUniforms = THREE.UniformsUtils.clone( depthShader.uniforms );

	var distanceShader = THREE.ShaderLib[ "distanceRGBA" ];
	var distanceUniforms = THREE.UniformsUtils.clone( distanceShader.uniforms );

	for ( var i = 0; i !== _NumberOfMaterialVariants; ++ i ) {

		var useMorphing = ( i & _MorphingFlag ) !== 0;
		var useSkinning = ( i & _SkinningFlag ) !== 0;

		var depthMaterial = new THREE.ShaderMaterial( {
			uniforms: depthUniforms,
			vertexShader: depthShader.vertexShader,
			fragmentShader: depthShader.fragmentShader,
			morphTargets: useMorphing,
			skinning: useSkinning
		} );

		_depthMaterials[ i ] = depthMaterial;

		var distanceMaterial = new THREE.ShaderMaterial( {
			defines: {
				'USE_SHADOWMAP': ''
			},
			uniforms: distanceUniforms,
			vertexShader: distanceShader.vertexShader,
			fragmentShader: distanceShader.fragmentShader,
			morphTargets: useMorphing,
			skinning: useSkinning
		} );

		_distanceMaterials[ i ] = distanceMaterial;

	}

	//

	var scope = this;

	this.enabled = false;

	this.autoUpdate = true;
	this.needsUpdate = false;

	this.type = THREE.PCFShadowMap;
	this.cullFace = THREE.CullFaceFront;

	this.render = function ( scene, camera ) {

		var faceCount, isPointLight;
		var shadows = _lights.shadows;

		if ( shadows.length === 0 ) return;

		if ( scope.enabled === false ) return;
		if ( scope.autoUpdate === false && scope.needsUpdate === false ) return;

		// Set GL state for depth map.
		_state.clearColor( 1, 1, 1, 1 );
		_state.disable( _gl.BLEND );
		_state.enable( _gl.CULL_FACE );
		_gl.frontFace( _gl.CCW );
		_gl.cullFace( scope.cullFace === THREE.CullFaceFront ? _gl.FRONT : _gl.BACK );
		_state.setDepthTest( true );
		_state.setScissorTest( false );

		// render depth map

		for ( var i = 0, il = shadows.length; i < il; i ++ ) {

			var light = shadows[ i ];

			var shadow = light.shadow;
			var shadowCamera = shadow.camera;

			_shadowMapSize.copy( shadow.mapSize );

			if ( light instanceof THREE.PointLight ) {

				faceCount = 6;
				isPointLight = true;

				var vpWidth = _shadowMapSize.x;
				var vpHeight = _shadowMapSize.y;

				// These viewports map a cube-map onto a 2D texture with the
				// following orientation:
				//
				//  xzXZ
				//   y Y
				//
				// X - Positive x direction
				// x - Negative x direction
				// Y - Positive y direction
				// y - Negative y direction
				// Z - Positive z direction
				// z - Negative z direction

				// positive X
				cube2DViewPorts[ 0 ].set( vpWidth * 2, vpHeight, vpWidth, vpHeight );
				// negative X
				cube2DViewPorts[ 1 ].set( 0, vpHeight, vpWidth, vpHeight );
				// positive Z
				cube2DViewPorts[ 2 ].set( vpWidth * 3, vpHeight, vpWidth, vpHeight );
				// negative Z
				cube2DViewPorts[ 3 ].set( vpWidth, vpHeight, vpWidth, vpHeight );
				// positive Y
				cube2DViewPorts[ 4 ].set( vpWidth * 3, 0, vpWidth, vpHeight );
				// negative Y
				cube2DViewPorts[ 5 ].set( vpWidth, 0, vpWidth, vpHeight );

				_shadowMapSize.x *= 4.0;
				_shadowMapSize.y *= 2.0;

			} else {

				faceCount = 1;
				isPointLight = false;

			}

			if ( shadow.map === null ) {

				var pars = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat };

				shadow.map = new THREE.WebGLRenderTarget( _shadowMapSize.x, _shadowMapSize.y, pars );

				//

				if ( light instanceof THREE.SpotLight ) {

					shadowCamera.aspect = _shadowMapSize.x / _shadowMapSize.y;

				}

				shadowCamera.updateProjectionMatrix();

			}

			var shadowMap = shadow.map;
			var shadowMatrix = shadow.matrix;

			_lightPositionWorld.setFromMatrixPosition( light.matrixWorld );
			shadowCamera.position.copy( _lightPositionWorld );

			_renderer.setRenderTarget( shadowMap );
			_renderer.clear();

			// render shadow map for each cube face (if omni-directional) or
			// run a single pass if not

			for ( var face = 0; face < faceCount; face ++ ) {

				if ( isPointLight ) {

					_lookTarget.copy( shadowCamera.position );
					_lookTarget.add( cubeDirections[ face ] );
					shadowCamera.up.copy( cubeUps[ face ] );
					shadowCamera.lookAt( _lookTarget );

					var vpDimensions = cube2DViewPorts[ face ];
					_state.viewport( vpDimensions );

				} else {

					_lookTarget.setFromMatrixPosition( light.target.matrixWorld );
					shadowCamera.lookAt( _lookTarget );

				}

				shadowCamera.updateMatrixWorld();
				shadowCamera.matrixWorldInverse.getInverse( shadowCamera.matrixWorld );

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

				// set object matrices & frustum culling

				_renderList.length = 0;

				projectObject( scene, camera, shadowCamera );

				// render shadow map
				// render regular objects

				for ( var j = 0, jl = _renderList.length; j < jl; j ++ ) {

					var object = _renderList[ j ];
					var geometry = _objects.update( object );
					var material = object.material;

					if ( material instanceof THREE.MultiMaterial ) {

						var groups = geometry.groups;
						var materials = material.materials;

						for ( var k = 0, kl = groups.length; k < kl; k ++ ) {

							var group = groups[ k ];
							var groupMaterial = materials[ group.materialIndex ];

							if ( groupMaterial.visible === true ) {

								var depthMaterial = getDepthMaterial( object, groupMaterial, isPointLight, _lightPositionWorld );
								_renderer.renderBufferDirect( shadowCamera, null, geometry, depthMaterial, object, group );

							}

						}

					} else {

						var depthMaterial = getDepthMaterial( object, material, isPointLight, _lightPositionWorld );
						_renderer.renderBufferDirect( shadowCamera, null, geometry, depthMaterial, object, null );

					}

				}

			}

		}

		// Restore GL state.
		var clearColor = _renderer.getClearColor(),
		clearAlpha = _renderer.getClearAlpha();
		_renderer.setClearColor( clearColor, clearAlpha );

		_state.enable( _gl.BLEND );

		if ( scope.cullFace === THREE.CullFaceFront ) {

			_gl.cullFace( _gl.BACK );

		}

		scope.needsUpdate = false;

	};

	function getDepthMaterial( object, material, isPointLight, lightPositionWorld ) {

		var geometry = object.geometry;

		var newMaterial = null;

		var materialVariants = _depthMaterials;
		var customMaterial = object.customDepthMaterial;

		if ( isPointLight ) {

			materialVariants = _distanceMaterials;
			customMaterial = object.customDistanceMaterial;

		}

		if ( ! customMaterial ) {

			var useMorphing = geometry.morphTargets !== undefined &&
					geometry.morphTargets.length > 0 && material.morphTargets;

			var useSkinning = object instanceof THREE.SkinnedMesh && material.skinning;

			var variantIndex = 0;

			if ( useMorphing ) variantIndex |= _MorphingFlag;
			if ( useSkinning ) variantIndex |= _SkinningFlag;

			newMaterial = materialVariants[ variantIndex ];

		} else {

			newMaterial = customMaterial;

		}

		newMaterial.visible = material.visible;
		newMaterial.wireframe = material.wireframe;
		newMaterial.wireframeLinewidth = material.wireframeLinewidth;

		if ( isPointLight && newMaterial.uniforms.lightPos !== undefined ) {

			newMaterial.uniforms.lightPos.value.copy( lightPositionWorld );

		}

		return newMaterial;

	}

	function projectObject( object, camera, shadowCamera ) {

		if ( object.visible === false ) return;

		if ( object.layers.test( camera.layers ) && ( object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points ) ) {

			if ( object.castShadow && ( object.frustumCulled === false || _frustum.intersectsObject( object ) === true ) ) {

				var material = object.material;

				if ( material.visible === true ) {

					object.modelViewMatrix.multiplyMatrices( shadowCamera.matrixWorldInverse, object.matrixWorld );
					_renderList.push( object );

				}

			}

		}

		var children = object.children;

		for ( var i = 0, l = children.length; i < l; i ++ ) {

			projectObject( children[ i ], camera, shadowCamera );

		}

	}

};
