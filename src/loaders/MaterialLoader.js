/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = MaterialLoader;

var DefaultLoadingManager = require( "./LoadingManager" ).DefaultLoadingManager,
	XHRLoader = require( "./XHRLoader" ),
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
	SpriteMaterial = require( "../materials/SpriteMaterial" );

function MaterialLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

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
		if ( json.wireframe !== undefined ) { material.wireframe = json.wireframe; }
		if ( json.wireframeLinewidth !== undefined ) { material.wireframeLinewidth = json.wireframeLinewidth; }

		// for PointCloudMaterial
		if ( json.size !== undefined ) { material.size = json.size; }
		if ( json.sizeAttenuation !== undefined ) { material.sizeAttenuation = json.sizeAttenuation; }

		if ( json.materials !== undefined ) {

			for ( var i = 0, l = json.materials.length; i < l; i ++ ) {

				material.materials.push( this.parse( json.materials[ i ] ) );

			}

		}

		return material;

	}

};
