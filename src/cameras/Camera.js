var Camera = Vector3.extend
({
	up: null,
	target: null,
	zoom: null,
	focus: null,
	roll: null,

	matrix: null,
	projectionMatrix: null,

	init: function(x, y, z)
	{
		this._super(x, y, z);
		this.up = new Vector3( 0, 1, 0 );
		this.target = new Vector3( 0, 0, 0 );
		
		this.projectionMatrix = Matrix4.makePerspective(45, 1, 0.001, 1000);

		this.matrix = new Matrix4();
		this.updateMatrix();
	},

	updateMatrix: function()
	{
		this.matrix.lookAt( this, this.target, this.up );
	},
	
	setProjectionMatrix: function(matrix)
	{
		this.projectionMatrix=matrix;
	},

	toString: function()
	{
		return 'Camera ( ' + this.x + ', ' + this.y + ', ' + this.z + ' )';
	}
});