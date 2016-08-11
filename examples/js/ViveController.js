THREE.ViveController = function ( id ) {

	THREE.Object3D.call( this );

	this.matrixAutoUpdate = false;
	this.standingMatrix = new THREE.Matrix4();
	
	this.ray = new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1),
		new THREE.Vector3(0, 0, 0), 100, 0x000000, 1, 1);
	this.add(this.ray);		

	var scope = this;

	function update() {

		requestAnimationFrame( update );

		var gamepad = navigator.getGamepads()[ id ];

		if ( gamepad !== undefined && gamepad.pose !== null ) {

			var pose = gamepad.pose;

			scope.position.fromArray( pose.position );
			scope.quaternion.fromArray( pose.orientation );
			scope.matrix.compose( scope.position, scope.quaternion, scope.scale );
			scope.matrix.multiplyMatrices( scope.standingMatrix, scope.matrix );
			scope.matrixWorldNeedsUpdate = true;

			scope.visible = true;

		} else {

			scope.visible = false;

		}

	}

	update();

};

THREE.ViveController.prototype = Object.create( THREE.Object3D.prototype );
THREE.ViveController.prototype.constructor = THREE.ViveController;
