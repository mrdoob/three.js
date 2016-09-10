import { XHRLoader } from './XHRLoader';
import { DefaultLoadingManager } from './LoadingManager';

function VideoLoader(manager)
{
	this.manager = (manager !== undefined) ? manager : DefaultLoadingManager;
}

VideoLoader.prototype.load = function(url, onLoad, onProgress, onError)
{
	var scope = this;
	var loader = new XHRLoader(this.manager);
	loader.load(url, function(text)
	{
		scope.parse(JSON.parse(text), onLoad);
	}, onProgress, onError);
}

VideoLoader.prototype.parse = function(json, onLoad)
{
	var video = new Video();
	
	video.name = json.name;
	video.uuid = json.uuid;
	video.format = json.format;
	video.encoding = json.encoding;
	video.data = json.data;
	
	return video;
}
