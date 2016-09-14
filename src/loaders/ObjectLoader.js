import { TextureMapping, TextureWrapping, TextureFilter } from '../constants';
import { Color } from '../math/Color';
import { Matrix4 } from '../math/Matrix4';
import { Object3D } from '../core/Object3D';
import { Group } from '../objects/Group';
import { Sprite } from '../objects/Sprite';
import { Points } from '../objects/Points';
import { Line } from '../objects/Line';
import { LineSegments } from '../objects/LineSegments';
import { LOD } from '../objects/LOD';
import { Mesh } from '../objects/Mesh';
import { SkinnedMesh } from '../objects/SkinnedMesh';
import { Fog } from '../scenes/Fog';
import { FogExp2 } from '../scenes/FogExp2';
import { HemisphereLight } from '../lights/HemisphereLight';
import { SpotLight } from '../lights/SpotLight';
import { PointLight } from '../lights/PointLight';
import { DirectionalLight } from '../lights/DirectionalLight';
import { AmbientLight } from '../lights/AmbientLight';
import { OrthographicCamera } from '../cameras/OrthographicCamera';
import { PerspectiveCamera } from '../cameras/PerspectiveCamera';
import { Scene } from '../scenes/Scene';
import { Texture } from '../textures/Texture';
import { ImageLoader } from './ImageLoader';
import { FontLoader } from './FontLoader';
import { VideoLoader } from './VideoLoader';
import { TextureLoader } from './TextureLoader';
import { AudioLoader } from './AudioLoader';
import { LoadingManager, DefaultLoadingManager } from './LoadingManager';
import { AnimationClip } from '../animation/AnimationClip';
import { MaterialLoader } from './MaterialLoader';
import { BufferGeometryLoader } from './BufferGeometryLoader';
import { JSONLoader } from './JSONLoader';
import { XHRLoader } from './XHRLoader';
import { Audio } from '../resouces/Audio';
import { Font } from '../resouces/Font';
import { Video } from '../resouces/Video';
import { Image } from '../resouces/Image';
import * as Geometries from '../extras/geometries/Geometries';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function ObjectLoader ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;
	this.texturePath = '';

}

