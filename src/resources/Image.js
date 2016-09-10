function Image(url)
{
	this.name = "image";
	this.uuid = _Math.generateUUID();
	this.type = "Image";

	this.format = "";
	this.encoding = ""
	this.data = null;
	
	if(url !== undefined)
	{
		this.encoding = url.split(".").pop().toLowerCase();

		//Gifs migth have animations
		if(this.encoding === "gif")
		{
			var file = new XMLHttpRequest();
			file.open("GET", url, false);
			file.overrideMimeType("text/plain; charset=x-user-defined");
			file.send(null);

			this.data = "data:image/" + this.encoding + ";base64," + Base64Utils.fromBinaryString(file.response);
			this.format = "base64";
		}
		//Requires TGALoader to be bundled with threejs
		/*else if(this.encoding === "tga")
		{
			var file = new XMLHttpRequest();
			file.open("GET", url, false);
			file.overrideMimeType("text/plain; charset=x-user-defined");
			file.send(null);

			var loader = new TGALoader();
			var canvas = loader.parse(ArraybufferUtils.fromBinaryString(file.response));

			this.encoding = "jpeg";
			this.format = "base64";
			this.data = canvas.toDataURL("image/jpeg", 0.8);
		}*/
		else
		{
			this.format = "url";
			this.data = url;
		}
	}
}

Image.prototype.encodeData = function()
{
	var image = document.createElement("img");
	image.src = this.data;

	var canvas = document.createElement("canvas");
	canvas.width = image.width;
	canvas.height = image.height;

	var context = canvas.getContext("2d");
	context.drawImage(image, 0, 0, image.width, image.height);

	var transparent = false;
	var data = context.getImageData(0, 0, image.width, image.height).data;
	for(var i = 3; i < data.length; i += 4)
	{
		if(data[i] !== 255)
		{
			transparent = true;
			break;
		}
	}

	if(transparent)
	{
		this.format = "base64";
		this.encoding = "png";
		this.data = canvas.toDataURL("image/png");
	}
	else
	{
		this.format = "base64";
		this.encoding = "jpeg";
		this.data = canvas.toDataURL("image/jpeg", 0.8);
	}
}

Image.prototype.toJSON = function(meta)
{
	if(meta.images[this.uuid] !== undefined)
	{
		return meta.images[this.uuid];
	}

	if(this.format === "url")
	{
		this.encodeData();
	}

	var data = {};
	data.name = this.name;
	data.uuid = this.uuid;
	data.type = this.type;
	data.encoding = this.encoding;
	data.format = this.format;
	data.data = this.data;

	meta.images[this.uuid] = data;

	return data;
}
