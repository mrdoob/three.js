/* global module require */
'use strict';

module.exports = function(settings) { // wrapper in case we're in module_context mode

const cache      = new (require('inmemfilecache'))();
const Feed       = require('feed').Feed;
const fs         = require('fs');
const glob       = require('glob');
const Handlebars = require('handlebars');
const hanson     = require('hanson');
const marked     = require('marked');
const path       = require('path');
const Promise    = require('promise');
const sitemap    = require('sitemap');
const utils      = require('./utils');
const moment     = require('moment');
const url        = require('url');

//process.title = 'build';

const executeP = Promise.denodeify(utils.execute);

marked.setOptions({
  rawHtml: true,
  //pedantic: true,
});

function applyObject(src, dst) {
  Object.keys(src).forEach(function(key) {
    dst[key] = src[key];
  });
  return dst;
}

function mergeObjects() {
  const merged = {};
  Array.prototype.slice.call(arguments).forEach(function(src) {
    applyObject(src, merged);
  });
  return merged;
}

function readFile(fileName) {
  return cache.readFileSync(fileName, 'utf-8');
}

function writeFileIfChanged(fileName, content) {
  if (fs.existsSync(fileName)) {
    const old = readFile(fileName);
    if (content === old) {
      return;
    }
  }
  fs.writeFileSync(fileName, content);
  console.log('Wrote: ' + fileName);  // eslint-disable-line
}

function copyFile(src, dst) {
  writeFileIfChanged(dst, readFile(src));
}

function replaceParams(str, params) {
  const template = Handlebars.compile(str);
  if (Array.isArray(params)) {
    params = mergeObjects.apply(null, params.slice().reverse());
  }

  return template(params);
}

function encodeParams(params) {
  const values = Object.values(params).filter(v => v);
  if (!values.length) {
    return '';
  }
  return '&' + Object.entries(params).map((kv) => {
    return `${encodeURIComponent(kv[0])}=${encodeURIComponent(kv[1])}`;
  }).join('&');
}

function encodeQuery(query) {
  if (!query) {
    return '';
  }
  return '?' + query.split('&').map(function(pair) {
    return pair.split('=').map(function(kv) {
      return encodeURIComponent(decodeURIComponent(kv));
    }).join('=');
  }).join('&');
}

function encodeUrl(src) {
  const u = url.parse(src);
  u.search = encodeQuery(u.query);
  return url.format(u);
}

function TemplateManager() {
  const templates = {};

  this.apply = function(filename, params) {
    let template = templates[filename];
    if (!template) {
      template = Handlebars.compile(readFile(filename));
      templates[filename] = template;
    }

    if (Array.isArray(params)) {
      params = mergeObjects.apply(null, params.slice().reverse());
    }

    return template(params);
  };
}

const templateManager = new TemplateManager();

Handlebars.registerHelper('include', function(filename, options) {
  let context;
  if (options && options.hash && options.hash.filename) {
    const varName = options.hash.filename;
    filename = options.data.root[varName];
    context = options.hash;
  } else {
    context = options.data.root;
  }
  return templateManager.apply(filename, context);
});

Handlebars.registerHelper('example', function(options) {
  options.hash.width   = options.hash.width  ? 'width:  ' + options.hash.width  + 'px;' : '';
  options.hash.height  = options.hash.height ? 'height: ' + options.hash.height + 'px;' : '';
  options.hash.caption = options.hash.caption || options.data.root.defaultExampleCaption;
  options.hash.examplePath = options.data.root.examplePath;
  options.hash.encodedUrl = encodeURIComponent(encodeUrl(options.hash.url));
  options.hash.url = encodeUrl(options.hash.url);
  options.hash.params = encodeParams({
    startPane: options.hash.startPane,
  });
  return templateManager.apply('build/templates/example.template', options.hash);
});

Handlebars.registerHelper('diagram', function(options) {

  options.hash.width  = options.hash.width || '400';
  options.hash.height = options.hash.height || '300';
  options.hash.examplePath = options.data.root.examplePath;
  options.hash.className = options.hash.className || '';
  options.hash.url = encodeUrl(options.hash.url);

  return templateManager.apply('build/templates/diagram.template', options.hash);
});

Handlebars.registerHelper('image', function(options) {

  options.hash.examplePath = options.data.root.examplePath;
  options.hash.className = options.hash.className || '';
  options.hash.caption = options.hash.caption || undefined;

  if (options.hash.url.substring(0, 4) === 'http') {
    options.hash.examplePath = '';
  }

  return templateManager.apply('build/templates/image.template', options.hash);
});

Handlebars.registerHelper('selected', function(options) {
  const key = options.hash.key;
  const value = options.hash.value;
  const re = options.hash.re;
  const sub = options.hash.sub;

  const a = this[key];
  let b = options.data.root[value];

  if (re) {
    const r = new RegExp(re);
    b = b.replace(r, sub);
  }

  return a === b ? 'selected' : '';
});

function slashify(s) {
  return s.replace(/\\/g, '/');
}

const Builder = function(outBaseDir, options) {

  const g_articlesByLang = {};
  let g_articles = [];
  let g_langInfo;
  const g_langDB = {};
  const g_outBaseDir = outBaseDir;
  const g_origPath = options.origPath;

  // This are the english articles.
  const g_origArticles = glob.sync(path.join(g_origPath, '*.md')).map(a => path.basename(a)).filter(a => a !== 'index.md');

  const extractHeader = (function() {
    const headerRE = /([A-Z0-9_-]+): (.*?)$/i;

    return function(content) {
      const metaData = { };
      const lines = content.split('\n');
      for (;;) {
        const line = lines[0].trim();
        const m = headerRE.exec(line);
        if (!m) {
          break;
        }
        metaData[m[1].toLowerCase()] = m[2];
        lines.shift();
      }
      return {
        content: lines.join('\n'),
        headers: metaData,
      };
    };
  }());

  const parseMD = function(content) {
    return extractHeader(content);
  };

  const loadMD = function(contentFileName) {
    const content = cache.readFileSync(contentFileName, 'utf-8');
    return parseMD(content);
  };

  function extractHandlebars(content) {
    const tripleRE = /\{\{\{.*?\}\}\}/g;
    const doubleRE = /\{\{\{.*?\}\}\}/g;

    let numExtractions = 0;
    const extractions = {
    };

    function saveHandlebar(match) {
      const id = '==HANDLEBARS_ID_' + (++numExtractions) + '==';
      extractions[id] = match;
      return id;
    }

    content = content.replace(tripleRE, saveHandlebar);
    content = content.replace(doubleRE, saveHandlebar);

    return {
      content: content,
      extractions: extractions,
    };
  }

  function insertHandlebars(info, content) {
    const handlebarRE = /==HANDLEBARS_ID_\d+==/g;

    function restoreHandlebar(match) {
      const value = info.extractions[match];
      if (value === undefined) {
        throw new Error('no match restoring handlebar for: ' + match);
      }
      return value;
    }

    content = content.replace(handlebarRE, restoreHandlebar);

    return content;
  }

  const applyTemplateToContent = function(templatePath, contentFileName, outFileName, opt_extra, data) {
    // Call prep's Content which parses the HTML. This helps us find missing tags
    // should probably call something else.
    //Convert(md_content)
    const metaData = data.headers;
    const content = data.content;
    //console.log(JSON.stringify(metaData, undefined, '  '));
    const info = extractHandlebars(content);
    let html = marked(info.content);
    html = insertHandlebars(info, html);
    html = replaceParams(html, [opt_extra, g_langInfo]);
    const relativeOutName = slashify(outFileName).substring(g_outBaseDir.length);
    const pathRE = new RegExp(`^\\/${settings.rootFolder}\\/lessons\\/$`);
    const langs = Object.keys(g_langDB).map((name) => {
      const lang = g_langDB[name];
      const url = slashify(path.join(lang.basePath, path.basename(outFileName)))
         .replace('index.html', '')
         .replace(pathRE, '/');
      return {
        lang: lang.lang,
        language: lang.language,
        url: url,
      };
    });
    metaData['content'] = html;
    metaData['langs'] = langs;
    metaData['src_file_name'] = slashify(contentFileName);
    metaData['dst_file_name'] = relativeOutName;
    metaData['basedir'] = '';
    metaData['toc'] = opt_extra.toc;
    metaData['templateOptions'] = opt_extra.templateOptions;
    metaData['langInfo'] = g_langInfo;
    metaData['url'] = `${settings.baseUrl}${relativeOutName}`;
    metaData['relUrl'] = relativeOutName;
    metaData['screenshot'] = `${settings.baseUrl}/${settings.rootFolder}/lessons/resources/${settings.siteThumbnail}`;
    const basename = path.basename(contentFileName, '.md');
    ['.jpg', '.png'].forEach(function(ext) {
      const filename = path.join(settings.rootFolder, 'lessons', 'screenshots', basename + ext);
      if (fs.existsSync(filename)) {
        metaData['screenshot'] = `${settings.baseUrl}/${settings.rootFolder}/lessons/screenshots/${basename}${ext}`;
      }
    });
    const output = templateManager.apply(templatePath, metaData);
    writeFileIfChanged(outFileName, output);

    return metaData;
  };

  const applyTemplateToFile = function(templatePath, contentFileName, outFileName, opt_extra) {
    console.log('processing: ', contentFileName);  // eslint-disable-line
    opt_extra = opt_extra || {};
    const data = loadMD(contentFileName);
    const metaData = applyTemplateToContent(templatePath, contentFileName, outFileName, opt_extra, data);
    g_articles.push(metaData);
  };

  const applyTemplateToFiles = function(templatePath, filesSpec, extra) {
    const files = glob.sync(filesSpec).sort();
    files.forEach(function(fileName) {
      const ext = path.extname(fileName);
      const baseName = fileName.substr(0, fileName.length - ext.length);
      const outFileName = path.join(outBaseDir, baseName + '.html');
      applyTemplateToFile(templatePath, fileName, outFileName, extra);
    });

  };

  const addArticleByLang = function(article, lang) {
    const filename = path.basename(article.dst_file_name);
    let articleInfo = g_articlesByLang[filename];
    const url = `${settings.baseUrl}${article.dst_file_name}`;
    if (!articleInfo) {
      articleInfo = {
        url: url,
        changefreq: 'monthly',
        links: [],
      };
      g_articlesByLang[filename] = articleInfo;
    }
    articleInfo.links.push({
      url: url,
      lang: lang,
    });
  };

  const getLanguageSelection = function(lang) {
    const lessons = lang.lessons || (`${settings.rootFolder}/lessons/${lang.lang}`);
    const langInfo = hanson.parse(fs.readFileSync(path.join(lessons, 'langinfo.hanson'), {encoding: 'utf8'}));
    langInfo.langCode = langInfo.langCode || lang.lang;
    langInfo.home = lang.home || ('/' + lessons + '/');
    g_langDB[lang.lang] = {
      lang: lang.lang,
      language: langInfo.language,
      basePath: '/' + lessons,
      langInfo: langInfo,
    };
  };

  this.preProcess = function(langs) {
     langs.forEach(getLanguageSelection);
  };

  this.process = function(options) {
    console.log('Processing Lang: ' + options.lang);  // eslint-disable-line
    options.lessons     = options.lessons     || (`${settings.rootFolder}/lessons/${options.lang}`);
    options.toc         = options.toc         || (`${settings.rootFolder}/lessons/${options.lang}/toc.html`);
    options.template    = options.template    || 'build/templates/lesson.template';
    options.examplePath = options.examplePath === undefined ? `/${settings.rootFolder}/lessons/` : options.examplePath;

    g_articles = [];
    g_langInfo = g_langDB[options.lang].langInfo;

    applyTemplateToFiles(options.template, path.join(options.lessons, settings.lessonGrep), options);

    // generate place holders for non-translated files
    const articlesFilenames = g_articles.map(a => path.basename(a.src_file_name));
    const missing = g_origArticles.filter(name => articlesFilenames.indexOf(name) < 0);
    missing.forEach(name => {
      const ext = path.extname(name);
      const baseName = name.substr(0, name.length - ext.length);
      const outFileName = path.join(outBaseDir, options.lessons, baseName + '.html');
      const data = Object.assign({}, loadMD(path.join(g_origPath, name)));
      data.content = g_langInfo.missing;
      const extra = {
        origLink: '/' + slashify(path.join(g_origPath, baseName + '.html')),
        toc: options.toc,
      };
      console.log('  generating missing:', outFileName);  // eslint-disable-line
      applyTemplateToContent(
          'build/templates/missing.template',
          path.join(options.lessons, 'langinfo.hanson'),
          outFileName,
          extra,
          data);
    });

    function utcMomentFromGitLog(result, filename, timeType) {
      const dateStr = result.stdout.split('\n')[0].trim();
      const utcDateStr = dateStr
        .replace(/"/g, '')   // WTF to these quotes come from!??!
        .replace(' ', 'T')
        .replace(' ', '')
        .replace(/(\d\d)$/, ':$1');
      const m = moment.utc(utcDateStr);
      if (m.isValid()) {
        return m;
      }
      const stat = fs.statSync(filename);
      return moment(stat[timeType]);
    }

    const tasks = g_articles.map((article) => {
      return function() {
        return executeP('git', [
          'log',
          '--format="%ci"',
          '--name-only',
          '--diff-filter=A',
          article.src_file_name,
        ]).then((result) => {
          article.dateAdded = utcMomentFromGitLog(result, article.src_file_name, 'ctime');
        });
      };
    }).concat(g_articles.map((article) => {
       return function() {
         return executeP('git', [
           'log',
           '--format="%ci"',
           '--name-only',
           '--max-count=1',
           article.src_file_name,
         ]).then((result) => {
           article.dateModified = utcMomentFromGitLog(result, article.src_file_name, 'mtime');
         });
       };
    }));

    return tasks.reduce(function(cur, next){
        return cur.then(next);
    }, Promise.resolve()).then(function() {
      let articles = g_articles.filter(function(article) {
        return article.dateAdded !== undefined;
      });
      articles = articles.sort(function(a, b) {
        return b.dateAdded - a.dateAdded;
      });

      if (articles.length) {
        const feed = new Feed({
          title:          g_langInfo.title,
          description:    g_langInfo.description,
          link:           g_langInfo.link,
          image:          `${settings.baseUrl}/${settings.rootFolder}/lessons/resources/${settings.siteThumbnail}`,
          date:           articles[0].dateModified.toDate(),
          published:      articles[0].dateModified.toDate(),
          updated:        articles[0].dateModified.toDate(),
          author: {
            name:       `${settings.siteName} Contributors`,
            link:       `${settings.baseUrl}/contributors.html`,
          },
        });

        articles.forEach(function(article) {
          feed.addItem({
            title:          article.title,
            link:           `${settings.baseUrl}${article.dst_file_name}`,
            description:    '',
            author: [
              {
                name:       `${settings.siteName} Contributors`,
                link:       `${settings.baseUrl}/contributors.html`,
              },
            ],
            // contributor: [
            // ],
            date:           article.dateModified.toDate(),
            published:      article.dateAdded.toDate(),
            // image:          posts[key].image
          });

          addArticleByLang(article, options.lang);
        });

        try {
          const outPath = path.join(g_outBaseDir, options.lessons, 'atom.xml');
          console.log('write:', outPath);  // eslint-disable-line
          writeFileIfChanged(outPath, feed.atom1());
        } catch (err) {
          return Promise.reject(err);
        }
      } else {
        console.log('no articles!');  // eslint-disable-line
      }

      return Promise.resolve();
    }).then(function() {
      // this used to insert a table of contents
      // but it was useless being auto-generated
      applyTemplateToFile('build/templates/index.template', path.join(options.lessons, 'index.md'), path.join(g_outBaseDir, options.lessons, 'index.html'), {
        table_of_contents: '',
        templateOptions: g_langInfo,
      });
      return Promise.resolve();
    }, function(err) {
      console.error('ERROR!:');  // eslint-disable-line
      console.error(err);  // eslint-disable-line
      if (err.stack) {
        console.error(err.stack);  // eslint-disable-line
      }
      throw new Error(err.toString());
    });
  };

  this.writeGlobalFiles = function() {
    const sm = sitemap.createSitemap({
      hostname: settings.baseUrl,
      cacheTime: 600000,
    });
    const articleLangs = { };
    Object.keys(g_articlesByLang).forEach(function(filename) {
      const article = g_articlesByLang[filename];
      const langs = {};
      article.links.forEach(function(link) {
        langs[link.lang] = true;
      });
      articleLangs[filename] = langs;
      sm.add(article);
    });
    // var langInfo = {
    //   articles: articleLangs,
    //   langs: g_langDB,
    // };
    // var langJS = 'window.langDB = ' + JSON.stringify(langInfo, null, 2);
    // writeFileIfChanged(path.join(g_outBaseDir, 'langdb.js'), langJS);
    writeFileIfChanged(path.join(g_outBaseDir, 'sitemap.xml'), sm.toString());
    copyFile(path.join(g_outBaseDir, `${settings.rootFolder}/lessons/atom.xml`), path.join(g_outBaseDir, 'atom.xml'));
    copyFile(path.join(g_outBaseDir, `${settings.rootFolder}/lessons/index.html`), path.join(g_outBaseDir, 'index.html'));

    applyTemplateToFile('build/templates/index.template', 'contributors.md', path.join(g_outBaseDir, 'contributors.html'), {
      table_of_contents: '',
      templateOptions: '',
    });
  };


};

const b = new Builder('out', {
  origPath: `${settings.rootFolder}/lessons`,  // english articles
});

const readdirs = function(dirpath) {
  const dirsOnly = function(filename) {
    const stat = fs.statSync(filename);
    return stat.isDirectory();
  };

  const addPath = function(filename) {
    return path.join(dirpath, filename);
  };

  return fs.readdirSync(`${settings.rootFolder}/lessons`)
      .map(addPath)
      .filter(dirsOnly);
};

const isLangFolder = function(dirname) {
  const filename = path.join(dirname, 'langinfo.hanson');
  return fs.existsSync(filename);
};


const pathToLang = function(filename) {
  return {
    lang: path.basename(filename),
  };
};

let langs = [
  // English is special (sorry it's where I started)
  {
    template: 'build/templates/lesson.template',
    lessons: `${settings.rootFolder}/lessons`,
    lang: 'en',
    toc: `${settings.rootFolder}/lessons/toc.html`,
    examplePath: `/${settings.rootFolder}/lessons/`,
    home: '/',
  },
];

langs = langs.concat(readdirs(`${settings.rootFolder}/lessons`)
    .filter(isLangFolder)
    .map(pathToLang));

b.preProcess(langs);

const tasks = langs.map(function(lang) {
  return function() {
    return b.process(lang);
  };
});

return tasks.reduce(function(cur, next) {
  return cur.then(next);
}, Promise.resolve()).then(function() {
  b.writeGlobalFiles();
  cache.clear();
  return Promise.resolve();
});

};

