var Vertex = Vector3.extend
({
	u: null, v: null,
	screen: null,
	normal : null,
	visible: null,

	init: function(x, y, z)
	{
		this._super(x, y, z);
		this.screen = new Vector3();
	},

	toString: function()
	{
		return 'Vertex ( ' + this.x + ', ' + this.y + ', ' + this.z + ' )';
	}
});
