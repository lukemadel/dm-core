'use strict';

function getMessage(obj, lang, filter) {
  if (Array.isArray(obj)) {
    var c = obj.reduce(function (prev, cur) {
        if (!filter && cur.lang && cur.lang === lang) {
          return cur.$t;
        }
        else if (filter && cur.lang && cur.lang === lang && cur['for'] === filter) {
          return cur.$t;
        }
        else {
          return prev;
        }
      }, null
    );
    return c
  }
  else if (obj) {
    if (obj.$t) {
      return obj.$t;
    }
    else if (lang && !filter && obj[lang]) {
      return obj[lang];
    }
    else if (lang && !filter && obj.en) {
      return obj.en;
    }
    else if (lang && filter && obj[filter]) {
      return getMessage(obj[filter], lang);
    }
    else if (lang && filter && !obj[filter]) {
      return getMessage(obj, lang);
    }
    else {
      return obj;
    }
  }
  else {
    return;
  }
}


module.exports = function (manifest, lang) {
  var optimist = require('optimist');
  lang = lang || 'en';
  optimist.usage('\nUsage: ' + manifest.id + ' [options]\n\n       ' + getMessage(manifest.title, lang));
  Object.keys(manifest.parameters).forEach(function (key) {
      optimist.describe(key, getMessage(manifest.parameters[key].label, lang))
      if (manifest.parameters[key].alias && !Array.isArray(manifest.parameters[key].alias)) {
        optimist.alias(key, manifest.parameters[key].alias)
      }
      else if (manifest.parameters[key].alias && Array.isArray(manifest.parameters[key].alias)) {
        manifest.parameters[key].alias.forEach(function (altkey) {
            optimist.alias(key, altkey)
          }
        );
      }
      if (manifest.parameters[key].default) {
        optimist.default(key, manifest.parameters[key].default);
      }
      if (manifest.parameters[key].type === 'boolean') {
        optimist.boolean(key);
      }
      else if (manifest.parameters[key].type === 'text') {
        optimist.string(key);
      }
    }
  );
  optimist.boolean('h').alias('h', 'help').describe('h', 'Print this list and exit.');

  var argv = optimist.argv;
  if (argv.h) {
    console.log(optimist.help());
    process.exit();
  }
  var options = require('formatik').parse(argv, manifest.parameters, lang);

  if (options.isValid()) {
    return options.mget('value');
  }
  else {
    console.log(optimist.help());
    process.exit(-1);
  }
}




