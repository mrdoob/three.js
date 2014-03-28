/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.AmbientLight = function ( color ) {

	THREE.Light.call( this, color );

};

THREE.AmbientLight.prototype = Object.create( THREE.Light.prototype );

THREE.AmbientLight.prototype.clone = function () {

	var light = new THREE.AmbientLight();

	THREE.Light.prototype.clone.call( this, light );

	return light;

};

THREE.AmbientLight.prototype.serialize = function( exporters ) {

  var data = THREE.Object3D.prototype.serialize.call( this, exporters );
  
  data.type = 'AmbientLight';
  data.color = this.color.getHex();

  return data;

};

THREE.AmbientLight.deserialize = function( data, geometries, materials ) {
  
  var object = new THREE.AmbientLight( data.color );
  THREE.Object3D.deserializeCommon.call( object, data, geometries, materials );
  return object;

};