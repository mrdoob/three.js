/**
 * @author mrdoob / http://mrdoob.com/
 */

Object.defineProperties( THREE.Box2.prototype, {
	empty: {
		value: function () {
			console.warn( 'THREE.Box2: .empty() has been renamed to .isEmpty().' );
			return this.isEmpty();
		}
	},
	isIntersectionBox: {
		value: function ( box ) {
			console.warn( 'THREE.Box2: .isIntersectionBox() has been renamed to .intersectsBox().' );
			return this.intersectsBox( box );
		}
	}
} );

Object.defineProperties( THREE.Box3.prototype, {
	empty: {
		value: function () {
			console.warn( 'THREE.Box3: .empty() has been renamed to .isEmpty().' );
			return this.isEmpty();
		}
	},
	isIntersectionBox: {
		value: function ( box ) {
			console.warn( 'THREE.Box3: .isIntersectionBox() has been renamed to .intersectsBox().' );
			return this.intersectsBox( box );
		}
	},
	isIntersectionSphere: {
		value: function ( sphere ) {
			console.warn( 'THREE.Box3: .isIntersectionSphere() has been renamed to .intersectsSphere().' );
			return this.intersectsSphere( sphere );
		}
	}
} );

Object.defineProperties( THREE.Matrix3.prototype, {
	multiplyVector3: {
		value: function ( vector ) {
			console.warn( 'THREE.Matrix3: .multiplyVector3() has been removed. Use vector.applyMatrix3( matrix ) instead.' );
			return vector.applyMatrix3( this );
		}
	},
	multiplyVector3Array: {
		value: function ( a ) {
			console.warn( 'THREE.Matrix3: .multiplyVector3Array() has been renamed. Use matrix.applyToVector3Array( array ) instead.' );
			return this.applyToVector3Array( a );
		}
	}
} );

Object.defineProperties( THREE.Matrix4.prototype, {
	extractPosition: {
		value: function ( m ) {
			console.warn( 'THREE.Matrix4: .extractPosition() has been renamed to .copyPosition().' );
			return this.copyPosition( m );
		}
	},
	setRotationFromQuaternion: {
		value: function ( q ) {
			console.warn( 'THREE.Matrix4: .setRotationFromQuaternion() has been renamed to .makeRotationFromQuaternion().' );
			return this.makeRotationFromQuaternion( q );
		}
	},
	multiplyVector3: {
		value: function ( vector ) {
			console.warn( 'THREE.Matrix4: .multiplyVector3() has been removed. Use vector.applyMatrix4( matrix ) or vector.applyProjection( matrix ) instead.' );
			return vector.applyProjection( this );
		}
	},
	multiplyVector4: {
		value: function ( vector ) {
			console.warn( 'THREE.Matrix4: .multiplyVector4() has been removed. Use vector.applyMatrix4( matrix ) instead.' );
			return vector.applyMatrix4( this );
		}
	},
	multiplyVector3Array: {
		value: function ( a ) {
			console.warn( 'THREE.Matrix4: .multiplyVector3Array() has been renamed. Use matrix.applyToVector3Array( array ) instead.' );
			return this.applyToVector3Array( a );
		}
	},
	rotateAxis: {
		value: function ( v ) {
			console.warn( 'THREE.Matrix4: .rotateAxis() has been removed. Use Vector3.transformDirection( matrix ) instead.' );
			v.transformDirection( this );
		}
	},
	crossVector: {
		value: function ( vector ) {
			console.warn( 'THREE.Matrix4: .crossVector() has been removed. Use vector.applyMatrix4( matrix ) instead.' );
			return vector.applyMatrix4( this );
		}
	},
	translate: {
		value: function ( v ) {
			console.error( 'THREE.Matrix4: .translate() has been removed.' );
		}
	},
	rotateX: {
		value: function ( angle ) {
			console.error( 'THREE.Matrix4: .rotateX() has been removed.' );
		}
	},
	rotateY: {
		value: function ( angle ) {
			console.error( 'THREE.Matrix4: .rotateY() has been removed.' );
		}
	},
	rotateZ: {
		value: function ( angle ) {
			console.error( 'THREE.Matrix4: .rotateZ() has been removed.' );
		}
	},
	rotateByAxis: {
		value: function ( axis, angle ) {
			console.error( 'THREE.Matrix4: .rotateByAxis() has been removed.' );
		}
	}
} );

