QUnit.module( "Color" );

QUnit.test( "constructor" , function( assert ){
    var c = new THREE.Color();
    assert.ok( c.r, "Red: " + c.r );
    assert.ok( c.g, "Green: " + c.g );
    assert.ok( c.b, "Blue: " + c.b );
});

QUnit.test( "rgb constructor", function( assert ){
    var c = new THREE.Color( 1, 1, 1 );
    assert.ok( c.r == 1, "Passed" );
    assert.ok( c.g == 1, "Passed" );
    assert.ok( c.b == 1, "Passed" );
});

QUnit.test( "copyHex" , function( assert ){
    var c = new THREE.Color();
    var c2 = new THREE.Color(0xF5FFFA);
    c.copy(c2);
    assert.ok(c.getHex() == c2.getHex(), "Hex c: " + c.getHex() + " Hex c2: " + c2.getHex());
});

QUnit.test( "copyColorString" , function( assert ){
    var c = new THREE.Color();
    var c2 = new THREE.Color('ivory');
    c.copy(c2);
    assert.ok(c.getHex() == c2.getHex(), "Hex c: " + c.getHex() + " Hex c2: " + c2.getHex());
});

QUnit.test( "setRGB" , function( assert ){
    var c = new THREE.Color();
    c.setRGB(1, 0.2, 0.1);
    assert.ok( c.r == 1, "Red: " + c.r );
    assert.ok( c.g == 0.2, "Green: " + c.g );
    assert.ok( c.b == 0.1, "Blue: " + c.b );
});

QUnit.test( "copyGammaToLinear" , function( assert ){
    var c = new THREE.Color();
    var c2 = new THREE.Color();
    c2.setRGB(0.3, 0.5, 0.9);
    c.copyGammaToLinear(c2);
    assert.ok( c.r == 0.09, "Red c: " + c.r + " Red c2: " + c2.r);
    assert.ok( c.g == 0.25, "Green c: " + c.g + " Green c2: " + c2.g);
    assert.ok( c.b == 0.81, "Blue c: " + c.b + " Blue c2: " + c2.b);
});

QUnit.test( "copyLinearToGamma" , function( assert ){
    var c = new THREE.Color();
    var c2 = new THREE.Color();
    c2.setRGB(0.09, 0.25, 0.81);
    c.copyLinearToGamma(c2);
    assert.ok( c.r == 0.3, "Red c: " + c.r + " Red c2: " + c2.r);
    assert.ok( c.g == 0.5, "Green c: " + c.g + " Green c2: " + c2.g);
    assert.ok( c.b == 0.9, "Blue c: " + c.b + " Blue c2: " + c2.b);
});


QUnit.test( "convertGammaToLinear" , function( assert ){
    var c = new THREE.Color();
    c.setRGB(0.3, 0.5, 0.9);
    c.convertGammaToLinear();
    assert.ok( c.r == 0.09, "Red: " + c.r );
    assert.ok( c.g == 0.25, "Green: " + c.g );
    assert.ok( c.b == 0.81, "Blue: " + c.b );
});


QUnit.test( "convertLinearToGamma" , function( assert ){
    var c = new THREE.Color();
    c.setRGB(4, 9, 16);
    c.convertLinearToGamma();
    assert.ok( c.r == 2, "Red: " + c.r );
    assert.ok( c.g == 3, "Green: " + c.g );
    assert.ok( c.b == 4, "Blue: " + c.b );
});

QUnit.test("setWithNum", function( assert ){
    var c = new THREE.Color();
    c.set(0xFF0000);
    assert.ok( c.r == 1, "Red: " + c.r );
    assert.ok( c.g === 0, "Green: " + c.g );
    assert.ok( c.b === 0, "Blue: " + c.b );
});


QUnit.test( "setWithString" , function( assert ){
    var c = new THREE.Color();
    c.set('silver');
    assert.ok(c.getHex() == 0xC0C0C0, "Hex c: " + c.getHex());
});


QUnit.test( "clone" , function( assert ){
    var c = new THREE.Color('teal');
    var c2 = c.clone();
    assert.ok(c2.getHex() == 0x008080, "Hex c2: " + c2.getHex());
});

QUnit.test( "lerp" , function( assert ){
    var c = new THREE.Color();
    var c2 = new THREE.Color();
    c.setRGB(0, 0, 0);
    c.lerp(c2, 0.2);
    assert.ok( c.r == 0.2, "Red: " + c.r );
    assert.ok( c.g == 0.2, "Green: " + c.g );
    assert.ok( c.b == 0.2, "Blue: " + c.b );
    
});


