var Scene = Class.extend
({
	objects: null,

	init: function()
	{
		this.objects = new Array();
	},

	add: function( object )
	{
		this.objects.push( object );
	},

	remove: function( object )
	{
		for(var i = 0; i < this.objects.length; i++)
			if(object == this.objects[i])
				alert("yay");
	},

	toString: function()
	{
		return 'Scene ( ' + this.objects + ' )';
	}
});
