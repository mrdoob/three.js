/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = MaterialLoader;

var DefaultLoadingManager = require( "./LoadingManager" ).DefaultLoadingManager,
	XHRLoader = require( "./XHRLoader" ),
	Constants = require( "../Constants" ),
	LineBasicMaterial = require( "../materials/LineBasicMaterial" ),
	LineDashedMaterial = require( "../materials/LineDashedMaterial" ),
	Material = require( "../materials/Material" ),
	MeshBasicMaterial = require( "../materials/MeshBasicMaterial" ),
	MeshDepthMaterial = require( "../materials/MeshDepthMaterial" ),
	MeshLambertMaterial = require( "../materials/MeshLambertMaterial" ),
	MeshNormalMaterial = require( "../materials/MeshNormalMaterial" ),
	MeshPhongMaterial = require( "../materials/MeshPhongMaterial" ),
	MultiMaterial = require( "../materials/MultiMaterial" ),
	PointCloudMaterial = require( "../materials/PointCloudMaterial" ),
	RawShaderMaterial = require( "../materials/RawShaderMaterial" ),
	ShaderMaterial = require( "../materials/ShaderMaterial" ),
	SpriteMaterial = require( "../materials/SpriteMaterial" ),
	Vector2 = require( "../math/Vector2" );

function MaterialLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;
	this.textures = {};

}

MaterialLoader.prototype = {

	constructor: MaterialLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new XHRLoader( scope.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( JSON.parse( text ) ) );

		}, onProgress, onError );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	setTextures: function ( value ) {

		this.textures = value;

	},

	getTexture: function ( name ) {

		var textures = this.textures;

		if ( textures[ name ] === undefined ) {

			console.warn( "MaterialLoader: Undefined texture", name );

		}

		return textures[ name ];

	},

	parse: function ( json ) {

		var material;

		switch ( json.type ) {

			case "LineBasicMaterial":

				material = new LineBasicMaterial();
				break;

			case "LineDashedMaterial":

				material = new LineDashedMaterial();
				break;

			case "Material":

				material = new Material();
				break;

			case "MeshBasicMaterial":

				material = new MeshBasicMaterial();
				break;

			case "MeshDepthMaterial":

				material = new MeshDepthMaterial();
				break;

			case "MeshLambertMaterial":

				material = new MeshLambertMaterial();
				break;

			case "MeshNormalMaterial":

				material = new MeshNormalMaterial();
				break;

			case "MeshPhongMaterial":

				material = new MeshPhongMaterial();
				break;

			case "MultiMaterial":

				material = new MultiMaterial();
				break;

			case "PointCloudMaterial":

				material = new PointCloudMaterial();
				break;

			case "RawShaderMaterial":

				material = new RawShaderMaterial();
				break;

			case "ShaderMaterial":

				material = new ShaderMaterial();
				break;

			case "SpriteMaterial":

				material = new SpriteMaterial();
				break;

		}

		material.uuid = json.uuid;

		if ( json.name !== undefined ) { material.name = json.name; }
		if ( json.color !== undefined ) { material.color.setHex( json.color ); }
		if ( json.emissive !== undefined ) { material.emissive.setHex( json.emissive ); }
		if ( json.specular !== undefined ) { material.specular.setHex( json.specular ); }
		if ( json.shininess !== undefined ) { material.shininess = json.shininess; }
		if ( json.uniforms !== undefined ) { material.uniforms = json.uniforms; }
		if ( json.vertexShader !== undefined ) { material.vertexShader = json.vertexShader; }
		if ( json.fragmentShader !== undefined ) { material.fragmentShader = json.fragmentShader; }
		if ( json.vertexColors !== undefined ) { material.vertexColors = json.vertexColors; }
		if ( json.shading !== undefined ) { material.shading = json.shading; }
		if ( json.blending !== undefined ) { material.blending = json.blending; }
		if ( json.side !== undefined ) { material.side = json.side; }
		if ( json.opacity !== undefined ) { material.opacity = json.opacity; }
		if ( json.transparent !== undefined ) { material.transparent = json.transparent; }
		if ( json.alphaTest !== undefined ) { material.alphaTest = json.alphaTest; }
		if ( json.depthTest !== undefined ) { material.depthTest = json.depthTest; }
		if ( json.depthWrite !== undefined ) { material.depthWrite = json.depthWrite; }
		if ( json.wireframe !== undefined ) { material.wireframe = json.wireframe; }
		if ( json.wireframeLinewidth !== undefined ) { material.wireframeLinewidth = json.wireframeLinewidth; }

		// for PointCloudMaterial
		if ( json.size !== undefined ) { material.size = json.size; }
		if ( json.sizeAttenuation !== undefined ) { material.sizeAttenuation = json.sizeAttenuation; }

		// maps

		if ( json.map !== undefined ) { material.map = this.getTexture( json.map ); }

		if ( json.alphaMap !== undefined ) {

			material.alphaMap = this.getTexture( json.alphaMap );
			material.transparent = true;

		}

		if ( json.bumpMap !== undefined ) { material.bumpMap = this.getTexture( json.bumpMap ); }
		if ( json.bumpScale !== undefined ) { material.bumpScale = json.bumpScale; }

		if ( json.normalMap !== undefined ) { material.normalMap = this.getTexture( json.normalMap ); }
		if ( json.normalScale ) {	material.normalScale = new Vector2( json.normalScale, json.normalScale ); }

		if ( json.displacementMap !== undefined ) { material.displacementMap = this.getTexture( json.displacementMap ); }
		if ( json.displacementScale !== undefined ) { material.displacementScale = json.displacementScale; }
		if ( json.displacementBias !== undefined ) { material.displacementBias = json.displacementBias; }

		if ( json.specularMap !== undefined ) { material.specularMap = this.getTexture( json.specularMap ); }

		if ( json.envMap !== undefined ) {

			material.envMap = this.getTexture( json.envMap );
			material.combine = Constants.MultiplyOperation;

		}

		if ( json.reflectivity ) { material.reflectivity = json.reflectivity; }

		if ( json.lightMap !== undefined ) { material.lightMap = this.getTexture( json.lightMap ); }
		if ( json.lightMapIntensity !== undefined ) { material.lightMapIntensity = json.lightMapIntensity; }

		if ( json.aoMap !== undefined ) { material.aoMap = this.getTexture( json.aoMap ); }
		if ( json.aoMapIntensity !== undefined ) { material.aoMapIntensity = json.aoMapIntensity; }

		// MeshFaceMaterial

		if ( json.materials !== undefined ) {

			for ( var i = 0, l = json.materials.length; i < l; i ++ ) {

				material.materials.push( this.parse( json.materials[ i ] ) );

			}

		}

		return material;

	}

};
