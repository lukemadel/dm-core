'use strict';

var path = require('path')
, basename = path.basename(__filename, '.js')
, debug = require('debug')('mill:' + basename)
, stream = require("stream")
;

function Tester(command, options)
{
  var self = this;
  self.content = '';
  self.si = new stream.PassThrough();
  self.so = command(options, self.si);
  self.ending = function () {};

  self.so.on('data', function (buf) {
      self.content += buf.toString();
    }
  );
  self.so.on('end', function () {
      self.ending(null, self.content);
      self.content = '';
    }
  )
}

Tester.prototype.send = function (content) {
  this.si.write(content);
  this.si.end();
  return this;
};

Tester.prototype.end = function (callback) {
  this.ending = callback;
  return this;
};


module.exports = function (command, options) {
  return new Tester(command, options);
}
