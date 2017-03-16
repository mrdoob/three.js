  // Installs globals onto window:
  // * Buffer
  // * require (monkey-patches if already defined)
  // * process
  // You can pass in an arbitrary object if you do not wish to pollute
  // the global namespace.
  BrowserFS.install(window);
  // Constructs an instance of the LocalStorage-backed file system.
  var lsfs = new BrowserFS.FileSystem.LocalStorage();
  // Initialize it as the root file system.
  BrowserFS.initialize(lsfs);

/*
 * @author TheCodeCrafter / Converting the original FS to a file saving mechanism
 * @author chrispalazzolo / Creating the original Node.js converter
 */


/*
##### Class to parse a .3ds file into a js object.
*/

var binary3DSParser = function(file, options){
	this.fs = function() {
		this.stats = function() {
			
		}
	}

	this.err = false;
	this.errMsg = '';

	this.file = '';
	this.fileName = '';
	this.filePath = '';
	this.logPath = '';

	this.dirs = {
		log: "log/",
		json: "json/",
		edit: "edit/",
		keyF: "keyframer/",
		mat: "material/",
		map: "map/",
		mask: "mask/",
		obj: "objects/",
		view: "viewports/",
		mesh: "mesh/",
		camera: "camera/",
		light: "light/" 
	};

	this.setFileAndPath(file);

	//Options
	this.saveJson = false;
	this.save_options = {
		path: this.filePath + this.fileName,
		jsonPerItem: false,
		unparsedToFile: false
 	};
	this.logging = false;
	this.log_options = {
		read: true,
		parsing: true,
		unparsed: true,
		unknown: true,
		jumping: false,
		file: true
	};
	this.verbose = false;
	this.verbose_options = {
		onlyStats: false
	};
	this.trackUnparsed = false;

	this.setOptions(options);
	
	this.numOfBytes = [];
	this.numOfBytes['id'] = 2,      // 16 bits
	this.numOfBytes['length'] = 4,  // 32 bits
	this.numOfBytes['header'] = 6,  // 6 bytes for chunk info
	this.numOfBytes['file'] = 0,    // total bytes in file
	this.numOfBytes['read'] = 0     // bytes read from file
	this.numOfBytes['written'] = 0; // bytes written to the log file

	if(this.logging){
		this.fdLog = null;
		this.initLogFile();
		this.writeHeadingToLog();
	}

	if(this.isFileValid(file)){
		this.fd = null;
		this.fstats = null;

		this.unparsed = null;
		
		this.curPos = 0;           // current position in the file
		this.curChunkInfo = null;  // holds the most recent header chunk information pulled from the file.
		this.completed = false;    // after everything needed is parsed set this flag to true.
		this.eof = false;				   // gets set to true when we reached the end of the file.

		this.headerCt = 0;
		this.matCt = 0;
		this.meshCt = 0;
		this.unparsedCt = 0;
		this.level = []; // ["Main", "Edit | KeyFramer", etc...]
	}
}
binary3DSParser.prototype = {
	isFileValid: function(file){
		if(!file){
			this.err = true;
			this.errMsg = "No file or path provided.";
			this.writeToLog(this.errMsg);
			this.verboseToConsole(this.errMsg);

			return false;
		}

		if(typeof file != "string"){
			this.err = true;
			this.errMsg = 'File value must be a path to a file of type string.';
			this.writeToLog(this.errMsg);
			this.verboseToConsole(this.errMsg);

			return false;
		}

		if(file.indexOf('.3ds') < 1&&file.indexOf('.3DS') < 1){ //a.3ds is a vaild file name
			this.err = true;
			this.errMsg = 'Not a vaild .3ds file: ' + file;
			this.writeToLog(this.errMsg);
			this.verboseToConsole(this.errMsg);

			return false;
		}

		if(!this.fs.existsSync(file)){
			this.err = true;
			this.errMsg = "File doesn't exist: " + file;
			this.writeToLog(this.errMsg);
			this.verboseToConsole(this.errMsg);

			return false;
		}

		return true;
	},
	setFileAndPath: function(file){
		if(file){
			var items = this.getFileInfo(file);

			if(items !== null){
				this.filePath = items.path;
				this.fileName = items.name;
				this.file = items.file;
			}
		}
	},
	getFileInfo: function(f){
		if(f){
			var file = '';
			var filePath = '';
			var fileName = '';

			if(f.indexOf('/') > -1){
				var parts = f.split('/');
				var last = parts[parts.length - 1];

				if(last && last.indexOf('.') > -1){
					file = last;
					filePath = f.replace(file, '') ;	
				}
				else{
					filePath = f;

					if(f.charAt(f.length - 1) != '/'){
						filePath += '/';
					}
				}
			}
			else{
				file = f;
			}

			fileName = file.split('.')[0];

			return {file: file, name: fileName, path: filePath};
		}

		return null;
	},
	setOptions: function(options){
		if(!options || options === null || typeof options != "object"){return;}
		
		if(options.saveJson === true){
			this.saveJson = true;
		}
		
		var savePath = this.save_options.path;

		if(options.saveOptions && typeof options.saveOptions == "object"){
			var ops = options.saveOptions;

			if(ops.path && ops.path != ' ' && ops.path != "undefined" && ops.path != undefined && typeof ops.path == "string"){
				var fileInfo = this.getFileInfo(ops.path);

				if(fileInfo !== null){
					savePath = fileInfo.path;

					this.mkDir(savePath);

					savePath += this.fileName;
				}
			}

			if(ops.jsonPerItem === true){
				this.save_options.jsonPerItem = true;
			}

			if(ops.unparsedToFile === true){
				this.save_options.unparsedToFile = true;
			}
		}

		//need to create the directory default or what was passed in.
		if(savePath.charAt(savePath.length - 1) != '/'){
			savePath += '/';
		}

		this.mkDir(savePath);

		this.save_options.path = savePath;

		if(options.logging === true){
			this.logging = true;
		}
		
		if(options.logOptions && typeof options.logOptions == "object"){
			var ops = options.logOptions;

			if(ops.read === false){
				this.log_options.read = false;
			}

			if(ops.parsing === false){
				this.log_options.parsing = false;
			}

			if(ops.unknowns === false){
				this.log_options.unknown = false;
			}

			if(ops.jumping === true){
				this.log_options.jumping = true;
			}

			if(ops.file === false){
				this.log_options.file = false;
			}
		}

		if(options.verbose === true){
			this.verbose = true;	
		}
		
		if(options.verboseOptions && typeof options.verboseOptions == "object"){
			var ops = options.verboseOptions;

			if(ops.onlyStats === true){
				this.verbose_options.onlyStats = true;
			}
		}

		if(options.trackUnparsed === true){
			this.trackUnparsed = true;
		}
	},
	initFile: function(){
		this.writeToLog("Opening File: " + this.filePath + this.file);
		
		var fileData = this.openFile(this.filePath + this.file, 'r');
		
		if(fileData !== null && fileData != undefined){
			this.fstats = this.fs.fstatSync(fileData);
			
			if(this.fstats !== null && this.fstats != undefined){
				this.numOfBytes.file = this.fstats.size;
				this.writeToLog("File Size: " + this.fstats.size + " bytes.");
				
				return fileData;
			}
			else{
				this.err = true;
				this.errMsg = 'A file error has occured.';
				this.writeToLog(this.errMsg);
				this.verboseToConsole(this.errMsg);

				this.closeFile(fileData);
			}
		}
		else{
			this.err = true;
			this.errMsg = "Error opening file.";
			this.writeToLog(this.errMsg);
			this.verboseToConsole(this.errMsg);
		}

		return null;
	},
	initLogFile: function(){
		if(this.logging){
			var logPath = this.save_options.path + this.dirs.log;
			var logFile = logPath + this.fileName + '.log';

			this.mkDir(logPath);

			this.fdLog = this.openFile(logFile, 'w');

			this.logPath = logPath;
		}
	},
	openFile: function(file, flag){
		if(file && flag){
			return this.fs.openSync(file, flag);
		}

		return null;
	},
	closeFile: function(fileData){
		if(fileData){
			this.fs.closeSync(fileData);
		}
	},
	writeToLog: function(str){
		if(this.logging === true && str != undefined){
			var buffer = new Buffer(str + '\r\n');
			this.numOfBytes.written += this.fs.writeSync(this.fdLog, buffer, 0, buffer.length, this.numOfBytes.written);
		}
	},
	writeHeadingToLog: function(){
		var hdMsg = "3dsTojs - .3ds to JS Parser.  Log of Parsing file: " + this.filePath + this.file;
		var msgLen = hdMsg.length;
		var lgBrdr = Array(msgLen + 1).join('=');
		var smBrdr = Array(msgLen + 1).join('-');
		this.writeToLog(lgBrdr);
		this.writeToLog(hdMsg);
		this.writeToLog(lgBrdr);
		this.writeToLog("Logging:");
		for(var key in this.log_options){
			this.writeToLog((key.charAt(0).toUpperCase() + key.slice(1)) + ": " + this.log_options[key]);
		}
		this.writeToLog(smBrdr + "\r\n");
	},
	writeChunkToLog: function(type, supplementText){
		if(this.logging === true){
			var chunk = this.curChunkInfo;

			switch(type){
				case 0: //Read
					if(this.log_options.read === false){ return;}
					type = "Read";
					break;
				case 1: //Parsed
					if(this.log_options.parsing === false){return;}
					type = "Parsed";
					break;
				case 2: //Error
					type = ">>> Error";
					break;
				case 3: // Not Parsed
					if(this.log_options.unparsed === false){return;}
					type = ">>> Not Parsed";
					break;
				case 4: //Unknown
					if(this.log_options.unknown === false){return;}
					type = ">>> Unknown";
					break;
				default:
					type = "####";
					break;
			}

			if(supplementText && supplementText != undefined){
				supplementText = " :: " + supplementText;
			} else{
				supplementText = '';
			}

			this.writeToLog(type + " Chunk: Id: " + this.formatHex(chunk.id) + ", Length: " + chunk.length + ", position in file: " + chunk.found_pos + " | Bytes Read: " + this.numOfBytes.read + supplementText);
		}
	},
	writeFileToLog: function(type, fileName, path){
		if(this.logging === true && this.log_options.file === true){
			this.writeToLog("Saved: JSON | " + type + " | " + fileName + " | " + path);
		}
	},
	readChunkFromFile: function(len){
		if(this.fd !== null && len > 0){
			var buffer = new Buffer(len);
			
			this.numOfBytes.read += this.fs.readSync(this.fd, buffer, 0, len, this.curPos);

			if(this.numOfBytes.read >= this.fstats.size){
				this.eof = true;
			}

			this.jump(len);

			return buffer;
		}

		return null;
	},
	jump: function(howMany){
		this.curPos += howMany;

		var msg = "Jumping: " + howMany + " positions to position " + this.curPos + " in file.";
		
		if(this.log_options.jumping){
			this.writeToLog(msg);
		}
	},
	setLevel: function(lvl, lbl){
		if(this.level){
			var len = this.level.length;
			var lPos = len > 0 ? len - 1 : 0;

			if(lvl < lPos){
				this.level = this.level.slice(0, lvl);
			}
		}
		else{
			this.level = [];
		}

		this.level[lvl] = lbl;
	},
	handleUnparsedChunk: function(type){ // type = 0: unparse due to lack of info to parse, 1: unknown
		var id = this.curChunkInfo.id.toString(16);

		var levelLbl = this.level.length > 1 ? this.level.join('>') : this.level[0];

		if(this.trackUnparsed === true){
			if(this.unparsed === null){
				this.unparsed = {};
			}

			if(!this.unparsed[levelLbl]){
				this.unparsed[levelLbl] = {};
			}

			if(!this.parsed[levelLbl][id]){
				this.unparsed[levelLbl][id] = [];
			}

			this.unparsed[levelLbl][id].push(this.curChunkInfo);
		}

		if(this.save_options.unparsedToFile === true){
			this.jump(this.numOfBytes.header * -1); // jump back to the start of the header chunk.  Want to include that in the data chunk.
			var buffer = this.readChunkFromFile(this.curChunkInfo.length); // now pull that full data chunk from file.
			var file = this.logPath + this.fileName + "_unparsed_" + this.curChunkInfo.id.toString(16) + "_" + this.curPos + ".log";

			this.fs.writeFileSync(file, buffer); // write the binary data chunk to a log file.
		}
		else{
			this.jump(this.curChunkInfo.data_length);
		}

		this.unparsedCt++;

		if(type == 0){
			this.writeChunkToLog(3, "Not enough info to parse. Level: " + levelLbl);	
			this.verboseToConsole("Not enough info to parse.  Id: " + id + ", Data Length: " + this.curChunkInfo.data_length + ", Level: " + levelLbl);
		}
		else{
			this.writeChunkToLog(4, "Chunk was not parsed. Level: " + levelLbl);	
			this.verboseToConsole("Found Unknown Chunk.  Id: " + id + ", Data Length: " + this.curChunkInfo.data_length + ", Level: " + levelLbl);
		}
	},
	nextChunkInfo: function(){
		var chunk = this.readChunkFromFile(this.numOfBytes.header);

		if(chunk !== null){
			this.prevChunkInfo = this.curChunkInfo;

			var id = chunk.readUInt16LE(0, true);
			var len = chunk.readUInt32LE(this.numOfBytes.id, true);
			var dataLen = len - this.numOfBytes.header;

			this.curChunkInfo = {
				id: id,
				length: len,
				found_pos: this.curPos - this.numOfBytes.header,
				data_start_pos: this.curPos,
				data_length: dataLen,
				poitionOfNextChunk: this.curPos + dataLen
			};

			this.headerCt++;

			this.writeChunkToLog(0);
		}
	},
	getString: function(len){
		if(len === null){
			var str = '';
			var buffer = this.readChunkFromFile(1);

			while(buffer[0] !== 0x00){
				str += String.fromCharCode(buffer[0]);
				buffer = this.readChunkFromFile(1);
			}

			return str;
		}
		else{
			var buffer = this.readChunkFromFile(len);

			if(buffer !== null){
				return buffer.toString();
			}
		}

		return '';
	},
	getShort: function(){
		var buffer = this.readChunkFromFile(2);

		if(buffer !== null){
			return buffer.readUInt16LE(0, true);
		}
	},
	getInt: function(){
		var buffer = this.readChunkFromFile(4);

		if(buffer !== null){
			return buffer.readUInt32LE(0, true);
		}

		return 0;
	},
	getFloat: function(){
		var buffer = this.readChunkFromFile(4);

		if(buffer !== null){
			return buffer.readFloatLE(0, true);
		}

		return null;
	},
	getIntPct: function(){
		var buffer = this.readChunkFromFile(2);

		if(buffer !== null){
			return buffer.readUInt16LE(0, true);
		}

		return null;
	},
	getFloatPct: function(){
		var buffer = this.readChunkFromFile(4);

		if(buffer !== null){
			return buffer.readFloatLE(0, true);
		}

		return null;
	},
	getPercent: function(){
		this.nextChunkInfo();

		switch(this.curChunkInfo.id){
			case 0x0030:
				return this.getIntPct();
			case 0x0013:
				return this.getFloatPct();
			default:
				this.jump(this.numOfBytes.header * -1);
				return null;
		}
	},
	getColor_24: function(){ //BYTE R,G,B
		var buffer = this.readChunkFromFile(3);

		if(buffer !== null){
			return [
				buffer.readUInt8(0), // r
				buffer.readUInt8(1), // g
				buffer.readUInt8(2)  // b
			];
		}

		return null;
	},
	getColorFloat: function(){ //FLOAT R,G,B
		var buffer = this.readChunkFromFile(12);

		if(buffer !== null){
			return [
				buffer.readFloatLE(0, true), // r
				buffer.readFloatLE(4, true), // g
				buffer.readFloatLE(8, true)  // b
			];
		}

		return null;
	},
	getColor: function(){
		var eod = this.curPos + this.curChunkInfo.data_length;
		var end = false;
		var obj = {};

		while(this.curPos < eod || !end){
			this.nextChunkInfo();

			switch(this.curChunkInfo.id){
				case 0x0011:
					this.writeChunkToLog(1);
					this.verboseToConsole("Parsing Color 24...");

					obj.color_24 = this.getColor_24();
					
					break;
				case 0x0012:
					this.writeChunkToLog(1);
					this.verboseToConsole("Parsing Lin Color 24...");

					obj.lin_color_24 = this.getColor_24();
					
					break;
				case 0x0010:
					this.writeChunkToLog(1);
					this.verboseToConsole("Parsing Color F...");

					obj.color_f = this.getColorFloat();
					
					break;
				case 0x0013:
					this.writeChunkToLog(1);
					this.verboseToConsole("Parsing Lin Color F...");

					obj.lin_color_f = this.getColorFloat();
					
					break;
				default:
					this.jump(this.numOfBytes.header * -1); // Reached the end of color chunks.
					end = true;
					break;
			}
		}

		return obj;
	},
	parse: function(){
		var data = null;

		if(!this.err){
			this.fd = this.initFile();

			if(this.fd !== null){
				this.writeToLog("Parsing Start...");
				this.verboseToConsole("Parsing Start...");

				var time = process.hrtime();
				data = this.parseMain();
				var diff = process.hrtime(time); // Parse time, diff = [seconds, nanosecoonds];

				this.writeToLog("Parsing Complete.");
				this.writeToLog("Closing File.");
				
				this.verboseToConsole("Parsing Complete...");
				this.verboseToConsole("Closing File...");

				this.closeFile(this.fd);

				this.saveToJson(data);

				if(this.verbose){
					this.displayStats(diff);
				}

				this.writeToLog(this.getStatsString(diff));
			}
		}

		this.closeFile(this.fdLog);

		var returnObj = {
			err: this.err,
			errMsg: this.errMsg,
			data: data
		};

		if(this.trackUnparsed){
			returnObj.unparsed = this.unparsed;
		}
		//console.log(returnObj.data.edit.objects[0].mesh[0].local_coords);
		return returnObj;
	},
	parseMain: function(){
		var obj = null;

		this.nextChunkInfo();

		if(this.curChunkInfo !== null && this.curChunkInfo.id === 0x4d4d){
			obj = {};

			var eod = this.curChunkInfo.data_start_pos + this.curChunkInfo.data_length;
			
			this.setLevel(0, "4d4d(Main)");

			this.writeChunkToLog(1);
			this.verboseToConsole("Parsing M3D version...");

			while((!this.eof || !this.completed) && this.curPos < eod){
				this.nextChunkInfo();

				switch(this.curChunkInfo.id){
					case 0x0002: // m3d version
						this.setLevel(1, "0002(M3D Version)");
						
						this.writeChunkToLog(1);
						this.verboseToConsole(". Parsing M3D version...");

						obj.m3d_version = this.getInt();

						break;
					case 0x3d3d: // edit data chunk
						this.setLevel(1, "3d3d(Edit)");
						
						this.writeChunkToLog(1);
						this.verboseToConsole(". Parsing Edit Data...");

						obj.edit = this.parseEdit();

						break;
					case 0xB000: // key framer data chunk
						this.setLevel(1, "b000(Key Framer)");
						
						this.writeChunkToLog(1);
						this.verboseToConsole(". Parsing Key Framer Data...");

						obj.keyFramer = this.parseKeyFramer();
						
						break;
					default:
						this.handleUnparsedChunk(1);

						break;
				}
			}
		}
		else{
			this.err = true;
			this.errMsg = "Error parsing file:  Not a valid 3ds file.";
			this.writeToLog(this.errMsg);
			this.verboseToConsole(this.errMsg);
		}

		return obj;
	},
	parseEdit: function(){
		var editObj = {};
		var mats = null;
		var objs = null;
		var vports = null;

		var editChunk = this.curChunkInfo;
		var eod = editChunk.data_start_pos + editChunk.data_length; //eod(end of data)

		while(this.curPos < eod){
			this.nextChunkInfo();

			switch(this.curChunkInfo.id){
				case 0x3d3e:
					this.setLevel(2, "3d3e(Mesh Version)");
					
					this.verboseToConsole(".. Paring Mesh Version...");
					this.writeChunkToLog(1);

					if(editObj === null){editObj = {};}
					editObj.mesh_version = this.getInt();
					
					break;
				case 0xafff:
					this.setLevel(2, "afff(Materials)");
					
					this.verboseToConsole(".. Parsing Material Data...");
					this.writeChunkToLog(1);

					if(!mats || mats === null){
						mats = [];
					}

					mats.push(this.parseMaterials());
					this.matCt++;

					break;
				case 0x0100:
					this.setLevel(2, "0100(Master Scale)");
					
					this.verboseToConsole(".. Parsing Scale...");
					this.writeChunkToLog(1);

					if(editObj === null){editObj = {};}
					editObj.master_scale = this.getFloat();

					break;
				case 0x1200:
					this.setLevel(2, "1200(Solid BGND)");

					this.verboseToConsole("..Parsing Solid BGND...");
					this.writeChunkToLog(1);

					editObj.solid_bgnd = this.getColor();

					break;
				case 0x1201:
					this.setLevel(2, "1201(Use Solid BGND)");

					this.writeChunkToLog(this.curChunkInfo.data_length > this.numOfBytes.header ? 3 : 1); // If there is data, not sure how to parse.  Mostly been empty data chunks.
					this.verboseToConsole(".. Parsing Use Solid BGND...");

					editObj.use_solid_bgnd = null; // always seems to be an empty chunk

					break;
				case 0x2100:
					this.setLevel(2, "2100(Ambient Light)");

					this.verboseToConsole(".. Parsing Ambient Light...");
					this.writeChunkToLog(1);

					editObj.ambient_light = this.getColor();

					break;
				case 0x4000:
					this.setLevel(2, "4000(Object)");

					this.verboseToConsole(".. Parsing Object Data...")
					this.writeChunkToLog(1);

					if(!objs || objs === null){
						objs = [];
					}

					objs.push(this.parseObjects());

					break;
				case 0x7001:
					this.setLevel(2, "7001(Viewport)");

					this.writeChunkToLog(1);
					this.verboseToConsole(".. Parsing Viewport Data...");

					if(!vports || vports === null){
						vports = [];
					}

					vports.push(this.parseViewport());

					break;
				default:
					this.handleUnparsedChunk(1);
					break;
			}
		}

		if(mats !== null){
			editObj.materials = mats;
		}

		if(objs !== null){
			editObj.objects = objs;
		}

		if(vports !== null){
			editObj.view_ports = vports;
		}

		return editObj;
	},
	parseMaterials: function(){ //Chunk 0xafff, Child of 0x4d4d
		var matObj = {};

		var matChunkInfo = this.curChunkInfo;
		var eod = matChunkInfo.data_start_pos + matChunkInfo.data_length;

		while(this.curPos < eod){
			this.nextChunkInfo();

			switch(this.curChunkInfo.id){
				case 0xA000: //Material Name
					this.setLevel(3, "A000(Name)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Material Name...");

					matObj.name = this.getString(null);
					
					break;
				case 0xA010:
					this.setLevel(3, "A010(Ambient Color)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Ambient Color...");

					matObj.ambient = this.getColor();

					break;
				case 0xA020:
					this.setLevel(3, "A020(Diffuse Color)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Diffuse Color...");

					matObj.diffuse = this.getColor();

					break;
				case 0xA030:
					this.setLevel(3, "A030(Specular Color)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Specular Color...");

					matObj.specular = this.getColor();

					break;
				case 0xA040:
					this.setLevel(3, "A040(Shininess)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Shininess...");

					matObj.shininess = this.getPercent();

					break;
				case 0xA041:
					this.setLevel(3, "A041(Shininess Strength 1)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Shininess Strength 1...");

					matObj.shin_strg1 = this.getPercent();

					break;
				case 0xA042:
					this.setLevel(3, "A042(Shininess Strength 2)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Shiniess Strength 2...");

					matObj.shin_strg2 = this.getPercent();

					break;
				case 0xA050:
					this.setLevel(3, "A050(Transparency)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Transparency...");

					matObj.transparency = this.getPercent();

					break;
				case 0xA052:
					this.setLevel(3, "A052(Transparency Fall Off)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Transparency Fall Off...");

					matObj.trans_fall_off = this.getPercent();

					break;
				case 0xA053:
					this.setLevel(3, "a053(Reflect Blur)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Reflect Blur...");

					matObj.reflect_blur = this.getPercent();

					break;
				case 0xA100:
					this.setLevel(3, "a100(Type)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Type...");

					matObj.type = this.getShort(); //material type, 1=flat 2=gour. 3=phong 4=metal

					break;
				case 0xa084:
					this.setLevel(3, "a084(Self Illum)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Self Illum...");

					matObj.self_illum = this.getPercent();

					break;
				case 0xa08a:
					this.setLevel(3, "a08a(Transparency Fall Off In)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Transpare...")

					matObj.trans_falloff_in = null; //so far everyone I have seen has a length of 0
					
					break;
				case 0xA087:
					this.setLevel(3, "A087(Wire Size)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Wire Size...");

					matObj.wire_size = this.getFloat();

					break;
				case 0xA081:
					this.setLevel(3, "A081(Two Sided)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Two Sided...");

					matObj.two_side = null; // so far everyone I have seen has a length of 0

					break;
				case 0xA082:
					this.setLevel(3, "A082(Decal)");
					
					matObj.decal = null;
					
					this.handleUnparsedChunk(0);

					break;
				case 0xA083:
					this.setLevel(3, "A083(Transparency Additive)");
					
					matObj.trans_add = null;
					
					this.handleUnparsedChunk(0);

					break;
				case 0xA085:
					this.setLevel(3, "A085(Wire On)");
					
					matObj.wire_on = null;
					
					this.handleUnparsedChunk(0);

					break;
				case 0xA086:
					this.setLevel(3, "A086(Super SMP)");
					
					this.handleUnparsedChunk(0);
					
					matObj.super_smp = null;
					
					break;
				case 0xA088:
					this.setLevel(3, "A088(Face Map)");
					
					this.handleUnparsedChunk(0);
					
					matObj.face_map = null;
					
					break;
				case 0xA08C:
					this.setLevel(3, "A08C(Phong Soft)");
					
					this.handleUnparsedChunk(0);
					
					matObj.phong_soft = null;
					
					break;
				case 0xA08E:
					this.setLevel(3, "A08E(Wire ABS)");
					
					this.handleUnparsedChunk(0);
					
					matObj.abs = null;
					
					break;
				case 0xA100:
					this.setLevel(3, "A100(Shading)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Shading...");
					
					matObj.shading = this.getInt();
					
					break;
				case 0xA200:
					this.setLevel(3, "A200(Texture Map)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Texture Map...");

					matObj.texture_map = this.parseMap();

					break;
				case 0xA204:
					this.setLevel(3, "A204(Specular Map)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Specular Map...");

					matObj.specular_map = this.parseMap();

					break;
				case 0xA210:
					this.setLevel(3, "A210(Opacity Map)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Opacity Map...");

					matObj.opacity_map = this.parseMap();

					break;
				case 0xA220:
					this.setLevel(3, "A220(Relection Map)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Reflection Map...");
					
					matObj.reflection_map = this.parseMap();

					break;
				case 0xA230:
					this.setLevel(3, "A230(Bump Map)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Bump Map...");
					
					matObj.bump_map = this.parseMap();
					
					break;
				case 0xA33A:
					this.setLevel(3, "A33A(Texture2 Map)");

					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Texture2 Map...)");

					matObj.texture2_map = this.parseMap();

					break;
				case 0xA33C:
					this.setLevel(3, "A33C(Shininess Map)");

					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Shininess Map...");

					matObj.shin_map = this.parseMap();

					break;
				case 0xA33D:
					this.setLevel(3, "A33D(Self Illum Map)");

					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Self Illum Map...");

					matObj.self_illum_map = this.parseMap();

					break;
				default:
					this.handleUnparsedChunk(1);
					break;
			}
		}

		return matObj;
	},
	parseMap: function(){
		var obj = {};

		var eod = this.curPos + this.curChunkInfo.data_length;

		obj.amount = this.getPercent();

		while(this.curPos < eod){
			this.nextChunkInfo();

			switch(this.curChunkInfo.id){
				case 0xA252:
					this.setLevel(4, "a252(Bump Percent)");

					this.writeChunkToLog(1);
					this.verboseToConsole(".... Parsing Bump Percent...");

					obj.bump_pct = this.getShort();

					break;
				case 0xA300:
					this.setLevel(4, "a300(Map File Name)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole(".... Parsing Map File Name...");

					obj.file_name = this.getString(null);

					break;
				case 0xA351:
					this.setLevel(4, "a351(Map Options)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole(".... Parsing Map Options...");

					obj.options = this.getShort();

					break;
				case 0xa353:
					this.setLevel(4, "a353(Map Filtering Blur)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole(".... Parsing Map Filtering Blur...");

					obj.filtering_blur = this.getFloat();

					break;
				case 0xa354:
					this.setLevel(4, "a354(Map UScale)");

					this.writeChunkToLog(1);
					this.verboseToConsole(".... Parsing Map UScale...");

					obj.u_scale = this.getFloat();

					break;
				case 0xa356:
					this.setLevel(4, "a356(Map VScale)");

					this.writeChunkToLog(1);
					this.verboseToConsole(".... Parsing Map VScale...");

					obj.v_scale = this.getFloat();

					break;
				case 0xa358:
					this.setLevel(4, "a358(Map UOffset)");

					this.writeChunkToLog(1);
					this.verboseToConsole(".... Parsing Map UOffset...");

					obj.u_offset = this.getFloat();

					break;
				case 0xa35a:
					this.setLevel(4, "a35a(Map VOffset)");

					this.writeChunkToLog(1);
					this.verboseToConsole(".... Parsing Map VOffset...");

					obj.v_offset = this.getFloat();

					break;
				default:
					this.handleUnparsedChunk(1);
					break;
			}
		}

		return obj;
	},
	parseObjects: function(){ // Chunk 0x4000, Child of 0x3d3d
		var objObj = {
			name: this.getString(null),
		};

		var objChunk = this.curChunkInfo;
		var eod = objChunk.data_start_pos + objChunk.data_length;

		while(this.curPos < eod){
			this.nextChunkInfo();

			switch(this.curChunkInfo.id){
				case 0x4100:
					this.setLevel(3, "4100(Mesh)");
					
					this.verboseToConsole("... Parsing Mesh Data...");
					this.writeChunkToLog(1);

					if(!objObj.mesh){
						objObj.mesh = [];
					}
					
					objObj.mesh.push(this.parseMesh());
					this.meshCt++;

					break;
				case 0x4600:
					this.setLevel(3, "4600(Light)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Light Data...");

					if(!objObj.light){
						objObj.light = [];
					}

					objObj.light.push(this.parseLight());

					break;
				case 0x4700:
					this.setLevel(3, "4700(Camera)");
					
					this.verboseToConsole("... Parsing Camera Data...");
					this.writeChunkToLog(1);

					if(!objObj.camera){
						objObj.camera = [];
					}

					objObj.camera.push(this.parseCamera());

					break;
				default:
					this.handleUnparsedChunk(1);
					break;
			}
		}

		return objObj;
	},
	parseMesh: function(){ // Chunk 0x4100, Child of 0x4000
		var meshObj = {};

		var meshChunk = this.curChunkInfo;
		var eod = meshChunk.data_start_pos + meshChunk.data_length;

		while(this.curPos < eod){
			this.nextChunkInfo();

			switch(this.curChunkInfo.id){
				case 0x4110:
					this.setLevel(4, "4110(Vertices)");
					
					this.verboseToConsole(".... Parsing Vertices...");
					this.writeChunkToLog(1);

					meshObj.vertices = this.parseVertices();

					break;
				case 0x4111:
					this.setLevel(4, "4111(Vertex Flags)");
					
					this.verboseToConsole(".... Parsing Vertex Flags..");
					this.writeChunkToLog(1);

					meshObj.vertex_flags = this.parseVertexFlags();
					
					break;
				case 0x4120:
					this.setLevel(4, "4120(Faces)");
					
					this.verboseToConsole(".... Parsing Faces...");
					this.writeChunkToLog(1);

					meshObj.faces = this.parseFaces();
					
					break;
				case 0x4140:
					this.setLevel(4, "4140(Mapping Coordinates)");
					
					this.verboseToConsole(".... Parsing Mapping Coordinates...");
					this.writeChunkToLog(1);

					meshObj.mapping_coords = this.parseMappingCoords();
					
					break;
				case 0x4160:
					this.setLevel(4, "4160(Local Coordinates)");
					
					this.verboseToConsole(".... Parsing Local Coordinates...");
					this.writeChunkToLog(1);

					meshObj.local_coords = this.parseLocalCoords();
					
					break;
				case 0x4170:
					this.setLevel(4, "4170(Textures)");
					
					this.verboseToConsole(".... Parsing Textures...");
					this.writeChunkToLog(1);

					meshObj.texture = this.parseTexture();
					
					break;
				default:
					this.handleUnparsedChunk(1);
					break;
			}
		}

		return meshObj;
	},
	parseVertices: function(){ // Chuck 0x4110, Child of 0x4100
		if(this.curChunkInfo.id === 0x4110){
			var points = this.getShort();
			var chunkLen = points * 12; // a point = (float_x, float_y , float_z) | float = 4 bytes | data len = number of points * (4 + 4 + 4)

			var dataChunk = this.readChunkFromFile(chunkLen);

			if(dataChunk !== null){
				var verts = []; // [x,y,z,x,y,z,x,y,z,x,y,...]
				var curPtPos = 0; // holds the next byte position for the next point.

				for(var i = 0; i < points; i++){
					curPtPos = i * 12; // a point (x,y,z) are 3 floating point values, a float = 4 bytes;

					verts.push(dataChunk.readFloatLE(curPtPos, true));     // x
					verts.push(dataChunk.readFloatLE(curPtPos + 4, true)); // y
					verts.push(dataChunk.readFloatLE(curPtPos + 8, true)); // z
				}
				
				return {
					count: points,
					points: verts
				};
			}

			return [];
		}

		return null;
	},
	parseVertexFlags: function(){ // Chunk 0x4111, Child of 0x4100
		var flagCt = this.getShort();
		var flags = []; //an array of shorts

		var dataLen = flagCt * 2;
		var dataChunk = this.readChunkFromFile(dataLen);

		if(dataChunk !== null){
			for(var i = 0; i < flagCt; i++){
				flags.push(dataChunk.readUInt16LE(i * 2, true));
			}

			return {
				count: flagCt,
				flags: flags
			}
		}

		return null;
	},
	parseFaces: function(){ // Chunk 0x4120, Child of 0x4100
		var obj = {};

		var faceChunkInfo = this.curChunkInfo;
		var eod = faceChunkInfo.data_start_pos + faceChunkInfo.data_length;
		
		var faceCt = this.getShort();

		var chunkLen = faceCt * 8; //face = (short_vert1, short_vert2, short_vert3, short_flags) | short = 2 bytes

		var dataChunk = this.readChunkFromFile(chunkLen);

		if(dataChunk !== null){
			var faces = []; // [face, face, face, etc..]
			var face = [];  // [vert1, vert2, vert3, flags]
			var chunkPos = 0;

			for(var i = 0; i < faceCt; i++){
				chunkPos = i * 8;

				face = [
					dataChunk.readUInt16LE(chunkPos, true),     // vert1
					dataChunk.readUInt16LE(chunkPos + 2, true), // vert2
					dataChunk.readUInt16LE(chunkPos + 4, true), // vert3
					dataChunk.readUInt16LE(chunkPos + 6, true)  // Flags
				];

				faces.push(face);
			}

			obj.count = faceCt;
			obj.faces = faces;
		}
		
		while(this.curPos < eod){
			this.nextChunkInfo();

			switch(this.curChunkInfo.id){
				case 0x4130:
					this.setLevel(5, "4130(Material)");
					
					this.verboseToConsole("..... Parsing Mesh Material...");
					this.writeChunkToLog(1);

					if(!obj.material) { obj.material = []; }
					obj.material.push(this.parseMeshMat());

					break;
				case 0x4150:
					this.setLevel(5, "4150(Smoothing)");
					
					this.verboseToConsole("..... Parsing Mesh Smoothing...");
					this.writeChunkToLog(1);

					obj.smoothing = this.parseMeshSmooth();
					
					break;
				default:
					this.handleUnparsedChunk(1);
					break;
			}
		}

		return obj;
	},
	parseMeshMat: function(){ // Chunk 0x4130, Child of 0x4120
		var name = this.getString(null);
		var faceCt = this.getShort();

		var chunkLen = faceCt * 2;
		var dataChunk = this.readChunkFromFile(chunkLen);

		if(dataChunk !== null){
			var faces = []; //an array of shorts

			for(var i = 0; i < faceCt; i++){
				faces.push(dataChunk.readUInt16LE(i * 2, true));
			}

			return {
				name: name,
				count: faceCt,
				faces: faces
			}
		}

		return null;
	},
	parseMeshSmooth: function(){ // Chunk 0x4150, Child of Chunk 0x4120
		var total = this.curChunkInfo.data_length / 2;
		var ary = [];

		var dataChunk = this.readChunkFromFile(this.curChunkInfo.data_length);

		if(dataChunk !== null){
			for(var i = 0; i < total; i++){
				ary.push(dataChunk.readUInt16LE(i * 2, true));
			}

			return ary;
		}
		
		return [];
	},
	parseMappingCoords: function(){ //Chunk 0x4140, Child of 0x4100
		var vertCt = this.getShort();
		var vertUVCt = vertCt * 2; // vertex = u,v
		var verts = []; // a vertex = float u, v... [u,v,u,v,u,v,...]
		
		var chunkLen = vertCt * 8;
		
		var dataChunk = this.readChunkFromFile(chunkLen);

		if(dataChunk !== null){
			for(var i = 0; i < vertUVCt; i++){
				verts.push(dataChunk.readFloatLE(i * 4, true));
			}
			
			return {
				count: vertCt,
				vertex: verts
			};
		}

		return null;
	},
	parseLocalCoords: function(){ //Chunk 0x4160, Child of 0x4100
		if(this.curChunkInfo.data_length == 48){ //float 4x3 matrix
			var matrix = [];
			var set = [];

			var dataChunk = this.readChunkFromFile(this.curChunkInfo.data_length);
			var pos = 0;

			for(var i = 0; i < 4; i++){
				set = [];

				for(var j = 0; j < 3; j++){
					set.push(dataChunk.readFloatLE(pos, true));
					pos += 4;
				}

				matrix.push(set);
			}
			
			return matrix;
		}
		
		return null;
	},
	parseTexture: function(){ // Chunk 0x4170, Child of 0x4100
		var buffer = this.readChunkFromFile(this.curChunkInfo.data_length);

		if(buffer !== null){
			var type = buffer.readUInt16LE(0, true);

			var tiling = [
				buffer.readFloatLE(2, true), // x
				buffer.readFloatLE(6, true)  // y
			];

			var icon = [
				buffer.readFloatLE(10, true), // x
				buffer.readFloatLE(14, true), // y
				buffer.readFloatLE(18, true)  // z
			];

			var matrix = []; // 4x3 matrix (float)
			var set = [];

			var pos = 22;

			for(var i = 0; i < 4; i++){
				set = [];

				for(var j = 0; j < 3; j++){
					set.push(buffer.readFloatLE(pos, true));
					pos += 4;
				}

				matrix.push(set);
			}

			var scaling = [
				buffer.readFloatLE(pos, true),     // scaling
				buffer.readFloatLE(pos + 4, true), // plan icon w
				buffer.readFloatLE(pos + 8, true), // plan icon h
				buffer.readFloatLE(pos + 12, true) // cyl icon h
			];

			return {
				type: type,
				tiling: tiling,
				icon: icon,
				matrix: matrix,
				scaling: scaling
			};
		}
		
		return null;
	},
	parseLight: function(){ // Chunk 0x4600, Child of 0x4100
		// var light = {};
		// var buffer = this.getChunkFromFile(12);

		// if(buffer !== null){
		// 	light.position = [
		// 		buffer.readFloatLE(0, true),
		// 		buffer.readFloatLE(4, true),
		// 		buffer.readFloatLE(8, true)
		// 	];
		// }

		//need a file with this info to parse
		this.handleUnparsedChunk(0);

		return null;
	},
	parseCamera: function(){ // Chunk 0x4700, Child of 0x4100
		var camera = {};
		var eod = this.curPos + this.curChunkInfo.data_length;

		var buffer = this.readChunkFromFile(32);

		if(buffer !== null){
			camera.pos = [
				buffer.readFloatLE(0, true), // x
				buffer.readFloatLE(4, true), // y
				buffer.readFloatLE(8, true)  // z
			];

			camera.target_pos = [
				buffer.readFloatLE(12, true), // x
				buffer.readFloatLE(16, true), // y
				buffer.readFloatLE(20, true)  // z
			];

			camera.bank_ang = buffer.readFloatLE(24, true);
			camera.focus = buffer.readFloatLE(28, true);			
		}

		while(this.curPos < eod){
			this.nextChunkInfo();

			switch(this.curChunkInfo.id){
				case 0x4710:
					this.setLevel(4, "4710(Camera Cone)");

					if(this.curChunkInfo.data_length > 0){
						this.handleUnparsedChunk(0)
					}
					else{
						this.writeChunkToLog(1);
						this.verboseToConsole(".... Parsing Camera Cone...");

						camera.cone = null; // seem to be always dataless...	
					}
					
					break;
				case 0x4720:
					this.setLevel(4, "4720(Range)");

					this.writeChunkToLog(1);
					this.verboseToConsole(".... Parsing Camera Range...");

					camera.range = this.parseCameraRange();

					break;
			}
		}

		return camera;
	},
	parseCameraRange: function(){
		var range = [];

		var buffer = this.readChunkFromFile(8);

		if(buffer !== null){
			range = [
				buffer.readFloatLE(0, true), // near
				buffer.readFloatLE(4, true)  // far
			];	
		}

		return range;
	},
	parseViewport: function(){ //Chunk 0x7001, Child of 0x3d3d
		var eod = this.curPos + this.curChunkInfo.data_length;
		var buffer = this.readChunkFromFile(14);

		if(buffer !== null){
			var vp = {
				form: buffer.readUInt16LE(0, true),
				top: buffer.readUInt16LE(2, true),
				ready: buffer.readUInt16LE(4, true),
				wstate: buffer.readUInt16LE(6, true),
				swapws: buffer.readUInt16LE(8, true),
				swapport: buffer.readUInt16LE(10, true),
        swapcur: buffer.readUInt16LE(12, true)
			};

			while(this.curPos < eod){
				this.nextChunkInfo();
				
				switch(this.curChunkInfo.id){
					case 0x7020:
						this.setLevel(3, "7020(Viewport Size)");

						this.writeChunkToLog(1);
						this.verboseToConsole("... Parsing Viewport Size...");

						vp.size = this.parseViewportSize();

						break;
					case 0x7012:
						this.setLevel(3, "7012(Viewport Data 3)");

						this.writeChunkToLog(1);
						this.verboseToConsole("... Parsing Viewport Data 3...");

						if(!vp.data_3 || vp.data_3 === null){
							vp.data_3 = [];
						}

						vp.data_3.push(this.parseViewportData());

						break;
					case 0x7011:
						this.setLevel(3, "7011(Viewport Data)");

						this.writeChunkToLog(1);
						this.verboseToConsole("... Parsing Viewport Data...");

						if(!vp.data || vp.data === null){
							vp.data = [];
						}

						vp.data.push(this.parseViewportData());

						break;
					default:
						this.handleUnparsedChunk(1);
						break;
				}
			}

			return vp;
		}

		return null;
	},
	parseViewportSize: function(){ // Chunk 0x7020, Child of 0x7001
		var buffer = this.readChunkFromFile(8);

		if(buffer !== null){
			return [
				buffer.readUInt16LE(0), // x
				buffer.readUInt16LE(2), // y
				buffer.readUInt16LE(4), // w
				buffer.readUInt16LE(6)  // h
			];
		}

		return null;
	},
	parseViewportData: function(){ // Chunk 0x7012, Child of 0x7001
		var vpd = null;
		var lenOfData = 38;
		var lenOfName = this.curChunkInfo.data_length - lenOfData;

		var buffer = this.readChunkFromFile(lenOfData);

		if(buffer !== null){
			vpd = {
				flags: buffer.readUInt16LE(0, true),
				axis_lockout: buffer.readUInt16LE(2, true),
				win:[
					buffer.readUInt16LE(4, true), // x
					buffer.readUInt16LE(6, true), // y
					buffer.readUInt16LE(8, true), // w
					buffer.readUInt16LE(10, true), // h
					buffer.readUInt16LE(12, true), // view
				],
				zoom: buffer.readFloatLE(16, true),
				world_center: [
					buffer.readFloatLE(20, true), // x
					buffer.readFloatLE(24, true), // y
					buffer.readFloatLE(28, true)  // z
				],
				horiz_ang: buffer.readFloatLE(32, true),
				vert_ang: buffer.readFloatLE(34, true),
				camera_name: this.getString(lenOfName)
			};
		}
    
    return vpd;
	},
	parseKeyFramer: function(){ //Chunk 0xB000, Child of 0x4d4d
		var keyObj = {};

		var keyFChunkInfo = this.curChunkInfo;
		var eod = keyFChunkInfo.data_start_pos + keyFChunkInfo.data_length;

		while(this.curPos < eod){
			this.nextChunkInfo();

			switch(this.curChunkInfo.id){
				case 0xB00A:
					this.setLevel(2, "B00A(Header Info)");
					
					this.verboseToConsole(".. Parsing Key Framer Info...");
					this.writeChunkToLog(1);

					keyObj.revision = this.getShort();
					keyObj.name = this.getString(null);
					keyObj.animation_length = this.getShort();
					this.jump(2); //null chunk
					
					break;
				case 0xB008:
					this.setLevel(2, "B008(Segment)");
					
					this.verboseToConsole(".. Parsing start and end frames...");
					this.writeChunkToLog(1);

					keyObj.start = this.getShort();
					this.jump(2); // null chunk
					keyObj.end = this.getShort();
					this.jump(2); // null chunk
					
					break;
				case 0xB009:
					this.setLevel(2, "B009(Curtime)");
					
					this.verboseToConsole(".. Parsing Current Frame...");
					this.writeChunkToLog(1);

					keyObj.cur_time = this.getShort();
					this.jump(2); // null chunk
					
					break;
				case 0xB002:
					this.setLevel(2, "B002(Object)");
					
					this.verboseToConsole(".. Parsing Key Framer Object...");
					this.writeChunkToLog(1);

					if(!keyObj.nodes){
						keyObj.nodes = [];
					}

					keyObj.nodes.push(this.parseNodeInfo());
					
					break;
				case 0xB001:
					this.setLevel(2, "B002(Ambient)");

					this.writeChunkToLog(1);
					this.verboseToConsole(".. Parsing Key Framer Ambient...");

					if(!keyObj.ambient){
						keyObj.ambient = [];
					}

					keyObj.ambient.push(this.parseNodeInfo());
					
					break;
				case 0xB003:
					this.setLevel(2, "B003(Camera)");

					this.writeChunkToLog(1);
					this.verboseToConsole(".. Parsing Key Framer Camera...");

					if(!keyObj.camera){
						keyObj.camera = [];
					}

					keyObj.camera.push(this.parseNodeInfo());

					break;
				case 0xB004:
					this.setLevel(2, "B004(Target)");

					this.writeChunkToLog(1);
					this.verboseToConsole(".. Parsing Key Framer Target...");

					if(!keyObj.target){
						keyObj.target = [];
					}

					keyObj.target.push(this.parseNodeInfo());

					break;
				case 0x7001:
					this.setLevel(2, "7001(Viewport)");

					this.writeChunkToLog(1);
					this.verboseToConsole(".. Parsing Viewport Data...");

					if(!keyObj.view_ports){
						keyObj.view_ports = [];
					}

					keyObj.view_ports.push(this.parseViewport());

					break;
				default:
					this.handleUnparsedChunk(1);
					break;
			}
		}

		return keyObj;
	},
	parseNodeInfo: function(){ //Chunk 0xB002, Child of 0xB000
		var obj = {};
		var nodeChunkInfo = this.curChunkInfo;
		var eod = nodeChunkInfo.data_start_pos + nodeChunkInfo.data_length;

		while(this.curPos < eod){
			this.nextChunkInfo();

			switch(this.curChunkInfo.id){
				case 0xB010:
					this.setLevel(3, "b010(Node HDR)");

					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Node HDR...")

					obj.hierarch = {
						name: this.getString(null),
						flag1: this.getShort(),
						flag2: this.getShort(),
						hierarchy: this.getShort()
					};

					break;
				case 0xB011:
					this.setLevel(3, "b011(Instance Name)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Instance Name...");
					
					obj.instance_name = this.getString(null);
					
					break;
				case 0xB013:
					this.setLevel(3, "b013(Pivot)");

					this.writeChunkToLog(1);					
					this.verboseToConsole("... Parsing Pivot...")

					var buffer = this.readChunkFromFile(this.curChunkInfo.data_length);

					if(buffer !== null){
						obj.pivot = [
							buffer.readFloatLE(0, true), // x
							buffer.readFloatLE(4, true), // y
							buffer.readFloatLE(8, true)  // z
						];
					}

					break;
				case 0xB014: //x,y,z limits as float value
					this.setLevel(3, "b014(Bounding Box)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Bounding Box...");

					obj.bounding_box = this.parseBoundingBox();
					
					break;
				case 0xB015:
					this.setLevel(3, "b014(Morph Smoothing)");

					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Morph Smoothing...");

					obj.morph_smoothing = this.getFloat();

					break;
				case 0xB020:
					this.setLevel(3, "b020(Position Track)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Position Track...");

					obj.pos_track = this.parsePositionTrack();
					
					break;
				case 0xB021:
					this.setLevel(3, "b021(Rotation)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Rotation...");

					obj.rotation = this.parseRotation();
					
					break;
				case 0xB022:
					this.setLevel(3, "b022(Scale)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Scale...");

					obj.scale = this.parseScale();
					
					break;
				case 0xB023:
					this.setLevel(3, "b023(FOV Track)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing FOV Track...");

					obj.fov_track = this.parseFOVTrack();
					
					break;	
				case 0xB024:
					this.setLevel(3, "b024(Roll Track)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Roll Track...");

					obj.roll_track = this.parseRollTrack();
					
					break;	
				case 0xB025:
					this.setLevel(3, "b025(Color Track)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Color Track...");

					obj.color_track = this.parseColorTrack();
					
					break;
				case 0xB026:
					this.setLevel(3, "b026(Morph Track)");
										
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Morph Track...");

					obj.morph_track = this.parseMorphTrack();

					break;
				case 0xB027:
					this.setLevel(3, "b027(Hot Spots)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Hot Spots...");

					obj.hotspots = this.parseHotSpots();
					
					break;
				case 0xB028:
					this.setLevel(3, "b028(Fall Off Track)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Fall Off Track...");

					obj.fall_track = this.parseFallOffTrack();
					
					break;
				case 0xB029: //HIDE_TRACK_TAG
					this.setLevel(3, "b029(Hide Track)");
					
					//don't have any specs on this... jump
					this.handleUnparsedChunk(0);
					break;
				case 0xB030:
					this.setLevel(3, "B030(Id)");
					
					this.writeChunkToLog(1);
					this.verboseToConsole("... Parsing Id...");

					obj.id = this.getShort();
					
					break;
				default:
					this.handleUnparsedChunk(1);
					break;
			}
		}

		return obj;
	},
	parseBoundingBox: function(){
		// Data is the min and max floating point values of x, y, z
		var buffer = this.readChunkFromFile(this.curChunkInfo.data_length);

		if(buffer !== null){
			return [
				[buffer.readFloatLE(0, true), buffer.readFloatLE(12, true)], // [x1, x2]
				[buffer.readFloatLE(4, true), buffer.readFloatLE(16, true)], // [y1, y2]
				[buffer.readFloatLE(8, true), buffer.readFloatLE(20, true)]  // [z1, z2]
			];
		}

		return null;
	},
	parsePositionTrack: function(){
		var obj = this.parseCommonKeyFramerObj();

		var positions = [];
		var typedef = null;
		var buffer = null;

		for(var i = 0; i < obj.keys; i++){
			typedef = this.parseCommonTypeDefObj();

			buffer = this.readChunkFromFile(12);

			if(buffer !== null){
				typedef.pos = [
					buffer.readFloatLE(0, true), // x
					buffer.readFloatLE(4, true), // y
					buffer.readFloatLE(8, true)  // z
				];
			}

			positions.push(typedef);
		}

		obj.positions = positions;

		return obj;
	},
	parseRotation: function(){
		var obj = this.parseCommonKeyFramerObj();

		var rotations = [];
		var typedef = null;
		var buffer = null;

		for(var i = 0; i < obj.keys; i++){
			typedef = this.parseCommonTypeDefObj();

			buffer = this.readChunkFromFile(16);

			if(buffer !== null){
				typedef.rotation = buffer.readFloatLE(0, true); // in rads
				typedef.pos = [
					buffer.readFloatLE(4, true), // x
					buffer.readFloatLE(8, true), // y
					buffer.readFloatLE(12, true) // z
				];
			}

			rotations.push(typedef);
		}

		obj.rotations = rotations;

		return obj;
	},
	parseScale: function(){
		var obj = this.parseCommonKeyFramerObj();

		var scales = [];
		var typedef = '';
		var buffer = null;

		for(var i = 0; i < obj.keys; i++){
			typedef = this.parseCommonTypeDefObj();
			
			buffer = this.readChunkFromFile(12);

			if(buffer !== null){
				typedef.points = [
					buffer.readFloatLE(0, true), // x
					buffer.readFloatLE(4, true), // y
					buffer.readFloatLE(8, true)  // z
				];
			}

			scales.push(typedef);
		}

		obj.scales = scales;

		return obj;
	},
	parseFOVTrack: function(){
		var obj = this.parseCommonKeyFramerObj();

		var fovs = [];
		var typedef = '';

		for(var i = 0; i < obj.keys; i++){
			typedef = this.parseCommonTypeDefObj();
			typedef.field_of_view = this.getFloat();

			fovs.push(typedef);
		}

		obj.fovs = fovs;

		return obj;
	},
	parseRollTrack: function(){
		var obj = this.parseCommonKeyFramerObj();

		var rolls = [];
		var typedef = '';

		for(var i = 0; i < obj.keys; i++){
			typedef = this.parseCommonTypeDefObj();
			typedef.camera_roll = this.getFloat();

			rolls.push(typedef);
		}

		obj.rolls = rolls;

		return obj;
	},
	parseColorTrack: function(){
		var obj = this.parseCommonKeyFramerObj();

		var colors = [];
		var typedef = '';
		var buffer = null;

		for(var i = 0; i < obj.keys; i++){
			typedef = this.parseCommonTypeDefObj();
			
			buffer = this.readChunkFromFile(12);

			if(buffer !== null){
				typedef.rbg = [
					buffer.readFloatLE(0, true), // x
					buffer.readFloatLE(4, true), // y
					buffer.readFloatLE(8, true)  // z
				];
			}
			
			colors.push(typedef);
		}
		
		obj.colors = colors;

		return obj;
	},
	parseMorphTrack: function(){
		var obj = this.parseCommonKeyFramerObj();

		var morphs = [];
		var typedef = '';

		for(var i = 0; i < obj.keys; i++){
			typedef = this.parseCommonTypeDefObj();
			typedef.name = this.getString(null);

			morphs.push(morphs);
		}

		obj.morphs = morphs;

		return obj;
	},
	parseHotSpots: function(){
		var obj = this.parseCommonKeyFramerObj();

		var hots = [];
		var typedef = '';

		for(var i = 0; i < obj.keys; i++){
			typedef = this.parseCommonTypeDefObj();
			typedef.hotspot_angle = this.getFloat();

			hots.push(typedef);
		}

		obj.hot_spots = hots;

		return obj;
	},
	parseFallOffTrack: function(){
		var obj = this.parseCommonKeyFramerObj();

		var falls = [];
		var typedef = '';

		for(var i = 0; i < obj.keys; i++){
			typedef = this.parseCommonTypeDefObj();
			typedef.falloff_angle = this.getFloat();

			falls.push(typedef);
		}

		obj.fall_offs = falls;

		return obj;
	},
	parseCommonKeyFramerObj: function(){
		var buffer = this.readChunkFromFile(14);

		if(buffer !== null){
			return {
				flags: buffer.readUInt16LE(0, true),
				unknown: [
					buffer.readUInt16LE(2, true),
					buffer.readUInt16LE(4, true),
					buffer.readUInt16LE(6, true),
					buffer.readUInt16LE(8, true)
				],
				keys: buffer.readUInt16LE(10, true),
				unkown2: buffer.readUInt16LE(12, true)
			};
		}

		return null;
	},
	parseCommonTypeDefObj: function(){
		var buffer = this.readChunkFromFile(6);

		if(buffer !== null){
			return {
				frame_num: buffer.readUInt16LE(0, true),
				unknown_long: buffer.readUInt32LE(2, true)
			};
		}
		
		return null;
	},
	formatHex: function(hex){
		var hexStr = hex.toString(16).toUpperCase();

		switch(hexStr.length){
			case 1:
				hexStr = "000" + hexStr;
				break;
			case 2:
				hexStr = "00" + hexStr;
				break;
			case 3:
				hexStr = "0" + hexStr;
				break;
		}

		return hexStr;
	},
	getStatsString: function(parseTime){
		return "Stats" +
		"\r\n------------------------------------------------------" +
		"\r\nBytes Read: " + this.numOfBytes.read +
		"\r\nHeaders Found: " + this.headerCt +
		"\r\nHeaders Unparsed: " + this.unparsedCt +
		"\r\nMaterails Found: " + this.matCt + 
		"\r\nMeshes Found: " + this.meshCt + 
		"\r\nParse Time: " + parseTime[0] + "s and " + parseTime[1] + "ns" + 
		"\r\n------------------------------------------------------";
	},
	displayStats: function(parseTime){
		if(this.verbose_options.onlyStats === true){
			console.log(" ");
		}

		console.log("\r\n" + this.getStatsString(parseTime));
	},
	verboseToConsole: function(str){
		if(this.verbose === true && this.verbose_options.onlyStats === false){
			console.log(str);
		}
	},
	saveToJson: function(data){
		if(data && this.saveJson === true){
			var jsonPath = this.save_options.path + this.dirs.json;;

			this.mkDir(jsonPath);

			if(this.save_options.jsonPerItem !== true){
				var jsonFile = jsonPath + this.fileName + '.json';
				
				this.fs.writeFileSync(jsonFile, JSON.stringify(data));

				this.writeFileToLog("Complete", this.fileName, jsonFile);
				this.verboseToConsole("JSON file save: " + jsonFile);
			}
			else{
				if(data.edit !== null){
					this.saveEdit(jsonPath, data.edit);
				}
				if(data.keyFramer !== null){
					this.saveKeyFramer(jsonPath, data.keyFramer);
				}
			}
		}
	},
	saveEdit: function(path, data){
		if(data && path){
			var editPath = path + this.dirs.edit;

			this.mkDir(editPath);

			if(data.materials !== null && data.materials.length > 0){
				this.saveMaterials(editPath, data.materials);
			}

			if(data.objects !== null && data.objects.length > 0){
				this.saveObjects(editPath, data.objects);
			}

			if(data.view_ports !== null && data.objects.length > 0){
				this.saveViewports(editPath, data.view_ports);
			}
		}
	},
	saveMaterials: function(path, data){
		if(data && path){
			var matPath = path + this.dirs.mat;
			var matFile = '';
			var matObj = '';
			var matName = '';

			this.mkDir(matPath);

			for(var i = 0; i < data.length; i++){
				matObj = data[i];
				matName = this.mkFileName(matObj.name);
				matFile = matPath + matName + ".json";

				this.fs.writeFileSync(matFile, JSON.stringify(matObj));

				this.writeFileToLog("Material", matName, matFile);
				this.verboseToConsole("Saved Material " + matName + " to file: " + matFile);
			}
		}
	},
	saveObjects: function(path, data){
		if(data && path){
			var objPath = path + this.dirs.obj;
			var objFile = '';
			var objObj = '';
			var objName = '';

			this.mkDir(objPath);

			for(var i = 0; i < data.length; i++){
				objObj = data[i];
				objName = this.mkFileName(objObj.name);
				objFile = objPath + objName + ".json";

				this.fs.writeFileSync(objFile, JSON.stringify(objObj));

				this.writeFileToLog("Object", objName, objFile);
				this.verboseToConsole("Saved Object " + objName + " to file: " + objFile);
			}
		}
	},
	saveViewports: function(path, data){
		if(data && path){
			var vpPath = path + this.dirs.view;
			var vpFile = '';
			var vpObj = '';
			var vpName = '';

			this.mkDir(vpPath);

			for(var i = 0; i < data.length; i++){
				vpObj = data[i];
				vpName += "viewport_" + i;
				vpFile = vpPath + vpName + ".json";

				this.fs.writeFileSync(vpFile, JSON.stringify(vpObj));

				this.writeFileToLog("Viewport", vpName, vpFile);
				this.verboseToConsole("Saved Viewport " + vpName + " to file: " + vpFile);
			}
		}
	},
	saveKeyFramer: function(path, data){
		if(data && path){
			var keyPath = path + this.dirs.keyF;
			var keyFile = keyPath + "key_framer.json";

			this.mkDir(keyPath);

			this.fs.writeFileSync(keyFile, JSON.stringify(data));

			this.writeFileToLog("Key Framer", "Key Framer", keyFile);
			this.verboseToConsole("Saved Key Framer data to file: " + keyFile);
		}
	},
	mkFileName: function(name){
		if(name && typeof name == "string" && name != ' '){
			if(name.charAt(0) == ' '){name = name.slice(1);}
			if(name.charAt(name.length - 1) == ' '){name = name.slice(0, name.length - 1);}
			name = name.replace(/ /g, '_');
		}

		return name;
	},
	mkDir: function(path){
		if(path){
			if(!this.fs.existsSync(path)){
				this.fs.mkdirSync(path);
			}
		}
	}
};

//###############################################################################################################################
// Helper Functions
//###############################################################################################################################

function getPrintRowLabel(counter){
	var lbAry = [];

	for(var i = 0; i < counter.length; i++){
		lbAry.push(counter[i].toString(16));
	}

		return lbAry.join('') + "0";
}

//###############################################################################################################################
// Exports functions
//###############################################################################################################################

function parse(file, options){
	var p = new binary3DSParser(file, options);
	return p.parse();
}


function parseToJson(file, options){
	var obj = parse(file, options);

	if(obj !== null && !obj.err && obj.data){
		obj.data = JSON.stringify(obj.data);
	}

	return obj;
}

function help(){
	var text = [];
	text.push("**** 3dsTojs Help *****************************************");
	text.push("--- Functions: ---");
	text.push(".parse(file, [options]) - returns an object of the parsed file.");
	text.push(".parseToJson(file, [options]) - returns JSON of the parsed file.");
	text.push(".help() - prints this help text to the console.");
	text.push(".print() - prints the file (hex) to the console.");
	text.push("\n");
	text.push("--- Parameters: ---");
	text.push("file - <string> - full path to the .3ds file.");
	text.push("options - <object> - flags for events such as logging, saving to JSON files, etc...");
	text.push("\n--- Available options: ---");
	text.push("saveJson - <bool> (d:false) - flag to save parsed object to a JSON file.");
 	text.push("saveOptions - <object> - flags for saving to files (JSON, log, etc...");
	text.push(" path - <string> (d: directory of 3ds file.) - Location to save files.");
	text.push(" jsonPerItem - <bool> (d:false) - Save objects as separate JSON files.");
	text.push(" unparsedToFile - <bool> (d:false) - Saves the unparsable chunk to a file.");
 	text.push("logging - <bool> (d:false) - Creates a log file of parsing events.");
  text.push("logOptions - <object> - flags on what is to be logged.");
	text.push(" read: <bool> (d:true) - Logs header chunks read from the file.");
  text.push(" parsing: <bool> (d:true) - Logs parsing of identifiable chunks.");
  text.push(" unparsed: <bool> (d:true) - Logs identifiable ids but not enough info to parse.");
  text.push(" unknown: <bool> (d:true) - Logs unknown chunk ids.");
  text.push(" jumping: <bool> (d:false) - Logs any position movement in the read file.");
  text.push(" files: <bool> (d:true) - Logs the json files saved to disk.");
  text.push("verbose: <bool> (d:false) - Prints the parsing progress and stats to the console.");
 	text.push("verboseOptions - <object> - flags on what to write to the console.");
	text.push(" onlyStats: <bool> (d:false) - Shows only the stats on completion.");
  text.push("trackUnparsed - <bool> (d:false) - returns an object ");
	text.push("\nDefault option setup if no options passed in:");
	text.push("options = {");
 	text.push("  saveJson: false,");
 	text.push("  saveOptions:{");
	text.push("    path: '<directory of 3ds file>',");
	text.push("    jsonPerItem: false,");
 	text.push("  },");
 	text.push("  logging: false,");
  text.push("  logOptions:{");
	text.push("    read: true,");
  text.push("    parsing: true,");
  text.push("    unparsed: true,");
  text.push("    unknown: true,");
  text.push("    jumping: false,");
  text.push("    files: true");
  text.push("  },");
 	text.push("  verbose: false,");
 	text.push("  verboseOptions:{");
	text.push("    onlyStats: false");
 	text.push("  },");
  text.push("  trackUnparsed: false");
	text.push("}");

	console.log(text.join('\n'));
}

function print(buffer){
	if(buffer.constructor.name == "Buffer"){
		var numOfCols = 16;
		var line = '';
		var buffLen = buffer.length;
		var maxDigitsOfRowCt = (Math.ceil(buffLen / numOfCols).toString()).length;

		var counter = [];

		for(var i = 0; i < maxDigitsOfRowCt; i++){
			counter.push(0);
		}

		console.log('\n');
		console.log("      00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F");
		console.log("     ------------------------------------------------");

		for(var i = 0; i < buffLen; i++){
			var nextVal = buffer.readUInt8(i, true);
			nextVal = nextVal.toString(16);

			if(nextVal.length < 1){
				nextVal = "00";
			}
			else if( nextVal.length == 1){
				nextVal = "0" + nextVal;
			}

			var mod = i % numOfCols;

			line += nextVal + ' ';

			if(mod == 15){
				console.log(getPrintRowLabel(counter) + " | " + line);
				line = '';
				
				for(var j = (counter.length - 1); j >= 0; j--){
					counter[j]++;

					if(counter[j] < 16){
						break;
					}
					else{
						counter[j] = 0;
					}
				}
			}
		}

		console.log('\n');
	}
	else{
		console.log("Error: Argument must be of type Buffer!");
	}
}

//###############################################################################################################################
//
// Export Setters
//
//###############################################################################################################################

exports.parse = parse;
exports.parseToJson = parseToJson;
exports.help = help;
exports.print = print;
