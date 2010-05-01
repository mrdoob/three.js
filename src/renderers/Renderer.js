var Renderer = Class.extend
({
	matrix: null,

	viewport: null,
	renderList: null,

	face3Pool: null,
	face4Pool: null,

	width: null,
	height: null,
	widthHalf: null,
	heightHalf: null,

	init: function()
	{
		this.matrix = new Matrix4();

		this.face3Pool = new Array();
		this.face4Pool = new Array();
	},

	setSize: function( width, height )
	{
		this.width = width;
		this.height = height;

		this.widthHalf = this.width / 2;
		this.heightHalf = this.height / 2;
	},

	sort: function(a, b)
	{
		return b.screen.z - a.screen.z;
	},

	render: function( scene, camera )
	{
		var vertex, face, object;
		var face3count = 0, face4count = 0;

		this.renderList = new Array();

		for (var i = 0; i < scene.objects.length; i++)
		{
			object = scene.objects[i];

			
			if (object instanceof Mesh)
			{
	
				this.matrix.multiply( camera.matrix, object.matrix );
				
				// vertices

				for (var j = 0; j < object.geometry.vertices.length; j++)
				{
					vertex = object.geometry.vertices[j];

					vertex.screen.copy( vertex );

					this.matrix.transform( vertex.screen );
					camera.projectionMatrix.transform( vertex.screen );

					vertex.visible = vertex.screen.z > 0 && object.screen.z < 1;		
					
					//convert to screen coords
					vertex.screen.x *= this.widthHalf;
					vertex.screen.y *= -this.heightHalf; // can't figure out why it's rendering upside down???
				}

				// faces

				for (j = 0; j < object.geometry.faces.length; j++)
				{
					face = object.geometry.faces[j];

					// TODO: Use normals for culling

					if (face instanceof Face3)
					{
						if (face.a.visible && face.b.visible && face.c.visible && (object.doubleSided ||
						   (face.c.screen.x - face.a.screen.x) * (face.b.screen.y - face.a.screen.y) -
						   (face.c.screen.y - face.a.screen.y) * (face.b.screen.x - face.a.screen.x) > 0) )
						{
							face.screen.z = (face.a.screen.z + face.b.screen.z + face.c.screen.z) * 0.3;

							if (this.face3Pool[face3count] == null)
								this.face3Pool[face3count] = new Face3(new Vertex(), new Vertex(), new Vertex());

							this.face3Pool[face3count].a.screen.copy(face.a.screen);
							this.face3Pool[face3count].b.screen.copy(face.b.screen);
							this.face3Pool[face3count].c.screen.copy(face.c.screen);
							this.face3Pool[face3count].screen.z = face.screen.z;
							this.face3Pool[face3count].color = face.color;
							this.face3Pool[face3count].material = object.material;

							this.renderList.push( this.face3Pool[face3count] );

							face3count++;
						}
					}
					else if (face instanceof Face4)
					{
						if (face.a.visible && face.b.visible && face.c.visible && (object.doubleSided ||
						   ((face.d.screen.x - face.a.screen.x) * (face.b.screen.y - face.a.screen.y) -
						   (face.d.screen.y - face.a.screen.y) * (face.b.screen.x - face.a.screen.x) > 0 ||
						   (face.b.screen.x - face.c.screen.x) * (face.d.screen.y - face.c.screen.y) -
						   (face.b.screen.y - face.c.screen.y) * (face.d.screen.x - face.c.screen.x) > 0)) )
						{
							face.screen.z = (face.a.screen.z + face.b.screen.z + face.c.screen.z + face.d.screen.z) * 0.25;

							if (this.face4Pool[face4count] == null)
								this.face4Pool[face4count] = new Face4(new Vertex(), new Vertex(), new Vertex(), new Vertex());

							this.face4Pool[face4count].a.screen.copy(face.a.screen);
							this.face4Pool[face4count].b.screen.copy(face.b.screen);
							this.face4Pool[face4count].c.screen.copy(face.c.screen);
							this.face4Pool[face4count].d.screen.copy(face.d.screen);
							this.face4Pool[face4count].screen.z = face.screen.z;
							this.face4Pool[face4count].color = face.color;
							this.face4Pool[face4count].material = object.material;

							this.renderList.push( this.face4Pool[face4count] );

							face4count++;
						}						
					}
				}
			}
			else if (object instanceof Particle)
			{
				object.screen=object.position.toVector4();
				camera.matrix.transform( object.screen );
				camera.projectionMatrix.transform( object.screen );
				
				var size=object.screen.x/object.screen.w-(object.screen.x+camera.projectionMatrix.n11)/(object.screen.w+camera.projectionMatrix.n14);
				object.zsize=Math.abs(size)*object.size;
				
				object.screen=object.screen.toVector3();
				
				if (object.screen.z > 0 && object.screen.z < 1 
				&& object.screen.x+object.zsize > -1 && object.screen.x-object.zsize < 1
				&& object.screen.y+object.zsize > -1 && object.screen.y-object.zsize < 1){
					object.zsize *= this.widthHalf;
					object.screen.x *= this.widthHalf;
					object.screen.y *= this.heightHalf; 
					this.renderList.push( object );
				}
			}
		}

		this.renderList.sort(this.sort);
	}
});