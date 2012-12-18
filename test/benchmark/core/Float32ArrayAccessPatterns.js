
var array = new Float32Array( 10000 * 3 );

for( var j = 0, jl = array.length; j < jl; j ++ ) {
	array[j] = j;
}

var vectorArray = [];

for( var j = 0, jl = array.length/3; j < jl; j ++ ) {
	vectorArray.push( new THREE.Vector3( j*3, j*3+1, j*3+2 ) );
}

var Float32ArrayCopyTest = function( array ) {
	var x, y, z;
	for (var i = 0, il = array.length / 3; i < il; i += 3) {
	  x = array[i + 0];
	  y = array[i + 1];
	  z = array[i + 2];
	  x *= 1.01;
	  y *= 1.03;
	  z *= 0.98;
	  array[i + 0] = x;
	  array[i + 1] = y;
	  array[i + 2] = z;
	}
};

var Float32ArrayDirectTest = function( array ) {
	for (var i = 0, il = array.length / 3; i < il; i += 3) {
	  array[i + 0] *= 1.01;
	  array[i + 1] *= 1.03;
	  array[i + 2] *= 0.98;
	}
};


var Float32ArrayVector3CopyTest = function( array ) {
	var value = new THREE.Vector3();
	for (var i = 0, il = array.length / 3; i < il; i += 3) {
	  value.x = array[i + 0];
	  value.y = array[i + 1];
	  value.z = array[i + 2];
	  value.x *= 1.01;
	  value.y *= 1.03;
	  value.z *= 0.98;
	  array[i + 0] = value.x;
	  array[i + 1] = value.y;
	  array[i + 2] = value.z;
	}
};

var Float32ArrayArrayCopyTest = function( array ) {
	var value2 = [0,0,0];
	for (var i = 0, il = array.length / 3; i < il; i += 3) {
	  value2[0] = array[i + 0];
	  value2[1] = array[i + 1];
	  value2[2] = array[i + 2];
	  value2[0] *= 1.01;
	  value2[1] *= 1.03;
	  value2[2] *= 0.98;
	  array[i + 0] = value2[0];
	  array[i + 1] = value2[1];
	  array[i + 2] = value2[2];
	}
};

var Float32ArrayFloat32ArrayCopyTest = function( array ) {
	var value3 = new Float32Array( 3 );
	for (var i = 0, il = array.length / 3; i < il; i += 3) {
	  value3[0] = array[i + 0];
	  value3[1] = array[i + 1];
	  value3[2] = array[i + 2];
	  value3[0] *= 1.01;
	  value3[1] *= 1.03;
	  value3[2] *= 0.98;
	  array[i + 0] = value3[0];
	  array[i + 1] = value3[1];
	  array[i + 2] = value3[2];
	}
};


var Vector3ArrayVector3CopyTest = function( array ) {
	var value = new THREE.Vector3();
	for (var i = 0, il = vectorArray.length; i < il; i ++ ) {
	  value.copy( vectorArray[i] );
	  value.x *= 1.01;
	  value.y *= 1.03;
	  value.z *= 0.98;
	  vectorArray[i].copy( value );
	}
};

var Vector3ArrayVector3RefTest = function( array ) {
	for (var i = 0, il = vectorArray.length; i < il; i ++ ) {
	  var value = vectorArray[i];
	  value.x *= 1.01;
	  value.y *= 1.03;
	  value.z *= 0.98;
	}
};

var Vector3ArrayVector3DirectTest = function( array ) {
	for (var i = 0, il = vectorArray.length; i < il; i ++ ) {
	  vectorArray[i].x *= 1.01;
	  vectorArray[i].y *= 1.03;
	  vectorArray[i].z *= 0.98;
	}
};

var suite = new Benchmark.Suite;

suite.add('Float32ArrayFloat32ArrayCopyTest', function() {
  Float32ArrayFloat32ArrayCopyTest( array );
});

suite.add('Float32DirectArray', function() {
  Float32ArrayDirectTest( array );
});

suite.add('Float32ArrayArrayCopyTest', function() {
  Float32ArrayArrayCopyTest( array );
});

suite.add('Float32CopyArray', function() {
  Float32ArrayCopyTest( array );
});

suite.add('Float32ArrayVector3CopyTest', function() {
  Float32ArrayVector3CopyTest( array );
});

suite.add('Vector3ArrayVector3Ref', function() {
  Vector3ArrayVector3RefTest( array );
});

suite.add('Vector3ArrayVector3Direct', function() {
  Vector3ArrayVector3DirectTest( array );
});

suite.add('Vector3ArrayVector3Copy', function() {
  Vector3ArrayVector3CopyTest( array );
});

suite.on('cycle', function(event, bench) {
  console.log(String(event.target));
});

suite.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  console.log( "Done" );
});

suite.run(true);