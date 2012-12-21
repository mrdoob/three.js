THREE = {};
    
THREE.Vector3 = function ( x, y, z ) {

    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;

};

THREE.Vector3.prototype = {

    constructor: THREE.Vector3,
    
    length: function () {

            return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

    }
    
};

THREE.Vector3X = function ( x, y, z ) {

    var elements = this.elements = new Float32Array( 3 );
    elements[0] = x || 0;
    elements[1] = y || 1;
    elements[2] = z || 2;

};

THREE.Vector3X.prototype = {

    constructor: THREE.Vector3X,
    
    length: function () {

            return Math.sqrt( this[0] * this[0] + this[1] * this[1] + this[2] * this[2] );

    }
    
};



var suite = new Benchmark.Suite;

suite.add('Vector3-Set', function() {

    var array = [];
    for ( var i = 0; i < 100000; i ++ ) {
        var v = new THREE.Vector3( i, i, i );
        array.push( v );
    }

    var result = 0;
    for ( var i = 0; i < 100000; i ++ ) {
        var v = array[i];
        result += v.length();
    }
});

suite.add('Vector3-Float32Array', function() {

    var array = [];
    for ( var i = 0; i < 100000; i ++ ) {
        var v = new THREE.Vector3X( i, i, i );
        array.push( v );
    }

    var result = 0;
    for ( var i = 0; i < 100000; i ++ ) {
        var v = array[i];
        result += v.length();
    }
});

suite.on('cycle', function(event, bench) {
  console.log(String(event.target));
});

suite.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  console.log( "Done" );
});

suite.run(true);