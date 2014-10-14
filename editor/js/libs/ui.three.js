/**
 * @author mrdoob / http://mrdoob.com/
 */

UI.Texture = function () {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'span' );

	var input = document.createElement( 'input' );
	input.type = 'file';
	input.addEventListener( 'change', function ( event ) {

		loadFile( event.target.files[ 0 ] );

	} );

	var canvas = document.createElement( 'canvas' );
	canvas.width = 32;
	canvas.height = 16;
	canvas.style.cursor = 'pointer';
	canvas.style.marginRight = '5px';
	canvas.style.border = '1px solid #888';
	canvas.addEventListener( 'click', function ( event ) {

		input.click();

	}, false );
	canvas.addEventListener( 'drop', function ( event ) {

		event.preventDefault();
		event.stopPropagation();
		loadFile( event.dataTransfer.files[ 0 ] );

	}, false );
	dom.appendChild( canvas );

	var name = document.createElement( 'input' );
	name.disabled = true;
	name.style.width = '64px';
	name.style.border = '1px solid #ccc';
	dom.appendChild( name );

	var loadFile = function ( file ) {

		if ( file.type.match( 'image.*' ) ) {

			var reader = new FileReader();
			reader.addEventListener( 'load', function ( event ) {

				var image = document.createElement( 'img' );
				image.addEventListener( 'load', function( event ) {

					var texture = new THREE.Texture( this );
					texture.sourceFile = file.name;
					texture.needsUpdate = true;

					scope.setValue( texture );

					if ( scope.onChangeCallback ) scope.onChangeCallback();

				}, false );

				image.src = event.target.result;

			}, false );

			reader.readAsDataURL( file );

		}

	}

	this.dom = dom;
	this.texture = null;
	this.onChangeCallback = null;

	return this;

};

UI.Texture.prototype = Object.create( UI.Element.prototype );

UI.Texture.prototype.getValue = function () {

	return this.texture;

};

UI.Texture.prototype.setValue = function ( texture ) {

	var canvas = this.dom.children[ 0 ];
	var name = this.dom.children[ 1 ];
	var context = canvas.getContext( '2d' );

	if ( texture !== null ) {

		var image = texture.image;

		if ( image !== undefined && image.width > 0 ) {

			name.value = texture.sourceFile;

			var scale = canvas.width / image.width;
			context.drawImage( image, 0, 0, image.width * scale, image.height * scale );

		} else {

			name.value = texture.sourceFile + ' (error)';
			context.clearRect( 0, 0, canvas.width, canvas.height );

		}

	} else {

		name.value = '';
		context.clearRect( 0, 0, canvas.width, canvas.height );

	}

	this.texture = texture;

};

UI.Texture.prototype.onChange = function ( callback ) {

	this.onChangeCallback = callback;

	return this;

};


//

UI.CubeTexture = function () {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'span' );

	var input = document.createElement( 'input' );
	input.type = 'file';
	input.addEventListener( 'change', function ( event ) {

		loadFile( event.target.files[ 0 ] );

	}, false );

	var canvas = document.createElement( 'canvas' );
	canvas.width = 32;
	canvas.height = 16;
	canvas.style.cursor = 'pointer';
	canvas.style.marginRight = '5px';
	canvas.style.border = '1px solid #888';
	canvas.addEventListener( 'click', function ( event ) {

		input.click();

	}, false );
	canvas.addEventListener( 'drop', function ( event ) {

		event.preventDefault();
		event.stopPropagation();
		loadFile( event.dataTransfer.files[ 0 ] );

	}, false );
	dom.appendChild( canvas );

	var name = document.createElement( 'input' );
	name.disabled = true;
	name.style.width = '64px';
	name.style.border = '1px solid #ccc';
	dom.appendChild( name );

	var loadFile = function ( file ) {

		if ( file.type.match( 'image.*' ) ) {

			var reader = new FileReader();
			reader.addEventListener( 'load', function ( event ) {

				var image = document.createElement( 'img' );
				image.addEventListener( 'load', function( event ) {

					var array = [ this, this, this, this, this, this ];

					var texture = new THREE.Texture( array, new THREE.CubeReflectionMapping() );
					texture.sourceFile = file.name;
					texture.needsUpdate = true;

					scope.setValue( texture );

					if ( scope.onChangeCallback ) scope.onChangeCallback();

				}, false );
				image.src = event.target.result;

			}, false );
			reader.readAsDataURL( file );

		}

	};

	this.dom = dom;
	this.texture = null;
	this.onChangeCallback = null;

	return this;

};

UI.CubeTexture.prototype = Object.create( UI.Element.prototype );

UI.CubeTexture.prototype.getValue = function () {

	return this.texture;

};

UI.CubeTexture.prototype.setValue = function ( texture ) {

	var canvas = this.dom.children[ 0 ];
	var name = this.dom.children[ 1 ];
	var context = canvas.getContext( '2d' );

	if ( texture !== null ) {

		var image = texture.image[ 0 ];

		if ( image !== undefined && image.width > 0 ) {

			name.value = texture.sourceFile;

			var scale = canvas.width / image.width;
			context.drawImage( image, 0, 0, image.width * scale, image.height * scale );

		} else {

			name.value = texture.sourceFile + ' (error)';
			context.clearRect( 0, 0, canvas.width, canvas.height );

		}

	} else {

		name.value = '';
		context.clearRect( 0, 0, canvas.width, canvas.height );

	}

	this.texture = texture;

};

UI.CubeTexture.prototype.onChange = function ( callback ) {

	this.onChangeCallback = callback;

	return this;

};
