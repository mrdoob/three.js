/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new Texture( <Image> ),
 *
 *  aoMap: new Texture( <Image> ),
 *  aoMapIntensity: <float>
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
 *
 *  fog: <bool>
 * }
 */

module.exports = MeshBasicMaterial;

var Constants = require( "../Constants" ),
	Material = require( "../materials/Material" ),
	Color = require( "../math/Color" );

function MeshBasicMaterial( parameters ) {

	Material.call( this );

	this.type = "MeshBasicMaterial";

	this.color = new Color( 0xffffff ); // emissive

	this.map = null;

	this.aoMap = null;
	this.aoMapIntensity = 1.0;

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

	this.setValues( parameters );

}

MeshBasicMaterial.prototype = Object.create( Material.prototype );
MeshBasicMaterial.prototype.constructor = MeshBasicMaterial;

MeshBasicMaterial.prototype.copy = function ( source ) {
	
	Material.prototype.copy.call( this, source );

	this.color.copy( source.color );

	this.map = source.map;

	this.aoMap = source.aoMap;
	this.aoMapIntensity = source.aoMapIntensity;

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
	
	return this;

};
