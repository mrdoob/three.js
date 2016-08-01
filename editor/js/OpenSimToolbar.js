/**
 * @author mrdoob / http://mrdoob.com/
 */

var OpenSimToolbar = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'toolbar' );

	var buttons = new UI.Panel();
	container.add( buttons );

	var camera = editor.camera;
	// translate / rotate / scale

	var viewx = new UI.Button('+X').onClick(function () {

		viewfromPlusX();

	});
	buttons.add(viewx);

	function viewfromPlusX() {
		var center = new THREE.Vector3();
		var modelObject = editor.scene.getObjectByName('OpenSimModel');
		var bbox = new THREE.Box3().setFromObject(modelObject);
		bbox.center(center);
		//var helper = new THREE.BoundingBoxHelper(modelObject, 0xff0000);
		//helper.update();
	    // If you want a visible bounding box
		//editor.scene.add(helper);
	    // create a sphere at new CameraPos
		var newpos = new THREE.Vector3();
		newpos.copy(center);
		var fov = editor.camera.fov * (Math.PI / 180);
	    // Calculate the camera distance
		var objectSize = Math.max(bbox.max.y - bbox.min.y, bbox.max.x - bbox.min.x);
		var distance = Math.abs(objectSize / Math.sin(fov / 2));
		newpos.x = bbox.max.x + distance;
		editor.camera.position.copy(newpos);
		editor.camera.lookAt(center.x, center.y, center.z);
		//editor.camera.fov = 2 * Math.atan((bbox.max.y - bbox.min.y) / 1000) * (180 / Math.PI);
		editor.camera.updateProjectionMatrix();
	};

	var viewminx = new UI.Button('-X').onClick(function () {
		viewfromMinusX();
	});
	buttons.add(viewminx);
	function viewfromMinusX() {
	    var modelObject = editor.scene.getObjectByName('OpenSimModel');
	    var bbox = new THREE.Box3().setFromObject(modelObject);
	    var center = new THREE.Vector3();
	    bbox.center(center);
	    //var helper = new THREE.BoundingBoxHelper(modelObject, 0xff0000);
	    //helper.update();
	    // If you want a visible bounding box
	    //editor.scene.add(helper);
	    // create a sphere at new CameraPos
	    var newpos = new THREE.Vector3();
	    newpos.copy(center);
	    var fov = editor.camera.fov * (Math.PI / 180);
	    // Calculate the camera distance
	    var objectSize = Math.max(bbox.max.y - bbox.min.y, bbox.max.x - bbox.min.x);
	    var distance = Math.abs(objectSize / Math.sin(fov / 2));
	    newpos.x = bbox.min.x - distance;
	    editor.camera.position.copy(newpos);
	    editor.camera.lookAt(center.x, center.y, center.z);
	    //editor.camera.fov = 2 * Math.atan((bbox.max.y - bbox.min.y) / 1000) * (180 / Math.PI);
	    editor.camera.updateProjectionMatrix();
	};

	var viewminy = new UI.Button('-Y').onClick(function () {
	    viewfromMinusY();
	});
	buttons.add(viewminy);
	function viewfromMinusY() {
	};

	var viewplusy = new UI.Button('+Y').onClick(function () {
	    viewfromPlusY();
	});
	buttons.add(viewplusy);
	function viewfromMinusY() {
	};
	var viewminz = new UI.Button('-Z').onClick(function () {
	    viewfromMinusZ();
	});
	buttons.add(viewminz);
	function viewfromMinusZ() {
	};
	var viewplusz = new UI.Button('+Z').onClick(function () {
	    viewfromPlusZ();
	});
	buttons.add(viewplusz);
	function viewfromPlusZ() {
	};
	return container;

}
