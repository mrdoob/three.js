/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Audio } from './audio/Audio.js';
import { AudioAnalyser } from './audio/AudioAnalyser.js';
import { PerspectiveCamera } from './cameras/PerspectiveCamera.js';
import { FlatShading } from './constants.js';
import {
	Float64BufferAttribute,
	Float32BufferAttribute,
	Uint32BufferAttribute,
	Int32BufferAttribute,
	Uint16BufferAttribute,
	Int16BufferAttribute,
	Uint8ClampedBufferAttribute,
	Uint8BufferAttribute,
	Int8BufferAttribute,
	BufferAttribute
} from './core/BufferAttribute.js';
import { BufferGeometry } from './core/BufferGeometry.js';
import { Face3 } from './core/Face3.js';
import { Geometry } from './core/Geometry.js';
import { Object3D } from './core/Object3D.js';
import { Uniform } from './core/Uniform.js';
import { Curve } from './extras/core/Curve.js';
import { CurvePath } from './extras/core/CurvePath.js';
import { Path } from './extras/core/Path.js';
import { CatmullRomCurve3 } from './extras/curves/CatmullRomCurve3.js';
import { AxesHelper } from './helpers/AxesHelper.js';
import { BoxHelper } from './helpers/BoxHelper.js';
import { GridHelper } from './helpers/GridHelper.js';
import { SkeletonHelper } from './helpers/SkeletonHelper.js';
import { BoxGeometry } from './geometries/BoxGeometry.js';
import { EdgesGeometry } from './geometries/EdgesGeometry.js';
import { ExtrudeGeometry } from './geometries/ExtrudeGeometry.js';
import { ExtrudeBufferGeometry } from './geometries/ExtrudeGeometry.js';
import { ShapeGeometry } from './geometries/ShapeGeometry.js';
import { WireframeGeometry } from './geometries/WireframeGeometry.js';
import { Light } from './lights/Light.js';
import { Loader } from './loaders/Loader.js';
import { LoaderUtils } from './loaders/LoaderUtils.js';
import { FileLoader } from './loaders/FileLoader.js';
import { AudioLoader } from './loaders/AudioLoader.js';
import { CubeTextureLoader } from './loaders/CubeTextureLoader.js';
import { DataTextureLoader } from './loaders/DataTextureLoader.js';
import { TextureLoader } from './loaders/TextureLoader.js';
import { Material } from './materials/Material.js';
import { LineBasicMaterial } from './materials/LineBasicMaterial.js';
import { MeshPhongMaterial } from './materials/MeshPhongMaterial.js';
import { PointsMaterial } from './materials/PointsMaterial.js';
import { ShaderMaterial } from './materials/ShaderMaterial.js';
import { Box2 } from './math/Box2.js';
import { Box3 } from './math/Box3.js';
import { Color } from './math/Color.js';
import { Line3 } from './math/Line3.js';
import { _Math } from './math/Math.js';
import { Matrix3 } from './math/Matrix3.js';
import { Matrix4 } from './math/Matrix4.js';
import { Plane } from './math/Plane.js';
import { Quaternion } from './math/Quaternion.js';
import { Ray } from './math/Ray.js';
import { Triangle } from './math/Triangle.js';
import { Vector2 } from './math/Vector2.js';
import { Vector3 } from './math/Vector3.js';
import { Vector4 } from './math/Vector4.js';
import { LineSegments } from './objects/LineSegments.js';
import { LOD } from './objects/LOD.js';
import { Points } from './objects/Points.js';
import { Sprite } from './objects/Sprite.js';
import { Skeleton } from './objects/Skeleton.js';
import { WebGLRenderer } from './renderers/WebGLRenderer.js';
import { WebGLRenderTarget } from './renderers/WebGLRenderTarget.js';
import { WebGLShadowMap } from './renderers/webgl/WebGLShadowMap.js';
import { WebVRManager } from './renderers/webvr/WebVRManager.js';
import { ImageUtils } from './extras/ImageUtils.js';
import { Shape } from './extras/core/Shape.js';
import { CubeCamera } from './cameras/CubeCamera.js';

export { BoxGeometry as CubeGeometry };

export class Face4 {

	constructor( a, b, c, d, normal, color, materialIndex ) {

		console.warn( 'THREE.Face4 has been removed. A THREE.Face3 will be created instead.' );
		return new Face3( a, b, c, normal, color, materialIndex );

	}

}

export var LineStrip = 0;

export var LinePieces = 1;

export class MeshFaceMaterial {

	constructor( materials ) {

		console.warn( 'THREE.MeshFaceMaterial has been removed. Use an Array instead.' );
		return materials;

	}

}

