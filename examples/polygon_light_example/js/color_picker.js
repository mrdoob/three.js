
if (window.ColorXXX == undefined) ColorXXX = {};

ColorXXX.Picker = function (props) {

	/// loading properties
	if (typeof(props) == "undefined") props = {};
	this.callback = props.callback; // bind custom function
	this.hue = props.hue || 0; // 0-360
	this.sat = props.sat || 0; // 0-100
	this.val = props.val || 100; // 0-100
	this.element = props.element || document.body;
	this.size = 165; // size of colorpicker
	this.margin = 10; // margins on colorpicker
	this.offset = this.margin / 2;
	this.hueWidth = 30;

	/// creating colorpicker (header)
	var plugin = document.createElement("div");
	plugin.id = "colorjack_square";
	plugin.style.cssText  = "height: " + (this.size + this.margin * 2) + "px";

    this.visible = function() {
		var current = plugin.style.display;
        return current !== "none";
    }

	this.hide = function () {
		plugin.style.display = "none";
	}

	this.show = function () {
		plugin.style.display = "block";
	}

	this.toggle = function () {
		if (this.visible())
			$(plugin).fadeOut("fast", "linear");		
		else
			$(plugin).fadeIn("fast", "linear");

		//plugin.style.display = (current === "none") ? "block" : "none";
	}

    if (props.fade) {
	    plugin.style.cssText += "display: none";
	    this.toggle();
    }

	var that = this;

	/// creating media-resources
	var arrows = document.createElement("canvas");
	arrows.width = 40;
	arrows.height = 5;
	(function () { // creating arrows
		var ctx = arrows.getContext("2d");
		var width = 3;
		var height = 5;
		var size = 9;
		var top = -size / 4;
		var left = 1;
		for (var n = 0; n < 20; n++) { // multiply anti-aliasing
			ctx.beginPath();
			ctx.fillStyle = "#FFF";
			ctx.moveTo(left + size / 4, size / 2 + top);
			ctx.lineTo(left, size / 4 + top);
			ctx.lineTo(left, size / 4 * 3 + top);
			ctx.fill();
		}
		ctx.translate(width, height);
		ctx.rotate(180 * Math.PI / 180); // rotate arrows
		ctx.drawImage(arrows, -29, 0);
		ctx.translate(-width, -height);
	})();

	var circle = document.createElement("canvas");
	circle.width = 10;
	circle.height = 10;
	(function () { // creating circle-selection
		var ctx = circle.getContext("2d");
		ctx.lineWidth = 1;
		ctx.beginPath();
		var x = circle.width / 2;
		var y = circle.width / 2;
		ctx.arc(x, y, 4.5, 0, Math.PI * 2, true);
		ctx.strokeStyle = '#000';
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(x, y, 3.5, 0, Math.PI * 2, true);
		ctx.strokeStyle = '#FFF';
		ctx.stroke();
	})();

	/// creating colorpicker sliders
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");
	canvas.style.cssText = "position: absolute; top: 5px; left: " + (this.offset) + "px;";
	canvas.width = this.size + this.hueWidth + this.margin;
	canvas.height = this.size + this.margin;
	plugin.appendChild(canvas);

	plugin.onclick = function(e) {
	    e.stopPropagation();
	}

	plugin.onmousemove =
	plugin.onmousedown = function (e) {
		var down = (e.type == "mousedown");
		var offset = that.margin / 2;

	    var of = $(canvas).offset();
	    var oX = of.left;
	    var oY = of.top;

		var x0 = (e.pageX - oX) - offset;
		var y0 = (e.pageY - oY) - offset;
		var x = clamp(x0, 0, canvas.width);
		var y = clamp(y0, 0, that.size);

		if (x != x0 || y != y0) { // move colorpicker
			/*plugin.style.cursor = "move";
			if (down) dragElement({
				type: "difference",
				event: e,
				element: plugin,
				callback: function (coords, state) {
					plugin.style.left = coords.x + "px";
					plugin.style.top = coords.y + "px";
				}
			});*/
			return;
		} else if (x <= that.size) { // saturation-value selection
			plugin.style.cursor = "crosshair";
			if (down) dragElement({
				type: "relative",
				event: e,
				element: canvas,
				callback: function (coords, state) {
					var x = clamp(coords.x - that.offset, 0, that.size);
					var y = clamp(coords.y - that.offset, 0, that.size);
					that.sat = x / that.size * 100; // scale saturation
					that.val = 100 - (y / that.size * 100); // scale value
					that.drawSample();
				}
			});
		} else if (x > that.size + that.margin && x <= that.size + that.hueWidth) { // hue selection
			plugin.style.cursor = "crosshair";
			if (down) dragElement({
				type: "relative",
				event: e,
				element: canvas,
				callback: function (coords, state) {
					var y = clamp(coords.y - that.offset, 0, that.size);
					that.hue = Math.min(1, y / that.size) * 360;
					that.drawSample();
				}
			});
		} else { // margin between hue/saturation-value
			plugin.style.cursor = "default";
		}
		
		return false; // prevent selection
	};
	// appending to elementc
	this.element.appendChild(plugin);

	/// helper functions
	var that = this;
	this.el = plugin;
	this.drawSample = function () {
		// clearing canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		that.drawSquare();
		that.drawHue();

		// arrow-selection
		var y = (that.hue / 362) * that.size - 2;
		ctx.drawImage(arrows, that.size + that.offset + 4, Math.round(y) + that.offset);

		// circle-selection
		var x = that.sat / 100 * that.size;
		var y = (1 - (that.val / 100)) * that.size;
		x = x - circle.width / 2;
		y = y - circle.height / 2;
 		ctx.drawImage(circle, Math.round(x) + that.offset, Math.round(y) + that.offset);

		// run custom code
		if (that.callback) {
            var rgb = ColorXXX.HSV_RGB({
                H: that.hue,
                S: that.sat,
                V: that.val
            });

		    that.callback(rgb);
		}
	};

	this.drawSquare = function () {
		// retrieving hex-code
		var hex = ColorXXX.HSV_HEX({
			H: that.hue,
			S: 100,
			V: 100
		});
		var offset = that.offset;
		var size = that.size;
		// drawing color
		ctx.fillStyle = "#" + hex;
		ctx.fillRect(offset, offset, size, size);
		// overlaying saturation
		var gradient = ctx.createLinearGradient(offset, offset, size + offset, 0);
		gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
		gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
		ctx.fillStyle = gradient;
		ctx.fillRect(offset, offset, size, size);
		// overlaying value
		var gradient = ctx.createLinearGradient(offset, offset, 0, size + offset);
		gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
		gradient.addColorStop(1, "rgba(0, 0, 0, 1)");
		ctx.fillStyle = gradient;
		ctx.fillRect(offset, offset, size, size);
		// drawing outer bounds
		ctx.strokeStyle = "rgba(255,255,255,0.15)";
		ctx.strokeRect(offset+0.5, offset+0.5, size-1, size-1);
	};

	this.drawHue = function () {
		// drawing hue selector
		var left = that.size + that.margin + that.offset;
		var gradient = ctx.createLinearGradient(0, 0, 0, that.size);
		gradient.addColorStop(0.00, "rgba(255,   0,  0,  1)");
		gradient.addColorStop(0.15, "rgba(255, 255,  0,  1)");
		gradient.addColorStop(0.30, "rgba(0,   255,  0,  1)");
		gradient.addColorStop(0.50, "rgba(0,   255, 255, 1)");
		gradient.addColorStop(0.65, "rgba(0,     0, 255, 1)");
		gradient.addColorStop(0.80, "rgba(255,   0, 255, 1)");
		gradient.addColorStop(1.00, "rgba(255,   0,   0, 1)");
		ctx.fillStyle = gradient;
		ctx.fillRect(left, that.offset, 20, that.size);
		// drawing outer bounds
		ctx.strokeStyle = "rgba(255,255,255,0.2)";
		ctx.strokeRect(left + 0.5, that.offset + 0.5, 19, that.size-1);
	};

	this.destroyMe = function () {
	    $(plugin).remove();
		for (var key in that) delete that[key];
	};

	// drawing color selection
	this.drawSample();

	return this;
};


