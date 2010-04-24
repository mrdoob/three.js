var Mesh = Object3D.extend
({
	geometry: null,
	material: null,
	
	doubleSide: null,

	init: function( geometry, material )
	{
		this._super();
		this.geometry = geometry;
		this.material = material;
	}
});
