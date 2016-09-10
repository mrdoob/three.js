import { Texture } from './Texture';
import { Image } from '../resouces/Image';

function ImageTexture(image, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding)
{
	if(typeof image === "string")
	{
		this.img = new Image(image);
	}
	else
	{
		this.img = image;
	}

	THREE.ImageTexture.call(this, document.createElement("img"), mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding);

	var texture = this;
	this.disposed = false;

	this.name = "texture";
	this.category = "Image";

	this.image.src = this.img.data;
	this.image.onload = function()
	{
		texture.needsUpdate = true;
	}

	if(this.img.encoding === "gif")
	{
		function update()
		{
			if(!texture.disposed)
			{
				texture.needsUpdate = true;
				requestAnimationFrame(update);
			}
		};
		update();
	}
}

ImageTexture.prototype = Object.create(THREE.ImageTexture.prototype);

ImageTexture.prototype.dispose = function()
{	
	THREE.ImageTexture.prototype.dispose.call(this);

	this.disposed = true;
}

ImageTexture.prototype.toJSON = function(meta)
{
	var data = THREE.ImageTexture.prototype.toJSON.call(this, meta);
	var image = this.img.toJSON(meta);

	data.image = image.uuid;

	return data;
}