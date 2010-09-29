THREE.SelectableFace3 =  function ( a, b, c, normal, color, onSelect) {
	
	THREE.Face3.call( this, a, b, c, normal, color );
	
	this.selectable = true;
	this.onSelect = onSelect;
};

THREE.SelectableFace3.prototype = new THREE.Face3();
THREE.SelectableFace3.prototype.constructor = THREE.SelectableFace3;