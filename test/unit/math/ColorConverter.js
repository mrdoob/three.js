module( "ColorConverter" );


test( "fromRGB", function(){
    var c1 = new THREE.Color();
    var c2 = new THREE.Color().setRGB( 0, 0.5, 1 );
    THREE.ColorConverter.fromRGB( c1, 0, 0.5, 1 );
    ok( c1.equals( c2 ), "Ok" );
});

test( "fromHex/toHex", function(){
    var c1 = new THREE.Color();
    var c2 = new THREE.Color().setHex( 0x11aaff );
    THREE.ColorConverter.fromHex( c1, 0x11aaff );
    ok( c1.equals( c2 ), "Ok" );
    var hex = THREE.ColorConverter.toHex( c1 );
    ok( hex === 0x11aaff, "Ok" );
});

test( "fromHSV/toHSV", function(){
    var c1 = new THREE.Color();
   var c2 = new THREE.Color().setHSL( 0.25, 0.5, 0.75 );
    var hsv = THREE.ColorConverter.toHSV( c2 );
    THREE.ColorConverter.fromHSV( c1, hsv.h, hsv.s, hsv.v );
    ok( c1.equals( c2 ), "Ok" );
});

test( "fromHSL/toHSL", function(){
    var c1 = new THREE.Color();
    var c2 = new THREE.Color().setHSL( 0.25, 0.5, 0.75 );
    var hsl = THREE.ColorConverter.toHSL( c2 );
    THREE.ColorConverter.fromHSL( c1, hsl.h, hsl.s, hsl.l );
    ok( c1.equals( c2 ), "Ok" );
});

