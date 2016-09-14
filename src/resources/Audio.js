import { ArraybufferUtils } from './extras/utils/ArraybufferUtils'
import { Base64Utils } from './extras/utils/Base64Utils'

function Audio(url)
{
	this.name = "audio";
	this.uuid = _Math.generateUUID();
	this.type = "Audio";

	this.format = "";
	this.encoding = ""
	this.data = null;

	if(url !== undefined)
	{
		var file = new XMLHttpRequest();
		file.open("GET", url, false);
		file.overrideMimeType("text/plain; charset=x-user-defined");
		file.send(null);

		this.data = ArraybufferUtils.fromBinaryString(file.response);
		this.encoding = url.split(".").pop().toLowerCase();
		this.format = "arraybuffer";
	}
}

Audio.prototype.toJSON = function(meta)
{
	if(meta.audio[this.uuid] !== undefined)
	{
		return meta.audio[this.uuid];
	}

	var data = {};
	data.name = this.name;
	data.uuid = this.uuid;
	data.type = this.type;
	data.encoding = this.encoding;
	data.data = Base64Utils.fromArraybuffer(this.data);
	data.format = "base64";

	meta.audio[this.uuid] = data;

	return data;
}