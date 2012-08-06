/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
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

THREE.LineBasicMaterial = function ( parameters ) {

	THREE.Material.call( this );

	this.color = new THREE.Color( 0xffffff );

	this.linewidth = 1;
	this.linecap = 'round';
	this.linejoin = 'round';

	this.vertexColors = false;

	this.fog = true;

	this.setParameters( parameters );

};

THREE.LineBasicMaterial.prototype = Object.create( THREE.Material.prototype );

THREE.LineBasicMaterial.prototype.clone = function () {

	return new THREE.LineBasicMaterial( this );

};
