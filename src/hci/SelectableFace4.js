var SelectableFace4 = function ( a, b, c, d, onSelect, normal, color) {
	
	THREE.Face4.call( this, a, b, c, d, normal, color );
	
	this.selectable = true;
	this.onSelect = onSelect;
};

SelectableFace4.prototype = new THREE.Face4();
SelectableFace4.prototype.constructor = SelectableFace4;  
THREE.SelectableFace4 = SelectableFace4;