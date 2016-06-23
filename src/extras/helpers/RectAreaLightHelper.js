/**
 * @author abelnation / http://github.com/abelnation
*/

THREE.RectAreaLightHelper = function ( light ) {

	THREE.Object3D.call( this );

	this.light = light;
	this.light.updateMatrixWorld();

	// this.matrix = light.matrixWorld;
	// this.matrixAutoUpdate = false;

	this.lightMat = new THREE.MeshBasicMaterial( {
		color: light.color,
		fog: false
	} );

	this.lightWireMat = new THREE.MeshBasicMaterial( {
		color: light.color,
		fog: false,
		wireframe: true
	} );

	var hx = this.light.width / 2.0;
	var hy = this.light.height / 2.0;
	this.lightShape = new THREE.ShapeGeometry( new THREE.Shape( [
		new THREE.Vector3( - hx,   hy, 0 ),
		new THREE.Vector3(   hx,   hy, 0 ),
		new THREE.Vector3(   hx, - hy, 0 ),
		new THREE.Vector3( - hx, - hy, 0 )
	] ) );

	// shows the "front" of the light, e.g. where light comes from
	this.lightMesh = new THREE.Mesh( this.lightShape, this.lightMat );
	// shows the "back" of the light, which does not emit light
	this.lightWireMesh = new THREE.Mesh( this.lightShape, this.lightWireMat );

	this.add( this.lightMesh );
	this.add( this.lightWireMesh );

	this.update();

};

THREE.RectAreaLightHelper.prototype = Object.create( THREE.Object3D.prototype );
THREE.RectAreaLightHelper.prototype.constructor = THREE.RectAreaLightHelper;

THREE.RectAreaLightHelper.prototype.dispose = function () {

	this.lightMesh.geometry.dispose();
	this.lightMesh.material.dispose();
	this.lightWireMesh.geometry.dispose();
	this.lightWireMesh.material.dispose();

};

THREE.RectAreaLightHelper.prototype.update = function () {

	var vector = new THREE.Vector3();
	var vector2 = new THREE.Vector3();

	return function () {

		// TODO (abelnation) why not just make light helpers a child of the light object?
		if ( this.light.target ) {

			vector.setFromMatrixPosition( this.light.matrixWorld );
			vector2.setFromMatrixPosition( this.light.target.matrixWorld );

			var lookVec = vector2.clone().sub( vector );
			this.lightMesh.lookAt( lookVec );
			this.lightWireMesh.lookAt( lookVec );

		}

		this.lightMesh.material.color
			.copy( this.light.color )
			.multiplyScalar( this.light.intensity );

		this.lightWireMesh.material.color
			.copy( this.light.color )
			.multiplyScalar( this.light.intensity );

		var oldShape = this.lightShape;

		var hx = this.light.width / 2.0;
		var hy = this.light.height / 2.0;
		this.lightShape = new THREE.ShapeGeometry( new THREE.Shape( [
			new THREE.Vector3( - hx,   hy, 0 ),
			new THREE.Vector3(   hx,   hy, 0 ),
			new THREE.Vector3(   hx, - hy, 0 ),
			new THREE.Vector3( - hx, - hy, 0 )
		] ) );

		this.lightMesh.geometry = this.lightShape;
		this.lightWireMesh.geometry = this.lightShape;

		oldShape.dispose();
	};

}();
