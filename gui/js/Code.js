var Code = function () {

	var _domElement = document.createElement( 'div' );
	_domElement.style.position = 'absolute';
	_domElement.style.backgroundColor = '#f0f0f0';
	_domElement.style.overflow = 'auto';

	//

	var _html = false;

	var _checkbox = document.createElement( 'input' );
	_checkbox.type = 'checkbox';
	_checkbox.style.margin = '20px 6px 0px 20px';
	_checkbox.addEventListener( 'click', function () { _html = !_html; _update(); }, false );
	_domElement.appendChild( _checkbox );

	/*
	var _checkboxText = document.createElement( 'span' );
	_checkboxText.style.fontFamily = 'Monospace';
	_checkboxText.innerText = 'HTML';
	_domElement.appendChild( _checkboxText );
	*/

	//

	var _code = document.createElement( 'pre' );
	_code.style.color = '#404040';
	_code.style.margin = '20px';
	_code.style.fontSize = '13px';
	_code.style.whiteSpace = 'pre'; // 'pre-wrap'
	_domElement.appendChild( _code );

	//

	var _list = [];

	var _update = function () {

		var string = '';

		string += [

			'var camera, scene, renderer;',
			'',
			'init();',
			'animate();',
			'',
			'function init() {',
			'',
			'\tcamera = new THREE.Camera();',
			'',
			'\tscene = new THREE.Scene();',
			''

		].join( '\n' );

		for ( var i = 0, l = _list.length; i < l; i ++ ) {

			string += _list[ i ] + '\n';

		}

		string += [

			'',
			'\trenderer = new THREE.WebGLRenderer()',
			'\tdocument.body.appendChild( renderer.domElement );',
			'',
			'}',
			'',
			'function animate() {',
			'',
			'\trequestAnimationFrame( animate );',
			'\trender();',
			'',
			'}',
			'',
			'function render() {',
			'',
			'\trenderer.render( scene, camera );',
			'',
			'}'

		].join( '\n' );

		if ( _html ) {

			string = '&lt;!doctype html&gt;\n&lt;html&gt;\n\t&lt;body&gt;\n\t\t&lt;script src=\"js/Three.js\"&gt;&lt;/script&gt;\n\t\t&lt;script src=\"js/RequestAnimationFrame.js\"&gt;&lt;/script&gt;\n\t\t&lt;script&gt;\n' + ( '\n' + string ).replace( /\n/gi, '\n\t\t\t' ) + '\n\n\t\t&lt;/script&gt;\n\t&lt;/body&gt;\n&lt;/html&gt;';

		}

		_code.innerHTML = string;

	}

	// signals

	signals.updated.add( function ( scene ) {

		_list.length = 0;

		for ( var i = 0, l = scene.objects.length; i < l; i ++ ) {

			var object = scene.objects[ i ];

			if ( object instanceof THREE.Mesh ) {

				var string = '';
				string += '\n\tvar geometry = ' + object.geometry.gui.getCode() + ';';
				string += '\n\tvar material = ' + object.materials[ 0 ].gui.getCode() + ';';
				string += '\n\tvar mesh = new THREE.Mesh( geometry, material );';

				if ( object.position.x != 0 ) string += '\n\tmesh.position.x = ' + object.position.x + ';';
				if ( object.position.y != 0 ) string += '\n\tmesh.position.y = ' + object.position.y + ';';
				if ( object.position.z != 0 ) string += '\n\tmesh.position.z = ' + object.position.z + ';';

				if ( object.rotation.x != 0 ) string += '\n\tmesh.rotation.x = ' + object.rotation.x + ';';
				if ( object.rotation.y != 0 ) string += '\n\tmesh.rotation.y = ' + object.rotation.y + ';';
				if ( object.rotation.z != 0 ) string += '\n\tmesh.rotation.z = ' + object.rotation.z + ';';

				if ( object.scale.x != 1 ) string += '\n\tmesh.scale.x = ' + object.scale.x + ';';
				if ( object.scale.y != 1 ) string += '\n\tmesh.scale.y = ' + object.scale.y + ';';
				if ( object.scale.z != 1 ) string += '\n\tmesh.scale.z = ' + object.scale.z + ';';

				string += '\n\tscene.addObject( mesh );'; // string += '\n\tscene.add( mesh );';

				_list.push( string );

			}

		}

		_update();

	} );

	//

	this.getDOMElement = function () {

		return _domElement;

	}

	this.setPosition = function ( x, y ) {

		_domElement.style.left = x + 'px';
		_domElement.style.top = y + 'px';

	}

	this.setSize = function ( width, height ) {

		_domElement.style.width = width + 'px';
		_domElement.style.height = height + 'px';

	}

}
