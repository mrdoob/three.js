/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 */

THREE.TransformControls = function ( camera, domElement ) {

	this.camera = camera;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	this.visible = false;
	this.active = false;

	this.snapDist = null;
  this.modifierAxis = new THREE.Vector3( 1, 1, 1 );
	
	var scope = this;

	// gizmo object

	var loader = new THREE.SceneLoader2();
	var gizmo = loader.parse( gizmoGeometry );

	this.gizmo = new THREE.Object3D();
	this.gizmo.scale.set( 100,100,100 );
	this.gizmo.visible = this.visible;

	// object picking

	var intersectionPlane = new THREE.Mesh( new THREE.PlaneGeometry( 5000, 5000 ) );
	intersectionPlane.visible = false;

	var ray = new THREE.Raycaster();
	var projector = new THREE.Projector();
	var offset = new THREE.Vector3();

	// axis geometry

	var axisX = gizmo.children[0].clone();
	axisX.rotation.set( -Math.PI/2, 0, -Math.PI/2 );
	axisX.material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
	axisX.material.depthTest = false;
	axisX.material.transparent = true;
	this.gizmo.add( axisX );

	var axisY = gizmo.children[0].clone();
	axisY.material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	axisY.material.depthTest = false;
	axisY.material.transparent = true;
	this.gizmo.add( axisY );

	var axisZ = gizmo.children[0].clone();
	axisZ.rotation.set( Math.PI/2, Math.PI/2, 0 );
	axisZ.material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
	axisZ.material.depthTest = false;
	axisZ.material.transparent = true;
	this.gizmo.add( axisZ );

	// invisible handles

	var handleRX = gizmo.children[1].clone();
	handleRX.rotation.set( -Math.PI/2, 0, -Math.PI/2 );
	handleRX.name = 'RX';
	var handleTX = gizmo.children[2].clone();
	handleTX.rotation.set( -Math.PI/2, 0, -Math.PI/2 );
	handleTX.name = 'TX';
	var handleSX = gizmo.children[3].clone();
	handleSX.rotation.set( -Math.PI/2, 0, -Math.PI/2 );
	handleSX.name = 'SX';
	
	var handleRY = gizmo.children[1].clone();
	handleRY.name = 'RY';
	var handleTY = gizmo.children[2].clone();
	handleTY.name = 'TY';
	var handleSY = gizmo.children[3].clone();
	handleSY.name = 'SY';

	var handleRZ = gizmo.children[1].clone();
	handleRZ.rotation.set( Math.PI/2, Math.PI/2, 0 );
	handleRZ.name = 'RZ';
	var handleTZ = gizmo.children[2].clone();
	handleTZ.rotation.set( Math.PI/2, Math.PI/2, 0 );
	handleTZ.name = 'TZ';
	var handleSZ = gizmo.children[3].clone();
	handleSZ.rotation.set( Math.PI/2, Math.PI/2, 0 );
	handleSZ.name = 'SZ';

	this.handles = [handleRX, handleTX, handleSX, handleRY, handleTY, handleSY, handleRZ, handleTZ, handleSZ];
	for (i in this.handles) {
		this.gizmo.add(this.handles[i]);
		this.handles[i].visible = false;
	}

  this.attatch = function ( object ) {
  	this.object = object;
  	this.gizmo.rotation = object.rotation;
		this.gizmo.position = object.position;
		this.gizmo.updateMatrix();
		this.visible = true;
  }

  function onMouseDown( event ) {

		event.preventDefault();

		scope.domElement.focus();

		if ( event.button === 0 ) {

			console.log(scope.object.position);

			intersectionPlane.position.copy( scope.object.position );
			intersectionPlane.lookAt( scope.camera.position );
			intersectionPlane.updateMatrix();
			intersectionPlane.updateMatrixWorld();

			var vector = new THREE.Vector3(
				( event.layerX / scope.domElement.offsetWidth ) * 2 - 1,
				- ( event.layerY / scope.domElement.offsetHeight ) * 2 + 1,
				0.5
			);

			projector.unprojectVector( vector, scope.camera );

			ray.set( scope.camera.position, vector.sub( scope.camera.position ).normalize() );

			var intersects = ray.intersectObjects( scope.handles, true );

			if ( intersects.length > 0 ) {

				scope.active = intersects[ 0 ].object.name;


		// if ( selected === object || selected === helpersToObjects[ object.id ] ) {
		// 			var intersects = ray.intersectObject( intersectionPlane );
		// 			offset.copy( intersects[ 0 ].point ).sub( intersectionPlane.position );

			} else {

		 		scope.active = false;

			}

		}

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	};

	function onMouseMove( event ) {

		var vector = new THREE.Vector3(
			( event.layerX / scope.domElement.offsetWidth ) * 2 - 1,
			- ( event.layerY / scope.domElement.offsetHeight ) * 2 + 1,
			0.5
		);

		projector.unprojectVector( vector, scope.camera );

		ray.set( scope.camera.position, vector.sub( scope.camera.position ).normalize() );

		var intersects = ray.intersectObject( intersectionPlane );

		if ( intersects.length > 0 ) {

			var point = intersects[ 0 ].point.sub( offset );

			if (scope.snapDist) {
				point.x = Math.round( point.x / scope.snapDist ) * scope.snapDist;
        point.y = Math.round( point.y / scope.snapDist ) * scope.snapDist;
        point.z = Math.round( point.z / scope.snapDist ) * scope.snapDist;
			}

			switch ( scope.active ) {

				case 'TX':
					scope.object.position.x = point.x;
					break;
				case 'TY':
					scope.object.position.y = point.y;
					break;
				case 'TZ':
					scope.object.position.z = point.z;
					break;
				case 'T':
					scope.object.position.x = scope.modifierAxis.x === 1 ? point.x : intersectionPlane.position.x;
					scope.object.position.y = scope.modifierAxis.y === 1 ? point.y : intersectionPlane.position.y;
		      scope.object.position.z = scope.modifierAxis.z === 1 ? point.z : intersectionPlane.position.z;
		      break;

			}



			//signals.objectChanged.dispatch( scope.object );

			//render();

		}

	}

	function onMouseUp( event ) {

		scope.active = false;

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

	}

	this.domElement.addEventListener( 'mousedown', onMouseDown, false );

};

