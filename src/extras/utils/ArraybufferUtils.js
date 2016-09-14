"use strict";

function ArraybufferUtils(){}

//Create arraybuffer from binary string
ArraybufferUtils.fromBinaryString = function(str)
{
	var length = str.length;
	var arraybuffer = new ArrayBuffer(length);
	var view = new Uint8Array(arraybuffer);

	for(var i = 0; i < length; i++)
	{
		view[i] = str.charCodeAt(i);
	}

	return arraybuffer;
}

//Create arraybuffer from base64 string
ArraybufferUtils.fromBase64 = function(str)
{
	var encoding = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	var length = str.length / 4 * 3;
	var arraybuffer = new ArrayBuffer(length);
	var view = new Uint8Array(arraybuffer);

	var a, b, c, d;

	for(var i = 0, j = 0; i < length; i += 3)
	{
		a = encoding.indexOf(str.charAt(j++));
		b = encoding.indexOf(str.charAt(j++));
		c = encoding.indexOf(str.charAt(j++));
		d = encoding.indexOf(str.charAt(j++));

		view[i] = (a << 2) | (b >> 4);
		if(c !== 64)
		{
			view[i+1] = ((b & 15) << 4) | (c >> 2);
		}
		if(d !== 64)
		{
			view[i+2] = ((c & 3) << 6) | d;
		}
	}

	return arraybuffer;
}