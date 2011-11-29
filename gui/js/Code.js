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

	var _preview = document.createElement( 'a' );
	_preview.href = '#';
	_preview.innerHTML = 'preview';
	_preview.style.margin = '20px 6px 0px 20px';
	_preview.addEventListener( 'click', function () { 

			// Get unescaped code gen

			var temp=document.createElement("pre");
			temp.innerHTML = _codegen( true );
			temp = temp.firstChild.nodeValue;
			temp = temp.replace("js/Three.js", "../build/Three.js");
			temp = temp.replace("js/RequestAnimationFrame.js", "../examples/js/RequestAnimationFrame.js");

			console.log('test', temp);

			var opener = window.open('','myconsole',
			  'width=800,height=400'
			   +',menubar=1'
			   +',toolbar=0'
			   +',status=1'
			   +',scrollbars=1'
			   +',resizable=1');

			opener.document.writeln( temp );
			opener.document.close();

		}, false 
	);
	_domElement.appendChild( _preview );


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

	var _codegen = function (html) {
		var string = '';

		string += [

			'var camera, scene, renderer;',
			'',
			'init();',
			'animate();',
			'',
			'function init() {',
			'',
			'\tcamera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );',
			'\tcamera.position.z = 500;',
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
			'\trenderer.setSize( window.innerWidth, window.innerHeight );',
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

		if ( html ) {

			string = '&lt;!doctype html&gt;\n&lt;html&gt;\n\t&lt;body&gt;\n\t\t&lt;script src=\"js/Three.js\"&gt;&lt;/script&gt;\n\t\t&lt;script src=\"js/RequestAnimationFrame.js\"&gt;&lt;/script&gt;\n\t\t&lt;script&gt;\n' + ( '\n' + string ).replace( /\n/gi, '\n\t\t\t' ) + '\n\n\t\t&lt;/script&gt;\n\t&lt;/body&gt;\n&lt;/html&gt;';

		}

		return string;
	}

	var _update = function () {

		_code.innerHTML = _codegen( _html );

	}

	// signals

	signals.updated.add( function ( scene ) {

		_list.length = 0;

		for ( var i = 0, l = scene.objects.length; i < l; i ++ ) {

			var object = scene.objects[ i ];

			if ( object.geometry == undefined || object.geometry.gui == undefined ) {

				_list.push( 'TODO' );
				continue;

			}

			if ( object instanceof THREE.Mesh ) {

				var string = '';
				string += '\n\tvar geometry = ' + object.geometry.gui.getCode() + ';';
				string += '\n\tvar material = ' + object.material.gui.getCode() + ';';
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
