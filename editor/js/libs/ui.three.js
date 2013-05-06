// Texture

UI.Texture = function ( position ) {

    UI.Element.call( this );

	var scope = this;

	var image = new Image();
	this.texture = new THREE.Texture( image );

	this.dom = document.createElement( 'input' );
	this.dom.type = 'file';
	this.dom.style.position = position || 'relative';

	this.onChangeCallback = null;

	this.dom.addEventListener( 'change', function ( event ) {

		var file = event.target.files[ 0 ];

		if ( file.type.match( 'image.*' ) ) {

			var reader = new FileReader();
			reader.addEventListener( 'load', function ( event ) {

				var image = document.createElement( 'img' );

				image.addEventListener( 'load', function( event ) {

					scope.texture.image = this;
					scope.texture.needsUpdate = true;

					if ( scope.onChangeCallback ) scope.onChangeCallback();

				}, false );

				image.src = event.target.result;

				// remember the original filename (including extension)
				// this is used for url field in the scene export

				scope.texture.sourceFile = file.name;

				// generate unique name per texture
				// based on source file name

				var chunks = file.name.split( '.' );
				var extension = chunks.pop().toLowerCase();
				var filename = chunks.join( '.' );

				if ( ! ( filename in scope.textureNameMap ) ) {

					scope.textureNameMap[ filename ] = true;
					scope.texture.name = filename;

				} else {

					scope.texture.name = filename + "_" + scope.texture.id;

				}

			}, false );

			reader.readAsDataURL( file );

		}

	}, false );

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

UI.CubeTexture = function ( position ) {

	UI.Element.call( this );

	var scope = this;

	this.texture = new THREE.Texture( [], new THREE.CubeReflectionMapping() );

	this.dom = document.createElement( 'input' );
	this.dom.type = 'file';
	this.dom.style.position = position || 'relative';

	this.onChangeCallback = null;

	this.dom.addEventListener( 'change', function ( event ) {

		var file = event.target.files[ 0 ];

		if ( file.type.match( 'image.*' ) ) {

			var reader = new FileReader();
			reader.addEventListener( 'load', function ( event ) {

				var image = document.createElement( 'img' );
				image.addEventListener( 'load', function( event ) {

					scope.texture.image = [ this, this, this, this, this, this ];
					scope.texture.needsUpdate = true;

					if ( scope.onChangeCallback ) scope.onChangeCallback();

				}, false );
				image.src = event.target.result;

			}, false );
			reader.readAsDataURL( file );

		}

	}, false );

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
