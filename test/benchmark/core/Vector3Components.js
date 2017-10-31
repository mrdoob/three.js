(function() {

  var s = Bench.newSuite("Vector 3 Components");

  THREE = {};

  THREE.Vector3 = function(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  };

  THREE.Vector3.prototype = {
    constructor: THREE.Vector3,
    setComponent: function(index, value) {
      this[THREE.Vector3.__indexToName[index]] = value;
    },

    getComponent: function(index) {
      return this[THREE.Vector3.__indexToName[index]];
    },

    setComponent2: function(index, value) {
      switch (index) {
        case 0:
          this.x = value;
          break;
        case 1:
          this.y = value;
          break;
        case 2:
          this.z = value;
          break;
        default:
          throw new Error("index is out of range: " + index);
      }
    },

    getComponent2: function(index) {
      switch (index) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        case 2:
          return this.z;
        default:
          throw new Error("index is out of range: " + index);
      }
    },


    getComponent3: function(index) {
      if (index === 0) return this.x;
      if (index === 1) return this.y;
      if (index === 2) return this.z;
      throw new Error("index is out of range: " + index);
    },

    getComponent4: function(index) {
      if (index === 0) return this.x;else if (index === 1) return this.y;else if (index === 2) return this.z;
      else
        throw new Error("index is out of range: " + index);
    }
  };


  THREE.Vector3.__indexToName = {
    0: 'x',
    1: 'y',
    2: 'z'
  };

  var a = [];
  for (var i = 0; i < 100000; i++) {
    a[i] = new THREE.Vector3(i * 0.01, i * 2, i * -1.3);
  }




  s.add('IndexToName', function() {
    var result = 0;
    for (var i = 0; i < 100000; i++) {
      result += a[i].getComponent(i % 3);
    }
  });

  s.add('SwitchStatement', function() {
    var result = 0;
    for (var i = 0; i < 100000; i++) {
      result += a[i].getComponent2(i % 3);
    }
  });

  s.add('IfAndReturnSeries', function() {
    var result = 0;
    for (var i = 0; i < 100000; i++) {
      result += a[i].getComponent3(i % 3);
    }
  });

  s.add('IfReturnElseSeries', function() {
    var result = 0;
    for (var i = 0; i < 100000; i++) {
      result += a[i].getComponent4(i % 3);
    }
  });

})();
