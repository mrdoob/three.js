
/**
 * @author Jey-en  https://github.com/adrs2002
 * 
 * this loader repo -> https://github.com/adrs2002/threeXfileLoader
 * 
 * This loader is load model (and animation) from .X file format. (for old DirectX).
 *  ! this version are load from TEXT format .X only ! not a Binary.
 * 
 * Support
 *  - mesh
 *  - texture
 *  - normal / uv
 *  - material
 *  - skinning
 *
 *  Not Support
 *  - template
 *  - material(ditail)
 *  - morph
 *  - scene
 */


//テキスト情報の読み込みモード
// text file Reading Mode
var XfileLoadMode$1 = XfileLoadMode = {
    none: -1,
    Element: 1,
    FrameTransformMatrix_Read: 3,
    Mesh: 5,
    Vartex_init: 10,
    Vartex_Read: 11,
    Index_init: 20,
    index_Read: 21,
    Uv_init: 30,
    Uv_Read: 31,

    Normal_V_init: 40,
    Normal_V_Read: 41,
    Normal_I_init: 42,
    Normal_I_Read: 43,

    Mat_Face_init: 101,
    Mat_Face_len_Read: 102,
    Mat_Face_Set: 103,
    Mat_Set: 111,

    Mat_Set_Texture: 121,
    Mat_Set_LightTex: 122,
    Mat_Set_EmissiveTex: 123,
    Mat_Set_BumpTex: 124,
    Mat_Set_NormalTex: 125,
    Mat_Set_EnvTex: 126,

    Weit_init: 201,
    Weit_IndexLength: 202,
    Weit_Read_Index: 203,
    Weit_Read_Value: 204,
    Weit_Read_Matrx: 205,

    Anim_init: 1001,
    Anim_Reading: 1002,
    Anim_KeyValueTypeRead: 1003,
    Anim_KeyValueLength: 1004,
    Anime_ReadKeyFrame: 1005
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

// import * as XAnimationInfo from 'XAnimationInfo.js'
// import * as _xdata from 'rawXdata.js'

var XAnimationObj = function () {
    function XAnimationObj() {
        classCallCheck(this, XAnimationObj);

        this.fps = 30;
        this.name = 'xanimation';
        this.length = 0;
        this.hierarchy = [];
    }

    createClass(XAnimationObj, [{
        key: 'make',
        value: function make(XAnimationInfoArray, mesh) {
            var keys = Object.keys(XAnimationInfoArray);
            var hierarchy_tmp = [];
            for (var i = 0; i < keys.length; i++) {
                var bone = null;
                var parent = -1;
                var baseIndex = -1;
                //まず、割り当てられているボーンを探す
                for (var m = 0; m < mesh.skeleton.bones.length; m++) {
                    if (mesh.skeleton.bones[m].name == XAnimationInfoArray[keys[i]].BoneName) {
                        bone = XAnimationInfoArray[keys[i]].BoneName;
                        parent = mesh.skeleton.bones[m].parent.name;
                        baseIndex = m;
                        break;
                    }
                }
                hierarchy_tmp[baseIndex] = this.makeBonekeys(XAnimationInfoArray[keys[i]], bone, parent);
            }
            //Xfileの仕様で、「ボーンの順番どおりにアニメーションが出てる」との保証がないため、ボーンヒエラルキーは再定義
            var keys2 = Object.keys(hierarchy_tmp);
            for (var _i = 0; _i < keys2.length; _i++) {
                this.hierarchy.push(hierarchy_tmp[_i]);
                //こんどは、自分より先に「親」がいるはず。
                var parentId = -1;
                for (var _m = 0; _m < this.hierarchy.length; _m++) {
                    if (_i != _m && this.hierarchy[_i].parent === this.hierarchy[_m].name) {
                        parentId = _m;
                        break;
                    }
                }
                this.hierarchy[_i].parent = parentId;
            }
        }

        //ボーンとキーフレームを再作成する

    }, {
        key: 'makeBonekeys',
        value: function makeBonekeys(XAnimationInfo, bone, parent) {
            var refObj = new Object();
            refObj.name = bone;
            refObj.parent = parent;
            refObj.keys = new Array();
            for (var i = 0; i < XAnimationInfo.KeyFrames.length; i++) {
                var keyframe = new Object();
                keyframe.time = XAnimationInfo.KeyFrames[i].time * this.fps;
                keyframe.matrix = XAnimationInfo.KeyFrames[i].matrix;
                // matrixを再分解。
                keyframe.pos = new THREE.Vector3().setFromMatrixPosition(keyframe.matrix);
                keyframe.rot = new THREE.Quaternion().setFromRotationMatrix(keyframe.matrix);
                keyframe.scl = new THREE.Vector3().setFromMatrixScale(keyframe.matrix);
                refObj.keys.push(keyframe);
            }
            return refObj;
        }
    }]);
    return XAnimationObj;
}();

var Xdata = function Xdata() {
        classCallCheck(this, Xdata);

        //XFrameInfo Array(final output)
        this.FrameInfo = new Array();

        //XFrameInfo Array
        this.FrameInfo_Raw = new Array();

        this.AnimationSetInfo = new Array();

        this.AnimTicksPerSecond = 60;

        this.XAnimationObj = null;
};

//ボーン（ウェイト）情報格納クラス構造
var XboneInf = function XboneInf() {
    classCallCheck(this, XboneInf);

    this.BoneName = "";
    //重要：ボーンを1次元配列化したときの配列内index。skinindexに対応する
    this.BoneIndex = 0;
    //このIndecesは頂点Indexということ
    this.Indeces = new Array();
    this.Weights = new Array();
    this.initMatrix = null;
    this.OffsetMatrix = null;
};

var XAnimationInfo$1 = XAnimationInfo = function XAnimationInfo() {
    this.AnimeName = "";
    this.BoneName = "";
    this.TargetBone = null;
    //this.KeyType = 0;
    this.FrameStartLv = 0;
    this.KeyFrames = new Array(); //XAnimationKeyInfo Array
    this.InverseMx = null;
};

//Xfile内のフレーム構造を再現したクラス構造
var XFrameInfo$1 = XFrameInfo = function XFrameInfo() {
    this.Mesh = null;
    this.Geometry = null;
    this.FrameName = "";
    this.ParentName = "";
    this.FrameStartLv = 0;
    this.FrameTransformMatrix = null;

    this.children = new Array();
    //XboneInf Array
    this.BoneInfs = new Array();
    this.VertexSetedBoneCount = new Array(); //その頂点に対し、いくつBone&Weightを割り当てたかというカウント1

    this.Materials = new Array();
};

var XKeyFrameInfo = function XKeyFrameInfo() {
    classCallCheck(this, XKeyFrameInfo);

    this.index = 0;
    this.Frame = 0;
    this.time = 0.0;
    this.matrix = null;
};

// import * as THREE from '../three.js'

THREE.XFileLoader = function () {
    // コンストラクタ
    function XFileLoader(manager, Texloader, _zflg) {
        classCallCheck(this, XFileLoader);

        this.manager = manager !== undefined ? manager : THREE.DefaultLoadingManager;
        this.Texloader = Texloader !== undefined ? Texloader : THREE.TextureLoader;
        this.zflg = _zflg === undefined ? false : _zflg;
        this.skinFlg = false;
        this.url = "";
        this.baseDir = "";
        // XfileLoadMode = XfileLoadMode;
        // 現在の行読み込みもーど
        this.nowReadMode = XfileLoadMode$1.none;

        this.nowAnimationKeyType = 4;

        //Xファイルは要素宣言→要素数→要素実体　という並びになるので、要素数宣言を保持する
        this.tgtLength = 0;
        this.nowReaded = 0;

        // { の数（ファイル先頭から
        this.ElementLv = 0;

        //ジオメトリ読み込み開始時の　{ の数
        this.geoStartLv = Number.MAX_VALUE;

        //Frame読み込み開始時の　{ の数
        this.FrameStartLv = Number.MAX_VALUE;

        this.matReadLine = 0;
        this.putMatLength = 0;
        this.nowMat = null;

        //ボーン情報格納用
        this.BoneInf = new XboneInf();

        //UV割り出し用の一時保管配列
        this.tmpUvArray = new Array();

        //放線割り出し用の一時保管配列
        //Xfileの放線は「頂点ごと」で入っているので、それを面に再計算して割り当てる。面倒だと思う
        this.NormalVectors = new Array();
        this.FacesNormal = new Array();

        //現在読み出し中のフレーム名称
        this.nowFrameName = "";

        this.nowAnimationSetName = "";

        //現在読み出し中のフレームの階層構造。
        this.FrameHierarchie = new Array();
        this.endLineCount = 0;
        this.geometry = null;

        this.LoadingXdata = null;
        this.lines = null;
        this.KeyInfo = null;

        this.animeKeyNames = null;
        this.data = null;
        this.onLoad = null;
    }

    //読み込み開始命令部


    createClass(XFileLoader, [{
        key: 'load',
        value: function load(_arg, onLoad, onProgress, onError) {
            var _this = this;

            var loader = new THREE.FileLoader(this.manager);
            loader.setResponseType('arraybuffer');

            for (var i = 0; i < _arg.length; i++) {
                switch (i) {
                    case 0:
                        this.url = _arg[i];break;
                    case 1:
                        this.zflg = _arg[i];break;
                    case 2:
                        this.skinFlg = _arg[i];break;
                }
            }

            loader.load(this.url, function (text) {
                _this.parse(text, onLoad);
            }, onProgress, onError);
        }
    }, {
        key: 'isBinary',
        value: function isBinary(binData) {

            var reader = new DataView(binData);
            var face_size = 32 / 8 * 3 + 32 / 8 * 3 * 3 + 16 / 8;
            var n_faces = reader.getUint32(80, true);
            var expect = 80 + 32 / 8 + n_faces * face_size;

            if (expect === reader.byteLength) {
                return true;
            }

            // some binary files will have different size from expected,
            // checking characters higher than ASCII to confirm is binary
            var fileLength = reader.byteLength;
            for (var index = 0; index < fileLength; index++) {

                if (reader.getUint8(index, false) > 127) {
                    return true;
                }
            }
            return false;
        }
    }, {
        key: 'ensureBinary',
        value: function ensureBinary(buf) {
            if (typeof buf === "string") {
                var array_buffer = new Uint8Array(buf.length);
                for (var i = 0; i < buf.length; i++) {
                    array_buffer[i] = buf.charCodeAt(i) & 0xff; // implicitly assumes little-endian
                }
                return array_buffer.buffer || array_buffer;
            } else {
                return buf;
            }
        }
    }, {
        key: 'ensureString',
        value: function ensureString(buf) {

            if (typeof buf !== "string") {
                var array_buffer = new Uint8Array(buf);
                var str = '';
                for (var i = 0; i < buf.byteLength; i++) {
                    str += String.fromCharCode(array_buffer[i]); // implicitly assumes little-endian
                }
                return str;
            } else {
                return buf;
            }
        }

        //解析を行う前に、バイナリファイルかテキストファイルかを判別する。今はテキストファイルしか対応できていないので・・・

    }, {
        key: 'parse',
        value: function parse(data, onLoad) {
            var binData = this.ensureBinary(data);
            this.data = this.ensureString(data);
            this.onLoad = onLoad;
            return this.isBinary(binData) ? this.parseBinary(binData) : this.parseASCII();
        }

        /*
        バイナリデータだった場合の読み込み。現在は基本的に未対応
        */

    }, {
        key: 'parseBinary',
        value: function parseBinary(data) {
            //ねげちぶ！
            return parseASCII(String.fromCharCode.apply(null, data));
        }
    }, {
        key: 'parseASCII',
        value: function parseASCII() {
            //モデルファイルの元ディレクトリを取得する
            var baseDir = "";
            if (this.url.lastIndexOf("/") > 0) {
                this.baseDir = this.url.substr(0, this.url.lastIndexOf("/") + 1);
            }

            //Xfileとして分解できたものの入れ物
            this.LoadingXdata = new Xdata();

            // 返ってきたデータを行ごとに分解
            this.lines = this.data.split("\n");
            this.mainloop();
        }
    }, {
        key: 'mainloop',
        value: function mainloop() {
            var _this2 = this;

            var EndFlg = false;

            //フリーズ現象を防ぐため、100行ずつの制御にしている（１行ずつだと遅かった）
            for (var i = 0; i < 100; i++) {
                this.LineRead(this.lines[this.endLineCount].trim());
                this.endLineCount++;

                if (this.endLineCount >= this.lines.length - 1) {
                    EndFlg = true;
                    this.readFinalize();
                    setTimeout(function () {
                        _this2.animationFinalize();
                    }, 1);
                    //this.onLoad(this.LoadingXdata);
                    break;
                }
            }

            if (!EndFlg) {
                setTimeout(function () {
                    _this2.mainloop();
                }, 1);
            }
        }

        //Xファイル解析メイン

    }, {
        key: 'LineRead',
        value: function LineRead(line) {

            //後でちゃんと考えるさ･･
            // template が入っていたら、その行は飛ばす！飛ばさなきゃ読める形が増えるだろうけど、後回し　
            if (line.indexOf("template ") > -1) {
                return;
            }

            if (line.length === 0) {
                return;
            }

            //DirectXは[ Frame ] で中身が構成されているため、Frameのツリー構造を一度再現する。
            //その後、Three.jsのObject3D型に合わせて再構築する必要がある
            if (line.indexOf("{") > -1) {
                this.ElementLv++;
            }

            //AnimTicksPerSecondは上のほうで1行で来る想定。外れたら、知らん！データを直すかフォークして勝手にやってくれ
            if (line.indexOf("AnimTicksPerSecond") > -1) {
                var findA = line.indexOf("{");
                this.LoadingXdata.AnimTicksPerSecond = parseInt(line.substr(findA + 1, line.indexOf(";") - findA + 1), 10);
            }

            if (line.indexOf("}") > -1) {
                //カッコが終わった時の動作
                if (this.ElementLv < 1 || this.nowFrameName === "") {
                    this.ElementLv = 0;return;
                }
                this.endElement();
                return;
            }

            ///////////////////////////////////////////////////////////////////

            if (line.indexOf("Frame ") > -1) {
                //１つのFrame開始
                this.beginFrame(line);
                return;
            }

            if (line.indexOf("FrameTransformMatrix") > -1) {
                this.nowReadMode = XfileLoadMode$1.FrameTransformMatrix_Read;
                return;
            }

            if (this.nowReadMode === XfileLoadMode$1.FrameTransformMatrix_Read) {
                var data = line.split(",");
                this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].FrameTransformMatrix = new THREE.Matrix4();
                this.ParseMatrixData(this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].FrameTransformMatrix, data);
                this.nowReadMode = XfileLoadMode$1.Element;
                return;
            }

            ////////////////////////////////////////////////////////////////////
            ///Mesh ＝　面データの読み込み開始
            /*  Mesh　は、頂点数（1行または ; ）→頂点データ(;区切りでxyz要素)→面数（index要素数）→index用データ　で成り立つ
            */
            if (line.indexOf("Mesh ") > -1) {
                this.beginReadMesh(line);return;
            }

            //頂点数読み出し
            if (this.nowReadMode === XfileLoadMode$1.Vartex_init) {
                this.readVertexCount(line);return;
            }
            //頂点読み出し
            if (this.nowReadMode === XfileLoadMode$1.Vartex_Read) {
                if (this.readVertex(line)) {
                    return;
                }
            }

            //Index読み出し///////////////////
            if (this.nowReadMode === XfileLoadMode$1.Index_init) {
                this.readIndexLength(line);return;
            }

            if (this.nowReadMode === XfileLoadMode$1.index_Read) {
                if (this.readVertexIndex(line)) {
                    return;
                }
            }

            //Normal部//////////////////////////////////////////////////
            //XFileでのNormalは、頂点毎の向き→面に属してる頂点のID　という順番で入っている。
            if (line.indexOf("MeshNormals ") > -1) {
                this.beginMeshNormal(line);return;
            }

            if (this.nowReadMode === XfileLoadMode$1.Normal_V_init) {
                this.readMeshNormalCount(line);return;
            }

            if (this.nowReadMode === XfileLoadMode$1.Normal_V_Read) {
                if (this.readMeshNormalVertex(line)) {
                    return;
                }
            }

            if (this.nowReadMode === XfileLoadMode$1.Normal_I_init) {
                this.readMeshNormalIndexCount(line);return;
            }

            if (this.nowReadMode === XfileLoadMode$1.Normal_I_Read) {
                if (this.readMeshNormalIndex(line)) {
                    return;
                }
            }
            ///////////////////////////////////////////////////////////////

            //UV///////////////////////////////////////////////////////////
            //UV宣言
            if (line.indexOf("MeshTextureCoords ") > -1) {
                this.nowReadMode = XfileLoadMode$1.Uv_init;return;
            }

            if (this.nowReadMode === XfileLoadMode$1.Uv_init) {
                this.readUvInit(line);return;
            }

            if (this.nowReadMode === XfileLoadMode$1.Uv_Read) {
                //次にUVを仮の入れ物に突っ込んでいく
                if (this.readUv(line)) {
                    return;
                }
            }
            ////////////////////////////////////////////////////////////

            //マテリアルのセット（面に対するマテリアルの割り当て）//////////////////////////
            if (line.indexOf("MeshMaterialList ") > -1) {
                this.nowReadMode = XfileLoadMode$1.Mat_Face_init;
                return;
            }
            if (this.nowReadMode === XfileLoadMode$1.Mat_Face_init) {
                //マテリアル数がここ？今回は特に影響ないようだが
                this.nowReadMode = XfileLoadMode$1.Mat_Face_len_Read;
                return;
            }
            if (this.nowReadMode === XfileLoadMode$1.Mat_Face_len_Read) {
                this.readMatrixSetLength(line);return;
            }

            if (this.nowReadMode === XfileLoadMode$1.Mat_Face_Set) {
                if (this.readMaterialBind(line)) {
                    return;
                }
            }

            //マテリアル定義
            if (line.indexOf("Material ") > -1) {
                this.readMaterialInit(line);return;
            }

            if (this.nowReadMode === XfileLoadMode$1.Mat_Set) {
                this.readandSetMaterial(line);return;
            }

            if (this.nowReadMode >= XfileLoadMode$1.Mat_Set_Texture && this.nowReadMode < XfileLoadMode$1.Weit_init) {
                this.readandSetMaterialTexture(line);return;
            }
            /////////////////////////////////////////////////////////////////////////

            //Bone部（仮//////////////////////////////////////////////////////////////////////
            if (line.indexOf("SkinWeights ") > -1 && this.nowReadMode >= XfileLoadMode$1.Element) {
                this.readBoneInit(line);return;
            }

            if (this.nowReadMode === XfileLoadMode$1.Weit_init) {
                this.readBoneName(line);return;
            }

            if (this.nowReadMode === XfileLoadMode$1.Weit_IndexLength) {
                this.readBoneVertexLength(line);return;
            }

            if (this.nowReadMode === XfileLoadMode$1.Weit_Read_Index) {
                this.readandSetBoneVertex(line);return;
            }

            if (this.nowReadMode === XfileLoadMode$1.Weit_Read_Value) {
                this.readandSetBoneWeightValue(line);return;
            }

            if (this.nowReadMode === XfileLoadMode$1.Weit_Read_Matrx) {
                this.readandSetBoneOffsetMatrixValue(line);return;
            }
            ///////////////////////////////////////////////////

            //アニメーション部
            ////////////////////////////////////////////////////////////
            //ここからは、Frame構造とは切り離して考える必要がある。
            //別ファイルに格納されている可能性も考慮しなくては…
            if (line.indexOf("AnimationSet ") > -1) {
                this.readandCreateAnimationSet(line);return;
            }

            if (line.indexOf("Animation ") > -1 && this.nowReadMode === XfileLoadMode$1.Anim_init) {
                this.readAndCreateAnimation(line);return;
            }

            if (line.indexOf("AnimationKey ") > -1) {
                this.nowReadMode = XfileLoadMode$1.Anim_KeyValueTypeRead;return;
            }

            if (this.nowReadMode === XfileLoadMode$1.Anim_KeyValueTypeRead) {
                this.nowAnimationKeyType = parseInt(line.substr(0, line.length - 1), 10);
                this.nowReadMode = XfileLoadMode$1.Anim_KeyValueLength;
                return;
            }

            if (this.nowReadMode === XfileLoadMode$1.Anim_KeyValueLength) {
                this.tgtLength = parseInt(line.substr(0, line.length - 1), 10);
                this.nowReaded = 0;
                this.nowReadMode = XfileLoadMode$1.Anime_ReadKeyFrame;
                return;
            }
            //やっとキーフレーム読み込み
            if (this.nowReadMode === XfileLoadMode$1.Anime_ReadKeyFrame) {
                this.readAnimationKeyFrame(line);return;
            }
            ////////////////////////
        }
    }, {
        key: 'endElement',
        value: function endElement(line) {

            if (this.nowReadMode < XfileLoadMode$1.Anim_init && this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].FrameStartLv === this.ElementLv && this.nowReadMode > XfileLoadMode$1.none) {

                //１つのFrame終了
                if (this.FrameHierarchie.length > 0) {
                    //「子」を探して、セットする
                    this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].children = new Array();
                    var keys = Object.keys(this.LoadingXdata.FrameInfo_Raw);
                    for (var m = 0; m < keys.length; m++) {
                        if (this.LoadingXdata.FrameInfo_Raw[keys[m]].ParentName === this.nowFrameName) {
                            this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].children.push(keys[m]);
                        }
                    }
                    this.FrameHierarchie.pop();
                }

                this.MakeOutputGeometry(this.nowFrameName, this.zflg);
                this.FrameStartLv = this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].FrameStartLv;

                //読み込み中のフレームを一段階上に戻す
                if (this.FrameHierarchie.length > 0) {
                    this.nowFrameName = this.FrameHierarchie[this.FrameHierarchie.length - 1];
                    this.FrameStartLv = this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].FrameStartLv;
                } else {
                    this.nowFrameName = "";
                }
            }

            if (this.nowReadMode === XfileLoadMode$1.Mat_Set) {
                //子階層を探してセットする                    
                this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].Materials.push(this.nowMat);
                this.nowReadMode = XfileLoadMode$1.Element;
            }

            this.ElementLv--;
        }
    }, {
        key: 'beginFrame',
        value: function beginFrame(line) {
            this.FrameStartLv = this.ElementLv;
            this.nowReadMode = XfileLoadMode$1.Element;

            this.nowFrameName = line.substr(6, line.length - 8);
            this.LoadingXdata.FrameInfo_Raw[this.nowFrameName] = new XFrameInfo$1();
            this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].FrameName = this.nowFrameName;
            //親の名前がすぐわかるので、この段階でセット
            if (this.FrameHierarchie.length > 0) {
                this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].ParentName = this.FrameHierarchie[this.FrameHierarchie.length - 1];
            }
            this.FrameHierarchie.push(this.nowFrameName);
            this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].FrameStartLv = this.FrameStartLv;
        }
    }, {
        key: 'beginReadMesh',
        value: function beginReadMesh(line) {
            if (this.nowFrameName === "") {
                this.FrameStartLv = this.ElementLv;
                this.nowFrameName = line.substr(5, line.length - 6);
                if (this.nowFrameName === "") {
                    this.nowFrameName = "mesh_" + this.LoadingXdata.FrameInfo_Raw.length;
                }
                this.LoadingXdata.FrameInfo_Raw[this.nowFrameName] = new XFrameInfo$1();
                this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].FrameName = this.nowFrameName;
                this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].FrameStartLv = this.FrameStartLv;
            }

            this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].Geometry = new THREE.Geometry();
            this.geoStartLv = this.ElementLv;
            this.nowReadMode = XfileLoadMode$1.Vartex_init;

            Bones = new Array();
            this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].Materials = new Array();
        }
    }, {
        key: 'readVertexCount',
        value: function readVertexCount(line) {
            this.nowReadMode = XfileLoadMode$1.Vartex_Read;
            this.tgtLength = parseInt(line.substr(0, line.length - 1), 10);
            this.nowReaded = 0;
        }
    }, {
        key: 'readVertex',
        value: function readVertex(line) {
            //頂点が確定
            var data = line.substr(0, line.length - 2).split(";");
            this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].Geometry.vertices.push(new THREE.Vector3(parseFloat(data[0]), parseFloat(data[1]), parseFloat(data[2])));
            //頂点を作りながら、Skin用構造も作成してしまおう
            this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].Geometry.skinIndices.push(new THREE.Vector4(0, 0, 0, 0));
            this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].Geometry.skinWeights.push(new THREE.Vector4(1, 0, 0, 0));
            this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].VertexSetedBoneCount.push(0);
            this.nowReaded++;

            if (this.nowReaded >= this.tgtLength) {
                this.nowReadMode = XfileLoadMode$1.Index_init;
                return true;
            }
            return false;
        }
    }, {
        key: 'readIndexLength',
        value: function readIndexLength(line) {
            this.nowReadMode = XfileLoadMode$1.index_Read;
            this.tgtLength = parseInt(line.substr(0, line.length - 1), 10);
            this.nowReaded = 0;
        }
    }, {
        key: 'readVertexIndex',
        value: function readVertexIndex(line) {
            // 面に属する頂点数,頂点の配列内index という形で入っている
            var data = line.substr(2, line.length - 4).split(",");

            if (this.zflg) {
                this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].Geometry.faces.push(new THREE.Face3(parseInt(data[2], 10), parseInt(data[1], 10), parseInt(data[0], 10), new THREE.Vector3(1, 1, 1).normalize()));
            } else {
                this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].Geometry.faces.push(new THREE.Face3(parseInt(data[0], 10), parseInt(data[1], 10), parseInt(data[2], 10), new THREE.Vector3(1, 1, 1).normalize()));
            }
            this.nowReaded++;
            if (this.nowReaded >= this.tgtLength) {
                this.nowReadMode = XfileLoadMode$1.Element;
                return true;
            }
            return false;
        }
    }, {
        key: 'beginMeshNormal',
        value: function beginMeshNormal(line) {
            this.nowReadMode = XfileLoadMode$1.Normal_V_init;
            this.NormalVectors = new Array();
            this.FacesNormal = new Array();
        }
    }, {
        key: 'readMeshNormalCount',
        value: function readMeshNormalCount(line) {
            this.nowReadMode = XfileLoadMode$1.Normal_V_Read;
            this.tgtLength = parseInt(line.substr(0, line.length - 1), 10);
            this.nowReaded = 0;
        }
    }, {
        key: 'readMeshNormalVertex',
        value: function readMeshNormalVertex(line) {
            var data = line.split(";");
            this.NormalVectors.push([parseFloat(data[0]), parseFloat(data[1]), parseFloat(data[2])]);
            this.nowReaded++;
            if (this.nowReaded >= this.tgtLength) {
                this.nowReadMode = XfileLoadMode$1.Normal_I_init;
                return true;
            }
            return false;
        }
    }, {
        key: 'readMeshNormalIndexCount',
        value: function readMeshNormalIndexCount(line) {
            this.nowReadMode = XfileLoadMode$1.Normal_I_Read;
            this.tgtLength = parseInt(line.substr(0, line.length - 1), 10);
            this.nowReaded = 0;
        }
    }, {
        key: 'readMeshNormalIndex',
        value: function readMeshNormalIndex(line) {

            //やっとNomal放線が決まる
            var data = line.substr(2, line.length - 4).split(",");
            //indexに対応したベクトルを一度取得＆加算し、単位ベクトルを得てからセットする

            var nowID = parseInt(data[0], 10);
            var v1 = new THREE.Vector3(this.NormalVectors[nowID][0], this.NormalVectors[nowID][1], this.NormalVectors[nowID][2]);
            nowID = parseInt(data[1], 10);
            var v2 = new THREE.Vector3(this.NormalVectors[nowID][0], this.NormalVectors[nowID][1], this.NormalVectors[nowID][2]);
            nowID = parseInt(data[2], 10);
            var v3 = new THREE.Vector3(this.NormalVectors[nowID][0], this.NormalVectors[nowID][1], this.NormalVectors[nowID][2]);

            //研究中
            if (this.zflg) {
                this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].Geometry.faces[this.nowReaded].vertexNormals = [v3, v2, v1];
            } else {
                this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].Geometry.faces[this.nowReaded].vertexNormals = [v1, v2, v3];
            }
            //this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].Geometry.faces[this.nowReaded].vertexNormals = [v1, v2, v3];

            this.FacesNormal.push(v1.normalize());
            this.nowReaded++;
            if (this.nowReaded >= this.tgtLength) {
                this.nowReadMode = XfileLoadMode$1.Element;
                return true;
            }
            return false;
        }

        ///////

    }, {
        key: 'readUvInit',
        value: function readUvInit(line) {
            //まず、セットされるUVの頂点数
            this.nowReadMode = XfileLoadMode$1.Uv_Read;
            this.tgtLength = parseInt(line.substr(0, line.length - 1), 10);
            this.nowReaded = 0;
            this.tmpUvArray = new Array();
            this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].Geometry.faceVertexUvs[0] = new Array();
        }
    }, {
        key: 'readUv',
        value: function readUv(line) {
            var data = line.split(";");
            //これは宣言された頂点の順に入っていく
            if (THREE.XFileLoader.IsUvYReverse) {
                this.tmpUvArray.push(new THREE.Vector2(parseFloat(data[0]), 1 - parseFloat(data[1])));
            } else {
                this.tmpUvArray.push(new THREE.Vector2(parseFloat(data[0]), parseFloat(data[1])));
            }

            this.nowReaded++;
            if (this.nowReaded >= this.tgtLength) {
                //UV読み込み完了。メッシュにUVを割り当てる
                //geometry.faceVertexUvs[ 0 ][ faceIndex ][ vertexIndex ]
                this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].Geometry.faceVertexUvs[0] = new Array();
                for (var m = 0; m < this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].Geometry.faces.length; m++) {
                    this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].Geometry.faceVertexUvs[0][m] = new Array();
                    this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].Geometry.faceVertexUvs[0][m].push(this.tmpUvArray[this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].Geometry.faces[m].a]);
                    this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].Geometry.faceVertexUvs[0][m].push(this.tmpUvArray[this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].Geometry.faces[m].b]);
                    this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].Geometry.faceVertexUvs[0][m].push(this.tmpUvArray[this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].Geometry.faces[m].c]);
                }

                this.nowReadMode = XfileLoadMode$1.Element;
                this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].Geometry.uvsNeedUpdate = true;
                return true;
            }
            return false;
        }
    }, {
        key: 'readMatrixSetLength',
        value: function readMatrixSetLength(line) {
            this.nowReadMode = XfileLoadMode$1.Mat_Face_Set;
            this.tgtLength = parseInt(line.substr(0, line.length - 1), 10);
            this.nowReaded = 0;
        }
    }, {
        key: 'readMaterialBind',
        value: function readMaterialBind(line) {
            var data = line.split(",");
            this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].Geometry.faces[this.nowReaded].materialIndex = parseInt(data[0]);
            this.nowReaded++;
            if (this.nowReaded >= this.tgtLength) {
                this.nowReadMode = XfileLoadMode$1.Element;
                return true;
            }
            return false;
        }
    }, {
        key: 'readMaterialInit',
        value: function readMaterialInit(line) {
            this.nowReadMode = XfileLoadMode$1.Mat_Set;
            this.matReadLine = 0;
            this.nowMat = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
            var matName = line.substr(9, line.length - 10);
            if (matName !== "") {
                this.nowMat.name = matName;
            }

            if (this.zflg) {
                this.nowMat.side = THREE.BackSide;
            } else {
                this.nowMat.side = THREE.FrontSide;
            }
            this.nowMat.side = THREE.FrontSide;
        }
    }, {
        key: 'readandSetMaterial',
        value: function readandSetMaterial(line) {
            var data = line.split(";");
            this.matReadLine++;
            switch (this.matReadLine) {
                case 1:
                    //FaceColor
                    this.nowMat.color.r = data[0];
                    this.nowMat.color.g = data[1];
                    this.nowMat.color.b = data[2];
                    break;
                case 2:
                    //power
                    this.nowMat.shininess = data[0];
                    break;
                case 3:
                    //Specular
                    this.nowMat.specular.r = data[0];
                    this.nowMat.specular.g = data[1];
                    this.nowMat.specular.b = data[2];
                    break;
                case 4:
                    //Emissiv color and put
                    this.nowMat.emissive.r = data[0];
                    this.nowMat.emissive.g = data[1];
                    this.nowMat.emissive.b = data[2];
                    break;
            }

            if (line.indexOf("TextureFilename") > -1) {
                this.nowReadMode = XfileLoadMode$1.Mat_Set_Texture;
            }
            if (line.indexOf("BumpMapFilename") > -1) {
                this.nowReadMode = XfileLoadMode$1.Mat_Set_BumpTex;
                this.nowMat.bumpScale = 0.05;
            }
            if (line.indexOf("NormalMapFilename") > -1) {
                this.nowReadMode = XfileLoadMode$1.Mat_Set_NormalTex;
                this.nowMat.normalScale = new THREE.Vector2(2, 2);
            }
            if (line.indexOf("EmissiveMapFilename") > -1) {
                this.nowReadMode = XfileLoadMode$1.Mat_Set_EmissiveTex;
            }
            if (line.indexOf("LightMapFilename") > -1) {
                this.nowReadMode = XfileLoadMode$1.Mat_Set_LightTex;
            }
        }

        //テクスチャのセット 

    }, {
        key: 'readandSetMaterialTexture',
        value: function readandSetMaterialTexture(line) {
            var data = line.substr(1, line.length - 3);
            if (data != undefined && data.length > 0) {

                switch (this.nowReadMode) {
                    case XfileLoadMode$1.Mat_Set_Texture:
                        this.nowMat.map = this.Texloader.load(this.baseDir + data);
                        break;
                    case XfileLoadMode$1.Mat_Set_BumpTex:
                        this.nowMat.bumpMap = this.Texloader.load(this.baseDir + data);
                        break;
                    case XfileLoadMode$1.Mat_Set_NormalTex:
                        this.nowMat.normalMap = this.Texloader.load(this.baseDir + data);
                        break;
                    case XfileLoadMode$1.Mat_Set_EmissiveTex:
                        this.nowMat.emissiveMap = this.Texloader.load(this.baseDir + data);
                        break;
                    case XfileLoadMode$1.Mat_Set_LightTex:
                        this.nowMat.lightMap = this.Texloader.load(this.baseDir + data);
                        break;
                    case XfileLoadMode$1.Mat_Set_EnvTex:
                        this.nowMat.envMap = this.Texloader.load(this.baseDir + data);
                        break;
                }
            }
            this.nowReadMode = XfileLoadMode$1.Mat_Set;
            this.endLineCount++; //}しかないつぎの行をとばす。改行のない詰まったデータが来たらどうしようね
            this.ElementLv--;
        }
        ////////////////////////////////////////////////

    }, {
        key: 'readBoneInit',
        value: function readBoneInit(line) {
            this.nowReadMode = XfileLoadMode$1.Weit_init;
            this.BoneInf = new XboneInf();
        }
    }, {
        key: 'readBoneName',
        value: function readBoneName(line) {
            //ボーン名称
            this.nowReadMode = XfileLoadMode$1.Weit_IndexLength;
            this.BoneInf.BoneName = line.substr(1, line.length - 3);
            this.BoneInf.BoneIndex = this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].BoneInfs.length;
            this.nowReaded = 0;
        }
    }, {
        key: 'readBoneVertexLength',
        value: function readBoneVertexLength(line) {
            //ボーンに属する頂点数
            this.nowReadMode = XfileLoadMode$1.Weit_Read_Index;
            this.tgtLength = parseInt(line.substr(0, line.length - 1), 10);
            this.nowReaded = 0;
        }
    }, {
        key: 'readandSetBoneVertex',
        value: function readandSetBoneVertex(line) {
            //ボーンに属する頂点を割り当て
            this.BoneInf.Indeces.push(parseInt(line.substr(0, line.length - 1), 10));
            this.nowReaded++;
            if (this.nowReaded >= this.tgtLength || line.indexOf(";") > -1) {
                this.nowReadMode = XfileLoadMode$1.Weit_Read_Value;
                this.nowReaded = 0;
            }
        }
    }, {
        key: 'readandSetBoneWeightValue',
        value: function readandSetBoneWeightValue(line) {
            //頂点にウェイトを割り当て
            var nowVal = parseFloat(line.substr(0, line.length - 1));
            this.BoneInf.Weights.push(nowVal);
            this.nowReaded++;
            if (this.nowReaded >= this.tgtLength || line.indexOf(";") > -1) {
                this.nowReadMode = XfileLoadMode$1.Weit_Read_Matrx;
            }
        }
    }, {
        key: 'readandSetBoneOffsetMatrixValue',
        value: function readandSetBoneOffsetMatrixValue(line) {
            //ボーンの初期Matrix
            var data = line.split(",");
            this.BoneInf.initMatrix = new THREE.Matrix4();
            this.ParseMatrixData(this.BoneInf.initMatrix, data);

            this.BoneInf.OffsetMatrix = new THREE.Matrix4();
            this.BoneInf.OffsetMatrix.getInverse(this.BoneInf.initMatrix);
            this.LoadingXdata.FrameInfo_Raw[this.nowFrameName].BoneInfs.push(this.BoneInf);
            this.nowReadMode = XfileLoadMode$1.Element;
        }
        //////////////

    }, {
        key: 'readandCreateAnimationSet',
        value: function readandCreateAnimationSet(line) {
            this.FrameStartLv = this.ElementLv;
            this.nowReadMode = XfileLoadMode$1.Anim_init;

            this.nowAnimationSetName = line.substr(13, line.length - 14).trim(); //13ってのは　AnimationSet  の文字数。 14は AnimationSet に末尾の  { を加えて、14
            this.LoadingXdata.AnimationSetInfo[this.nowAnimationSetName] = new Array();
        }
    }, {
        key: 'readAndCreateAnimation',
        value: function readAndCreateAnimation(line) {
            //アニメーション構造開始。
            this.nowFrameName = line.substr(10, line.length - 11).trim(); //10ってのは　Animations  の文字数。 11は Animations に末尾の  { を加えて、11
            this.LoadingXdata.AnimationSetInfo[this.nowAnimationSetName][this.nowFrameName] = new XAnimationInfo$1();
            this.LoadingXdata.AnimationSetInfo[this.nowAnimationSetName][this.nowFrameName].AnimeName = this.nowFrameName;
            this.LoadingXdata.AnimationSetInfo[this.nowAnimationSetName][this.nowFrameName].FrameStartLv = this.FrameStartLv;
            //ここは悪いコード。
            //次に来る「影響を受けるボーン」は、{  }  が１行で来るという想定･･･かつ、１つしかないという想定。
            //想定からずれるものがあったらカスタマイズしてくれ･･そのためのオープンソースだ。
            while (true) {
                this.endLineCount++;
                line = this.lines[this.endLineCount].trim();
                if (line.indexOf("{") > -1 && line.indexOf("}") > -1) {
                    this.LoadingXdata.AnimationSetInfo[this.nowAnimationSetName][this.nowFrameName].BoneName = line.replace(/{/g, "").replace(/}/g, "").trim();
                    break;
                }
            }
        }
    }, {
        key: 'readAnimationKeyFrame',
        value: function readAnimationKeyFrame(line) {
            this.KeyInfo = null;
            var data = line.split(";");

            var nowKeyframe = parseInt(data[0], 10);
            var frameFound = false;

            var tmpM = new THREE.Matrix4();
            //すでにそのキーが宣言済みでないかどうかを探す
            //要素によるキー飛ばし（回転：0&20フレーム、　移動:0&10&20フレーム　で、10フレーム時に回転キーがない等 )には対応できていない
            if (this.nowAnimationKeyType != 4) {
                for (var mm = 0; mm < this.LoadingXdata.AnimationSetInfo[this.nowAnimationSetName][this.nowFrameName].KeyFrames.length; mm++) {
                    if (this.LoadingXdata.AnimationSetInfo[this.nowAnimationSetName][this.nowFrameName].KeyFrames[mm].Frame === nowKeyframe) {
                        this.KeyInfo = this.LoadingXdata.AnimationSetInfo[this.nowAnimationSetName][this.nowFrameName].KeyFrames[mm];
                        frameFound = true;
                        break;
                    }
                }
            }

            if (!frameFound) {
                this.KeyInfo = new XKeyFrameInfo();
                this.KeyInfo.matrix = new THREE.Matrix4();
                this.KeyInfo.Frame = nowKeyframe;
            }

            var data2 = data[2].split(",");
            switch (this.nowAnimationKeyType) {
                case 0:
                    tmpM.makeRotationFromQuaternion(new THREE.Quaternion(parseFloat(data2[0]), parseFloat(data2[1]), parseFloat(data2[2])));
                    this.KeyInfo.matrix.multiply(tmpM);
                    break;
                case 1:
                    tmpM.makeScale(parseFloat(data2[0]), parseFloat(data2[1]), parseFloat(data2[2]));
                    this.KeyInfo.matrix.multiply(tmpM);
                    break;
                case 2:
                    tmpM.makeTranslation(parseFloat(data2[0]), parseFloat(data2[1]), parseFloat(data2[2]));
                    this.KeyInfo.matrix.multiply(tmpM);
                    break;
                //case 3: this.KeyInfo.matrix.makeScale(parseFloat(data[0]), parseFloat(data[1]), parseFloat(data[2])); break;
                case 4:
                    this.ParseMatrixData(this.KeyInfo.matrix, data2);
                    break;
            }

            if (!frameFound) {
                this.KeyInfo.index = this.LoadingXdata.AnimationSetInfo[this.nowAnimationSetName][this.nowFrameName].KeyFrames.length;
                this.KeyInfo.time = /*1.0 / this.LoadingXdata.AnimTicksPerSecond * */this.KeyInfo.Frame;
                this.LoadingXdata.AnimationSetInfo[this.nowAnimationSetName][this.nowFrameName].KeyFrames.push(this.KeyInfo);
            }

            this.nowReaded++;
            if (this.nowReaded >= this.tgtLength || line.indexOf(";;;") > -1) {
                this.nowReadMode = XfileLoadMode$1.Anim_init;
            }
        }
        ////////////////////////

    }, {
        key: 'readFinalize',
        value: function readFinalize() {
            //アニメーション情報、ボーン構造などを再構築
            this.LoadingXdata.FrameInfo = new Array();
            var keys = Object.keys(this.LoadingXdata.FrameInfo_Raw);
            for (var i = 0; i < keys.length; i++) {
                if (this.LoadingXdata.FrameInfo_Raw[keys[i]].Mesh != null) {
                    this.LoadingXdata.FrameInfo.push(this.LoadingXdata.FrameInfo_Raw[keys[i]].Mesh);
                }
            }

            //一部ソフトウェアからの出力用（DirectXとOpenGLのZ座標系の違い）に、鏡面処理を行う
            if (this.LoadingXdata.FrameInfo != null & this.LoadingXdata.FrameInfo.length > 0) {
                for (var _i = 0; _i < this.LoadingXdata.FrameInfo.length; _i++) {
                    if (this.LoadingXdata.FrameInfo[_i].parent == null) {
                        this.LoadingXdata.FrameInfo[_i].zflag = this.zflg;
                        if (this.zflg) {
                            this.LoadingXdata.FrameInfo[_i].scale.set(-1, 1, 1);
                        }
                    }
                }
            }
        }

        /////////////////////////////////

    }, {
        key: 'ParseMatrixData',
        value: function ParseMatrixData(targetMatrix, data) {
            targetMatrix.set(parseFloat(data[0]), parseFloat(data[4]), parseFloat(data[8]), parseFloat(data[12]), parseFloat(data[1]), parseFloat(data[5]), parseFloat(data[9]), parseFloat(data[13]), parseFloat(data[2]), parseFloat(data[6]), parseFloat(data[10]), parseFloat(data[14]), parseFloat(data[3]), parseFloat(data[7]), parseFloat(data[11]), parseFloat(data[15]));
        }

        //最終的に出力されるTHREE.js型のメッシュ（Mesh)を確定する

    }, {
        key: 'MakeOutputGeometry',
        value: function MakeOutputGeometry(nowFrameName, _zflg) {

            if (this.LoadingXdata.FrameInfo_Raw[nowFrameName].Geometry != null) {

                //１つのmesh終了
                this.LoadingXdata.FrameInfo_Raw[nowFrameName].Geometry.computeBoundingBox();
                this.LoadingXdata.FrameInfo_Raw[nowFrameName].Geometry.computeBoundingSphere();

                this.LoadingXdata.FrameInfo_Raw[nowFrameName].Geometry.verticesNeedUpdate = true;
                this.LoadingXdata.FrameInfo_Raw[nowFrameName].Geometry.normalsNeedUpdate = true;
                this.LoadingXdata.FrameInfo_Raw[nowFrameName].Geometry.colorsNeedUpdate = true;
                this.LoadingXdata.FrameInfo_Raw[nowFrameName].Geometry.uvsNeedUpdate = true;
                this.LoadingXdata.FrameInfo_Raw[nowFrameName].Geometry.groupsNeedUpdate = true;

                //ボーンの階層構造を作成する
                //BoneはFrame階層基準で作成、その後にWeit割り当てのボーン配列を再セットする

                var putBones = new Array();
                var BoneDics = new Array();
                var rootBone = new THREE.Bone();
                if (this.LoadingXdata.FrameInfo_Raw[nowFrameName].BoneInfs != null && this.LoadingXdata.FrameInfo_Raw[nowFrameName].BoneInfs.length) {
                    var keys = Object.keys(this.LoadingXdata.FrameInfo_Raw);
                    var BoneDics_Name = new Array();
                    for (var m = 0; m < keys.length; m++) {
                        if (this.LoadingXdata.FrameInfo_Raw[keys[m]].FrameStartLv <= this.LoadingXdata.FrameInfo_Raw[nowFrameName].FrameStartLv && nowFrameName != keys[m]) {
                            continue;
                        }

                        var b = new THREE.Bone();
                        b.name = keys[m];
                        b.applyMatrix(this.LoadingXdata.FrameInfo_Raw[keys[m]].FrameTransformMatrix);
                        b.matrixWorld = b.matrix;
                        b.FrameTransformMatrix = this.LoadingXdata.FrameInfo_Raw[keys[m]].FrameTransformMatrix;
                        BoneDics_Name[b.name] = putBones.length;
                        putBones.push(b);
                    }

                    //今度はボーンの親子構造を作成するために、再度ループさせる
                    for (var _m = 0; _m < putBones.length; _m++) {
                        for (var dx = 0; dx < this.LoadingXdata.FrameInfo_Raw[putBones[_m].name].children.length; dx++) {
                            var nowBoneIndex = BoneDics_Name[this.LoadingXdata.FrameInfo_Raw[putBones[_m].name].children[dx]];
                            if (putBones[nowBoneIndex] != null) {
                                putBones[_m].add(putBones[nowBoneIndex]);
                            }
                        }
                    }
                }

                var mesh = null;
                if (putBones.length > 0) {
                    if (this.LoadingXdata.FrameInfo_Raw[putBones[0].name].children.length === 0 && nowFrameName != putBones[0].name) {
                        putBones[0].add(putBones[1]);
                        putBones[0].zflag = _zflg;
                    }

                    //さらに、ウェイトとボーン情報を紐付ける
                    for (var _m2 = 0; _m2 < putBones.length; _m2++) {
                        if (putBones[_m2].parent === null) {
                            putBones[_m2].zflag = _zflg;
                        }

                        for (var bi = 0; bi < this.LoadingXdata.FrameInfo_Raw[nowFrameName].BoneInfs.length; bi++) {
                            if (putBones[_m2].name === this.LoadingXdata.FrameInfo_Raw[nowFrameName].BoneInfs[bi].BoneName) {
                                //ウェイトのあるボーンであることが確定。頂点情報を割り当てる
                                for (var vi = 0; vi < this.LoadingXdata.FrameInfo_Raw[nowFrameName].BoneInfs[bi].Indeces.length; vi++) {
                                    //頂点へ割り当て
                                    var nowVertexID = this.LoadingXdata.FrameInfo_Raw[nowFrameName].BoneInfs[bi].Indeces[vi];
                                    var nowVal = this.LoadingXdata.FrameInfo_Raw[nowFrameName].BoneInfs[bi].Weights[vi];

                                    switch (this.LoadingXdata.FrameInfo_Raw[nowFrameName].VertexSetedBoneCount[nowVertexID]) {
                                        case 0:
                                            this.LoadingXdata.FrameInfo_Raw[nowFrameName].Geometry.skinIndices[nowVertexID].x = _m2;
                                            this.LoadingXdata.FrameInfo_Raw[nowFrameName].Geometry.skinWeights[nowVertexID].x = nowVal;
                                            break;
                                        case 1:
                                            this.LoadingXdata.FrameInfo_Raw[nowFrameName].Geometry.skinIndices[nowVertexID].y = _m2;
                                            this.LoadingXdata.FrameInfo_Raw[nowFrameName].Geometry.skinWeights[nowVertexID].y = nowVal;
                                            break;
                                        case 2:
                                            this.LoadingXdata.FrameInfo_Raw[nowFrameName].Geometry.skinIndices[nowVertexID].z = _m2;
                                            this.LoadingXdata.FrameInfo_Raw[nowFrameName].Geometry.skinWeights[nowVertexID].z = nowVal;
                                            break;
                                        case 3:
                                            this.LoadingXdata.FrameInfo_Raw[nowFrameName].Geometry.skinIndices[nowVertexID].w = _m2;
                                            this.LoadingXdata.FrameInfo_Raw[nowFrameName].Geometry.skinWeights[nowVertexID].w = nowVal;
                                            break;
                                    }
                                    this.LoadingXdata.FrameInfo_Raw[nowFrameName].VertexSetedBoneCount[nowVertexID]++;
                                }
                            }
                        }
                    }

                    for (var sk = 0; sk < this.LoadingXdata.FrameInfo_Raw[nowFrameName].Materials.length; sk++) {
                        this.LoadingXdata.FrameInfo_Raw[nowFrameName].Materials[sk].skinning = true;
                    }

                    mesh = new THREE.SkinnedMesh(this.LoadingXdata.FrameInfo_Raw[nowFrameName].Geometry, new THREE.MultiMaterial(this.LoadingXdata.FrameInfo_Raw[nowFrameName].Materials));
                    var skeleton = new THREE.Skeleton(putBones);
                    mesh.add(putBones[0]);
                    mesh.bind(skeleton);

                    mesh.SketetonBase = putBones;
                } else {
                    mesh = new THREE.Mesh(this.LoadingXdata.FrameInfo_Raw[nowFrameName].Geometry, new THREE.MultiMaterial(this.LoadingXdata.FrameInfo_Raw[nowFrameName].Materials));
                }
                mesh.name = nowFrameName;
                this.LoadingXdata.FrameInfo_Raw[nowFrameName].Mesh = mesh;
                this.LoadingXdata.FrameInfo_Raw[nowFrameName].Geometry = null;
            }
        }

        //ガチ最終・アニメーションを独自形式→Three.jsの標準に変換する

    }, {
        key: 'animationFinalize',
        value: function animationFinalize() {
            this.animeKeyNames = Object.keys(this.LoadingXdata.AnimationSetInfo);
            if (this.animeKeyNames != null && this.animeKeyNames.length > 0) {
                this.nowReaded = 0;
                this.LoadingXdata.XAnimationObj = [];
                this.animationFinalize_step();
            } else {
                this.finalproc();
            }
        }
    }, {
        key: 'animationFinalize_step',
        value: function animationFinalize_step() {
            var i = this.nowReaded;
            var keys = Object.keys(this.LoadingXdata.FrameInfo_Raw);
            //アニメーションセットと関連付けられている「はず」のモデルを探す。
            var tgtModel = null;
            for (var m = 0; m < this.LoadingXdata.FrameInfo.length; m++) {
                var keys2 = Object.keys(this.LoadingXdata.AnimationSetInfo[this.animeKeyNames[i]]);
                if (this.LoadingXdata.AnimationSetInfo[this.animeKeyNames[i]][keys2[0]].BoneName == this.LoadingXdata.FrameInfo[m].name) {
                    tgtModel = this.LoadingXdata.FrameInfo[m];
                }
            }
            if (tgtModel != null) {
                this.LoadingXdata.XAnimationObj[i] = new XAnimationObj();
                this.LoadingXdata.XAnimationObj[i].fps = this.LoadingXdata.AnimTicksPerSecond;
                this.LoadingXdata.XAnimationObj[i].name = this.animeKeyNames[i];
                this.LoadingXdata.XAnimationObj[i].make(this.LoadingXdata.AnimationSetInfo[this.animeKeyNames[i]], tgtModel);

                // tgtModel.geometry.animations = THREE.AnimationClip.parseAnimation(this.LoadingXdata.XAnimationObj[i],tgtModel.skeleton.bones);            
            }
            this.nowReaded++;
            if (this.nowReaded >= this.animeKeyNames.length) {
                this.LoadingXdata.AnimationSetInfo = null;
                this.finalproc();
            } else {
                this.animationFinalize_step();
            }
        }
    }, {
        key: 'finalproc',
        value: function finalproc() {
            var _this3 = this;

            setTimeout(function () {
                _this3.onLoad(_this3.LoadingXdata);
            }, 1);
        }
    }]);
    return XFileLoader;
}();



THREE.XFileLoader.IsUvYReverse = true;
