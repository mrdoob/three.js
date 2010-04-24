var CanvasRenderer = Renderer.extend
({
	context: null,

	init: function()
	{
		this._super();

		this.viewport = document.createElement("canvas");
		this.viewport.style.position = "absolute";

		this.context = this.viewport.getContext("2d");
	},

	setSize: function( width, height )
	{
		this._super( width, height );

		this.viewport.width = this.width;
		this.viewport.height = this.height;
	},

	render: function( scene, camera )
	{
		this._super( scene, camera );

		var element , pi2 = Math.PI * 2;

		this.context.clearRect (0, 0, this.width, this.height);
		
		for (j = 0; j < this.renderList.length; j++)
		{
			element = this.renderList[j];
			
			if (element.material instanceof ColorMaterial)
			{
				this.context.fillStyle = element.material.color.styleString;
			}
			else if (element.material instanceof FaceColorMaterial)
			{
				this.context.fillStyle = element.color.styleString;
			}
			
			if (element instanceof Face3)
			{
				this.context.beginPath();
				this.context.moveTo(element.a.screen.x + this.widthHalf, element.a.screen.y + this.heightHalf);
				this.context.lineTo(element.b.screen.x + this.widthHalf, element.b.screen.y + this.heightHalf);
				this.context.lineTo(element.c.screen.x + this.widthHalf, element.c.screen.y + this.heightHalf);
				this.context.fill();
				this.context.closePath();
			}
			else if (element instanceof Face4)
			{
				this.context.beginPath();
				this.context.moveTo(element.a.screen.x + this.widthHalf, element.a.screen.y + this.heightHalf);
				this.context.lineTo(element.b.screen.x + this.widthHalf, element.b.screen.y + this.heightHalf);
				this.context.lineTo(element.c.screen.x + this.widthHalf, element.c.screen.y + this.heightHalf);
				this.context.lineTo(element.d.screen.x + this.widthHalf, element.d.screen.y + this.heightHalf);
				this.context.fill();
				this.context.closePath();
			}
			else if (element instanceof Particle)
			{
				this.context.beginPath();
				this.context.arc(element.screen.x + this.widthHalf, element.screen.y + this.heightHalf, element.size * element.screen.z, 0, pi2, true);
				this.context.fill();
				this.context.closePath();				
			}
			
		}
	}
});