var dragElement = function(props) {
	function mouseMove(e, state) {
		if (typeof(state) == "undefined") state = "move";
		var coord = XY(e);
		switch (props.type) {
			case "difference": 
				props.callback({
					x: coord.x + oX - eX,
					y: coord.y + oY - eY
				}, state);
				break;
			case "relative":
				props.callback({
					x: coord.x - oX,
					y: coord.y - oY
				}, state);
				break;
			default: // "absolute"
				props.callback({
					x: coord.x,
					y: coord.y
				}, state);
				break;
		}
	};
	function mouseUp(e) {
		window.removeEventListener("mousemove", mouseMove, false);
		window.removeEventListener("mouseup", mouseUp, false);
		mouseMove(e, "up");
	};
	function mouseClick(e) {
	    console.log("hghghfghh");
	    e.stopPropagation();
	}

	// current element position
	var el = props.element;


	var of = $(el).offset();
	var oX = of.left;
	var oY = of.top;

//	var origin = abPos(el);
//	var oX = origin.x;
//	var oY = origin.y;

	// current mouse position
	var e = props.event;
	var coord = XY(e);
	var eX = coord.x;
	var eY = coord.y;

	// events
	window.addEventListener("mousemove", mouseMove, false);
	window.addEventListener("mouseup", mouseUp, false);
	mouseMove(e, "down"); // run mouse-down
};

