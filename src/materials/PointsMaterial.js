/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture( <Image> ),
 *
 *  size: <float>,
 *  sizeAttenuation: <bool>,
 *
 *  blending: THREE.PremultipliedAlphaBlending,
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *  vertexColors: <bool>,
 *
 *  fog: <bool>
 * }
 */

THREE.PointsMaterial = function ( parameters ) {

	THREE.Material.call( this );

	this.type = 'PointsMaterial';

	this.color = new THREE.Color( 0xffffff );

	this.map = null;

	this.size = 1;
	this.sizeAttenuation = true;

	this.blending = THREE.PremultipliedAlphaBlending;

	this.vertexColors = THREE.NoColors;

	this.fog = true;

	this.setValues( parameters );

};

THREE.PointsMaterial.prototype = Object.create( THREE.Material.prototype );
THREE.PointsMaterial.prototype.constructor = THREE.PointsMaterial;

THREE.PointsMaterial.prototype.copy = function ( source ) {

	THREE.Material.prototype.copy.call( this, source );

	this.color.copy( source.color );

	this.map = source.map;

	this.size = source.size;
	this.sizeAttenuation = source.sizeAttenuation;

	this.vertexColors = source.vertexColors;

	this.fog = source.fog;

	return this;

};
