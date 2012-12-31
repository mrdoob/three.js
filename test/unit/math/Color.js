module( "Color" );

test( "constructor", function(){
    var c = new THREE.Color();
    ok( c.r, "Red: " + c.r );
    ok( c.g, "Green: " + c.g );
    ok( c.b, "Blue: " + c.g );
});

test( "copy", function(){
    var c = new THREE.Color();
    var c2 = new THREE.Color('red');
    c.copy(c2);
    ok( c.r == 1, "Red c: " + c.r + " Red c2: " + c2.r);
    ok( c.g == 0, "Green c: " + c.g + " Green c2: " + c2.g);
    ok( c.b == 0, "Blue c: " + c.g + " Blue c2: " + c2.b);
});

test( "setRGB", function(){
    var c = new THREE.Color()
    c.setRGB(0, 1, 1);
    ok( c.r == 0, "Red: " + c.r );
    ok( c.g == 1, "Green: " + c.g );
    ok( c.b == 1, "Blue: " + c.b );
});

test( "copyGammaToLinear", function(){
    var c = new THREE.Color();
    var c2 = new THREE.Color();
    c2.setRGB(2, 2, 2)
    c.copyGammaToLinear(c2)
    ok( c.r == 4, "Red c: " + c.r + " Red c2: " + c2.r);
    ok( c.g == 4, "Green c: " + c.g + " Green c2: " + c2.g);
    ok( c.b == 4, "Blue c: " + c.g + " Blue c2: " + c2.b);
});

test( "copyLinearToGamma", function(){
    var c = new THREE.Color();
    var c2 = new THREE.Color();
    c2.setRGB(4, 4, 4)
    c.copyLinearToGamma(c2)
    ok( c.r == 2, "Red c: " + c.r + " Red c2: " + c2.r);
    ok( c.g == 2, "Green c: " + c.g + " Green c2: " + c2.g);
    ok( c.b == 2, "Blue c: " + c.g + " Blue c2: " + c2.b);
});


test( "convertGammaToLinear", function(){
    var c = new THREE.Color();
    c.setRGB(2, 2, 2)
    c.convertGammaToLinear()
    ok( c.r == 4, "Red: " + c.r );
    ok( c.g == 4, "Green: " + c.g );
    ok( c.b == 4, "Blue: " + c.b );
});


test( "convertLinearToGamma", function(){
    var c = new THREE.Color();
    c.setRGB(4, 4, 4)
    c.convertLinearToGamma()
    ok( c.r == 2, "Red: " + c.r );
    ok( c.g == 2, "Green: " + c.g );
    ok( c.b == 2, "Blue: " + c.b );
});

test("setWithNum", function(){
    var c = new THREE.Color();
    c.set(0xFF0000);
    ok( c.r == 1, "Red: " + c.r );
    ok( c.g == 0, "Green: " + c.g );
    ok( c.b == 0, "Blue: " + c.b );
});


test( "setWithString", function(){
    var c = new THREE.Color();
    c.set('red');
    ok( c.r == 1, "Red: " + c.r );
    ok( c.g == 0, "Green: " + c.g );
    ok( c.b == 0, "Blue: " + c.b );
});


test( "clone", function(){
    var c = new THREE.Color('red');
    var c2 = c.clone();
    ok( c2.r == 1, "Red c: " + c.r + " Red c2: " + c2.r);
    ok( c2.g == 0, "Green c: " + c.g + " Green c2: " + c2.g);
    ok( c2.b == 0, "Blue c: " + c.g + " Blue c2: " + c2.b);
});

test( "lerpSelf", function(){
    var c = new THREE.Color();
    var c2 = new THREE.Color();
    c.setRGB(0, 0, 0);
    c.lerpSelf(c2, 2);
    ok( c.r == 2, "Red: " + c.r );
    ok( c.g == 2, "Green: " + c.g );
    ok( c.b == 2, "Blue: " + c.b );
    
});


test( "setStyleRGBRed", function(){
    var c = new THREE.Color();
    c.setStyle('rgb(255,0,0)');
    ok( c.r == 1, "Red: " + c.r );
    ok( c.g == 0, "Green: " + c.g );
    ok( c.b == 0, "Blue: " + c.b );
});

test( "setStyleRGBPercentRed", function(){
    var c = new THREE.Color();
    c.setStyle('rgb(100%,0%,0%)');
    ok( c.r == 1, "Red: " + c.r );
    ok( c.g == 0, "Green: " + c.g );
    ok( c.b == 0, "Blue: " + c.b );
});

test( "setStyleHexRed", function(){
    var c = new THREE.Color();
    c.setStyle('#ff0000');
    ok( c.r == 1, "Red: " + c.r );
    ok( c.g == 0, "Green: " + c.g );
    ok( c.b == 0, "Blue: " + c.b );
});

test( "setStyleHex2Red", function(){
    var c = new THREE.Color();
    c.setStyle('#f00');
    ok( c.r == 1, "Red: " + c.r );
    ok( c.g == 0, "Green: " + c.g );
    ok( c.b == 0, "Blue: " + c.b );
});

test( "setStyleColorName", function(){
    var c = new THREE.Color();
    c.setStyle('red');
    ok( c.r == 1, "Red: " + c.r );
    ok( c.g == 0, "Green: " + c.g );
    ok( c.b == 0, "Blue: " + c.b );
});


test( "getHex", function(){
    var c = new THREE.Color('red');
    var res = c.getHex();
    ok( res == 0xFF0000, "Hex: " + res );
});

test( "setHex", function(){
    var c = new THREE.Color();
    c.setHex(0xFF0000);
    ok( c.r == 1, "Red: " + c.r );
    ok( c.g == 0, "Green: " + c.g );
    ok( c.b == 0, "Blue: " + c.b );
});

test( "getHexString", function(){
    var c = new THREE.Color('red');
    var res = c.getHexString();
    ok( res == 'ff0000', "Hex: " + res );
});

test( "getStyle", function(){
    var c = new THREE.Color('red');    
    var res = c.getStyle();
    ok( res == 'rgb(255,0,0)', "style: " + res );
});

test( "getHSV", function(){
    var c = new THREE.Color('red');    
    var hsv = c.getHSV();

    ok( hsv.h == 0, "hue: " + hsv.h );
    ok( hsv.s == 1, "saturation: " + hsv.s );
    ok( hsv.v == 1, "value: " + hsv.v );
});

test( "setHSV", function(){
    var c = new THREE.Color();    
    c.setHSV(0, 1, 1);
    var hsv = c.getHSV();
    ok( hsv.h == 0, "hue: " + hsv.h );
    ok( hsv.s == 1, "saturation: " + hsv.s );
    ok( hsv.v == 1, "value: " + hsv.v );
});

// xxx todo more hsv tests

