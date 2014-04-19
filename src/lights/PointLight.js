/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PointLight = function ( color, intensity, distance ) {

	THREE.Light.call( this, color );

	this.intensity = ( intensity !== undefined ) ? intensity : 1;
	this.distance = ( distance !== undefined ) ? distance : 0;

};

THREE.PointLight.prototype = Object.create( THREE.Light.prototype );

THREE.PointLight.prototype.clone = function () {

	var light = new THREE.PointLight();

	THREE.Light.prototype.clone.call( this, light );

	light.intensity = this.intensity;
	light.distance = this.distance;

	return light;

};

THREE.PointLight.prototype.toJSON = function( exporters ) {

	var data = THREE.Object3D.prototype.toJSON.call( this, exporters )

	data.type = 'PointLight';
	data.color = this.color.getHex();
	data.intensity = this.intensity;
	data.distance = this.distance;

	return data;

};

THREE.PointLight.fromJSON = function( data, geometries, materials ) {

	var object = new THREE.PointLight( data.color, data.intensity, data.distance );
	THREE.Object3D.fromJSONCommon.call( object, data, geometries, materials );
	return object;

};