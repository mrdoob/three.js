(function() {

  var THREE = {};

  THREE.Vector3 = function(x, y, z) {

    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;

  };

  THREE.Vector3.prototype = {
    constructor: THREE.Vector3,
    lengthSq: function() {
      return this.x * this.x + this.y * this.y + this.z * this.z;
    },

    length: function() {
      return Math.sqrt(this.lengthSq());
    },

    length2: function() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

  };

  var a = [];
  for (var i = 0; i < 100000; i++) {
    a[i] = new THREE.Vector3(i * 0.01, i * 2, i * -1.3);
  }


  var suite = Bench.newSuite("Vector 3 Length");

  suite.add('NoCallTest', function() {
    var result = 0;
    for (var i = 0; i < 100000; i++) {
      var v = a[i];
      result += Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }
  });

  suite.add('InlineCallTest', function() {
    var result = 0;
    for (var i = 0; i < 100000; i++) {
      result += a[i].length2();
    }
  });

  suite.add('FunctionCallTest', function() {
    var result = 0;
    for (var i = 0; i < 100000; i++) {
      result += a[i].length();
    }
  });

})();
