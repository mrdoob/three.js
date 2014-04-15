/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.HemisphereLight = function ( skyColor, groundColor, intensity ) {

	THREE.Light.call( this, skyColor );

	this.position.set( 0, 100, 0 );

	this.groundColor = new THREE.Color( groundColor );
	this.intensity = ( intensity !== undefined ) ? intensity : 1;

};

THREE.HemisphereLight.prototype = Object.create( THREE.Light.prototype );

THREE.HemisphereLight.prototype.clone = function () {

	var light = new THREE.HemisphereLight();

	THREE.Light.prototype.clone.call( this, light );

	light.groundColor.copy( this.groundColor );
	light.intensity = this.intensity;

	return light;

};

THREE.HemisphereLight.prototype.toJSON = function( exporters ) {

  var data = THREE.Object3D.prototype.toJSON.call( this, exporters );
  
  data.type = 'HemisphereLight';
  data.color = this.color.getHex();
  data.groundColor = this.groundColor.getHex();

  return data;

};

THREE.HemisphereLight.fromJSON = function( data, geometries, materials ) {
  
  var object = new THREE.HemisphereLight( data.color, data.groundColor, data.intensity );
  THREE.Object3D.fromJSONCommon.call( object, data, geometries, materials );
  return object;

};