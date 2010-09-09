THREE.AmbientLight = function(color) {
  
  THREE.Light.call(this, color);

};

THREE.AmbientLight.prototype = new THREE.Light();
THREE.AmbientLight.prototype.constructor = THREE.AmbientLight; 