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
    c.setRGB(0, 1, 2);
    ok( c.r == 0, "Red: " + c.r );
    ok( c.g == 1, "Green: " + c.g );
    ok( c.b == 1, "Blue: " + c.b );
});
