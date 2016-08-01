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
		var modelObject = editor.scene.getObjectByName('OpenSimModel');
		var bbox = new THREE.Box3().setFromObject(modelObject);
	};

	var viewminx = new UI.Button('-X').onClick(function () {
		viewfromMinusX();
	});
	buttons.add(viewminx);
	function viewfromMinusX() {
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
