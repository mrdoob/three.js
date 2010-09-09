THREE.DirectionalLight = function(color, direction) {
  
  THREE.Light.call(this, color);
  
  this.direction = direction || new Vector3(1, 1, 1);
  
  this.direction.normalize();

};

THREE.DirectionalLight.prototype = new THREE.Light();
THREE.DirectionalLight.prototype.constructor = THREE.DirectionalLight; 