Object.defineProperties( THREE.Plane.prototype, {
	isIntersectionLine: {
		value: function ( line ) {
			console.warn( 'THREE.Plane: .isIntersectionLine() has been renamed to .intersectsLine().' );
			return this.intersectsLine( line );
		}
	}
} );

Object.defineProperties( THREE.Quaternion.prototype, {
	multiplyVector3: {
		value: function ( vector ) {
			console.warn( 'THREE.Quaternion: .multiplyVector3() has been removed. Use is now vector.applyQuaternion( quaternion ) instead.' );
			return vector.applyQuaternion( this );
		}
	}
} );

Object.defineProperties( THREE.Ray.prototype, {
	isIntersectionBox: {
		value: function ( box ) {
			console.warn( 'THREE.Ray: .isIntersectionBox() has been renamed to .intersectsBox().' );
			return this.intersectsBox( box );
		}
	},
	isIntersectionPlane: {
		value: function ( plane ) {
			console.warn( 'THREE.Ray: .isIntersectionPlane() has been renamed to .intersectsPlane().' );
			return this.intersectsPlane( plane );
		}
	},
	isIntersectionSphere: {
		value: function ( sphere ) {
			console.warn( 'THREE.Ray: .isIntersectionSphere() has been renamed to .intersectsSphere().' );
			return this.intersectsSphere( sphere );
		}
	}
} );

Object.defineProperties( THREE.Vector3.prototype, {
	setEulerFromRotationMatrix: {
		value: function () {
			console.error( 'THREE.Vector3: .setEulerFromRotationMatrix() has been removed. Use Euler.setFromRotationMatrix() instead.' );
		}
	},
	setEulerFromQuaternion: {
		value: function () {
			console.error( 'THREE.Vector3: .setEulerFromQuaternion() has been removed. Use Euler.setFromQuaternion() instead.' );
		}
	},
	getPositionFromMatrix: {
		value: function ( m ) {
			console.warn( 'THREE.Vector3: .getPositionFromMatrix() has been renamed to .setFromMatrixPosition().' );
			return this.setFromMatrixPosition( m );
		}
	},
	getScaleFromMatrix: {
		value: function ( m ) {
			console.warn( 'THREE.Vector3: .getScaleFromMatrix() has been renamed to .setFromMatrixScale().' );
			return this.setFromMatrixScale( m );
		}
	},
	getColumnFromMatrix: {
		value: function ( index, matrix ) {
			console.warn( 'THREE.Vector3: .getColumnFromMatrix() has been renamed to .setFromMatrixColumn().' );
			return this.setFromMatrixColumn( index, matrix );
		}
	}
} );

//

THREE.Face4 = function ( a, b, c, d, normal, color, materialIndex ) {

	console.warn( 'THREE.Face4 has been removed. A THREE.Face3 will be created instead.' );
	return new THREE.Face3( a, b, c, normal, color, materialIndex );

};

//

Object.defineProperties( THREE.Object3D.prototype, {
	eulerOrder: {
		get: function () {
			console.warn( 'THREE.Object3D: .eulerOrder is now .rotation.order.' );
			return this.rotation.order;
		},
		set: function ( value ) {
			console.warn( 'THREE.Object3D: .eulerOrder is now .rotation.order.' );
			this.rotation.order = value;
		}
	},
	getChildByName: {
		value: function ( name ) {
			console.warn( 'THREE.Object3D: .getChildByName() has been renamed to .getObjectByName().' );
			return this.getObjectByName( name );
		}
	},
	renderDepth: {
		set: function ( value ) {
			console.warn( 'THREE.Object3D: .renderDepth has been removed. Use .renderOrder, instead.' );
		}
	},
	translate: {
		value: function ( distance, axis ) {
			console.warn( 'THREE.Object3D: .translate() has been removed. Use .translateOnAxis( axis, distance ) instead.' );
			return this.translateOnAxis( axis, distance );
		}
	},
	useQuaternion: {
		get: function () {
			console.warn( 'THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.' );
		},
		set: function ( value ) {
			console.warn( 'THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.' );
		}
	}
} );

//

Object.defineProperties( THREE, {
	PointCloud: {
		value: function ( geometry, material ) {
			console.warn( 'THREE.PointCloud has been renamed to THREE.Points.' );
			return new THREE.Points( geometry, material );
		}
	},
	ParticleSystem: {
		value: function ( geometry, material ) {
			console.warn( 'THREE.ParticleSystem has been renamed to THREE.Points.' );
			return new THREE.Points( geometry, material );
		}
	}
} );