Object.assign( ObjectLoader.prototype, {

	load: function ( url, onLoad, onProgress, onError ) {

		if ( this.texturePath === '' ) {

			this.texturePath = url.substring( 0, url.lastIndexOf( '/' ) + 1 );

		}

		var scope = this;

		var loader = new XHRLoader( scope.manager );
		loader.load( url, function ( text ) {

			scope.parse( JSON.parse( text ), onLoad );

		}, onProgress, onError );

	},

	setTexturePath: function ( value ) {

		this.texturePath = value;

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: function ( json, onLoad ) {

		var geometries = this.parseGeometries(json.geometries);
		var images = this.parseImages(json.images);
		var videos = this.parseVideos(json.videos);
		var audio = this.parseAudio(json.audio);
		var fonts = this.parseFonts(json.fonts);
		var textures = this.parseTextures(json.textures, images, videos);
		var materials = this.parseMaterials(json.materials, textures);
		var object = this.parseObject(json.object, geometries, materials, textures, audio, fonts);

		if ( json.animations ) {

			object.animations = this.parseAnimations( json.animations );

		}

		if ( json.images === undefined || json.images.length === 0 ) {

			if ( onLoad !== undefined ) onLoad( object );

		}

		return object;

	},

	parseGeometries: function ( json ) {

		var geometries = {};

		if ( json !== undefined ) {

			var geometryLoader = new JSONLoader();
			var bufferGeometryLoader = new BufferGeometryLoader();

			for ( var i = 0, l = json.length; i < l; i ++ ) {

				var geometry;
				var data = json[ i ];

				switch ( data.type ) {

					case 'PlaneGeometry':
					case 'PlaneBufferGeometry':

						geometry = new Geometries[ data.type ](
							data.width,
							data.height,
							data.widthSegments,
							data.heightSegments
						);

						break;

					case 'BoxGeometry':
					case 'BoxBufferGeometry':
					case 'CubeGeometry': // backwards compatible

						geometry = new Geometries[ data.type ](
							data.width,
							data.height,
							data.depth,
							data.widthSegments,
							data.heightSegments,
							data.depthSegments
						);

						break;

					case 'CircleGeometry':
					case 'CircleBufferGeometry':

						geometry = new Geometries[ data.type ](
							data.radius,
							data.segments,
							data.thetaStart,
							data.thetaLength
						);

						break;

					case 'CylinderGeometry':
					case 'CylinderBufferGeometry':

						geometry = new Geometries[ data.type ](
							data.radiusTop,
							data.radiusBottom,
							data.height,
							data.radialSegments,
							data.heightSegments,
							data.openEnded,
							data.thetaStart,
							data.thetaLength
						);

						break;

					case 'ConeGeometry':
					case 'ConeBufferGeometry':

						geometry = new Geometries[ data.type ](
							data.radius,
							data.height,
							data.radialSegments,
							data.heightSegments,
							data.openEnded,
							data.thetaStart,
							data.thetaLength
						);

						break;

					case 'SphereGeometry':
					case 'SphereBufferGeometry':

						geometry = new Geometries[ data.type ](
							data.radius,
							data.widthSegments,
							data.heightSegments,
							data.phiStart,
							data.phiLength,
							data.thetaStart,
							data.thetaLength
						);

						break;

					case 'DodecahedronGeometry':
					case 'IcosahedronGeometry':
					case 'OctahedronGeometry':
					case 'TetrahedronGeometry':

						geometry = new Geometries[ data.type ](
							data.radius,
							data.detail
						);

						break;

					case 'RingGeometry':
					case 'RingBufferGeometry':

						geometry = new Geometries[ data.type ](
							data.innerRadius,
							data.outerRadius,
							data.thetaSegments,
							data.phiSegments,
							data.thetaStart,
							data.thetaLength
						);

						break;

					case 'TorusGeometry':
					case 'TorusBufferGeometry':

						geometry = new Geometries[ data.type ](
							data.radius,
							data.tube,
							data.radialSegments,
							data.tubularSegments,
							data.arc
						);

						break;

					case 'TorusKnotGeometry':
					case 'TorusKnotBufferGeometry':

						geometry = new Geometries[ data.type ](
							data.radius,
							data.tube,
							data.tubularSegments,
							data.radialSegments,
							data.p,
							data.q
						);

						break;

					case 'LatheGeometry':
					case 'LatheBufferGeometry':

						geometry = new Geometries[ data.type ](
							data.points,
							data.segments,
							data.phiStart,
							data.phiLength
						);

						break;

					case 'BufferGeometry':

						geometry = bufferGeometryLoader.parse( data );

						break;

					case 'Geometry':

						geometry = geometryLoader.parse( data.data, this.texturePath ).geometry;

						break;

					default:

						console.warn( 'THREE.ObjectLoader: Unsupported geometry type "' + data.type + '"' );

						continue;

				}

				geometry.uuid = data.uuid;

				if ( data.name !== undefined ) geometry.name = data.name;

				geometries[ data.uuid ] = geometry;

			}

		}

		return geometries;

	},

	parseMaterials: function ( json, textures ) {

		var materials = {};

		if ( json !== undefined ) {

			var loader = new MaterialLoader();
			loader.setTextures( textures );

			for ( var i = 0, l = json.length; i < l; i ++ ) {

				var material = loader.parse( json[ i ] );
				materials[ material.uuid ] = material;

			}

		}

		return materials;

	},

	parseAnimations: function ( json ) {

		var animations = [];

		for ( var i = 0; i < json.length; i ++ ) {

			var clip = AnimationClip.parse( json[ i ] );

			animations.push( clip );

		}

		return animations;

	},

	parseImages: function(json)
	{
		var loader = new ImageLoader();
		var images = [];

		if(json !== undefined)
		{
			for(var i = 0, l = json.length; i < l; i++)
			{
				images[json[i].uuid] = loader.parse(json[i]);
			}
		}

		return images;
	},

	parseVideos: function(json)
	{
		var loader = new VideoLoader();
		var videos = [];

		if(json !== undefined)
		{
			for(var i = 0, l = json.length; i < l; i++)
			{
				videos[json[i].uuid] = loader.parse(json[i]);
			}
		}

		return videos;
	},

	parseAudio: function(json)
	{
		var loader = new AudioLoader();
		var audio = [];

		if(json !== undefined)
		{
			for(var i = 0, l = json.length; i < l; i++)
			{
				audio[json[i].uuid] = loader.parse(json[i]);
			}
		}

		return audio;
	},

	parseFonts: function(json)
	{
		var loader = new FontLoader();
		var fonts = [];

		if(json !== undefined)
		{
			for(var i = 0, l = json.length; i < l; i++)
			{
				fonts[json[i].uuid] = loader.parse(json[i]);
			}
		}

		return fonts;
	},

	parseTextures: function(json, images, videos)
	{
		var loader = new TextureLoader();
		loader.setImages(images);
		loader.setVideos(videos);

		var textures = [];

		if(json !== undefined)
		{
			for(var i = 0, l = json.length; i < l; i++)
			{
				var texture = loader.parse(json[i]);
				textures[texture.uuid] = texture;
			}
		}
		
		return textures;
	},

	parseObject: function () {

		var matrix = new Matrix4();

		return function parseObject( data, geometries, materials, textures, audio, fonts ) {

			var object;

		function getTexture(uuid)
		{
			if(textures[uuid] === undefined)
			{
				console.warn("ObjectLoader: Undefined texture", uuid);
			}
			return textures[uuid];
		}

		function getGeometry(uuid)
		{
			if(geometries[uuid] === undefined)
			{
				console.warn("ObjectLoader: Undefined geometry", uuid);
			}
			return geometries[uuid];
		}

		function getMaterial(uuid)
		{
			if(materials[uuid] === undefined)
			{
				console.warn("ObjectLoader: Undefined material", uuid);
			}
			return materials[uuid];
		}

		function getFont(uuid)
		{
			if(fonts[uuid] === undefined)
			{
				console.warn("ObjectLoader: Undefined font", uuid);
			}
			return fonts[uuid];
		}

		function getAudio(uuid)
		{
			if(audio[uuid] === undefined)
			{
				console.warn("ObjectLoader: Undefined audio", uuid);
			}
			return audio[uuid];
		}

			switch ( data.type ) {

				case 'Scene':

					object = new Scene();

					if ( data.background !== undefined ) {

						if ( Number.isInteger( data.background ) ) {

							object.background = new Color( data.background );

						}

					}

					if ( data.fog !== undefined ) {

						if ( data.fog.type === 'Fog' ) {

							object.fog = new Fog( data.fog.color, data.fog.near, data.fog.far );

						} else if ( data.fog.type === 'FogExp2' ) {

							object.fog = new FogExp2( data.fog.color, data.fog.density );

						}

					}

					break;

				case 'PerspectiveCamera':

					object = new PerspectiveCamera( data.fov, data.aspect, data.near, data.far );

					if ( data.focus !== undefined ) object.focus = data.focus;
					if ( data.zoom !== undefined ) object.zoom = data.zoom;
					if ( data.filmGauge !== undefined ) object.filmGauge = data.filmGauge;
					if ( data.filmOffset !== undefined ) object.filmOffset = data.filmOffset;
					if ( data.view !== undefined ) object.view = Object.assign( {}, data.view );

					break;

				case 'OrthographicCamera':

					object = new OrthographicCamera( data.left, data.right, data.top, data.bottom, data.near, data.far );

					break;

				case 'AmbientLight':

					object = new AmbientLight( data.color, data.intensity );

					break;

				case 'DirectionalLight':

					object = new DirectionalLight( data.color, data.intensity );

					break;

				case 'PointLight':

					object = new PointLight( data.color, data.intensity, data.distance, data.decay );

					break;

				case 'SpotLight':

					object = new SpotLight( data.color, data.intensity, data.distance, data.angle, data.penumbra, data.decay );

					break;

				case 'HemisphereLight':

					object = new HemisphereLight( data.color, data.groundColor, data.intensity );

					break;

				case 'Mesh':

					var geometry = getGeometry( data.geometry );
					var material = getMaterial( data.material );

					if ( geometry.bones && geometry.bones.length > 0 ) {

						object = new SkinnedMesh( geometry, material );

					} else {

						object = new Mesh( geometry, material );

					}

					break;

				case 'LOD':

					object = new LOD();

					break;

				case 'Line':

					object = new Line( getGeometry( data.geometry ), getMaterial( data.material ), data.mode );

					break;

				case 'LineSegments':

					object = new LineSegments( getGeometry( data.geometry ), getMaterial( data.material ) );

					break;

				case 'PointCloud':
				case 'Points':

					object = new Points( getGeometry( data.geometry ), getMaterial( data.material ) );

					break;

				case 'Sprite':

					object = new Sprite( getMaterial( data.material ) );

					break;

				case 'Group':

					object = new Group();

					break;

				default:

					object = new Object3D();

			}

			object.uuid = data.uuid;

			if ( data.name !== undefined ) object.name = data.name;
			if ( data.matrix !== undefined ) {

				matrix.fromArray( data.matrix );
				matrix.decompose( object.position, object.quaternion, object.scale );

			} else {

				if ( data.position !== undefined ) object.position.fromArray( data.position );
				if ( data.rotation !== undefined ) object.rotation.fromArray( data.rotation );
				if ( data.quaternion !== undefined ) object.quaternion.fromArray( data.quaternion );
				if ( data.scale !== undefined ) object.scale.fromArray( data.scale );

			}

			if ( data.castShadow !== undefined ) object.castShadow = data.castShadow;
			if ( data.receiveShadow !== undefined ) object.receiveShadow = data.receiveShadow;

			if ( data.shadow ) {

				if ( data.shadow.bias !== undefined ) object.shadow.bias = data.shadow.bias;
				if ( data.shadow.radius !== undefined ) object.shadow.radius = data.shadow.radius;
				if ( data.shadow.mapSize !== undefined ) object.shadow.mapSize.fromArray( data.shadow.mapSize );
				if ( data.shadow.camera !== undefined ) object.shadow.camera = this.parseObject( data.shadow.camera );

			}

			if ( data.visible !== undefined ) object.visible = data.visible;
			if ( data.userData !== undefined ) object.userData = data.userData;

			if ( data.children !== undefined ) {

				for ( var child in data.children ) {

					object.add( this.parseObject( data.children[ child ], geometries, materials , textures, audio, fonts ) );

				}

			}

			if ( data.type === 'LOD' ) {

				var levels = data.levels;

				for ( var l = 0; l < levels.length; l ++ ) {

					var level = levels[ l ];
					var child = object.getObjectByProperty( 'uuid', level.object );

					if ( child !== undefined ) {

						object.addLevel( child, level.distance );

					}

				}

			}

			return object;

		};

	}()

} );


export { ObjectLoader };
