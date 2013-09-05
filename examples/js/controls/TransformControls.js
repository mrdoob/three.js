/**
 * @author arodic / https://github.com/arodic
 */

 "use strict";

THREE.TransformGizmoMaterial = function ( parameters ) {

	THREE.MeshBasicMaterial.call( this );

	this.depthTest = false;
	this.depthWrite = false;
	this.side = THREE.DoubleSide;
	this.transparent = true;

	this.setValues( parameters );

}

THREE.TransformGizmoMaterial.prototype = Object.create( THREE.MeshBasicMaterial.prototype );

THREE.TransformGizmo = function () {

	this.handleGizmos = {
		X: [
			new THREE.Mesh( new THREE.CylinderGeometry( 0.005, 0.005, 1, 4, 1, false ), new THREE.TransformGizmoMaterial( { color: "red" } ) ),
			new THREE.Vector3( 0.5, 0, 0 ),
			new THREE.Vector3( 0, 0, -Math.PI/2 )
		],
		Y: [
			new THREE.Mesh( new THREE.CylinderGeometry( 0.005, 0.005, 1, 4, 1, false ), new THREE.TransformGizmoMaterial( { color: "green" } ) ),
			new THREE.Vector3( 0, 0.5, 0 )
		],
		Z: [
			new THREE.Mesh( new THREE.CylinderGeometry( 0.005, 0.005, 1, 4, 1, false ), new THREE.TransformGizmoMaterial( { color: "blue" } ) ),
			new THREE.Vector3( 0, 0, 0.5 ),
			new THREE.Vector3( Math.PI/2, 0, 0 )
		]
	}

	var showPickers = false; //debug
	var showActivePlane = false; //debug

	this.init = function () {

		THREE.Object3D.call( this );

		this.handles = new THREE.Object3D();
		this.pickers = new THREE.Object3D();
		this.planes = new THREE.Object3D();

		this.add(this.handles);
		this.add(this.pickers);
		this.add(this.planes);

		//// PLANES

		var planeGeometry = new THREE.PlaneGeometry( 50, 50, 2, 2 );
		var planeMaterial = new THREE.MeshBasicMaterial( { wireframe: true } );
		planeMaterial.side = THREE.DoubleSide;

		var planes = {
			"XY": new THREE.Mesh( planeGeometry, planeMaterial ),
			"YZ": new THREE.Mesh( planeGeometry, planeMaterial ),
			"XZ": new THREE.Mesh( planeGeometry, planeMaterial ),
			"XYZE": new THREE.Mesh( planeGeometry, planeMaterial )
		};

		planes["YZ"].rotation.set( 0, Math.PI/2, 0 );
		planes["XZ"].rotation.set( -Math.PI/2, 0, 0 );

		for (var i in planes) {
			planes[i].name = i;
			this.planes.add(planes[i]);
			this.planes[i] = planes[i];
			planes[i].visible = false;
		}

		//// HANDLES AND PICKERS

		for ( var i in this.handleGizmos ) {

			var handle = this.handleGizmos[i][0];
			handle.name = i;
			if ( this.handleGizmos[i][1] ) handle.position.set( this.handleGizmos[i][1].x, this.handleGizmos[i][1].y, this.handleGizmos[i][1].z );
			if ( this.handleGizmos[i][2] ) handle.rotation.set( this.handleGizmos[i][2].x, this.handleGizmos[i][2].y, this.handleGizmos[i][2].z );
			
			this.handles.add( handle );

			if ( this.pickerGizmos && this.pickerGizmos[i] ) {

				var picker = this.pickerGizmos[i][0];
				if ( this.pickerGizmos[i][1] ) picker.position.set( this.pickerGizmos[i][1].x, this.pickerGizmos[i][1].y, this.pickerGizmos[i][1].z );
				if ( this.pickerGizmos[i][2] ) picker.rotation.set( this.pickerGizmos[i][2].x, this.pickerGizmos[i][2].y, this.pickerGizmos[i][2].z );
			
			} else {

				var picker = handle.clone();

			}

			picker.name = i;
			this.pickers.add( picker );

		}

		// reset Transformations

		this.traverse(function (child) {
			if (child instanceof THREE.Mesh) {			
				var tempGeometry = new THREE.Geometry();
				THREE.GeometryUtils.merge( tempGeometry, child );
				child.geometry = tempGeometry;
				child.position.set( 0, 0, 0 );
				child.rotation.set( 0, 0, 0 );
				child.scale.set( 1, 1, 1 );

			}
		});

	}

	this.hide = function () {

		for ( var j in this.handles.children ) this.handles.children[j].visible = false;

		for ( var j in this.pickers.children ) this.pickers.children[j].visible = false;

		for ( var j in this.planes.children ) this.planes.children[j].visible = false;

	}

	this.show = function () {

		for ( var i in this.handles.children ) {

			this.handles.children[i].visible = true;

		}

		for ( var i in this.pickers.children ) {

			this.pickers.children[i].visible = showPickers;

		}

		if (this.activePlane) this.activePlane.visible = showActivePlane;

	}

	this.highlight = function ( axis ) {

		var handle;

		for ( var i in this.handleGizmos ) {

			handle = this.handleGizmos[ i ][0];

			if ( handle.material.oldColor ) {

				handle.material.color.copy( handle.material.oldColor );
				handle.material.opacity = handle.material.oldOpacity;

			}

		}

		if ( axis ) {
		
			handle = this.handleGizmos[ axis ][0];

			handle.material.oldColor = handle.material.color.clone();
			handle.material.oldOpacity = handle.material.opacity;
	 
			handle.material.color.setRGB( 1, 1, 0 );
			handle.material.opacity = 1;

		}

	}

	this.init();

}