export class MultiMaterial {

	constructor( materials ) {

		if ( materials === undefined ) materials = [];

		console.warn( 'THREE.MultiMaterial has been removed. Use an Array instead.' );
		materials.isMultiMaterial = true;
		materials.materials = materials;
		materials.clone = function () {

			return materials.slice();

		};
		return materials;

	}

}

export class PointCloud {

	constructor( geometry, material ) {

		console.warn( 'THREE.PointCloud has been renamed to THREE.Points.' );
		return new Points( geometry, material );

	}

}

export class Particle {

	constructor( material ) {

		console.warn( 'THREE.Particle has been renamed to THREE.Sprite.' );
		return new Sprite( material );

	}

}

export class ParticleSystem {

	constructor( geometry, material ) {

		console.warn( 'THREE.ParticleSystem has been renamed to THREE.Points.' );
		return new Points( geometry, material );

	}

}

export class PointCloudMaterial {

	constructor( parameters ) {

		console.warn( 'THREE.PointCloudMaterial has been renamed to THREE.PointsMaterial.' );
		return new PointsMaterial( parameters );

	}

}

export class ParticleBasicMaterial {

	constructor( parameters ) {

		console.warn( 'THREE.ParticleBasicMaterial has been renamed to THREE.PointsMaterial.' );
		return new PointsMaterial( parameters );

	}

}

export class ParticleSystemMaterial {

	constructor( parameters ) {

		console.warn( 'THREE.ParticleSystemMaterial has been renamed to THREE.PointsMaterial.' );
		return new PointsMaterial( parameters );

	}

}

export class Vertex {

	constructor( x, y, z ) {

		console.warn( 'THREE.Vertex has been removed. Use THREE.Vector3 instead.' );
		return new Vector3( x, y, z );

	}

}

//

export class DynamicBufferAttribute {

	constructor( array, itemSize ) {

		console.warn( 'THREE.DynamicBufferAttribute has been removed. Use new THREE.BufferAttribute().setDynamic( true ) instead.' );
		return new BufferAttribute( array, itemSize ).setDynamic( true );

	}

}

export class Int8Attribute {

	constructor( array, itemSize ) {

		console.warn( 'THREE.Int8Attribute has been removed. Use new THREE.Int8BufferAttribute() instead.' );
		return new Int8BufferAttribute( array, itemSize );

	}

}

export class Uint8Attribute {

	constructor( array, itemSize ) {

		console.warn( 'THREE.Uint8Attribute has been removed. Use new THREE.Uint8BufferAttribute() instead.' );
		return new Uint8BufferAttribute( array, itemSize );

	}

}

export class Uint8ClampedAttribute {

	constructor( array, itemSize ) {

		console.warn( 'THREE.Uint8ClampedAttribute has been removed. Use new THREE.Uint8ClampedBufferAttribute() instead.' );
		return new Uint8ClampedBufferAttribute( array, itemSize );

	}

}

export class Int16Attribute {

	constructor( array, itemSize ) {

		console.warn( 'THREE.Int16Attribute has been removed. Use new THREE.Int16BufferAttribute() instead.' );
		return new Int16BufferAttribute( array, itemSize );

	}

}

export class Uint16Attribute {

	constructor( array, itemSize ) {

		console.warn( 'THREE.Uint16Attribute has been removed. Use new THREE.Uint16BufferAttribute() instead.' );
		return new Uint16BufferAttribute( array, itemSize );

	}

}

export class Int32Attribute {

	constructor( array, itemSize ) {

		console.warn( 'THREE.Int32Attribute has been removed. Use new THREE.Int32BufferAttribute() instead.' );
		return new Int32BufferAttribute( array, itemSize );

	}

}

export class Uint32Attribute {

	constructor( array, itemSize ) {

		console.warn( 'THREE.Uint32Attribute has been removed. Use new THREE.Uint32BufferAttribute() instead.' );
		return new Uint32BufferAttribute( array, itemSize );

	}

}

export class Float32Attribute {

	constructor( array, itemSize ) {

		console.warn( 'THREE.Float32Attribute has been removed. Use new THREE.Float32BufferAttribute() instead.' );
		return new Float32BufferAttribute( array, itemSize );

	}

}

export class Float64Attribute {

	constructor( array, itemSize ) {

		console.warn( 'THREE.Float64Attribute has been removed. Use new THREE.Float64BufferAttribute() instead.' );
		return new Float64BufferAttribute( array, itemSize );

	}

}

//

