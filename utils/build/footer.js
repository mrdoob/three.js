if ( typeof module === "object" && module && typeof module.exports === "object" ) {
	// Register as a node.js export
	module.exports = THREE;
}
if ( typeof define === "function" && define.amd ) {
	// Register as an AMD module.
	define( [], function () { return THREE; } );
}
if ( typeof window === "object" && typeof window.document === "object" ) {
	// Register as a window global
	window.THREE = THREE;
}

})();