THREE.TransformGizmo.prototype = Object.create( THREE.Object3D.prototype );

THREE.TransformGizmo.prototype.update = function ( rotation, eye ) {

	var vec1 = new THREE.Vector3( 0, 0, 0 );
	var vec2 = new THREE.Vector3( 0, 1, 0 );
	var lookAtMatrix = new THREE.Matrix4();

	for ( var i in this.children ) {

		for ( var j in this.children[i].children ) {

			var object = this.children[i].children[j];

			if ( object.name.search("E") != -1 ) {

				object.quaternion.setFromRotationMatrix( lookAtMatrix.lookAt( eye, vec1, vec2 ) );

			} else {

				object.quaternion.setFromEuler( rotation );

			}

		}

	}

}

THREE.TransformGizmoTranslate = function () {

	THREE.TransformGizmo.call( this );

	var arrowGeometry = new THREE.CylinderGeometry( 0.005, 0.005, 1, 4, 1, false );
	var mesh = new THREE.Mesh( new THREE.CylinderGeometry( 0, 0.05, 0.2, 12, 1, false ) );
	mesh.position.y = 0.5;
	THREE.GeometryUtils.merge( arrowGeometry, mesh );
				
	this.handleGizmos = {

		X: [
			new THREE.Mesh( arrowGeometry, new THREE.TransformGizmoMaterial( { color: "red" } ) ),
			new THREE.Vector3( 0.5, 0, 0 ),
			new THREE.Vector3( 0, 0, -Math.PI/2 )
		],
		Y: [
			new THREE.Mesh( arrowGeometry, new THREE.TransformGizmoMaterial( { color: "green" } ) ),
			new THREE.Vector3( 0, 0.5, 0 )
		],
		Z: [
			new THREE.Mesh( arrowGeometry, new THREE.TransformGizmoMaterial( { color: "blue" } ) ),
			new THREE.Vector3( 0, 0, 0.5 ),
			new THREE.Vector3( Math.PI/2, 0, 0 )
		],
		XYZ: [
			new THREE.Mesh( new THREE.OctahedronGeometry( 0.1, 0 ), new THREE.TransformGizmoMaterial( { color: "white", opacity: 0.25 } ) )
		],
		XY: [
			new THREE.Mesh( new THREE.PlaneGeometry( 0.29, 0.29 ), new THREE.TransformGizmoMaterial( { color: "yellow", opacity: 0.25 } ) ),
			new THREE.Vector3( 0.15, 0.15, 0 )
		],
		YZ: [
			new THREE.Mesh( new THREE.PlaneGeometry( 0.29, 0.29 ), new THREE.TransformGizmoMaterial( { color: "cyan", opacity: 0.25 } ) ),
			new THREE.Vector3( 0, 0.15, 0.15 ),
			new THREE.Vector3( 0, Math.PI/2, 0 )
		],
		XZ: [
			new THREE.Mesh( new THREE.PlaneGeometry( 0.29, 0.29 ), new THREE.TransformGizmoMaterial( { color: "magenta", opacity: 0.25 } ) ),
			new THREE.Vector3( 0.15, 0, 0.15 ),
			new THREE.Vector3( Math.PI/2, 0, 0 )
		]

	}

	this.pickerGizmos = {

		X: [
			new THREE.Mesh( new THREE.CylinderGeometry( 0.075, 0, 1, 4, 1, false ), new THREE.TransformGizmoMaterial( { color: "red", opacity: 0.25 } ) ),
			new THREE.Vector3( 0.6, 0, 0 ),
			new THREE.Vector3( 0, 0, -Math.PI/2 )
		],
		Y: [
			new THREE.Mesh( new THREE.CylinderGeometry( 0.075, 0, 1, 4, 1, false ), new THREE.TransformGizmoMaterial( { color: "green", opacity: 0.25 } ) ),
			new THREE.Vector3( 0, 0.6, 0 )
		],
		Z: [
			new THREE.Mesh( new THREE.CylinderGeometry( 0.075, 0, 1, 4, 1, false ), new THREE.TransformGizmoMaterial( { color: "blue", opacity: 0.25 } ) ),
			new THREE.Vector3( 0, 0, 0.6 ),
			new THREE.Vector3( Math.PI/2, 0, 0 )
		]

	}

	this.setActivePlane = function ( axis, eye ) {

		var tempMatrix = new THREE.Matrix4();
		eye.applyProjection( tempMatrix.getInverse( tempMatrix.extractRotation( this.planes[ "XY" ].matrixWorld ) ) );

		if ( axis == "X" ) {
			this.activePlane = this.planes[ "XY" ];
			if ( Math.abs(eye.y) > Math.abs(eye.z) ) this.activePlane = this.planes[ "XZ" ];
		}

		if ( axis == "Y" ){
			this.activePlane = this.planes[ "XY" ];
			if ( Math.abs(eye.x) > Math.abs(eye.z) ) this.activePlane = this.planes[ "YZ" ];
		}

		if ( axis == "Z" ){
			this.activePlane = this.planes[ "XZ" ];
			if ( Math.abs(eye.x) > Math.abs(eye.y) ) this.activePlane = this.planes[ "YZ" ];
		}

		if ( axis == "XYZ" ) this.activePlane = this.planes[ "XYZE" ];

		if ( axis == "XY" ) this.activePlane = this.planes[ "XY" ];

		if ( axis == "YZ" ) this.activePlane = this.planes[ "YZ" ];

		if ( axis == "XZ" ) this.activePlane = this.planes[ "XZ" ];

		this.hide();
		this.show();

	}

	this.init();

}