Curve.create = function ( construct, getPoint ) {

	console.log( 'THREE.Curve.create() has been deprecated' );

	construct.prototype = Object.create( Curve.prototype );
	construct.prototype.constructor = construct;
	construct.prototype.getPoint = getPoint;

	return construct;

};

//

//

//

export class ClosedSplineCurve3 extends CatmullRomCurve3 {

	constructor( points ) {

		console.warn( 'THREE.ClosedSplineCurve3 has been deprecated. Use THREE.CatmullRomCurve3 instead.' );

		super( points );
		this.type = 'catmullrom';
		this.closed = true;

	}

}



//

export class SplineCurve3 extends CatmullRomCurve3 {

	constructor( points ) {

		console.warn( 'THREE.SplineCurve3 has been deprecated. Use THREE.CatmullRomCurve3 instead.' );

		super( points );
		this.type = 'catmullrom';

	}

}



//

export class Spline extends CatmullRomCurve3 {

	constructor( points ) {

		console.warn( 'THREE.Spline has been removed. Use THREE.CatmullRomCurve3 instead.' );

		super( points );
		this.type = 'catmullrom';

	}

	initFromArray( /* a */ ) {

		console.error( 'THREE.Spline: .initFromArray() has been removed.' );

	}

	getControlPointsArray( /* optionalTarget */ ) {

		console.error( 'THREE.Spline: .getControlPointsArray() has been removed.' );

	}

	reparametrizeByArcLength( /* samplingCoef */ ) {

		console.error( 'THREE.Spline: .reparametrizeByArcLength() has been removed.' );

	}

}



//

export class AxisHelper {

	constructor( size ) {

		console.warn( 'THREE.AxisHelper has been renamed to THREE.AxesHelper.' );
		return new AxesHelper( size );

	}

}

export class BoundingBoxHelper {

	constructor( object, color ) {

		console.warn( 'THREE.BoundingBoxHelper has been deprecated. Creating a THREE.BoxHelper instead.' );
		return new BoxHelper( object, color );

	}

}

export class EdgesHelper {

	constructor( object, hex ) {

		console.warn( 'THREE.EdgesHelper has been removed. Use THREE.EdgesGeometry instead.' );
		return new LineSegments( new EdgesGeometry( object.geometry ), new LineBasicMaterial( { color: hex !== undefined ? hex : 0xffffff } ) );

	}

}

GridHelper.prototype.setColors = function () {

	console.error( 'THREE.GridHelper: setColors() has been deprecated, pass them in the constructor instead.' );

};

SkeletonHelper.prototype.update = function () {

	console.error( 'THREE.SkeletonHelper: update() no longer needs to be called.' );

};

export class WireframeHelper {

	constructor( object, hex ) {

		console.warn( 'THREE.WireframeHelper has been removed. Use THREE.WireframeGeometry instead.' );
		return new LineSegments( new WireframeGeometry( object.geometry ), new LineBasicMaterial( { color: hex !== undefined ? hex : 0xffffff } ) );

	}

}

//

export class XHRLoader {

	constructor( manager ) {

		console.warn( 'THREE.XHRLoader has been renamed to THREE.FileLoader.' );
		return new FileLoader( manager );

	}

}

export class BinaryTextureLoader {

	constructor( manager ) {

		console.warn( 'THREE.BinaryTextureLoader has been renamed to THREE.DataTextureLoader.' );
		return new DataTextureLoader( manager );

	}

}

//

Line3.prototype.center = function ( optionalTarget ) {

	console.warn( 'THREE.Line3: .center() has been renamed to .getCenter().' );
	return this.getCenter( optionalTarget );

};

Plane.prototype.isIntersectionLine = function ( line ) {

	console.warn( 'THREE.Plane: .isIntersectionLine() has been renamed to .intersectsLine().' );
	return this.intersectsLine( line );

};

Quaternion.prototype.multiplyVector3 = function ( vector ) {

	console.warn( 'THREE.Quaternion: .multiplyVector3() has been removed. Use is now vector.applyQuaternion( quaternion ) instead.' );
	return vector.applyQuaternion( this );

};

//

Object.defineProperties( Object3D.prototype, {

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
	useQuaternion: {
		get: function () {

			console.warn( 'THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.' );

		},
		set: function () {

			console.warn( 'THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.' );

		}
	}

} );

Object.defineProperties( LOD.prototype, {

	objects: {
		get: function () {

			console.warn( 'THREE.LOD: .objects has been renamed to .levels.' );
			return this.levels;

		}
	}

} );

Object.defineProperty( Skeleton.prototype, 'useVertexTexture', {

	get: function () {

		console.warn( 'THREE.Skeleton: useVertexTexture has been removed.' );

	},
	set: function () {

		console.warn( 'THREE.Skeleton: useVertexTexture has been removed.' );

	}

} );