//

Object.defineProperties( THREE.Light.prototype, {
	onlyShadow: {
		set: function ( value ) {
			console.warn( 'THREE.Light: .onlyShadow has been removed.' );
		}
	},
	shadowCameraFov: {
		set: function ( value ) {
			console.warn( 'THREE.Light: .shadowCameraFov is now .shadow.camera.fov.' );
			this.shadow.camera.fov = value;
		}
	},
	shadowCameraLeft: {
		set: function ( value ) {
			console.warn( 'THREE.Light: .shadowCameraLeft is now .shadow.camera.left.' );
			this.shadow.camera.left = value;
		}
	},
	shadowCameraRight: {
		set: function ( value ) {
			console.warn( 'THREE.Light: .shadowCameraRight is now .shadow.camera.right.' );
			this.shadow.camera.right = value;
		}
	},
	shadowCameraTop: {
		set: function ( value ) {
			console.warn( 'THREE.Light: .shadowCameraTop is now .shadow.camera.top.' );
			this.shadow.camera.top = value;
		}
	},
	shadowCameraBottom: {
		set: function ( value ) {
			console.warn( 'THREE.Light: .shadowCameraBottom is now .shadow.camera.bottom.' );
			this.shadow.camera.bottom = value;
		}
	},
	shadowCameraNear: {
		set: function ( value ) {
			console.warn( 'THREE.Light: .shadowCameraNear is now .shadow.camera.near.' );
			this.shadow.camera.near = value;
		}
	},
	shadowCameraFar: {
		set: function ( value ) {
			console.warn( 'THREE.Light: .shadowCameraFar is now .shadow.camera.far.' );
			this.shadow.camera.far = value;
		}
	},
	shadowCameraVisible: {
		set: function ( value ) {
			console.warn( 'THREE.Light: .shadowCameraVisible has been removed. Use new THREE.CameraHelper( light.shadow.camera ) instead.' );
		}
	},
	shadowBias: {
		set: function ( value ) {
			console.warn( 'THREE.Light: .shadowBias is now .shadow.bias.' );
			this.shadow.bias = value;
		}
	},
	shadowDarkness: {
		set: function ( value ) {
			console.warn( 'THREE.Light: .shadowDarkness has been removed.' );
		}
	},
	shadowMapWidth: {
		set: function ( value ) {
			console.warn( 'THREE.Light: .shadowMapWidth is now .shadow.mapSize.width.' );
			this.shadow.mapSize.width = value;
		}
	},
	shadowMapHeight: {
		set: function ( value ) {
			console.warn( 'THREE.Light: .shadowMapHeight is now .shadow.mapSize.height.' );
			this.shadow.mapSize.height = value;
		}
	}
} );

//

Object.defineProperties( THREE.BufferAttribute.prototype, {
	length: {
		get: function () {
			console.warn( 'THREE.BufferAttribute: .length has been deprecated. Please use .count.' );
			return this.array.length;
		}
	}
} );

Object.defineProperties( THREE.BufferGeometry.prototype, {
	drawcalls: {
		get: function () {
			console.error( 'THREE.BufferGeometry: .drawcalls has been renamed to .groups.' );
			return this.groups;
		}
	},
	offsets: {
		get: function () {
			console.warn( 'THREE.BufferGeometry: .offsets has been renamed to .groups.' );
			return this.groups;
		}
	},
	addIndex: {
		value: function ( index ) {
			console.warn( 'THREE.BufferGeometry: .addIndex() has been renamed to .setIndex().' );
			this.setIndex( index );
		}
	},
	addDrawCall: {
		value: function ( start, count, indexOffset ) {
			if ( indexOffset !== undefined ) {
				console.warn( 'THREE.BufferGeometry: .addDrawCall() no longer supports indexOffset.' );
			}
			console.warn( 'THREE.BufferGeometry: .addDrawCall() is now .addGroup().' );
			this.addGroup( start, count );
		}
	},
	clearDrawCalls: {
		value: function () {
			console.warn( 'THREE.BufferGeometry: .clearDrawCalls() is now .clearGroups().' );
			this.clearGroups();
		}
	},
	computeTangents: {
		value: function () {
			console.warn( 'THREE.BufferGeometry: .computeTangents() has been removed.' );
		}
	},
	computeOffsets: {
		value: function () {
			console.warn( 'THREE.BufferGeometry: .computeOffsets() has been removed.' );
		}
	}
} );

