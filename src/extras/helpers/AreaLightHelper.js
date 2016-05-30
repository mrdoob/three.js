/**
 * @author abelnation / http://github.com/abelnation
*/

THREE.AreaLightHelper = function ( light ) {

	THREE.Object3D.call( this );

	this.light = light;
	this.light.updateMatrixWorld();

	this.matrix = light.matrixWorld;
	this.matrixAutoUpdate = false;

	this.lightMat = new THREE.MeshBasicMaterial( {
		color: light.color,
		fog: false
	} );
	this.lightWireMat = new THREE.MeshBasicMaterial( {
		color: light.color,
		fog: false,
		wireframe: true
	} );

	console.log(light.polygon.points);

	this.lightShape = new THREE.ShapeGeometry( new THREE.Shape( light.polygon.points ) );
	this.lightMesh = new THREE.Mesh( this.lightShape, this.lightMat );
	this.lightWireMesh = new THREE.Mesh( this.lightShape, this.lightWireMat );

	this.add( this.lightMesh );
	this.add( this.lightWireMesh );

	this.update();

};

THREE.AreaLightHelper.prototype = Object.create( THREE.Object3D.prototype );
THREE.AreaLightHelper.prototype.constructor = THREE.AreaLightHelper;

THREE.AreaLightHelper.prototype.dispose = function () {

	this.lightMesh.geometry.dispose();
	this.lightMesh.material.dispose();
	this.lightWireMesh.geometry.dispose();
	this.lightWireMesh.material.dispose();

};

THREE.AreaLightHelper.prototype.update = function () {

	var vector = new THREE.Vector3();
	var vector2 = new THREE.Vector3();

	return function () {

		vector.setFromMatrixPosition( this.light.matrixWorld );
		vector2.setFromMatrixPosition( this.light.target.matrixWorld );

		var lookVec = vector2.clone().sub( vector );
		this.lightMesh.lookAt( lookVec );
		this.lightWireMesh.lookAt( lookVec );

		this.lightMesh.material.color
			.copy( this.light.color )
			.multiplyScalar( this.light.intensity );

		this.lightWireMesh.material.color
			.copy( this.light.color )
			.multiplyScalar( this.light.intensity );


	};

}();