THREE.TransformGizmoTranslate.prototype = Object.create( THREE.TransformGizmo.prototype );

THREE.TransformGizmoRotate = function () {

	THREE.TransformGizmo.call( this );

	this.handleGizmos = {

		X: [
			new THREE.Mesh( new THREE.TorusGeometry( 1, 0.005, 4, 32, Math.PI ), new THREE.TransformGizmoMaterial( { color: "red" } ) ),
			new THREE.Vector3( 0, 0, 0 ),
			new THREE.Vector3( 0, -Math.PI/2, -Math.PI/2 )
		],
		Y: [
			new THREE.Mesh( new THREE.TorusGeometry( 1, 0.005, 4, 32, Math.PI ), new THREE.TransformGizmoMaterial( { color: "green" } ) ),
			new THREE.Vector3( 0, 0, 0 ),
			new THREE.Vector3( Math.PI/2, 0, 0 )
		],
		Z: [
			new THREE.Mesh( new THREE.TorusGeometry( 1, 0.005, 4, 32, Math.PI ), new THREE.TransformGizmoMaterial( { color: "blue" } ) ),
			new THREE.Vector3( 0, 0, 0 ),
			new THREE.Vector3( 0, 0, -Math.PI/2 )
		],
		E: [
			new THREE.Mesh( new THREE.TorusGeometry( 1.25, 0.005, 4, 64 ), new THREE.TransformGizmoMaterial( { color: "yellow", opacity: 0.25 } ) )
		],
		XYZE: [
			new THREE.Mesh( new THREE.TorusGeometry( 1, 0.005, 4, 64 ), new THREE.TransformGizmoMaterial( { color: "gray" } ) )
		]

	}

	this.pickerGizmos = {

		X: [
			new THREE.Mesh( new THREE.TorusGeometry( 1, 0.05, 4, 12, Math.PI ), new THREE.TransformGizmoMaterial( { color: "red", opacity: 0.25 } ) ),
			new THREE.Vector3( 0, 0, 0 ),
			new THREE.Vector3( 0, -Math.PI/2, -Math.PI/2 )
		],
		Y: [
			new THREE.Mesh( new THREE.TorusGeometry( 1, 0.05, 4, 12, Math.PI ), new THREE.TransformGizmoMaterial( { color: "green", opacity: 0.25 } ) ),
			new THREE.Vector3( 0, 0, 0 ),
			new THREE.Vector3( Math.PI/2, 0, 0 )
		],
		Z: [
			new THREE.Mesh( new THREE.TorusGeometry( 1, 0.05, 4, 12, Math.PI ), new THREE.TransformGizmoMaterial( { color: "blue", opacity: 0.25 } ) ),
			new THREE.Vector3( 0, 0, 0 ),
			new THREE.Vector3( 0, 0, -Math.PI/2 )
		],
		E: [
			new THREE.Mesh( new THREE.TorusGeometry( 1.25, 0.05, 2, 24 ), new THREE.TransformGizmoMaterial( { color: "yellow", opacity: 0.25 } ) )
		],
		XYZE: [
			new THREE.Mesh( new THREE.Geometry() ) // TODO
		]

	}

	this.setActivePlane = function ( axis ) {

		if ( axis == "E" ) this.activePlane = this.planes[ "XYZE" ];

	 	if ( axis == "X" ) this.activePlane = this.planes[ "YZ" ];

		if ( axis == "Y" ) this.activePlane = this.planes[ "XZ" ];

		if ( axis == "Z" ) this.activePlane = this.planes[ "XY" ];

		this.hide();
		this.show();

	}

	this.update = function ( rotation, eye2 ) {

		THREE.TransformGizmo.prototype.update.apply( this, arguments );

		var group = {
			handles: this["handles"],
			pickers: this["pickers"],
		}

		var tempMatrix = new THREE.Matrix4();
		var worldRotation = new THREE.Euler( 0, 0, 1 );
		var tempQuaternion = new THREE.Quaternion();
		var unitX = new THREE.Vector3( 1, 0, 0 );
		var unitY = new THREE.Vector3( 0, 1, 0 );
		var unitZ = new THREE.Vector3( 0, 0, 1 );
		var quaternionX = new THREE.Quaternion();
		var quaternionY = new THREE.Quaternion();
		var quaternionZ = new THREE.Quaternion();
		var eye = eye2.clone();

		worldRotation.copy( this.planes["XY"].rotation );
		tempQuaternion.setFromEuler( worldRotation );

		tempMatrix.makeRotationFromQuaternion( tempQuaternion ).getInverse( tempMatrix );
		eye.applyProjection( tempMatrix );

		for ( var i in group ) {

			for ( var j in group[i].children ) {

				var object = group[i].children[j];

				tempQuaternion.setFromEuler( worldRotation );

				if ( object.name == "X" ) {
					quaternionX.setFromAxisAngle( unitX, Math.atan2( -eye.y, eye.z ) );
					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
					object.quaternion.copy( tempQuaternion );
				}

				if ( object.name == "Y" ) {
					quaternionY.setFromAxisAngle( unitY, Math.atan2( eye.x, eye.z ) );
					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY );
					object.quaternion.copy( tempQuaternion );
				}

				if ( object.name == "Z" ) {
					quaternionZ.setFromAxisAngle( unitZ, Math.atan2( eye.y, eye.x ) );
					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ );
					object.quaternion.copy( tempQuaternion );
				}

			}
		}

	}

	this.init();

}

