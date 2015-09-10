/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = WebGLShadowMap;

var WebGLRenderTarget = require( "../WebGLRenderTarget" ),

	OrthographicCamera = require( "../../cameras/OrthographicCamera" ),
	PerspectiveCamera = require( "../../cameras/PerspectiveCamera" ),

	Constants = require( "../../Constants" ),

	CameraHelper = require( "../../extras/helpers/CameraHelper" ),
	DirectionalLight = require( "../../lights/DirectionalLight" ),
	SpotLight = require( "../../lights/SpotLight" ),

	MultiMaterial = require( "../../materials/MultiMaterial" ),
	ShaderMaterial = require( "../../materials/ShaderMaterial" ),

	Frustum = require( "../../math/Frustum" ),
	Matrix4 = require( "../../math/Matrix4" ),
	Vector2 = require( "../../math/Vector2" ),
	Vector3 = require( "../../math/Vector3" ),

	Line = require( "../../objects/Line" ),
	Mesh = require( "../../objects/Mesh" ),
	PointCloud = require( "../../objects/PointCloud" ),
	SkinnedMesh = require( "../../objects/SkinnedMesh" ),

	ShaderLib = require( "../shaders/ShaderLib" ),
	UniformsUtils = require( "../shaders/UniformsUtils" );

function WebGLShadowMap( _renderer, _lights, _objects ) {

	var _gl = _renderer.context,
	_state = _renderer.state,
	_frustum = new Frustum(),
	_projScreenMatrix = new Matrix4(),

	_matrixPosition = new Vector3(),

	_renderList = [];

	// init

	var depthShader = ShaderLib[ "depthRGBA" ];
	var depthUniforms = UniformsUtils.clone( depthShader.uniforms );

	var _depthMaterial = new ShaderMaterial( {
		uniforms: depthUniforms,
		vertexShader: depthShader.vertexShader,
		fragmentShader: depthShader.fragmentShader
	 } );

	var _depthMaterialMorph = new ShaderMaterial( {
		uniforms: depthUniforms,
		vertexShader: depthShader.vertexShader,
		fragmentShader: depthShader.fragmentShader,
		morphTargets: true
	} );

	var _depthMaterialSkin = new ShaderMaterial( {
		uniforms: depthUniforms,
		vertexShader: depthShader.vertexShader,
		fragmentShader: depthShader.fragmentShader,
		skinning: true
	} );

	var _depthMaterialMorphSkin = new ShaderMaterial( {
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

	//

	var scope = this;

	this.enabled = false;

	this.autoUpdate = true;
	this.needsUpdate = false;

	this.type = Constants.PCFShadowMap;
	this.cullFace = Constants.CullFaceFront;

	this.render = function ( scene ) {

		if ( scope.enabled === false ) { return; }
		if ( scope.autoUpdate === false && scope.needsUpdate === false ) { return; }

		// set GL state for depth map

		_gl.clearColor( 1, 1, 1, 1 );
		_state.disable( _gl.BLEND );

		_state.enable( _gl.CULL_FACE );
		_gl.frontFace( _gl.CCW );

		if ( scope.cullFace === Constants.CullFaceFront ) {

			_gl.cullFace( _gl.FRONT );

		} else {

			_gl.cullFace( _gl.BACK );

		}

		_state.setDepthTest( true );

		// render depth map

		for ( var i = 0, il = _lights.length; i < il; i ++ ) {

			var light = _lights[ i ];

			if ( ! light.castShadow ) { continue; }

			if ( ! light.shadowMap ) {

				var shadowFilter = Constants.LinearFilter;

				if ( scope.type === Constants.PCFSoftShadowMap ) {

					shadowFilter = Constants.NearestFilter;

				}

				var pars = { minFilter: shadowFilter, magFilter: shadowFilter, format: Constants.RGBAFormat };

				light.shadowMap = new WebGLRenderTarget( light.shadowMapWidth, light.shadowMapHeight, pars );
				light.shadowMapSize = new Vector2( light.shadowMapWidth, light.shadowMapHeight );

				light.shadowMatrix = new Matrix4();

			}

			if ( ! light.shadowCamera ) {

				if ( light instanceof SpotLight ) {

					light.shadowCamera = new PerspectiveCamera( light.shadowCameraFov, light.shadowMapWidth / light.shadowMapHeight, light.shadowCameraNear, light.shadowCameraFar );

				} else if ( light instanceof DirectionalLight ) {

					light.shadowCamera = new OrthographicCamera( light.shadowCameraLeft, light.shadowCameraRight, light.shadowCameraTop, light.shadowCameraBottom, light.shadowCameraNear, light.shadowCameraFar );

				} else {

					console.error( "ShadowMapPlugin: Unsupported light type for shadow", light );
					continue;

				}

				scene.add( light.shadowCamera );

				if ( scene.autoUpdate === true ) { scene.updateMatrixWorld(); }

			}

			if ( light.shadowCameraVisible && ! light.cameraHelper ) {

				light.cameraHelper = new CameraHelper( light.shadowCamera );
				scene.add( light.cameraHelper );

			}

			var shadowMap = light.shadowMap;
			var shadowMatrix = light.shadowMatrix;
			var shadowCamera = light.shadowCamera;

			//

			shadowCamera.position.setFromMatrixPosition( light.matrixWorld );
			_matrixPosition.setFromMatrixPosition( light.target.matrixWorld );
			shadowCamera.lookAt( _matrixPosition );
			shadowCamera.updateMatrixWorld();

			shadowCamera.matrixWorldInverse.getInverse( shadowCamera.matrixWorld );

			//

			if ( light.cameraHelper ) { light.cameraHelper.visible = light.shadowCameraVisible; }
			if ( light.shadowCameraVisible ) { light.cameraHelper.update(); }

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

			_renderer.setRenderTarget( shadowMap );
			_renderer.clear();

			// set object matrices & frustum culling

			_renderList.length = 0;

			projectObject( scene, shadowCamera );

			// render regular objects

			var j, jl, k, kl,
				object, geometry, material,
				groups, materials,
				group, groupMaterial;

			for ( j = 0, jl = _renderList.length; j < jl; j ++ ) {

				object = _renderList[ j ];
				geometry = _objects.update( object );
				material = object.material;

				if ( material instanceof MultiMaterial ) {

					groups = geometry.groups;
					materials = material.materials;

					for ( k = 0, kl = groups.length; k < kl; k ++ ) {

						group = groups[ k ];
						groupMaterial = materials[ group.materialIndex ];

						if ( groupMaterial.visible === true ) {

							_renderer.renderBufferDirect( shadowCamera, _lights, null, geometry, getDepthMaterial( object, groupMaterial ), object, group );

						}

					}

				} else {

					_renderer.renderBufferDirect( shadowCamera, _lights, null, geometry, getDepthMaterial( object, material ), object );

				}

			}

		}

		// restore GL state

		var clearColor = _renderer.getClearColor(),
			clearAlpha = _renderer.getClearAlpha();

		_renderer.setClearColor( clearColor, clearAlpha );
		_state.enable( _gl.BLEND );

		if ( scope.cullFace === Constants.CullFaceFront ) {

			_gl.cullFace( _gl.BACK );

		}

		_renderer.resetGLState();

		scope.needsUpdate = false;

	};

	function getDepthMaterial( object, material ) {

		var geometry = object.geometry;

		var useMorphing = geometry.morphTargets !== undefined && geometry.morphTargets.length > 0 && material.morphTargets;
		var useSkinning = object instanceof SkinnedMesh && material.skinning;

		var depthMaterial;

		if ( object.customDepthMaterial ) {

			depthMaterial = object.customDepthMaterial;

		} else if ( useSkinning ) {

			depthMaterial = useMorphing ? _depthMaterialMorphSkin : _depthMaterialSkin;

		} else if ( useMorphing ) {

			depthMaterial = _depthMaterialMorph;

		} else {

			depthMaterial = _depthMaterial;

		}

		depthMaterial.visible = material.visible;
		depthMaterial.wireframe = material.wireframe;
		depthMaterial.wireframeLinewidth = material.wireframeLinewidth;

		return depthMaterial;

	}

	function projectObject( object, camera ) {

		if ( object.visible === false ) { return; }

		var material;

		if ( object instanceof Mesh || object instanceof Line || object instanceof PointCloud ) {

			if ( object.castShadow && ( object.frustumCulled === false || _frustum.intersectsObject( object ) === true ) ) {

				material = object.material;

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

}
