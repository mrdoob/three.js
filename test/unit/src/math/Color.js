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
