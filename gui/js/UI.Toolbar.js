UI.Toolbar = function () {

	var _domElement = document.createElement( 'div' );
	_domElement.style.position = 'absolute';
	_domElement.style.backgroundColor = '#404040';

	// CUBE

	var _button = document.createElement( 'button' );
	_button.innerHTML = 'Cube';
	_button.addEventListener( 'click', function ( event ) {

		var geometry = new THREE.CubeGeometry( 100, 100, 100, 4, 4, 4 );
		var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
		var mesh = new THREE.Mesh( geometry, material );

		signals.added.dispatch( mesh );

	}, false );
	_domElement.appendChild( _button );

	// SPHERE

	var _button = document.createElement( 'button' );
	_button.innerHTML = 'Sphere';
	_button.addEventListener( 'click', function ( event ) {

		var geometry = new THREE.SphereGeometry( 75, 20, 10 );
		var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
		var mesh = new THREE.Mesh( geometry, material );

		signals.added.dispatch( mesh );

	}, false );
	_domElement.appendChild( _button );

	// TORUS

	var _button = document.createElement( 'button' );
	_button.innerHTML = 'Torus';
	_button.addEventListener( 'click', function ( event ) {

		var geometry = new THREE.TorusGeometry( 50, 20, 20, 20 );
		var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
		var mesh = new THREE.Mesh( geometry, material );

		signals.added.dispatch( mesh );

	}, false );
	_domElement.appendChild( _button );

	this.getDOMElement = function () {

		return _domElement;

	};

	this.setPosition = function ( x, y ) {

		_domElement.style.left = x + 'px';
		_domElement.style.top = y + 'px';

	};

	this.setSize = function ( width, height ) {

		_domElement.style.width = width + 'px';
		_domElement.style.height = height + 'px';

	};

};
