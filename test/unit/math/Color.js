module( "Color" );

test( "constructor", function(){
    var c = new THREE.Color();
    ok( c.r, "Red: " + c.r );
    ok( c.g, "Green: " + c.g );
    ok( c.b, "Blue: " + c.b );
});

test( "rgb constructor", function(){
    var c = new THREE.Color( 1, 1, 1 );
    ok( c.r == 1, "Passed" );
    ok( c.g == 1, "Passed" );
    ok( c.b == 1, "Passed" );
});

test( "copyHex", function(){
    var c = new THREE.Color();
    var c2 = new THREE.Color(0xF5FFFA);
    c.copy(c2);
    ok(c.getHex() == c2.getHex(), "Hex c: " + c.getHex() + " Hex c2: " + c2.getHex());
});

test( "copyColorString", function(){
    var c = new THREE.Color();
    var c2 = new THREE.Color('ivory');
    c.copy(c2);
    ok(c.getHex() == c2.getHex(), "Hex c: " + c.getHex() + " Hex c2: " + c2.getHex());
});

test( "setRGB", function(){
    var c = new THREE.Color();
    c.setRGB(1, 0.2, 0.1);
    ok( c.r == 1, "Red: " + c.r );
    ok( c.g == 0.2, "Green: " + c.g );
    ok( c.b == 0.1, "Blue: " + c.b );
});

test( "copyGammaToLinear", function(){
    var c = new THREE.Color();
    var c2 = new THREE.Color();
    c2.setRGB(0.3, 0.5, 0.9);
    c.copyGammaToLinear(c2);
    ok( c.r == 0.09, "Red c: " + c.r + " Red c2: " + c2.r);
    ok( c.g == 0.25, "Green c: " + c.g + " Green c2: " + c2.g);
    ok( c.b == 0.81, "Blue c: " + c.b + " Blue c2: " + c2.b);
});

test( "copyLinearToGamma", function(){
    var c = new THREE.Color();
    var c2 = new THREE.Color();
    c2.setRGB(0.09, 0.25, 0.81);
    c.copyLinearToGamma(c2);
    ok( c.r == 0.3, "Red c: " + c.r + " Red c2: " + c2.r);
    ok( c.g == 0.5, "Green c: " + c.g + " Green c2: " + c2.g);
    ok( c.b == 0.9, "Blue c: " + c.b + " Blue c2: " + c2.b);
});


test( "convertGammaToLinear", function(){
    var c = new THREE.Color();
    c.setRGB(0.3, 0.5, 0.9);
    c.convertGammaToLinear();
    ok( c.r == 0.09, "Red: " + c.r );
    ok( c.g == 0.25, "Green: " + c.g );
    ok( c.b == 0.81, "Blue: " + c.b );
});


test( "convertLinearToGamma", function(){
    var c = new THREE.Color();
    c.setRGB(4, 9, 16);
    c.convertLinearToGamma();
    ok( c.r == 2, "Red: " + c.r );
    ok( c.g == 3, "Green: " + c.g );
    ok( c.b == 4, "Blue: " + c.b );
});

test("setWithNum", function(){
    var c = new THREE.Color();
    c.set(0xFF0000);
    ok( c.r == 1, "Red: " + c.r );
    ok( c.g === 0, "Green: " + c.g );
    ok( c.b === 0, "Blue: " + c.b );
});


test( "setWithString", function(){
    var c = new THREE.Color();
    c.set('silver');
    ok(c.getHex() == 0xC0C0C0, "Hex c: " + c.getHex());
});


test( "clone", function(){
    var c = new THREE.Color('teal');
    var c2 = c.clone();
    ok(c2.getHex() == 0x008080, "Hex c2: " + c2.getHex());
});

test( "lerp", function(){
    var c = new THREE.Color();
    var c2 = new THREE.Color();
    c.setRGB(0, 0, 0);
    c.lerp(c2, 0.2);
    ok( c.r == 0.2, "Red: " + c.r );
    ok( c.g == 0.2, "Green: " + c.g );
    ok( c.b == 0.2, "Blue: " + c.b );
    
});


test( "setStyleRGBRed", function(){
    var c = new THREE.Color();
    c.setStyle('rgb(255,0,0)');
    ok( c.r == 1, "Red: " + c.r );
    ok( c.g === 0, "Green: " + c.g );
    ok( c.b === 0, "Blue: " + c.b );
});

test( "setStyleRGBRedWithSpaces", function(){
    var c = new THREE.Color();
    c.setStyle('rgb(255, 0, 0)');
    ok( c.r == 1, "Red: " + c.r );
    ok( c.g === 0, "Green: " + c.g );
    ok( c.b === 0, "Blue: " + c.b );
});

test( "setStyleRGBPercent", function(){
    var c = new THREE.Color();
    c.setStyle('rgb(100%,50%,10%)');
    ok( c.r == 1, "Red: " + c.r );
    ok( c.g == 0.5, "Green: " + c.g );
    ok( c.b == 0.1, "Blue: " + c.b );
});

test( "setStyleRGBPercentWithSpaces", function(){
    var c = new THREE.Color();
    c.setStyle('rgb(100%,50%,10%)');
    ok( c.r == 1, "Red: " + c.r );
    ok( c.g == 0.5, "Green: " + c.g );
    ok( c.b == 0.1, "Blue: " + c.b );
});

test( "setStyleHexSkyBlue", function(){
    var c = new THREE.Color();
    c.setStyle('#87CEEB');
    ok(c.getHex() == 0x87CEEB, "Hex c: " + c.getHex());
});

test( "setStyleHex2Olive", function(){
    var c = new THREE.Color();
    c.setStyle('#F00');
    ok(c.getHex() == 0xFF0000, "Hex c: " + c.getHex());
});

test( "setStyleColorName", function(){
    var c = new THREE.Color();
    c.setStyle('powderblue');
    ok(c.getHex() == 0xB0E0E6, "Hex c: " + c.getHex());
});


test( "getHex", function(){
    var c = new THREE.Color('red');
    var res = c.getHex();
    ok( res == 0xFF0000, "Hex: " + res );
});

test( "setHex", function(){
    var c = new THREE.Color();
    c.setHex(0xFA8072);
    ok( c.getHex() == 0xFA8072, "Hex: " + c.getHex());
});

test( "getHexString", function(){
    var c = new THREE.Color('tomato');
    var res = c.getHexString();
    ok( res == 'ff6347', "Hex: " + res );
});

test( "getStyle", function(){
    var c = new THREE.Color('plum');
    var res = c.getStyle();
    ok( res == 'rgb(221,160,221)', "style: " + res );
});

test( "getHSL", function () {
    var c = new THREE.Color( 0x80ffff );
    var hsl = c.getHSL();

    ok( hsl.h == 0.5, "hue: " + hsl.h );
    ok( hsl.s == 1.0, "saturation: " + hsl.s );
    ok( (Math.round(parseFloat(hsl.l)*100)/100) == 0.75, "lightness: " + hsl.l );
});

test( "setHSL", function () {
    var c = new THREE.Color();
    c.setHSL(0.75, 1.0, 0.25);
    var hsl = c.getHSL();

    ok( hsl.h == 0.75, "hue: " + hsl.h );
    ok( hsl.s == 1.00, "saturation: " + hsl.s );
    ok( hsl.l == 0.25, "lightness: " + hsl.l );
});
