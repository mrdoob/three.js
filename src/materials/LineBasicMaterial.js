/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *
 *  blending: Constants.NormalBlending,
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *  linewidth: <float>,
 *  linecap: "round",
 *  linejoin: "round",
 *
 *  vertexColors: <bool>
 *
 *  fog: <bool>
 * }
 */

module.exports = LineBasicMaterial;

var Constants = require( "../Constants" ),
	Material = require( "../materials/Material" ),
	Color = require( "../math/Color" );

function LineBasicMaterial( parameters ) {

	Material.call( this );

	this.type = "LineBasicMaterial";

	this.color = new Color( 0xffffff );

	this.linewidth = 1;
	this.linecap = "round";
	this.linejoin = "round";

	this.vertexColors = Constants.NoColors;

	this.fog = true;

	this.setValues( parameters );

}

LineBasicMaterial.prototype = Object.create( Material.prototype );
LineBasicMaterial.prototype.constructor = LineBasicMaterial;

LineBasicMaterial.prototype.copy = function ( source ) {

	Material.prototype.copy.call( this, source );

	this.color.copy( source.color );

	this.linewidth = source.linewidth;
	this.linecap = source.linecap;
	this.linejoin = source.linejoin;

	this.vertexColors = source.vertexColors;

	this.fog = source.fog;

	return this;

};