//

Object.defineProperties( THREE.Material.prototype, {
	wrapAround: {
		get: function () {
			console.warn( 'THREE.' + this.type + ': .wrapAround has been removed.' );
		},
		set: function ( value ) {
			console.warn( 'THREE.' + this.type + ': .wrapAround has been removed.' );
		}
	},
	wrapRGB: {
		get: function () {
			console.warn( 'THREE.' + this.type + ': .wrapRGB has been removed.' );
			return new THREE.Color();
		}
	}
} );

Object.defineProperties( THREE, {
	PointCloudMaterial: {
		value: function ( parameters ) {
			console.warn( 'THREE.PointCloudMaterial has been renamed to THREE.PointsMaterial.' );
			return new THREE.PointsMaterial( parameters );
		}
	},
	ParticleBasicMaterial: {
		value: function ( parameters ) {
			console.warn( 'THREE.ParticleBasicMaterial has been renamed to THREE.PointsMaterial.' );
			return new THREE.PointsMaterial( parameters );
		}
	},
	ParticleSystemMaterial:{
		value: function ( parameters ) {
			console.warn( 'THREE.ParticleSystemMaterial has been renamed to THREE.PointsMaterial.' );
			return new THREE.PointsMaterial( parameters );
		}
	}
} );

Object.defineProperties( THREE.MeshPhongMaterial.prototype, {
	metal: {
		get: function () {
			console.warn( 'THREE.MeshPhongMaterial: .metal has been removed. Use THREE.MeshStandardMaterial instead.' );
			return false;
		},
		set: function ( value ) {
			console.warn( 'THREE.MeshPhongMaterial: .metal has been removed. Use THREE.MeshStandardMaterial instead' );
		}
	}
} );

Object.defineProperties( THREE.ShaderMaterial.prototype, {
	derivatives: {
		get: function () {
			console.warn( 'THREE.ShaderMaterial: .derivatives has been moved to .extensions.derivatives.' );
			return this.extensions.derivatives;
		},
		set: function ( value ) {
			console.warn( 'THREE. ShaderMaterial: .derivatives has been moved to .extensions.derivatives.' );
			this.extensions.derivatives = value;
		}
	}
} );

//

Object.defineProperties( THREE.WebGLRenderer.prototype, {
	supportsFloatTextures: {
		value: function () {
			console.warn( 'THREE.WebGLRenderer: .supportsFloatTextures() is now .extensions.get( \'OES_texture_float\' ).' );
			return this.extensions.get( 'OES_texture_float' );
		}
	},
	supportsHalfFloatTextures: {
		value: function () {
			console.warn( 'THREE.WebGLRenderer: .supportsHalfFloatTextures() is now .extensions.get( \'OES_texture_half_float\' ).' );
			return this.extensions.get( 'OES_texture_half_float' );
		}
	},
	supportsStandardDerivatives: {
		value: function () {
			console.warn( 'THREE.WebGLRenderer: .supportsStandardDerivatives() is now .extensions.get( \'OES_standard_derivatives\' ).' );
			return this.extensions.get( 'OES_standard_derivatives' );
		}
	},
	supportsCompressedTextureS3TC: {
		value: function () {
			console.warn( 'THREE.WebGLRenderer: .supportsCompressedTextureS3TC() is now .extensions.get( \'WEBGL_compressed_texture_s3tc\' ).' );
			return this.extensions.get( 'WEBGL_compressed_texture_s3tc' );
		}
	},
	supportsCompressedTexturePVRTC: {
		value: function () {
			console.warn( 'THREE.WebGLRenderer: .supportsCompressedTexturePVRTC() is now .extensions.get( \'WEBGL_compressed_texture_pvrtc\' ).' );
			return this.extensions.get( 'WEBGL_compressed_texture_pvrtc' );
		}
	},
	supportsBlendMinMax: {
		value: function () {
			console.warn( 'THREE.WebGLRenderer: .supportsBlendMinMax() is now .extensions.get( \'EXT_blend_minmax\' ).' );
			return this.extensions.get( 'EXT_blend_minmax' );
		}
	},
	supportsVertexTextures: {
		value: function () {
			return this.capabilities.vertexTextures;
		}
	},
	supportsInstancedArrays: {
		value: function () {
			console.warn( 'THREE.WebGLRenderer: .supportsInstancedArrays() is now .extensions.get( \'ANGLE_instanced_arrays\' ).' );
			return this.extensions.get( 'ANGLE_instanced_arrays' );
		}
	},
	enableScissorTest: {
		value: function ( boolean ) {
			console.warn( 'THREE.WebGLRenderer: .enableScissorTest() is now .setScissorTest().' );
			this.setScissorTest( boolean );
		}
	},
	initMaterial: {
		value: function () {
			console.warn( 'THREE.WebGLRenderer: .initMaterial() has been removed.' );
		}
	},
	addPrePlugin: {
		value: function () {
			console.warn( 'THREE.WebGLRenderer: .addPrePlugin() has been removed.' );
		}
	},
	addPostPlugin: {
		value: function () {
			console.warn( 'THREE.WebGLRenderer: .addPostPlugin() has been removed.' );
		}
	},
	updateShadowMap: {
		value: function () {
			console.warn( 'THREE.WebGLRenderer: .updateShadowMap() has been removed.' );
		}
	},
	shadowMapEnabled: {
		get: function () {
			return this.shadowMap.enabled;
		},
		set: function ( value ) {
			console.warn( 'THREE.WebGLRenderer: .shadowMapEnabled is now .shadowMap.enabled.' );
			this.shadowMap.enabled = value;
		}
	},
	shadowMapType: {
		get: function () {
			return this.shadowMap.type;
		},
		set: function ( value ) {
			console.warn( 'THREE.WebGLRenderer: .shadowMapType is now .shadowMap.type.' );
			this.shadowMap.type = value;
		}
	},
	shadowMapCullFace: {
		get: function () {
			return this.shadowMap.cullFace;
		},
		set: function ( value ) {
			console.warn( 'THREE.WebGLRenderer: .shadowMapCullFace is now .shadowMap.cullFace.' );
			this.shadowMap.cullFace = value;
		}
	}
} );