THREE.TransformGizmoRotate.prototype = Object.create( THREE.TransformGizmo.prototype );

THREE.TransformGizmoScale = function () {

	THREE.TransformGizmo.call( this );

	var arrowGeometry = new THREE.CylinderGeometry( 0.005, 0.005, 1, 4, 1, false );
	var mesh = new THREE.Mesh( new THREE.CubeGeometry( 0.125, 0.125, 0.125 ) );
	mesh.position.y = 0.5;
	THREE.GeometryUtils.merge( arrowGeometry, mesh );

	this.handleGizmos = {

		XYZ: [
			new THREE.Mesh( new THREE.CubeGeometry( 0.125, 0.125, 0.125 ), new THREE.TransformGizmoMaterial( { color: "white", opacity: 0.25 } ) )
		],
		X: [
			new THREE.Mesh( arrowGeometry, new THREE.TransformGizmoMaterial( { color: "red" } ) ),
			new THREE.Vector3( 0.5, 0, 0 ),
			new THREE.Vector3( 0, 0, -Math.PI/2 )
		],
		Y: [
			new THREE.Mesh( arrowGeometry, new THREE.TransformGizmoMaterial( { color: "green" } ) ),
			new THREE.Vector3( 0, 0.5, 0 )
		],
		Z: [
			new THREE.Mesh( arrowGeometry, new THREE.TransformGizmoMaterial( { color: "blue" } ) ),
			new THREE.Vector3( 0, 0, 0.5 ),
			new THREE.Vector3( Math.PI/2, 0, 0 )
		]

	}

	this.pickerGizmos = {

		X: [
			new THREE.Mesh( new THREE.CylinderGeometry( 0.125, 0, 1, 4, 1, false ), new THREE.TransformGizmoMaterial( { color: "red", opacity: 0.25 } ) ),
			new THREE.Vector3( 0.6, 0, 0 ),
			new THREE.Vector3( Math.PI/4, 0, -Math.PI/2 )
		],
		Y: [
			new THREE.Mesh( new THREE.CylinderGeometry( 0.125, 0, 1, 4, 1, false ), new THREE.TransformGizmoMaterial( { color: "green", opacity: 0.25 } ) ),
			new THREE.Vector3( 0, 0.6, 0 ),
			new THREE.Vector3( 0, Math.PI/4, 0 )
		],
		Z: [
			new THREE.Mesh( new THREE.CylinderGeometry( 0.125, 0, 1, 4, 1, false ), new THREE.TransformGizmoMaterial( { color: "blue", opacity: 0.25 } ) ),
			new THREE.Vector3( 0, 0, 0.6 ),
			new THREE.Vector3( Math.PI/2, Math.PI/4, 0 )
		]

	}

	this.setActivePlane = function ( axis, eye ) {

		var tempMatrix = new THREE.Matrix4();
		eye.applyProjection( tempMatrix.getInverse( tempMatrix.extractRotation( this.planes[ "XY" ].matrixWorld ) ) );

		if ( axis == "X" ) {
			this.activePlane = this.planes[ "XY" ];
			if ( Math.abs(eye.y) > Math.abs(eye.z) ) this.activePlane = this.planes[ "XZ" ];
		}

		if ( axis == "Y" ){
			this.activePlane = this.planes[ "XY" ];
			if ( Math.abs(eye.x) > Math.abs(eye.z) ) this.activePlane = this.planes[ "YZ" ];
		}

		if ( axis == "Z" ){
			this.activePlane = this.planes[ "XZ" ];
			if ( Math.abs(eye.x) > Math.abs(eye.y) ) this.activePlane = this.planes[ "YZ" ];
		}

		if ( axis == "XYZ" ) this.activePlane = this.planes[ "XYZE" ];

		this.hide();
		this.show();

	}

	this.init();

}

