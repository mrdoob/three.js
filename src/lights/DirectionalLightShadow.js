/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.DirectionalLightShadow = function ( light ) {
	var frustrumWidth = 300;
	var spreadAngle = 3.14/4;
	this.cameraParams = new THREE.Vector4( 2*frustrumWidth, 0.5, 1000 );
	THREE.LightShadow.call( this, new THREE.OrthographicCamera( - frustrumWidth, frustrumWidth, frustrumWidth, - frustrumWidth, this.cameraParams.y, this.cameraParams.z ) );
};

THREE.DirectionalLightShadow.prototype = Object.create( THREE.LightShadow.prototype );
THREE.DirectionalLightShadow.prototype.constructor = THREE.DirectionalLightShadow;

THREE.DirectionalLightShadow.prototype.update = function ( light ) {

	var camera = this.camera;
	var frustrumWidth = Math.abs(camera.left - camera.right);
	if ( this.cameraParams.x !== frustrumWidth || this.cameraParams.y !== camera.near || this.cameraParams.z !== camera.far ) {

		this.cameraParams.x = frustrumWidth;
		this.cameraParams.y = camera.near;
		this.cameraParams.z = camera.far;
	}

};
