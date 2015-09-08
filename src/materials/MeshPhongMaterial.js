/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  emissive: <hex>,
 *  specular: <hex>,
 *  shininess: <float>,
 *  opacity: <float>,
 *
 *  map: new Texture( <Image> ),
 *
 *  lightMap: new Texture( <Image> ),
 *  lightMapIntensity: <float>
 *
 *  aoMap: new Texture( <Image> ),
 *  aoMapIntensity: <float>
 *
 *  emissiveMap: new Texture( <Image> ),
 *
 *  bumpMap: new Texture( <Image> ),
 *  bumpScale: <float>,
 *
 *  normalMap: new Texture( <Image> ),
 *  normalScale: <Vector2>,
 *
 *  displacementMap: new Texture( <Image> ),
 *  displacementScale: <float>,
 *
 *  specularMap: new Texture( <Image> ),
 *
 *  alphaMap: new Texture( <Image> ),
 *
 *  envMap: new TextureCube( [posx, negx, posy, negy, posz, negz] ),
 *  combine: Constants.MultiplyOperation,
 *  reflectivity: <float>,
 *  refractionRatio: <float>,
 *
 *  shading: Constants.SmoothShading,
 *  blending: Constants.NormalBlending,
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 *
 *  vertexColors: Constants.NoColors / Constants.VertexColors / Constants.FaceColors,
 *
 *  skinning: <bool>,
 *  morphTargets: <bool>,
 *  morphNormals: <bool>,
 *
 *	fog: <bool>
 * }
 */

module.exports = MeshPhongMaterial;

var Constants = require( "../Constants" ),
	Color = require( "../math/Color" ),
	Material = require( "../materials/Material" ),
	Vector2 = require( "../math/Vector2" );

function MeshPhongMaterial( parameters ) {

	Material.call( this );

	this.type = "MeshPhongMaterial";

	this.color = new Color( 0xffffff ); // diffuse
	this.emissive = new Color( 0x000000 );
	this.specular = new Color( 0x111111 );
	this.shininess = 30;

	this.metal = false;

	this.map = null;

	this.lightMap = null;
	this.lightMapIntensity = 1.0;

	this.aoMap = null;
	this.aoMapIntensity = 1.0;

	this.emissiveMap = null;

	this.bumpMap = null;
	this.bumpScale = 1;

	this.normalMap = null;
	this.normalScale = new Vector2( 1, 1 );

	this.displacementMap = null;
	this.displacementScale = 1;
	this.displacementBias = 0;

	this.specularMap = null;

	this.alphaMap = null;

	this.envMap = null;
	this.combine = Constants.MultiplyOperation;
	this.reflectivity = 1;
	this.refractionRatio = 0.98;

	this.fog = true;

	this.shading = Constants.SmoothShading;

	this.wireframe = false;
	this.wireframeLinewidth = 1;
	this.wireframeLinecap = "round";
	this.wireframeLinejoin = "round";

	this.vertexColors = Constants.NoColors;

	this.skinning = false;
	this.morphTargets = false;
	this.morphNormals = false;

	this.setValues( parameters );

}

MeshPhongMaterial.prototype = Object.create( Material.prototype );
MeshPhongMaterial.prototype.constructor = MeshPhongMaterial;

MeshPhongMaterial.prototype.copy = function ( source ) {

	Material.prototype.copy.call( this, source );

	this.color.copy( source.color );
	this.emissive.copy( source.emissive );
	this.specular.copy( source.specular );
	this.shininess = source.shininess;

	this.metal = source.metal;

	this.map = source.map;

	this.lightMap = source.lightMap;
	this.lightMapIntensity = source.lightMapIntensity;

	this.aoMap = source.aoMap;
	this.aoMapIntensity = source.aoMapIntensity;

	this.emissiveMap = source.emissiveMap;

	this.bumpMap = source.bumpMap;
	this.bumpScale = source.bumpScale;

	this.normalMap = source.normalMap;
	this.normalScale.copy( source.normalScale );

	this.displacementMap = source.displacementMap;
	this.displacementScale = source.displacementScale;
	this.displacementBias = source.displacementBias;

	this.specularMap = source.specularMap;

	this.alphaMap = source.alphaMap;

	this.envMap = source.envMap;
	this.combine = source.combine;
	this.reflectivity = source.reflectivity;
	this.refractionRatio = source.refractionRatio;

	this.fog = source.fog;

	this.shading = source.shading;

	this.wireframe = source.wireframe;
	this.wireframeLinewidth = source.wireframeLinewidth;
	this.wireframeLinecap = source.wireframeLinecap;
	this.wireframeLinejoin = source.wireframeLinejoin;

	this.vertexColors = source.vertexColors;

	this.skinning = source.skinning;
	this.morphTargets = source.morphTargets;
	this.morphNormals = source.morphNormals;

	return this;

};
