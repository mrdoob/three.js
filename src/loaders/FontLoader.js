import { Font } from '../extras/core/Font';
import { XHRLoader } from './XHRLoader';
import { DefaultLoadingManager } from './LoadingManager';

function FontLoader(manager)
{
	this.manager = (manager !== undefined) ? manager : DefaultLoadingManager;
}

FontLoader.prototype.load = function(url, onLoad, onProgress, onError)
{
	var loader = new XHRLoader(this.manager);
	loader.load(url, function(text)
	{
		onLoad(new Font(JSON.parse(text)));
	}, onProgress, onError);
}

FontLoader.prototype.parse = function(json)
{
	if(json.data !== undefined)
	{
		var font = new Font();

		font.name = json.name;
		font.uuid = json.uuid;
		font.format = json.format;
		font.encoding = json.encoding;
		font.data = json.data;

		return font;
	}
	else
	{
		return new Font(json);
	}
}