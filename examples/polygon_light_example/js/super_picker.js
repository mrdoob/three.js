
function SuperPicker(id, opts) {
	this.id = id;
	this.init(opts);
	
	return this.picker;
}

SuperPicker.prototype = {
	
	init: function (opts) {
		var self = this,
			opt,
			style;
	
		this.pick = null;
	
		this.options =  { 
			picker_class   : 'sp_picker', // picker class name
			swatch_class   : 'sp_swatch', // swatch class name
			label_class    : 'sp_label',  // label class name
			default_value  : { r: 255, g: 255, b: 255 },
			value          : { r: 255, g: 255, b: 255 },
			label          : null,        // label
			callback       : undefined
		};
	
		for (opt in opts) {
			if (opts.hasOwnProperty.call(opts, opt)) {
				this.options[opt] = opts[opt];
			}
		}

		// Build picker
		this.picker = $("<div>")
			.addClass(this.options.picker_class)
			.css("webkitUserSelect", 'none');

		if (this.options.label) {
			this.label = $("<label>")
				.text(this.options.label)
				.addClass(this.options.label_class)
				.attr("title", "Click to reset to default");
			this.picker.append(this.label.get(0));
		}
		
		var setBackgroundColor = function(element, r, g, b) {
			self.r = r;
			self.g = g;
			self.b = b;		
			element.css("background", "rgba(" + r + ", " + g + ", " + b + ", 1)");
		}

		this.swatch = $("<div>")
			.addClass(this.options.swatch_class)
			.css("webkitUserSelect", 'none');

		var v = this.options.value;
		var r = Math.round(v.r*255);
		var g = Math.round(v.g*255);
		var b = Math.round(v.b*255);
		setBackgroundColor(this.swatch, r, g, b);

		this.picker.append(this.swatch.get(0));

		function newPicker(fade) {
			var that = this;
			var swatch = self.swatch;
			var callback = self.options.callback;
			var hsv = ColorXXX.rgb2hsv(self.r, self.g, self.b);

			var picker = new ColorXXX.Picker({
				hue: hsv[0],
				sat: hsv[1],
				val: hsv[2],
				fade: fade,
				callback: function(rgb) {
					setBackgroundColor(self.swatch, rgb.R, rgb.G, rgb.B);
					var c = new Color(rgb.R/255, rgb.G/255, rgb.B/255);
					callback(c);
				}
			});

			picker.el.style.top  = "0px";
			picker.el.style.left = "40px";
			
			self.swatch.append(picker.el);

			return picker;
		}


		// Define event listeners

		this.labelClick = function (event) {
			self.label.trigger("reset");

			var v = self.options.default_value;
			var r = Math.round(v.r*255);
			var g = Math.round(v.g*255);
			var b = Math.round(v.b*255);
			setBackgroundColor(self.swatch, r, g, b);

			if (self.pick !== null) {
				var visible = self.pick.visible();
				self.picker.destroy();
				if (visible)
					self.pick = newPicker(false);
			}

			return false;
		};

		this.swatchClick = function (event) {
			if (self.pick === null)
				self.pick = newPicker(true);
			else
				self.pick.toggle();

			return false;
		}

		this.picker.bind("DOMNodeInserted", function (event) {
			self.pickerInserted(event);
			self.initialised = true;
		});

		this.picker.bind("DOMNodeRemoved", function (event) {
			self.pickerRemoved(event);
		});

		this.picker.destroy = function() {
			if (self.pick === null)
				return;

			self.pick.destroyMe();
			self.pick = null;
		}

		this.infocus = false;
	},
	

	// Picker inserted into the DOM and ready for action
	pickerInserted: function (event) {
		var self = this;
		
		if (self.initialised)
			return;
	
		if (this.label) {
			this.label.bind("click", this.labelClick);
		}

		this.swatch.bind("click", this.swatchClick);
	},

	pickerRemoved: function (event) {	
		this.picker.destroy();
	},
};