THREE.TransformControls.prototype = Object.create( THREE.EventDispatcher.prototype );


var gizmoGeometry = {
	"metadata": {
		"version": 4,
		"type": "scene",
		"generator": "SceneExporter"
	},
	"geometries": [
		{
			"type": "Geometry",
			"data": {
				"vertices": [0,0,0,0,0.01421,0.01421,0,0.96,0,0,0.72,0.01421,0,0.72,0.04233,0.01421,0.01421,0,0.01421,0.72,0,0.04233,0.72,0,0.096131,-0.008,0.969091,0.189988,-0.008,0.955135,0.096131,0.008,0.969091,0.189988,0.008,0.955135,0.282693,-0.008,0.931913,0.282693,0.008,0.931913,0.372675,-0.008,0.899717,0.372675,0.008,0.899717,0.459068,-0.008,0.858856,0.459068,0.008,0.858856,0.54104,-0.008,0.809724,0.54104,0.008,0.809724,0.617802,-0.008,0.752794,0.617802,0.008,0.752794,0.688614,-0.008,0.688614,0.688614,0.008,0.688614,0.752794,-0.008,0.617802,0.752794,0.008,0.617802,0.809724,-0.008,0.54104,0.809724,0.008,0.54104,0.858856,-0.008,0.459068,0.858856,0.008,0.459068,0.899717,-0.008,0.372675,0.899717,0.008,0.372675,0.931913,-0.008,0.282693,0.931913,0.008,0.282693,0.955135,-0.008,0.189988,0.955135,0.008,0.189988,0.969091,-0.008,0.096131,0.969091,0.008,0.096131,0.094096,-0.008,0.955377,0.094096,0.008,0.955377,0.187287,-0.008,0.941554,0.187287,0.008,0.941554,0.278673,-0.008,0.918663,0.278673,0.008,0.918663,0.367376,-0.008,0.886924,0.367376,0.008,0.886924,0.452541,-0.008,0.846644,0.452541,0.008,0.846644,0.533347,-0.008,0.798211,0.533347,0.008,0.798211,0.609017,-0.008,0.74209,0.609017,0.008,0.74209,0.678822,-0.008,0.678822,0.678822,0.008,0.678822,0.74209,-0.008,0.609018,0.74209,0.008,0.609018,0.798211,-0.008,0.533347,0.798211,0.008,0.533347,0.846644,-0.008,0.452541,0.846644,0.008,0.452541,0.886924,-0.008,0.367376,0.886924,0.008,0.367376,0.918663,-0.008,0.278673,0.918663,0.008,0.278673,0.941554,-0.008,0.187287,0.941554,0.008,0.187287,0.955377,-0.008,0.094096,0.955377,0.008,0.094096,-0.04,0.96,0.04,0.04,0.96,0.04,-0.04,1.04,0.04,0.04,1.04,0.04,-0.04,1.04,-0.04,0.04,1.04,-0.04,-0.04,0.96,-0.04,0.04,0.96,-0.04],
				"normals": [-1,0,0,0,0,-1,1,0,0,0,0,1,0.14707724130664285,0,0.9891250098393162,0.24298614998551263,0,0.9700297577472652,0.3368891631065564,0,0.9415443121708952,0.4275564112614398,0,0.9039886698345496,0.5141017741704236,0,0.857729191408817,0.595695394349495,0,0.8032104314255385,0.6715574857547859,0,0.7409524568598922,0.7409524568598922,0,0.6715574857547859,0.8032104314255385,0,0.595695394349495,0.857729191408817,0,0.5141017741704236,0.9039886698345496,0,0.4275564112614398,0.9415443121708952,0,0.3368891631065564,0.9700297577472652,0,0.24298614998551263,0.9891250098393162,0,0.14707724130664285,-0.14672446081324952,0,-0.9891774019856405,-0.24298016647899742,0,-0.9700312565571475,-0.336895114456045,0,-0.9415421827277037,-0.4275547018879709,0,-0.903989478309061,-0.5141007723440386,0,-0.8577297918781084,-0.595701380530832,0,-0.8032059917814737,-0.6715614948471527,0,-0.7409488232250981,-0.7409440360602931,0,-0.6715667765953607,-0.8032097584279839,0,-0.5956963017898126,-0.8577297918781084,0,-0.5141007723440386,-0.903989478309061,0,-0.4275547018879709,-0.9415421827277037,0,-0.336895114456045,-0.9700312565571475,0,-0.24298016647899742,-0.9891774019856405,0,-0.14672446081324952,0,-1,0,0,1,0,-0.9891689682668569,0,0.14678130745391924,0.14678130745391924,0,-0.9891689682668569],
				"uvs": [[]],
				"faces": [16,0,1,2,0,16,1,3,2,0,16,3,4,2,0,16,0,2,5,1,16,5,2,6,1,16,2,7,6,1,16,0,2,1,2,16,1,2,3,2,16,2,4,3,2,16,0,5,2,3,16,5,6,2,3,16,6,7,2,3,16,8,9,10,4,16,10,9,11,4,16,9,12,11,5,16,11,12,13,5,16,12,14,13,6,16,13,14,15,6,16,14,16,15,7,16,15,16,17,7,16,16,18,17,8,16,17,18,19,8,16,18,20,19,9,16,19,20,21,9,16,20,22,21,10,16,21,22,23,10,16,22,24,23,11,16,23,24,25,11,16,24,26,25,12,16,25,26,27,12,16,26,28,27,13,16,27,28,29,13,16,28,30,29,14,16,29,30,31,14,16,30,32,31,15,16,31,32,33,15,16,32,34,33,16,16,33,34,35,16,16,34,36,35,17,16,35,36,37,17,16,38,39,40,18,16,40,39,41,18,16,40,41,42,19,16,42,41,43,19,16,42,43,44,20,16,44,43,45,20,16,44,45,46,21,16,46,45,47,21,16,46,47,48,22,16,48,47,49,22,16,48,49,50,23,16,50,49,51,23,16,50,51,52,24,16,52,51,53,24,16,52,53,54,25,16,54,53,55,25,16,54,55,56,26,16,56,55,57,26,16,56,57,58,27,16,58,57,59,27,16,58,59,60,28,16,60,59,61,28,16,60,61,62,29,16,62,61,63,29,16,62,63,64,30,16,64,63,65,30,16,64,65,66,31,16,66,65,67,31,16,38,40,8,32,16,8,40,9,32,16,39,10,41,33,16,41,10,11,33,16,39,38,10,34,16,10,38,8,34,16,40,42,9,32,16,9,42,12,32,16,43,41,13,33,16,13,41,11,33,16,42,44,12,32,16,12,44,14,32,16,45,43,15,33,16,15,43,13,33,16,44,46,14,32,16,14,46,16,32,16,47,45,17,33,16,17,45,15,33,16,46,48,16,32,16,16,48,18,32,16,49,47,19,33,16,19,47,17,33,16,48,50,18,32,16,18,50,20,32,16,51,49,21,33,16,21,49,19,33,16,50,52,20,32,16,20,52,22,32,16,53,51,23,33,16,23,51,21,33,16,52,54,22,32,16,22,54,24,32,16,55,53,25,33,16,25,53,23,33,16,54,56,24,32,16,24,56,26,32,16,57,55,27,33,16,27,55,25,33,16,56,58,26,32,16,26,58,28,32,16,59,57,29,33,16,29,57,27,33,16,58,60,28,32,16,28,60,30,32,16,61,59,31,33,16,31,59,29,33,16,60,62,30,32,16,30,62,32,32,16,63,61,33,33,16,33,61,31,33,16,62,64,32,32,16,32,64,34,32,16,65,63,35,33,16,35,63,33,33,16,66,36,64,32,16,64,36,34,32,16,66,67,36,35,16,36,67,37,35,16,67,65,37,33,16,37,65,35,33,16,68,69,70,3,16,70,69,71,3,16,70,71,72,33,16,72,71,73,33,16,72,73,74,1,16,74,73,75,1,16,74,75,68,32,16,68,75,69,32,16,69,75,71,2,16,71,75,73,2,16,74,68,72,0,16,72,68,70,0]
			}
		},
		{
			"type": "Geometry",
			"data": {
				"vertices": [1.026326,-0.058378,0.053698,1.026326,0.058378,0.053698,0.939081,0.068753,0.500037,0.939081,-0.068753,0.500037,0.50195,0.068753,0.935504,0.50195,-0.068753,0.935504,0.053698,0.058378,1.026326,0.053698,-0.058378,1.026326,0.912935,-0.05838,0.03687,0.814782,-0.070681,0.433851,0.814782,0.070681,0.433851,0.912935,0.05838,0.03687,0.43551,-0.070681,0.811678,0.43551,0.070681,0.811678,0.03687,-0.05838,0.912935,0.03687,0.05838,0.912935],
				"normals": [0.9814266968749732,0,0.1918375319406484,0.7057570812971007,0,0.7084539097210188,0.19857864742381448,0,0.9800849559029708,-0.970767704747755,0,-0.24002096454013275,-0.7057559109435002,0,-0.7084550756175795,-0.24618832357597284,0,-0.9692220124072979,0.004450806348387857,0.9995438295289505,-0.02987177887990181,0.14679905010457328,0,-0.9891663352987681,0.025246870914430328,-0.9995137637183726,-0.018298405574347386,0.010107063019912203,0.999897450588575,0.010145717499512054,0.01010700826555048,-0.9998974520398664,0.010145629014663217,-0.02365964751334554,0.9993207224458345,0.02825446460082895,-0.9891663352987681,0,0.14679905010457328,-0.0224605490450859,-0.9997421142409683,0.003350932645088142],
				"uvs": [[]],
				"faces": [17,0,1,2,3,0,17,3,2,4,5,1,17,5,4,6,7,2,17,8,9,10,11,3,17,9,12,13,10,4,17,12,14,15,13,5,17,1,11,10,2,6,17,8,11,1,0,7,17,0,3,9,8,8,17,2,10,13,4,9,17,3,5,12,9,10,17,4,13,15,6,11,17,15,14,7,6,12,17,5,7,14,12,13]
			}
		},
		{
			"type": "Geometry",
			"data": {
				"vertices": [-0.048994,0.097987,0.048994,0.048994,0.097987,0.048994,0.048994,0.902013,0.048994,-0.048994,0.902013,0.048994,0.048994,0.902013,-0.048994,-0.048994,0.902013,-0.048994,0.048994,0.097987,-0.048994,-0.048994,0.097987,-0.048994],
				"normals": [0,0,1,0,1,0,0,0,-1,0,-1,0,1,0,0,-1,0,0],
				"uvs": [[]],
				"faces": [17,0,1,2,3,0,17,3,2,4,5,1,17,5,4,6,7,2,17,7,6,1,0,3,17,1,6,4,2,4,17,7,0,3,5,5]
			}
		},
		{
			"type": "Geometry",
			"data": {
				"vertices": [-0.065973,0.927547,0.065973,0.065973,0.927547,0.065973,0.065973,1.138206,0.065973,-0.065973,1.138206,0.065973,0.065973,1.138206,-0.065973,-0.065973,1.138206,-0.065973,0.065973,0.927547,-0.065973,-0.065973,0.927547,-0.065973],
				"normals": [0,0,1,0,1,0,0,0,-1,0,-1,0,1,0,0,-1,0,0],
				"uvs": [[]],
				"faces": [17,0,1,2,3,0,17,3,2,4,5,1,17,5,4,6,7,2,17,7,6,1,0,3,17,1,6,4,2,4,17,7,0,3,5,5]
			}
		}],
	"materials": [
		{
			"type": "MeshBasicMaterial",
			"color": 16777215,
			"ambient": 16777215,
			"emissive": 0,
			"opacity": 1,
			"transparent": false,
			"wireframe": false
		}],
	"scene": {
		"type": "Scene",
		"children": [
			{
				"name": "d",
				"type": "Mesh",
				"position": [0,0,0],
				"rotation": [0,0,0],
				"scale": [1,1,1],
				"geometry": 0,
				"material": 0
			},
			{
				"name": "r",
				"type": "Mesh",
				"position": [0,0,0],
				"rotation": [0,0,0],
				"scale": [1,1,1],
				"geometry": 1,
				"material": 0
			},
			{
				"name": "t",
				"type": "Mesh",
				"position": [0,0,0],
				"rotation": [0,0,0],
				"scale": [1,1,1],
				"geometry": 2,
				"material": 0
			},
			{
				"name": "s",
				"type": "Mesh",
				"position": [0,0,0],
				"rotation": [0,0,0],
				"scale": [1,1,1],
				"geometry": 3,
				"material": 0
			}]
	}
}