QUnit.test( "setStyleRGBRed" , function( assert ){
    var c = new THREE.Color();
    c.setStyle('rgb(255,0,0)');
    assert.ok( c.r == 1, "Red: " + c.r );
    assert.ok( c.g === 0, "Green: " + c.g );
    assert.ok( c.b === 0, "Blue: " + c.b );
});

QUnit.test( "setStyleRGBARed" , function( assert ){
    var c = new THREE.Color();
    c.setStyle('rgba(255,0,0,0.5)');
    assert.ok( c.r == 1, "Red: " + c.r );
    assert.ok( c.g === 0, "Green: " + c.g );
    assert.ok( c.b === 0, "Blue: " + c.b );
});

QUnit.test( "setStyleRGBRedWithSpaces" , function( assert ){
    var c = new THREE.Color();
    c.setStyle('rgb( 255 , 0,   0 )');
    assert.ok( c.r == 1, "Red: " + c.r );
    assert.ok( c.g === 0, "Green: " + c.g );
    assert.ok( c.b === 0, "Blue: " + c.b );
});

QUnit.test( "setStyleRGBARedWithSpaces" , function( assert ){
    var c = new THREE.Color();
    c.setStyle('rgba( 255,  0,  0  , 1 )');
    assert.ok( c.r == 1, "Red: " + c.r );
    assert.ok( c.g === 0, "Green: " + c.g );
    assert.ok( c.b === 0, "Blue: " + c.b );
});

QUnit.test( "setStyleRGBPercent" , function( assert ){
    var c = new THREE.Color();
    c.setStyle('rgb(100%,50%,10%)');
    assert.ok( c.r == 1, "Red: " + c.r );
    assert.ok( c.g == 0.5, "Green: " + c.g );
    assert.ok( c.b == 0.1, "Blue: " + c.b );
});

QUnit.test( "setStyleRGBAPercent" , function( assert ){
    var c = new THREE.Color();
    c.setStyle('rgba(100%,50%,10%, 0.5)');
    assert.ok( c.r == 1, "Red: " + c.r );
    assert.ok( c.g == 0.5, "Green: " + c.g );
    assert.ok( c.b == 0.1, "Blue: " + c.b );
});

QUnit.test( "setStyleRGBPercentWithSpaces" , function( assert ){
    var c = new THREE.Color();
    c.setStyle('rgb( 100% ,50%  , 10% )');
    assert.ok( c.r == 1, "Red: " + c.r );
    assert.ok( c.g == 0.5, "Green: " + c.g );
    assert.ok( c.b == 0.1, "Blue: " + c.b );
});

QUnit.test( "setStyleRGBAPercentWithSpaces" , function( assert ){
    var c = new THREE.Color();
    c.setStyle('rgba( 100% ,50%  ,  10%, 0.5 )');
    assert.ok( c.r == 1, "Red: " + c.r );
    assert.ok( c.g == 0.5, "Green: " + c.g );
    assert.ok( c.b == 0.1, "Blue: " + c.b );
});

QUnit.test( "setStyleHSLRed" , function( assert ){
    var c = new THREE.Color();
    c.setStyle('hsl(360,100%,50%)');
    assert.ok( c.r == 1, "Red: " + c.r );
    assert.ok( c.g === 0, "Green: " + c.g );
    assert.ok( c.b === 0, "Blue: " + c.b );
});

QUnit.test( "setStyleHSLARed" , function( assert ){
    var c = new THREE.Color();
    c.setStyle('hsla(360,100%,50%,0.5)');
    assert.ok( c.r == 1, "Red: " + c.r );
    assert.ok( c.g === 0, "Green: " + c.g );
    assert.ok( c.b === 0, "Blue: " + c.b );
});

QUnit.test( "setStyleHSLRedWithSpaces" , function( assert ){
    var c = new THREE.Color();
    c.setStyle('hsl(360,  100% , 50% )');
    assert.ok( c.r == 1, "Red: " + c.r );
    assert.ok( c.g === 0, "Green: " + c.g );
    assert.ok( c.b === 0, "Blue: " + c.b );
});

QUnit.test( "setStyleHSLARedWithSpaces" , function( assert ){
    var c = new THREE.Color();
    c.setStyle('hsla( 360,  100% , 50%,  0.5 )');
    assert.ok( c.r == 1, "Red: " + c.r );
    assert.ok( c.g === 0, "Green: " + c.g );
    assert.ok( c.b === 0, "Blue: " + c.b );
});