//

Object.defineProperties( THREE.WebGLRenderTarget.prototype, {
	wrapS: {
		get: function () {
			console.warn( 'THREE.WebGLRenderTarget: .wrapS is now .texture.wrapS.' );
			return this.texture.wrapS;
		},
		set: function ( value ) {
			console.warn( 'THREE.WebGLRenderTarget: .wrapS is now .texture.wrapS.' );
			this.texture.wrapS = value;
		}
	},
	wrapT: {
		get: function () {
			console.warn( 'THREE.WebGLRenderTarget: .wrapT is now .texture.wrapT.' );
			return this.texture.wrapT;
		},
		set: function ( value ) {
			console.warn( 'THREE.WebGLRenderTarget: .wrapT is now .texture.wrapT.' );
			this.texture.wrapT = value;
		}
	},
	magFilter: {
		get: function () {
			console.warn( 'THREE.WebGLRenderTarget: .magFilter is now .texture.magFilter.' );
			return this.texture.magFilter;
		},
		set: function ( value ) {
			console.warn( 'THREE.WebGLRenderTarget: .magFilter is now .texture.magFilter.' );
			this.texture.magFilter = value;
		}
	},
	minFilter: {
		get: function () {
			console.warn( 'THREE.WebGLRenderTarget: .minFilter is now .texture.minFilter.' );
			return this.texture.minFilter;
		},
		set: function ( value ) {
			console.warn( 'THREE.WebGLRenderTarget: .minFilter is now .texture.minFilter.' );
			this.texture.minFilter = value;
		}
	},
	anisotropy: {
		get: function () {
			console.warn( 'THREE.WebGLRenderTarget: .anisotropy is now .texture.anisotropy.' );
			return this.texture.anisotropy;
		},
		set: function ( value ) {
			console.warn( 'THREE.WebGLRenderTarget: .anisotropy is now .texture.anisotropy.' );
			this.texture.anisotropy = value;
		}
	},
	offset: {
		get: function () {
			console.warn( 'THREE.WebGLRenderTarget: .offset is now .texture.offset.' );
			return this.texture.offset;
		},
		set: function ( value ) {
			console.warn( 'THREE.WebGLRenderTarget: .offset is now .texture.offset.' );
			this.texture.offset = value;
		}
	},
	repeat: {
		get: function () {
			console.warn( 'THREE.WebGLRenderTarget: .repeat is now .texture.repeat.' );
			return this.texture.repeat;
		},
		set: function ( value ) {
			console.warn( 'THREE.WebGLRenderTarget: .repeat is now .texture.repeat.' );
			this.texture.repeat = value;
		}
	},
	format: {
		get: function () {
			console.warn( 'THREE.WebGLRenderTarget: .format is now .texture.format.' );
			return this.texture.format;
		},
		set: function ( value ) {
			console.warn( 'THREE.WebGLRenderTarget: .format is now .texture.format.' );
			this.texture.format = value;
		}
	},
	type: {
		get: function () {
			console.warn( 'THREE.WebGLRenderTarget: .type is now .texture.type.' );
			return this.texture.type;
		},
		set: function ( value ) {
			console.warn( 'THREE.WebGLRenderTarget: .type is now .texture.type.' );
			this.texture.type = value;
		}
	},
	generateMipmaps: {
		get: function () {
			console.warn( 'THREE.WebGLRenderTarget: .generateMipmaps is now .texture.generateMipmaps.' );
			return this.texture.generateMipmaps;
		},
		set: function ( value ) {
			console.warn( 'THREE.WebGLRenderTarget: .generateMipmaps is now .texture.generateMipmaps.' );
			this.texture.generateMipmaps = value;
		}
	}
} );

