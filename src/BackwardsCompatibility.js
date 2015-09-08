/**
 * @author mrdoob / http://mrdoob.com/
 * @author vanruesc
 */

// using lowercase here lets uglify mangle more
module.exports = function ( three ) {

	// Core
	three.Int8Attribute = three.BufferAttribute.Int8Attribute;
	three.Uint8Attribute = three.BufferAttribute.Uint8Attribute;
	three.Uint8ClampedAttribute = three.BufferAttribute.Uint8ClampedAttribute;
	three.Int16Attribute = three.BufferAttribute.Int16Attribute;
	three.Uint16Attribute = three.BufferAttribute.Uint16Attribute;
	three.Int32Attribute = three.BufferAttribute.Int32Attribute;
	three.Uint32Attribute = three.BufferAttribute.Uint32Attribute;
	three.Float32Attribute = three.BufferAttribute.Float32Attribute;
	three.Float64Attribute = three.BufferAttribute.Float64Attribute;

	Object.defineProperties( three, {
		Object3DIdCount: {
			get: function () {

				return three.Object3D.IdCount;

			},
			set: function ( count ) {

				three.Object3D.IdCount = count;

			}
		},
		GeometryIdCount: {
			get: function () {

				return three.Geometry.IdCount;

			},
			set: function ( count ) {

				three.Geometry.IdCount = count;

			}
		}
	} );

	// Extras
	three.typeface_js = three.FontUtils.typeface_js;

	// Extras > Core
	three.Shape.Utils = three.ShapeUtils;

	// Extras > Geometries
	three.CubeGeometry = three.BoxGeometry;

	// Extras > Core
	three.PathActions = three.Path.Actions;

	// Loaders
	three.DataTextureLoader = three.BinaryTextureLoader;
	three.DefaultLoadingManager = three.LoadingManager.DefaultLoadingManager;

	// Math
	three.ColorKeywords = three.Color.Keywords;

	// Materials
	three.MeshFaceMaterial = three.MultiMaterial;
	three.ParticleBasicMaterial = three.PointCloudMaterial.ParticleBasicMaterial;
	three.ParticleSystemMaterial = three.PointCloudMaterial.ParticleSystemMaterial;

	Object.defineProperties( three, {
		MaterialIdCount: {
			get: function () {

				return three.Material.IdCount;

			},
			set: function ( count ) {

				three.Material.IdCount = count;

			}
		}
	} );

	// Objects
	three.Particle = three.Sprite;
	three.ParticleSystem = three.PointCloud.ParticleSystem;

	// Textures
	Object.defineProperties( three, {
		TextureIdCount: {
			get: function () {

				return three.Texture.IdCount;

			},
			set: function ( count ) {

				three.Texture.IdCount = count;

			}
		}
	} );

	// Other
	three.Projector = function () {

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

	three.CanvasRenderer = function () {

		console.error( "CanvasRenderer has been moved to /examples/js/renderers/CanvasRenderer.js" );

		this.domElement = document.createElement( "canvas" );
		this.clear = function () {};
		this.render = function () {};
		this.setClearColor = function () {};
		this.setSize = function () {};

	};

};