QUnit.test( "setStyleHexSkyBlue" , function( assert ){
    var c = new THREE.Color();
    c.setStyle('#87CEEB');
    assert.ok(c.getHex() == 0x87CEEB, "Hex c: " + c.getHex());
});

QUnit.test( "setStyleHexSkyBlueMixed" , function( assert ){
    var c = new THREE.Color();
    c.setStyle('#87cEeB');
    assert.ok(c.getHex() == 0x87CEEB, "Hex c: " + c.getHex());
});

QUnit.test( "setStyleHex2Olive" , function( assert ){
    var c = new THREE.Color();
    c.setStyle('#F00');
    assert.ok(c.getHex() == 0xFF0000, "Hex c: " + c.getHex());
});

QUnit.test( "setStyleHex2OliveMixed" , function( assert ){
    var c = new THREE.Color();
    c.setStyle('#f00');
    assert.ok(c.getHex() == 0xFF0000, "Hex c: " + c.getHex());
});

QUnit.test( "setStyleColorName" , function( assert ){
    var c = new THREE.Color();
    c.setStyle('powderblue');
    assert.ok(c.getHex() == 0xB0E0E6, "Hex c: " + c.getHex());
});

QUnit.test( "getHex" , function( assert ){
    var c = new THREE.Color('red');
    var res = c.getHex();
    assert.ok( res == 0xFF0000, "Hex: " + res );
});

QUnit.test( "setHex" , function( assert ){
    var c = new THREE.Color();
    c.setHex(0xFA8072);
    assert.ok( c.getHex() == 0xFA8072, "Hex: " + c.getHex());
});

QUnit.test( "getHexString" , function( assert ){
    var c = new THREE.Color('tomato');
    var res = c.getHexString();
    assert.ok( res == 'ff6347', "Hex: " + res );
});

QUnit.test( "getStyle" , function( assert ){
    var c = new THREE.Color('plum');
    var res = c.getStyle();
    assert.ok( res == 'rgb(221,160,221)', "style: " + res );
});

QUnit.test( "getHSL", function ( assert ) {
    var c = new THREE.Color( 0x80ffff );
    var hsl = c.getHSL();

    assert.ok( hsl.h == 0.5, "hue: " + hsl.h );
    assert.ok( hsl.s == 1.0, "saturation: " + hsl.s );
    assert.ok( (Math.round(parseFloat(hsl.l)*100)/100) == 0.75, "lightness: " + hsl.l );
});

QUnit.test( "setHSL", function ( assert ) {
    var c = new THREE.Color();
    c.setHSL(0.75, 1.0, 0.25);
    var hsl = c.getHSL();

    assert.ok( hsl.h == 0.75, "hue: " + hsl.h );
    assert.ok( hsl.s == 1.00, "saturation: " + hsl.s );
    assert.ok( hsl.l == 0.25, "lightness: " + hsl.l );
});

QUnit.test( "set", function ( assert ) {

	var a = new THREE.Color();
	var b = new THREE.Color( 0.5, 0, 0 );
	var c = new THREE.Color( 0xFF0000 );
	var d = new THREE.Color( 0, 1.0, 0 );

	a.set( b );
	assert.ok( a.equals( b ), "Set with THREE.Color instance" );

	a.set( 0xFF0000 );
	assert.ok( a.equals( c ), "Set with number" );

	a.set( "rgb(0,255,0)" );
	assert.ok( a.equals( d ), "Set with style" );

} );

QUnit.test( "offsetHSL", function ( assert ) {

	var a = new THREE.Color( "hsl(120,50%,50%)" );
	var b = new THREE.Color( 0.36, 0.84, 0.648 );

	a.offsetHSL( 0.1, 0.1, 0.1 );

	assert.ok( Math.abs( a.r - b.r ) <= eps, "Check r" );
	assert.ok( Math.abs( a.g - b.g ) <= eps, "Check g" );
	assert.ok( Math.abs( a.b - b.b ) <= eps, "Check b" );

} );

QUnit.test( "add", function ( assert ) {

	var a = new THREE.Color( 0x0000FF );
	var b = new THREE.Color( 0xFF0000 );
	var c = new THREE.Color( 0xFF00FF );

	a.add( b );

	assert.ok( a.equals( c ), "Check new value" );

} );

QUnit.test( "addScalar", function ( assert ) {

	var a = new THREE.Color( 0.1, 0.0, 0.0 );
	var b = new THREE.Color( 0.6, 0.5, 0.5 );

	a.addScalar( 0.5 );

	assert.ok( a.equals( b ), "Check new value" );

} );