var clamp = function(n, min, max) {
	return (n < min) ? min : ((n > max) ? max : n);
};

var XY = window.ActiveXObject ? // fix XY to work in various browsers
	function(event) {
		return {
			x: event.clientX + document.documentElement.scrollLeft,
			y: event.clientY + document.documentElement.scrollTop
		};
	} : function(event) {
		return {
			x: event.pageX,
			y: event.pageY
		};
	};

var abPos = function(o) { 
	o = typeof(o) == 'object' ? o : $(o);
	var offset = { x: 0, y: 0 };
	while(o != null) { 
		offset.x += o.offsetLeft; 
		offset.y += o.offsetTop; 
		o = o.offsetParent; 
	};
	return offset;
};


ColorXXX.HEX_STRING = function (o) {
	var z = o.toString(16);
	var n = z.length;
	while (n < 6) {
		z = '0' + z;
		n ++;
	}
	return z;
};

ColorXXX.RGB_HEX = function (o) {
	return o.R << 16 | o.G << 8 | o.B;
};

ColorXXX.HSV_RGB = function (o) {
	var H = o.H / 360,
		S = o.S / 100,
		V = o.V / 100,
		R, G, B;
	var A, B, C, D;
	if (S == 0) {
		R = G = B = Math.round(V * 255);
	} else {
		if (H >= 1) H = 0;
		H = 6 * H;
		D = H - Math.floor(H);
		A = Math.round(255 * V * (1 - S));
		B = Math.round(255 * V * (1 - (S * D)));
		C = Math.round(255 * V * (1 - (S * (1 - D))));
		V = Math.round(255 * V);
		switch (Math.floor(H)) {
			case 0:
				R = V;
				G = C;
				B = A;
				break;
			case 1:
				R = B;
				G = V;
				B = A;
				break;
			case 2:
				R = A;
				G = V;
				B = C;
				break;
			case 3:
				R = A;
				G = B;
				B = V;
				break;
			case 4:
				R = C;
				G = A;
				B = V;
				break;
			case 5:
				R = V;
				G = A;
				B = B;
				break;
		}
	}
	return {
		R: R,
		G: G,
		B: B
	};
};

ColorXXX.HSV_HEX = function (o) {
	return ColorXXX.HEX_STRING(ColorXXX.RGB_HEX(ColorXXX.HSV_RGB(o)));
};

ColorXXX.rgb2hsv = function (r, g, b) {
	var color = typeof(r) === 'number' ? [r / 255, g / 255, b / 255] : [r.r / 255, r.g / 255, r.b / 255],
		rgb_min = Math.min(color[0], Math.min(color[1], color[2])),
		rgb_max = Math.max(color[0], Math.max(color[1], color[2])),
		rgb_delta = rgb_max - rgb_min,
		v = rgb_max,
		h, s, r_delta, g_delta, b_delta;
	
    if (rgb_delta === 0.0) {
        // Grey
        h = 0.0;
        s = 0.0;
    } else {
        // Colour
        s = rgb_delta / rgb_max;
        r_delta = (((rgb_max - color[0]) / 6.0) + (rgb_delta / 2.0)) / rgb_delta;
        g_delta = (((rgb_max - color[1]) / 6.0) + (rgb_delta / 2.0)) / rgb_delta;
        b_delta = (((rgb_max - color[2]) / 6.0) + (rgb_delta / 2.0)) / rgb_delta;

        if (color[0] === rgb_max) {
            h = b_delta - g_delta;
        } else if (color[1] === rgb_max) {
            h = 1.0 / 3.0 + r_delta - b_delta;
        } else if (color[2] === rgb_max) {
            h = 2.0 / 3.0 + g_delta - r_delta;
        }

        if (h < 0.0) {
			h += 1.0;
		}
        if (h > 1.0) {
			h -= 1.0;
		}
    }
	
    return [Math.round(h * 359), Math.round(s * 100), Math.round(v * 100)];
};
