module( "Color" );

test( "constructor", function(){
    var c = new THREE.Color();
    ok( c.r, "Red: " + c.r );
    ok( c.g, "Green: " + c.g );
    ok( c.b, "Blue: " + c.g );
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
    var c = new THREE.Color()
    c.setRGB(255, 2, 1);
    ok( c.r == 255, "Red: " + c.r );
    ok( c.g == 2, "Green: " + c.g );
    ok( c.b == 1, "Blue: " + c.b );
});

test( "copyGammaToLinear", function(){
    var c = new THREE.Color();
    var c2 = new THREE.Color();
    c2.setRGB(2, 4, 8)
    c.copyGammaToLinear(c2)
    ok( c.r == 4, "Red c: " + c.r + " Red c2: " + c2.r);
    ok( c.g == 16, "Green c: " + c.g + " Green c2: " + c2.g);
    ok( c.b == 64, "Blue c: " + c.b + " Blue c2: " + c2.b);
});

test( "copyLinearToGamma", function(){
    var c = new THREE.Color();
    var c2 = new THREE.Color();
    c2.setRGB(4, 9, 16)
    c.copyLinearToGamma(c2)
    ok( c.r == 2, "Red c: " + c.r + " Red c2: " + c2.r);
    ok( c.g == 3, "Green c: " + c.g + " Green c2: " + c2.g);
    ok( c.b == 4, "Blue c: " + c.b + " Blue c2: " + c2.b);
});


test( "convertGammaToLinear", function(){
    var c = new THREE.Color();
    c.setRGB(2, 4, 8)
    c.convertGammaToLinear()
    ok( c.r == 4, "Red: " + c.r );
    ok( c.g == 16, "Green: " + c.g );
    ok( c.b == 64, "Blue: " + c.b );
});


test( "convertLinearToGamma", function(){
    var c = new THREE.Color();
    c.setRGB(4, 9, 16)
    c.convertLinearToGamma()
    ok( c.r == 2, "Red: " + c.r );
    ok( c.g == 3, "Green: " + c.g );
    ok( c.b == 4, "Blue: " + c.b );
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
    c.lerp(c2, 2);
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

test( "setStyleRGBPercent", function(){
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

test( "getHSV", function(){
    var c = new THREE.Color('maroon');    
    var hsv = c.getHSV();

    ok( hsv.h == 0, "hue: " + hsv.h );
    ok( hsv.s == 1, "saturation: " + hsv.s );
    ok( (Math.round(parseFloat(hsv.v)*100)/100) == 0.5, 
	"value: " + hsv.v );
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

