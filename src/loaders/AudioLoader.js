import { getAudioContext } from '../audio/AudioContext';
import { XHRLoader } from './XHRLoader';
import { DefaultLoadingManager } from './LoadingManager';
import { ArraybufferUtils } from './extras/utils/ArraybufferUtils'

function AudioLoader(manager)
{
	this.manager = (manager !== undefined) ? manager : DefaultLoadingManager;
}

AudioLoader.prototype.load = function(url, onLoad, onProgress, onError)
{
	var scope = this;
	var loader = new XHRLoader(this.manager);
	loader.load(url, function(text)
	{
		scope.parse(JSON.parse(text), onLoad);
	}, onProgress, onError);
}

AudioLoader.prototype.parse = function(json)
{
	var audio = new Audio();

	audio.name = json.name;
	audio.uuid = json.uuid;
	audio.format = json.format;
	audio.encoding = json.encoding;
	audio.data = ArraybufferUtils.fromBase64(json.data);

	return audio;
}