QUnit.test( "sub", function ( assert ) {

	var a = new THREE.Color( 0x0000CC );
	var b = new THREE.Color( 0xFF0000 );
	var c = new THREE.Color( 0x0000AA );

	a.sub( b );
	assert.strictEqual( a.getHex(), 0xCC, "Difference too large" );

	a.sub( c );
	assert.strictEqual( a.getHex(), 0x22, "Difference fine" );

} );

QUnit.test( "multiply", function ( assert ) {

	var a = new THREE.Color( 1, 0, 0.5 );
	var b = new THREE.Color( 0.5, 1, 0.5 );
	var c = new THREE.Color( 0.5, 0, 0.25 );

	a.multiply( b );
	assert.ok( a.equals( c ), "Check new value" );

} );

QUnit.test( "multiplyScalar", function ( assert ) {

	var a = new THREE.Color( 0.25, 0, 0.5 );
	var b = new THREE.Color( 0.5, 0, 1 );

	a.multiplyScalar( 2 );
	assert.ok( a.equals( b ), "Check new value" );

} );

QUnit.test( "equals", function ( assert ) {

	var a = new THREE.Color( 0.5, 0.0, 1.0 );
	var b = new THREE.Color( 0.5, 1.0, 0.0 );

	assert.strictEqual( a.r, b.r, "Components: r is equal" );
	assert.notStrictEqual( a.g, b.g, "Components: g is not equal" );
	assert.notStrictEqual( a.b, b.b, "Components: b is not equal" );

	assert.notOk( a.equals( b ), "equals(): a not equal b" );
	assert.notOk( b.equals( a ), "equals(): b not equal a" );

	a.copy( b );
	assert.strictEqual( a.r, b.r, "Components after copy(): r is equal" );
	assert.strictEqual( a.g, b.g, "Components after copy(): g is equal" );
	assert.strictEqual( a.b, b.b, "Components after copy(): b is equal" );

	assert.ok( a.equals( b ), "equals() after copy(): a equals b" );
	assert.ok( b.equals( a ), "equals() after copy(): b equals a" );

} );

QUnit.test( "fromArray", function ( assert ) {

	var a = new THREE.Color();
	var array = [ 0.5, 0.6, 0.7, 0, 1, 0 ];

	a.fromArray( array );
	assert.strictEqual( a.r, 0.5, "No offset: check r" );
	assert.strictEqual( a.g, 0.6, "No offset: check g" );
	assert.strictEqual( a.b, 0.7, "No offset: check b" );

	a.fromArray( array, 3 );
	assert.strictEqual( a.r, 0, "With offset: check r" );
	assert.strictEqual( a.g, 1, "With offset: check g" );
	assert.strictEqual( a.b, 0, "With offset: check b" );

} );

QUnit.test( "toArray", function ( assert ) {

	var r = 0.5, g = 1.0, b = 0.0;
	var a = new THREE.Color( r, g, b );

	var array = a.toArray();
	assert.strictEqual( array[ 0 ], r, "No array, no offset: check r" );
	assert.strictEqual( array[ 1 ], g, "No array, no offset: check g" );
	assert.strictEqual( array[ 2 ], b, "No array, no offset: check b" );

	array = [];
	a.toArray( array );
	assert.strictEqual( array[ 0 ], r, "With array, no offset: check r" );
	assert.strictEqual( array[ 1 ], g, "With array, no offset: check g" );
	assert.strictEqual( array[ 2 ], b, "With array, no offset: check b" );

	array = [];
	a.toArray( array, 1 );
	assert.strictEqual( array[ 0 ], undefined, "With array and offset: check [0]" );
	assert.strictEqual( array[ 1 ], r, "With array and offset: check r" );
	assert.strictEqual( array[ 2 ], g, "With array and offset: check g" );
	assert.strictEqual( array[ 3 ], b, "With array and offset: check b" );

} );

QUnit.test( "toJSON", function ( assert ) {

	var a = new THREE.Color( 0.0, 0.0, 0.0 );
	var b = new THREE.Color( 0.0, 0.5, 0.0 );
	var c = new THREE.Color( 1.0, 0.0, 0.0 );
	var d = new THREE.Color( 1.0, 1.0, 1.0 );

	assert.strictEqual( a.toJSON(), 0x000000, "Check black" );
	assert.strictEqual( b.toJSON(), 0x007F00, "Check half-blue" );
	assert.strictEqual( c.toJSON(), 0xFF0000, "Check red" );
	assert.strictEqual( d.toJSON(), 0xFFFFFF, "Check white" );

} );