Object.defineProperty( Curve.prototype, '__arcLengthDivisions', {

	get: function () {

		console.warn( 'THREE.Curve: .__arcLengthDivisions is now .arcLengthDivisions.' );
		return this.arcLengthDivisions;

	},
	set: function ( value ) {

		console.warn( 'THREE.Curve: .__arcLengthDivisions is now .arcLengthDivisions.' );
		this.arcLengthDivisions = value;

	}

} );

//

PerspectiveCamera.prototype.setLens = function ( focalLength, filmGauge ) {

	console.warn( "THREE.PerspectiveCamera.setLens is deprecated. " +
			"Use .setFocalLength and .filmGauge for a photographic setup." );

	if ( filmGauge !== undefined ) this.filmGauge = filmGauge;
	this.setFocalLength( focalLength );

};

//

Object.defineProperties( Light.prototype, {
	onlyShadow: {
		set: function () {

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
		set: function () {

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
		set: function () {

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

Object.defineProperties( BufferAttribute.prototype, {

	length: {
		get: function () {

			console.warn( 'THREE.BufferAttribute: .length has been deprecated. Use .count instead.' );
			return this.array.length;

		}
	},
	copyIndicesArray: function ( /* indices */ ) {

		console.error( 'THREE.BufferAttribute: .copyIndicesArray() has been removed.' );

	}

} );

Object.defineProperties( BufferGeometry.prototype, {

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
	}

} );

//

//

Object.defineProperties( Uniform.prototype, {

	dynamic: {
		set: function () {

			console.warn( 'THREE.Uniform: .dynamic has been removed. Use object.onBeforeRender() instead.' );

		}
	},
	onUpdate: {
		value: function () {

			console.warn( 'THREE.Uniform: .onUpdate() has been removed. Use object.onBeforeRender() instead.' );
			return this;

		}
	}

} );

//

Object.defineProperties( Material.prototype, {

	wrapAround: {
		get: function () {

			console.warn( 'THREE.Material: .wrapAround has been removed.' );

		},
		set: function () {

			console.warn( 'THREE.Material: .wrapAround has been removed.' );

		}
	},
	wrapRGB: {
		get: function () {

			console.warn( 'THREE.Material: .wrapRGB has been removed.' );
			return new Color();

		}
	},

	shading: {
		get: function () {

			console.error( 'THREE.' + this.type + ': .shading has been removed. Use the boolean .flatShading instead.' );

		},
		set: function ( value ) {

			console.warn( 'THREE.' + this.type + ': .shading has been removed. Use the boolean .flatShading instead.' );
			this.flatShading = ( value === FlatShading );

		}
	}

} );

Object.defineProperties( MeshPhongMaterial.prototype, {

	metal: {
		get: function () {

			console.warn( 'THREE.MeshPhongMaterial: .metal has been removed. Use THREE.MeshStandardMaterial instead.' );
			return false;

		},
		set: function () {

			console.warn( 'THREE.MeshPhongMaterial: .metal has been removed. Use THREE.MeshStandardMaterial instead' );

		}
	}

} );

Object.defineProperties( ShaderMaterial.prototype, {

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

Object.defineProperties( WebGLRenderer.prototype, {

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

			console.warn( 'THREE.WebGLRenderer: .shadowMapCullFace has been removed. Set Material.shadowSide instead.' );
			return undefined;

		},
		set: function ( /* value */ ) {

			console.warn( 'THREE.WebGLRenderer: .shadowMapCullFace has been removed. Set Material.shadowSide instead.' );

		}
	}
} );

Object.defineProperties( WebGLShadowMap.prototype, {

	cullFace: {
		get: function () {

			console.warn( 'THREE.WebGLRenderer: .shadowMap.cullFace has been removed. Set Material.shadowSide instead.' );
			return undefined;

		},
		set: function ( /* cullFace */ ) {

			console.warn( 'THREE.WebGLRenderer: .shadowMap.cullFace has been removed. Set Material.shadowSide instead.' );

		}
	},
	renderReverseSided: {
		get: function () {

			console.warn( 'THREE.WebGLRenderer: .shadowMap.renderReverseSided has been removed. Set Material.shadowSide instead.' );
			return undefined;

		},
		set: function () {

			console.warn( 'THREE.WebGLRenderer: .shadowMap.renderReverseSided has been removed. Set Material.shadowSide instead.' );

		}
	},
	renderSingleSided: {
		get: function () {

			console.warn( 'THREE.WebGLRenderer: .shadowMap.renderSingleSided has been removed. Set Material.shadowSide instead.' );
			return undefined;

		},
		set: function () {

			console.warn( 'THREE.WebGLRenderer: .shadowMap.renderSingleSided has been removed. Set Material.shadowSide instead.' );

		}
	}

} );

//

Object.defineProperties( WebGLRenderTarget.prototype, {

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

Object.defineProperties( WebVRManager.prototype, {

	standing: {
		set: function ( /* value */ ) {

			console.warn( 'THREE.WebVRManager: .standing has been removed.' );

		}
	}

} );

//

Audio.prototype.load = function ( file ) {

	console.warn( 'THREE.Audio: .load has been deprecated. Use THREE.AudioLoader instead.' );
	var scope = this;
	var audioLoader = new AudioLoader();
	audioLoader.load( file, function ( buffer ) {

		scope.setBuffer( buffer );

	} );
	return this;

};

AudioAnalyser.prototype.getData = function () {

	console.warn( 'THREE.AudioAnalyser: .getData() is now .getFrequencyData().' );
	return this.getFrequencyData();

};

//

CubeCamera.prototype.updateCubeMap = function ( renderer, scene ) {

	console.warn( 'THREE.CubeCamera: .updateCubeMap() is now .update().' );
	return this.update( renderer, scene );

};

//

export var GeometryUtils = {

	merge: function ( geometry1, geometry2, materialIndexOffset ) {

		console.warn( 'THREE.GeometryUtils: .merge() has been moved to Geometry. Use geometry.merge( geometry2, matrix, materialIndexOffset ) instead.' );
		var matrix;

		if ( geometry2.isMesh ) {

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

ImageUtils.crossOrigin = undefined;

ImageUtils.loadTexture = function ( url, mapping, onLoad, onError ) {

	console.warn( 'THREE.ImageUtils.loadTexture has been deprecated. Use THREE.TextureLoader() instead.' );

	var loader = new TextureLoader();
	loader.setCrossOrigin( this.crossOrigin );

	var texture = loader.load( url, onLoad, undefined, onError );

	if ( mapping ) texture.mapping = mapping;

	return texture;

};

ImageUtils.loadTextureCube = function ( urls, mapping, onLoad, onError ) {

	console.warn( 'THREE.ImageUtils.loadTextureCube has been deprecated. Use THREE.CubeTextureLoader() instead.' );

	var loader = new CubeTextureLoader();
	loader.setCrossOrigin( this.crossOrigin );

	var texture = loader.load( urls, onLoad, undefined, onError );

	if ( mapping ) texture.mapping = mapping;

	return texture;

};

ImageUtils.loadCompressedTexture = function () {

	console.error( 'THREE.ImageUtils.loadCompressedTexture has been removed. Use THREE.DDSLoader instead.' );

};

ImageUtils.loadCompressedTextureCube = function () {

	console.error( 'THREE.ImageUtils.loadCompressedTextureCube has been removed. Use THREE.DDSLoader instead.' );

};

//

export class Projector {

	constructor() {

		console.error( 'THREE.Projector has been moved to /examples/js/renderers/Projector.js.' );

		this.projectVector = function ( vector, camera ) {

			console.warn( 'THREE.Projector: .projectVector() is now vector.project().' );
			vector.project( camera );

		};

		this.unprojectVector = function ( vector, camera ) {

			console.warn( 'THREE.Projector: .unprojectVector() is now vector.unproject().' );
			vector.unproject( camera );

		};

		this.pickingRay = function () {

			console.error( 'THREE.Projector: .pickingRay() is now raycaster.setFromCamera().' );

		};

	}

}

//

export class CanvasRenderer {

	constructor() {

		console.error( 'THREE.CanvasRenderer has been moved to /examples/js/renderers/CanvasRenderer.js' );

		this.domElement = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'canvas' );
		this.clear = function () {};
		this.render = function () {};
		this.setClearColor = function () {};
		this.setSize = function () {};

	}

}

//

export var SceneUtils = {

	createMultiMaterialObject: function ( /* geometry, materials */ ) {

		console.error( 'THREE.SceneUtils has been moved to /examples/js/utils/SceneUtils.js' );

	},

	detach: function ( /* child, parent, scene */ ) {

		console.error( 'THREE.SceneUtils has been moved to /examples/js/utils/SceneUtils.js' );

	},

	attach: function ( /* child, scene, parent */ ) {

		console.error( 'THREE.SceneUtils has been moved to /examples/js/utils/SceneUtils.js' );

	}

};

//

export class LensFlare {

	constructor() {

		console.error( 'THREE.LensFlare has been moved to /examples/js/objects/Lensflare.js' );

	}

}
