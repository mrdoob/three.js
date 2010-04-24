var Particle = Object3D.extend
({
	size: 1,
	material: null,

	init: function( material )
	{
		this._super();
		this.material = material;
	}
});
