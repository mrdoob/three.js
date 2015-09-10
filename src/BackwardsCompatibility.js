/**
 * @author mrdoob / http://mrdoob.com/
 * @author vanruesc
 */

module.exports = function ( API ) {

	// Core
	API.Int8Attribute = API.BufferAttribute.Int8Attribute;
	API.Uint8Attribute = API.BufferAttribute.Uint8Attribute;
	API.Uint8ClampedAttribute = API.BufferAttribute.Uint8ClampedAttribute;
	API.Int16Attribute = API.BufferAttribute.Int16Attribute;
	API.Uint16Attribute = API.BufferAttribute.Uint16Attribute;
	API.Int32Attribute = API.BufferAttribute.Int32Attribute;
	API.Uint32Attribute = API.BufferAttribute.Uint32Attribute;
	API.Float32Attribute = API.BufferAttribute.Float32Attribute;
	API.Float64Attribute = API.BufferAttribute.Float64Attribute;
	API.DynamicBufferAttribute = API.BufferAttribute.DynamicBufferAttribute;

	Object.defineProperties( API, {
		Object3DIdCount: {
			get: function () {

				return API.Object3D.IdCount;

			},
			set: function ( count ) {

				API.Object3D.IdCount = count;

			}
		},
		GeometryIdCount: {
			get: function () {

				return API.Geometry.IdCount;

			},
			set: function ( count ) {

				API.Geometry.IdCount = count;

			}
		}
	} );

	// Extras
	API.typeface_js = API.FontUtils.typeface_js;

	// Extras > Core
	API.Shape.Utils = API.ShapeUtils;

	// Extras > Geometries
	API.CubeGeometry = API.BoxGeometry;

	// Extras > Core
	API.PathActions = API.Path.Actions;

	// Loaders
	API.DataTextureLoader = API.BinaryTextureLoader;
	API.DefaultLoadingManager = API.LoadingManager.DefaultLoadingManager;

	// Math
	API.ColorKeywords = API.Color.Keywords;

	// Materials
	API.MeshFaceMaterial = API.MultiMaterial;
	API.ParticleBasicMaterial = API.PointCloudMaterial.ParticleBasicMaterial;
	API.ParticleSystemMaterial = API.PointCloudMaterial.ParticleSystemMaterial;

	Object.defineProperties( API, {
		MaterialIdCount: {
			get: function () {

				return API.Material.IdCount;

			},
			set: function ( count ) {

				API.Material.IdCount = count;

			}
		}
	} );

	// Objects
	API.Particle = API.Sprite;
	API.ParticleSystem = API.PointCloud.ParticleSystem;

	// Textures
	Object.defineProperties( API, {
		TextureIdCount: {
			get: function () {

				return API.Texture.IdCount;

			},
			set: function ( count ) {

				API.Texture.IdCount = count;

			}
		}
	} );

	// Other
	API.Projector = function () {

		console.error( "Projector has been moved to /examples/js/renderers/Projector.js." );

		this.projectVector = function ( vector, camera ) {

			console.warn( "Projector: .projectVector() is now vector.project()." );
			vector.project( camera );

		};

		this.unprojectVector = function ( vector, camera ) {

			console.warn( "Projector: .unprojectVector() is now vector.unproject()." );
			vector.unproject( camera );

		};

		this.pickingRay = function () {

			console.error( "Projector: .pickingRay() is now raycaster.setFromCamera()." );

		};

	};

	API.CanvasRenderer = function () {

		console.error( "CanvasRenderer has been moved to /examples/js/renderers/CanvasRenderer.js" );

		this.domElement = document.createElement( "canvas" );
		this.clear = function () {};
		this.render = function () {};
		this.setClearColor = function () {};
		this.setSize = function () {};

	};

};
