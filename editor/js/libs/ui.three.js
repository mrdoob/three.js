// Texture

UI.Texture = function () {

    UI.Element.call( this );

	var scope = this;

	var canvas = document.createElement( 'canvas' );
	canvas.width = 64;
	canvas.height = 16;
	canvas.style.cursor = 'pointer';
	canvas.addEventListener( 'click', function ( event ) {

		input.click();

	}, false );

	var context = canvas.getContext( '2d' );
	context.fillStyle = 'black';
	context.fillRect( 0, 0, canvas.width, canvas.height );

	var input = document.createElement( 'input' );
	input.type = 'file';
	input.addEventListener( 'change', function ( event ) {

		var file = event.target.files[ 0 ];

		if ( file.type.match( 'image.*' ) ) {

			var reader = new FileReader();
			reader.addEventListener( 'load', function ( event ) {

				var image = document.createElement( 'img' );
				image.addEventListener( 'load', function( event ) {

					var scale = 64 / this.width;

					context.drawImage( this, 0, 0, this.width * scale, this.height * scale );

					scope.texture = new THREE.Texture( this );
					scope.texture.needsUpdate = true;

					if ( scope.onChangeCallback ) scope.onChangeCallback();

				}, false );

				image.src = event.target.result;

			}, false );

			reader.readAsDataURL( file );

		}

	} );

	this.dom = canvas;
	this.texture = null;
	this.onChangeCallback = null;

	return this;

};

UI.Texture.prototype = Object.create( UI.Element.prototype );

UI.Texture.prototype.textureNameMap = {};

UI.Texture.prototype.getValue = function () {

	return this.texture;

};

UI.Texture.prototype.setValue = function ( value ) {

	this.texture = value;

};

UI.Texture.prototype.onChange = function ( callback ) {

	this.onChangeCallback = callback;

	return this;

};


// CubeTexture

UI.CubeTexture = function () {

	UI.Element.call( this );

	var scope = this;

	var canvas = document.createElement( 'canvas' );
	canvas.width = 64;
	canvas.height = 16;
	canvas.style.cursor = 'pointer';
	canvas.addEventListener( 'click', function ( event ) {

		input.click();

	}, false );

	var context = canvas.getContext( '2d' );
	context.fillStyle = 'black';
	context.fillRect( 0, 0, canvas.width, canvas.height );

	var input = document.createElement( 'input' );
	input.type = 'file';
	input.addEventListener( 'change', function ( event ) {

		var file = event.target.files[ 0 ];

		if ( file.type.match( 'image.*' ) ) {

			var reader = new FileReader();
			reader.addEventListener( 'load', function ( event ) {

				var image = document.createElement( 'img' );
				image.addEventListener( 'load', function( event ) {

					var scale = 64 / this.width;

					context.drawImage( this, 0, 0, this.width * scale, this.height * scale );

					scope.texture = new THREE.Texture( [ this, this, this, this, this, this ], new THREE.CubeReflectionMapping() )
					scope.texture.needsUpdate = true;

					if ( scope.onChangeCallback ) scope.onChangeCallback();

				}, false );
				image.src = event.target.result;

			}, false );
			reader.readAsDataURL( file );

		}

	}, false );

	this.dom = canvas;
	this.texture = null;
	this.onChangeCallback = null;

	return this;

};

UI.CubeTexture.prototype = Object.create( UI.Element.prototype );

UI.CubeTexture.prototype.getValue = function () {

	return this.texture;

};

UI.CubeTexture.prototype.setValue = function ( value ) {

	this.texture = value;

};

UI.CubeTexture.prototype.onChange = function ( callback ) {

	this.onChangeCallback = callback;

	return this;

};