//

THREE.GeometryUtils = {

	merge: function ( geometry1, geometry2, materialIndexOffset ) {

		console.warn( 'THREE.GeometryUtils: .merge() has been moved to Geometry. Use geometry.merge( geometry2, matrix, materialIndexOffset ) instead.' );

		var matrix;

		if ( geometry2 instanceof THREE.Mesh ) {

			geometry2.matrixAutoUpdate && geometry2.updateMatrix();

			matrix = geometry2.matrix;
			geometry2 = geometry2.geometry;

		}

		geometry1.merge( geometry2, matrix, materialIndexOffset );

	},

	center: function ( geometry ) {

		console.warn( 'THREE.GeometryUtils: .center() has been moved to Geometry. Use geometry.center() instead.' );
		return geometry.center();

	}

};

THREE.ImageUtils = {

	crossOrigin: undefined,

	loadTexture: function ( url, mapping, onLoad, onError ) {

		console.warn( 'THREE.ImageUtils.loadTexture has been deprecated. Use THREE.TextureLoader() instead.' );

		var loader = new THREE.TextureLoader();
		loader.setCrossOrigin( this.crossOrigin );

		var texture = loader.load( url, onLoad, undefined, onError );

		if ( mapping ) texture.mapping = mapping;

		return texture;

	},

	loadTextureCube: function ( urls, mapping, onLoad, onError ) {

		console.warn( 'THREE.ImageUtils.loadTextureCube has been deprecated. Use THREE.CubeTextureLoader() instead.' );

		var loader = new THREE.CubeTextureLoader();
		loader.setCrossOrigin( this.crossOrigin );

		var texture = loader.load( urls, onLoad, undefined, onError );

		if ( mapping ) texture.mapping = mapping;

		return texture;

	},

	loadCompressedTexture: function () {

		console.error( 'THREE.ImageUtils.loadCompressedTexture has been removed. Use THREE.DDSLoader instead.' );

	},

	loadCompressedTextureCube: function () {

		console.error( 'THREE.ImageUtils.loadCompressedTextureCube has been removed. Use THREE.DDSLoader instead.' );

	}

};

//

THREE.Projector = function () {

	console.error( 'THREE.Projector has been moved to /examples/js/renderers/Projector.js.' );

	this.projectVector = function ( vector, camera ) {

		console.warn( 'THREE.Projector: .projectVector() is now vector.project().' );
		vector.project( camera );

	};

	this.unprojectVector = function ( vector, camera ) {

		console.warn( 'THREE.Projector: .unprojectVector() is now vector.unproject().' );
		vector.unproject( camera );

	};

	this.pickingRay = function ( vector, camera ) {

		console.error( 'THREE.Projector: .pickingRay() is now raycaster.setFromCamera().' );

	};

};

//

THREE.CanvasRenderer = function () {

	console.error( 'THREE.CanvasRenderer has been moved to /examples/js/renderers/CanvasRenderer.js' );

	this.domElement = document.createElement( 'canvas' );
	this.clear = function () {};
	this.render = function () {};
	this.setClearColor = function () {};
	this.setSize = function () {};

};

//

THREE.MeshFaceMaterial = THREE.MultiMaterial;
