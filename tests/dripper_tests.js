// Generated by CoffeeScript 1.6.3
(function() {
  var chai, codes, dripper, dump, inspect, should,
    __slice = [].slice;

  chai = require('chai');

  should = chai.should();

  dripper = require('../lib/dripper');

  inspect = require('util').inspect;

  codes = {
    'class': "###*\nclass\n###\nclass Foo\n\n  ###*\n  class property\n  ###\n  @a: 3\n\n  ###*\n  class function\n  ###\n  @add: (a, b) ->\n    new Foo a.value + b.value\n\n  ###*\n  prototype property\n  ###\n  a: 3\n\n  ###*\n  constructor\n  ###\n  constructor: (value = 0) ->\n\n  ###*\n  member function\n  ###\n  add: (value) ->\n    @value += value",
    'extended function': "$.fn.extend\n  ###*\n  extended function\n  ###\n  findBranch = (items...) -> @find items.join '>'"
  };

  dump = function() {
    var arg, args, _i, _len, _results;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    _results = [];
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      arg = args[_i];
      _results.push(console.log(JSON.stringify(arg, null, 2)));
    }
    return _results;
  };

  describe('dripper', function() {
    it('should not parse normal comment out', function() {
      var code, docs;
      code = "# single-line comment\nabc # single-line comment\n### herecomment ###\nabc ### herecomment ###\n###\nmulti-line herecomment\n###\n###\nmulti-line herecomment\n###\nabc";
      docs = dripper.parse(code);
      return docs.should.be.length(0);
    });
    it('should parse plane variable', function() {
      var code, doc;
      code = "###*\nplane variable\n###\ndoublePi = Math.PI * 2";
      doc = dripper.parse(code)[0];
      doc.type.should.be.equal('variable');
      doc.description.text.should.be.equal('plane variable');
      return doc.name.should.be.equal('doublePi');
    });
    it('should parse plane function', function() {
      var code, doc;
      code = "###*\nplane function\n###\nadd = (a, b = 0) -> a + b";
      doc = dripper.parse(code)[0];
      doc.type.should.be.equal('function');
      doc.description.text.should.be.equal('plane function');
      doc.name.should.be.equal('add');
      doc.params.should.have.length(2);
      doc.params[0].name.should.be.equal('a');
      should.not.exist(doc.params[0].value);
      doc.params[1].name.should.be.equal('b');
      return doc.params[1].value.should.be.equal(0);
    });
    it('should parse dotted variable', function() {
      var code, doc;
      code = "###*\ndotted variable\n@namespace $\n###\n$.$window = $ window";
      doc = dripper.parse(code)[0];
      doc.type.should.be.equal('variable');
      doc.description.text.should.be.equal('dotted variable');
      doc.description.meta.namespace.should.be.equal('$');
      return doc.name.should.be.equal('$window');
    });
    it('should parse dotted function', function() {
      var code, doc;
      code = "###*\ndotted function\n@namespace $.fn\n###\n$.fn.findAt = (selector, index = 0) -> @find(selector).eq(index)";
      doc = dripper.parse(code)[0];
      doc.type.should.be.equal('function');
      doc.description.text.should.be.equal('dotted function');
      doc.description.meta.namespace.should.be.equal('$.fn');
      doc.name.should.be.equal('findAt');
      doc.params[0].name.should.be.equal('selector');
      should.not.exist(doc.params[0].value);
      doc.params[1].name.should.be.equal('index');
      return doc.params[1].value.should.be.equal(0);
    });
    return it('should parse objective variable and function', function() {
      var code, docs;
      code = "$ =\n  ###*\n  objective variable\n  @namespace $\n  ###\n  halfPi: Math.PI / 2\n  fn:\n    ###*\n    objective function\n    @namespace $.fn\n    @param {String} selector This is 1st param description.\n    @returns {jQuery} This is returns description.\n    ###\n    findAndSelf: (selector) -> @find(selector).addBack().find selector";
      docs = dripper.parse(code);
      docs[0].type.should.be.equal('variable');
      docs[0].description.text.should.be.equal('objective variable');
      docs[0].description.meta.namespace.should.be.equal('$');
      docs[0].name.should.be.equal('halfPi');
      docs[1].type.should.be.equal('function');
      docs[1].description.text.should.be.equal('objective function');
      docs[1].description.meta.namespace.should.be.equal('$.fn');
      docs[1].name.should.be.equal('findAndSelf');
      docs[1].params[0].name.should.be.equal('selector');
      return should.not.exist(docs[1].params[0].value);
    });
  });

}).call(this);
