import { Texture } from './Texture';
import { Video } from '../resouces/Video';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function VideoTexture(video, mapping, wrapS, wrapT, type, anisotropy)
{
	if(typeof video === "string")
	{
		this.video = new Video(video);
	}
	else if(video instanceof Video)
	{
		this.video = video;
	}

	THREE.Texture.call(this, document.createElement("video"), mapping, wrapS, wrapT, THREE.LinearFilter, THREE.LinearFilter, THREE.RGBFormat, type, anisotropy);

	this.generateMipmaps = false;
	this.disposed = false;

	this.name = "video";
	this.category = "Video";

	this.autoplay = true;
	this.loop = true;

	this.image.autoplay = this.autoplay;
	this.image.loop = this.loop;
	this.image.src = this.video.data;

	var texture = this;
	var video = this.image;
	function update()
	{
		if(video.readyState >= video.HAVE_CURRENT_DATA)
		{
			texture.needsUpdate = true;
		}

		if(!texture.disposed)
		{
			requestAnimationFrame(update);
		}
	};
	update();
}

VideoTexture.prototype = Object.create(THREE.Texture.prototype);

VideoTexture.prototype.dispose = function()
{	
	THREE.Texture.prototype.dispose.call(this);

	this.disposed = true;
	if(!this.image.paused)
	{
		this.image.pause();
	}
}

VideoTexture.prototype.toJSON = function(meta)
{
	var data = THREE.Texture.prototype.toJSON.call(this, meta);
	var video = this.video.toJSON(meta);

	data.video = video.uuid;
	data.loop = this.loop;
	data.autoplay = this.autoplay;

	return data;
}