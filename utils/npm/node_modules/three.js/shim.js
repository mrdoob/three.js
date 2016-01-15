var THREE = require('three');

console.warn( "WARNING: The 'three.js' npm package is deprecated in favor of the 'three' npm package, please upgrade.");

if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = THREE;
  }
  exports.THREE = THREE;
} else {
  this['THREE'] = THREE;
}
