/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new Texture( <Image> ),
 *
 *  size: <float>,
 *  sizeAttenuation: <bool>,
 *
 *  blending: Constants.NormalBlending,
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *  vertexColors: <bool>,
 *
 *  fog: <bool>
 * }
 */

module.exports = PointCloudMaterial;

var Constants = require( "../Constants" ),
	Color = require( "../math/Color" ),
	Material = require( "../materials/Material" );

function PointCloudMaterial( parameters ) {

	Material.call( this );

	this.type = "PointCloudMaterial";

	this.color = new Color( 0xffffff );

	this.map = null;

	this.size = 1;
	this.sizeAttenuation = true;

	this.vertexColors = Constants.NoColors;

	this.fog = true;

	this.setValues( parameters );

}

PointCloudMaterial.prototype = Object.create( Material.prototype );
PointCloudMaterial.prototype.constructor = PointCloudMaterial;

PointCloudMaterial.prototype.copy = function ( source ) {

	Material.prototype.copy.call( this, source );

	this.color.copy( source.color );

	this.map = source.map;

	this.size = source.size;
	this.sizeAttenuation = source.sizeAttenuation;

	this.vertexColors = source.vertexColors;

	this.fog = source.fog;
	
	return this;

};

// Backwards Compatibility

PointCloudMaterial.ParticleBasicMaterial = function ( parameters ) {

	console.warn( "ParticleBasicMaterial has been renamed to PointCloudMaterial." );
	return new PointCloudMaterial( parameters );

};

PointCloudMaterial.ParticleSystemMaterial = function ( parameters ) {

	console.warn( "ParticleSystemMaterial has been renamed to PointCloudMaterial." );
	return new PointCloudMaterial( parameters );

};
