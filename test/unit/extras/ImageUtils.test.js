QUnit.module( "ImageLoader", {

	beforeEach: function() {

		THREE.Cache.clear();

	}

});


var good_url = '../../examples/textures/sprite.png';
var bad_url = 'url_not_found';


QUnit.test( "test load handler", function( assert ) {

	var done = assert.async();

	THREE.ImageUtils.loadTexture( good_url, undefined, function ( tex ) {

		assert.success( "load handler should be called" );
		assert.ok( tex, "texture is defined" );
		assert.ok( tex.image, "texture.image is defined" );
		done();

	}, function () {

		assert.fail( "error handler should not be called" );
		done();

	});

});


QUnit.test( "test error handler", function( assert ) {

	var done = assert.async();

	THREE.ImageUtils.loadTexture( bad_url, undefined, function () {

		assert.fail( "load handler should not be called" );
		done();

	}, function ( event ) {

		assert.success( "error handler should be called" );
		assert.ok( event.type === 'error', "should have error event" );

		done();

	});

});


QUnit.test( "test cached texture", function( assert ) {

	var done = assert.async();

	var rtex1 = THREE.ImageUtils.loadTexture( good_url, undefined, function ( tex1 ) {

		assert.ok( rtex1.image !== undefined, "texture 1 image is loaded" );
		assert.equal( rtex1, tex1, "texture 1 callback is equal to return" );

		var rtex2 = THREE.ImageUtils.loadTexture( good_url, undefined, function ( tex2 ) {

			assert.ok( rtex2 !== undefined, "cached callback is async" );
			assert.ok( rtex2.image !== undefined, "texture 2 image is loaded" );
			assert.equal( rtex2, tex2, "texture 2 callback is equal to return" );

			done();

		});

		assert.ok( rtex2, "texture 2 return is defined" );

	});

	assert.ok( rtex1, "texture 1 return is defined" );
	assert.ok( rtex1.image === undefined, "texture 1 image is not loaded" );

});