THREE.TransformGizmoScale.prototype = Object.create( THREE.TransformGizmo.prototype );

THREE.TransformControls = function ( camera, domElement ) {

	// TODO: Make non-uniform scale and rotate play nice in hierarchies
	// TODO: ADD RXYZ contol

	THREE.Object3D.call( this );

	domElement = ( domElement !== undefined ) ? domElement : document;

	this.gizmo = {}
	this.gizmo["translate"] = new THREE.TransformGizmoTranslate();
	this.gizmo["rotate"] = new THREE.TransformGizmoRotate();
	this.gizmo["scale"] = new THREE.TransformGizmoScale();

	this.add(this.gizmo["translate"]);
	this.add(this.gizmo["rotate"]);
	this.add(this.gizmo["scale"]);

	this.gizmo["translate"].hide();
	this.gizmo["rotate"].hide();
	this.gizmo["scale"].hide();

	this.hovered = false;
	this.snap = false;
	this.space = "world";
	this.size = 1;

	var scope = this;
	
	var _object = null;

	var _axis = false;
	var _mode = "translate";
	var _plane = "XY";

	var changeEvent = { type: "change" };

	var ray = new THREE.Raycaster();
	var projector = new THREE.Projector();
	var pointerVector = new THREE.Vector3();

	var point = new THREE.Vector3();
	var offset = new THREE.Vector3();

	var rotation = new THREE.Vector3();
	var offsetRotation = new THREE.Vector3();
	var scale = 1;

	var lookAtMatrix = new THREE.Matrix4();
	var eye = new THREE.Vector3()

	var tempMatrix = new THREE.Matrix4();
	var tempVector = new THREE.Vector3();
	var tempQuaternion = new THREE.Quaternion();
	var unitX = new THREE.Vector3( 1, 0, 0 );
	var unitY = new THREE.Vector3( 0, 1, 0 );
	var unitZ = new THREE.Vector3( 0, 0, 1 );

	var quaternionXYZ = new THREE.Quaternion();
	var quaternionX = new THREE.Quaternion();
	var quaternionY = new THREE.Quaternion();
	var quaternionZ = new THREE.Quaternion();
	var quaternionE = new THREE.Quaternion();

	var oldPosition = new THREE.Vector3();
	var oldScale = new THREE.Vector3();
	var oldRotationMatrix = new THREE.Matrix4();

	var parentRotationMatrix  = new THREE.Matrix4();
	var parentScale = new THREE.Vector3();

	var worldPosition = new THREE.Vector3();
	var worldRotation = new THREE.Euler();
	var worldRotationMatrix  = new THREE.Matrix4();
	var camPosition = new THREE.Vector3();
	var camRotation = new THREE.Euler();

	this.attach = function ( object ) {

		_object = object;

	 	this.gizmo["translate"].hide();
	 	this.gizmo["rotate"].hide();
	 	this.gizmo["scale"].hide();
	 	this.gizmo[_mode].show();

	 	scope.dispatchEvent( changeEvent );

		domElement.addEventListener( "mousedown", onMouseDown, false );
		domElement.addEventListener( "mousemove", onMouseHover, false );

	}

	this.detach = function ( object ) {

		_object = null;
		this.hovered = false;

	 	this.gizmo["translate"].hide();
	 	this.gizmo["rotate"].hide();
	 	this.gizmo["scale"].hide();

		domElement.removeEventListener( "mousedown", onMouseDown, false );
		domElement.removeEventListener( "mousemove", onMouseHover, false );

	}

	this.setMode = function ( mode ) {

		_mode = mode ? mode : _mode;

		if ( _mode == "scale" ) scope.space = "local";

	 	this.gizmo["translate"].hide();
	 	this.gizmo["rotate"].hide();
	 	this.gizmo["scale"].hide();	
	 	this.gizmo[_mode].show();

		this.update();
	 	scope.dispatchEvent( changeEvent );

	}

	this.setSnap = function ( snap ) {

		scope.snap = snap;

	}

	this.setSize = function ( size ) {

		scope.size = size;
		this.update();
	 	scope.dispatchEvent( changeEvent );
	 	
	}

	this.setSpace = function ( space ) {

		scope.space = space;

		this.update();
	 	scope.dispatchEvent( changeEvent );

	}

	this.update = function () {

		if ( _object === null ) return;

		_object.updateMatrixWorld();
		worldPosition.getPositionFromMatrix( _object.matrixWorld );
		worldRotation.setFromRotationMatrix( tempMatrix.extractRotation( _object.matrixWorld ) );

		camera.updateMatrixWorld();
		camPosition.getPositionFromMatrix( camera.matrixWorld );
		camRotation.setFromRotationMatrix( tempMatrix.extractRotation( camera.matrixWorld ) );

		scale = worldPosition.distanceTo( camPosition ) / 6 * scope.size;
		this.position.copy( worldPosition )
		this.scale.set( scale, scale, scale );

		eye.copy( camPosition ).sub( worldPosition ).normalize();

		if ( scope.space == "local" )
			this.gizmo[_mode].update( worldRotation, eye );

		else if ( scope.space == "world" )
			this.gizmo[_mode].update( new THREE.Euler(), eye );

		

	}

	function onMouseHover( event ) {

		event.preventDefault();

		if ( _axis === false ) {

			var intersect = intersectObjects( event, scope.gizmo[_mode].pickers.children );

			if ( intersect ) {

				if ( scope.hovered !== intersect.object ) {

					scope.hovered = intersect.object;

					scope.gizmo[_mode].highlight( scope.hovered.name );

					scope.dispatchEvent( changeEvent );

				}

			} else if ( scope.hovered !== false ) {

				scope.hovered = false;

				scope.gizmo[_mode].highlight();

				scope.dispatchEvent( changeEvent );

			}

		}

	};

	function onMouseDown( event ) {

		event.preventDefault();

		if ( event.button === 0 ) {

			var intersect = intersectObjects( event, scope.gizmo[_mode].pickers.children );

			if ( intersect ) {

				_axis = intersect.object.name;

				scope.update();

				eye.copy( camPosition ).sub( worldPosition ).normalize();

				scope.gizmo[_mode].setActivePlane( _axis, eye );

				var planeIntersect = intersectObjects( event, [scope.gizmo[_mode].activePlane] );

				if ( planeIntersect ) {

					oldPosition.copy( _object.position );
					oldScale.copy( _object.scale );

					oldRotationMatrix.extractRotation( _object.matrix );
					worldRotationMatrix.extractRotation( _object.matrixWorld );

					parentRotationMatrix.extractRotation( _object.parent.matrixWorld );
					parentScale.getScaleFromMatrix( tempMatrix.getInverse( _object.parent.matrixWorld ) );

					offset.copy( planeIntersect.point );

				}

			}

		}

		domElement.addEventListener( "mousemove", onMouseMove, false );
		domElement.addEventListener( "mouseup", onMouseUp, false );
		domElement.addEventListener( "mouseout", onMouseUp, false );

	};

	function onMouseMove( event ) {

		if ( _axis ) {

			var planeIntersect = intersectObjects( event, [scope.gizmo[_mode].activePlane] );

			if ( planeIntersect ) {

				point.copy( planeIntersect.point );

				if ( _mode == "translate" ) {

					point.sub( offset );
					point.multiply(parentScale);

					if ( scope.space == "local" ) {

						point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

						if ( _axis.search("X") == -1 ) point.x = 0;
						if ( _axis.search("Y") == -1 ) point.y = 0;
						if ( _axis.search("Z") == -1 ) point.z = 0;

						point.applyMatrix4( oldRotationMatrix );

						_object.position.copy( oldPosition );
						_object.position.add( point );

					} 

					if ( scope.space == "world" || _axis.search("XYZ") != -1 ) {

						if ( _axis.search("X") == -1 ) point.x = 0;
						if ( _axis.search("Y") == -1 ) point.y = 0;
						if ( _axis.search("Z") == -1 ) point.z = 0;

						point.applyMatrix4( tempMatrix.getInverse( parentRotationMatrix ) );

						_object.position.copy( oldPosition );
						_object.position.add( point );

						if ( scope.snap ) {

							if ( _axis.search("X") != -1 ) _object.position.x = Math.round( _object.position.x / scope.snap ) * scope.snap;
							if ( _axis.search("Y") != -1 ) _object.position.y = Math.round( _object.position.y / scope.snap ) * scope.snap;
							if ( _axis.search("Z") != -1 ) _object.position.z = Math.round( _object.position.z / scope.snap ) * scope.snap;
						
						}

					}

				} else if ( _mode == "scale" ) {

					point.sub( offset );
					point.multiply(parentScale);

					if ( scope.space == "local" ) {

						if ( _axis == "XYZ") {

							scale = 1 + ( ( point.y ) / 50 );

							_object.scale.x = oldScale.x * scale;
							_object.scale.y = oldScale.y * scale;
							_object.scale.z = oldScale.z * scale;

						} else {

							point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

							if ( _axis == "X" ) _object.scale.x = oldScale.x * ( 1 + point.x / 50 );
							if ( _axis == "Y" ) _object.scale.y = oldScale.y * ( 1 + point.y / 50 );
							if ( _axis == "Z" ) _object.scale.z = oldScale.z * ( 1 + point.z / 50 );

						}

					}

				} else if ( _mode == "rotate" ) {

					point.sub( worldPosition );
					point.multiply(parentScale);
					tempVector.copy(offset).sub( worldPosition );
					tempVector.multiply(parentScale);

					if ( _axis == "E" ) {

						point.applyMatrix4( tempMatrix.getInverse( lookAtMatrix ) );
						tempVector.applyMatrix4( tempMatrix.getInverse( lookAtMatrix ) );

						rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
						offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

						tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );

						quaternionE.setFromAxisAngle( eye, rotation.z - offsetRotation.z );
						quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

						tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionE );
						tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

						_object.quaternion.copy( tempQuaternion );

					} else if ( _axis == "XYZE" ) {

						quaternionE.setFromEuler( point.clone().cross(tempVector).normalize() ); // rotation axis

						tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );
						quaternionX.setFromAxisAngle( quaternionE, - point.clone().angleTo(tempVector) );
						quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

						tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
						tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

						_object.quaternion.copy( tempQuaternion );

					} else if ( scope.space == "local" ) {

						point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

						tempVector.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

						rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
						offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

						quaternionXYZ.setFromRotationMatrix( oldRotationMatrix );
						quaternionX.setFromAxisAngle( unitX, rotation.x - offsetRotation.x );
						quaternionY.setFromAxisAngle( unitY, rotation.y - offsetRotation.y );
						quaternionZ.setFromAxisAngle( unitZ, rotation.z - offsetRotation.z );

						if ( _axis == "X" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionX );
						if ( _axis == "Y" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionY );
						if ( _axis == "Z" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionZ );

						_object.quaternion.copy( quaternionXYZ );

					} else if ( scope.space == "world" ) {

						rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
						offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

						tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );

						quaternionX.setFromAxisAngle( unitX, rotation.x - offsetRotation.x );
						quaternionY.setFromAxisAngle( unitY, rotation.y - offsetRotation.y );
						quaternionZ.setFromAxisAngle( unitZ, rotation.z - offsetRotation.z );
						quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

						if ( _axis == "X" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
						if ( _axis == "Y" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY );
						if ( _axis == "Z" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ );

						tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

						_object.quaternion.copy( tempQuaternion );

					}

				}

			}

			scope.update();
			scope.dispatchEvent( changeEvent );

		}

	}

	function onMouseUp( event ) {

		_axis = false;

		domElement.removeEventListener( "mousemove", onMouseMove, false );
		domElement.removeEventListener( "mouseup", onMouseUp, false );
		domElement.removeEventListener( "mouseout", onMouseUp, false );

	}

	function intersectObjects( event, objects ) {

	    var rect = domElement.getBoundingClientRect();
	    var x = (event.clientX - rect.left) / rect.width;
	    var y = (event.clientY - rect.top) / rect.height;
		pointerVector.set( ( x ) * 2 - 1, - ( y ) * 2 + 1, 0.5 );

		projector.unprojectVector( pointerVector, camera );
		ray.set( camPosition, pointerVector.sub( camPosition ).normalize() );

		var intersections = ray.intersectObjects( objects, true );
		return intersections[0] ? intersections[0] : false;

	}

};

THREE.TransformControls.prototype = Object.create( THREE.Object3D.prototype );