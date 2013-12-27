(function() {
  var ClassDoc, Code, Description, Doc, Meta, Param, Renderer, Returns, Token, coffee, commander, fs, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fs = require('fs');

  path = require('path');

  commander = require('commander');

  coffee = require('coffee-script');

  module.exports = {
    run: function() {
      var docs, input, text, version;
      version = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')).version;
      commander.version(version).usage('dripper [options] <input>').option('-e, --engine <engine>', 'template engine <ejs>', 'ejs').option('-t, --template <filename>', 'template file <readme.ejs>', 'readme.ejs').option('-o, --output <filename>', 'output file <readme.md>', 'readme.md').parse(process.argv);
      if ((input = commander.args[0]) == null) {
        throw new TypeError('input is required');
      }
      docs = this.parse(fs.readFileSync(input, 'utf8'));
      text = this.render(docs, commander.engine, fs.readFileSync(commander.template, 'utf8'));
      return fs.writeFileSync(commander.output, text);
    },
    parse: function(source) {
      var code;
      code = new Code(source);
      return code.filterJSDocs();
    },
    render: function(docs, engine, template, options) {
      var renderer;
      if (engine == null) {
        engine = 'ejs';
      }
      if (template == null) {
        template = null;
      }
      if (options == null) {
        options = {};
      }
      renderer = new Renderer(engine, template, options);
      return renderer.render(docs);
    }
  };

  Renderer = (function() {
    function Renderer(engine, template, options) {
      if (engine == null) {
        engine = 'ejs';
      }
      if (template == null) {
        template = null;
      }
      if (options == null) {
        options = {};
      }
      if (template == null) {
        if (Renderer.defaultTemplate == null) {
          Renderer.defaultTemplate = fs.readFileSync('assets/template.ejs', 'utf8');
        }
        template = Renderer.defaultTemplate;
      }
      engine = require(engine);
      this.renderer = engine.compile(template, options);
    }

    Renderer.prototype.render = function(docs) {
      return this.renderer({
        docs: docs
      });
    };

    return Renderer;

  })();

  Code = (function() {
    function Code(source) {
      this.tokens = coffee.tokens(source).map(function(el) {
        return new Token(el);
      });
    }

    Code.prototype.filterJSDocs = function() {
      var classDoc, classIndent, docs, indent,
        _this = this;
      docs = [];
      indent = 0;
      classIndent = null;
      classDoc = null;
      this.tokens.filter(function(token) {
        var doc, isParam, isParamValue, name, param;
        switch (token.type) {
          case 'INDENT':
            indent += token.source;
            break;
          case 'OUTDENT':
            indent -= token.source;
            if ((classIndent != null) && classIndent === indent) {
              classDoc = classDoc.fixName();
              docs.push(classDoc);
              classDoc = null;
              classIndent = null;
            }
            break;
          case 'HERECOMMENT':
            if (token.source.charAt(0) !== '*') {
              return;
            }
            doc = new Doc(token.source);
            name = null;
            param = null;
            isParam = false;
            isParamValue = false;
            return _this.filterAt(token.range.last_line + 1).forEach(function(relatedToken) {
              var source, type;
              type = relatedToken.type, source = relatedToken.source;
              switch (type) {
                case 'CLASS':
                  classDoc = doc = new ClassDoc(doc.description);
                  classDoc.type = type;
                  return classIndent = indent;
                case '@':
                  return doc.modifier = 'static';
                case 'IDENTIFIER':
                  if (isParam) {
                    param = {
                      name: source,
                      isRest: false
                    };
                    return doc.pushParam(param);
                  } else {
                    return name = source;
                  }
                  break;
                case '...':
                  if (isParam) {
                    return param.isRest = true;
                  }
                  break;
                case '=':
                  if (isParam) {
                    return isParamValue = true;
                  } else {
                    doc.name = name;
                    docs.push(doc);
                  }
                  break;
                case ':':
                  if (isParam) {
                    return;
                  }
                  doc.name = name;
                  if (classDoc != null) {
                    if (doc.modifier === 'static') {
                      return classDoc.pushStatic(doc);
                    } else {
                      doc.modifier = 'member';
                      return classDoc.pushMember(doc);
                    }
                  } else {
                    return docs.push(doc);
                  }
                  break;
                case 'PARAM_START':
                  return isParam = true;
                case 'PARAM_END':
                  return isParam = false;
                case '->':
                case '=>':
                  doc.type = 'function';
                  return '';
                default:
                  if (isParamValue) {
                    isParamValue = false;
                    switch (type) {
                      case 'NUMBER':
                        source = parseFloat(source);
                    }
                    return param.value = source;
                  }
              }
            });
        }
      });
      return docs;
    };

    Code.prototype.filterAt = function(line) {
      return this.tokens.filter(function(token) {
        return token.range.first_line === line;
      });
    };

    return Code;

  })();

  Token = (function() {
    function Token(_arg) {
      this.type = _arg[0], this.source = _arg[1], this.range = _arg[2], this.newLine = _arg[3];
      if (this.newLine == null) {
        this.newLine = false;
      }
    }

    Token.prototype.toString = function() {
      return "[" + this.type + "] " + (('' + this.source).replace(/\n/g, '\\n'));
    };

    return Token;

  })();

  Doc = (function() {
    function Doc(comment) {
      if (comment == null) {
        comment = '';
      }
      this.type = 'variable';
      this.description = new Description(comment);
    }

    Doc.prototype.pushParam = function() {
      if (this.params == null) {
        this.params = [];
      }
      return this.params.push.apply(this.params, arguments);
    };

    return Doc;

  })();

  ClassDoc = (function(_super) {
    __extends(ClassDoc, _super);

    function ClassDoc(description) {
      this.description = description != null ? description : '';
      ClassDoc.__super__.constructor.call(this, this.description);
      this.statics = [];
      this.members = [];
    }

    ClassDoc.prototype.pushStatic = function() {
      return this.statics.push.apply(this.statics, arguments);
    };

    ClassDoc.prototype.pushMember = function() {
      return this.members.push.apply(this.members, arguments);
    };

    return ClassDoc;

  })(Doc);

  Description = (function() {
    Description.prototype.rMeta = /^@(\S+)\s+(.*)/mg;

    Description.prototype.rComment = /^\*\s*(.*?)\s*$/;

    function Description(comment) {
      var _this = this;
      this.meta = new Meta();
      comment = comment.replace(this.rMeta, function() {
        _this.meta.add(arguments[1], arguments[2]);
        return '';
      });
      this.text = comment.replace(this.rComment, '$1');
    }

    return Description;

  })();

  Meta = (function() {
    function Meta() {
      this.namespace = '';
      this.params = [];
      this.returns = '';
      this["const"] = false;
      this.deprecated = '';
      this.license = '';
      this.member = null;
    }

    Meta.prototype.add = function(type, value) {
      switch (type) {
        case 'param':
          return this.params.push(new Param(value));
        case 'return':
        case 'returns':
          return this.returns = new Returns(value);
        default:
          return this[type] = value;
      }
    };

    return Meta;

  })();

  Param = (function() {
    Param.prototype.rNameTypeDescription = /(?:{(.*?)})?\s+(.*?)\s+(.*)/;

    function Param(description) {
      var _ref;
      _ref = this.rNameTypeDescription.exec(description), _ref[0], this.type = _ref[1], this.name = _ref[2], this.text = _ref[3];
    }

    return Param;

  })();

  Returns = (function() {
    Returns.prototype.rTypeDescription = /(?:{(.*?)})?\s+(.*)/;

    function Returns(description) {
      var _ref;
      _ref = this.rTypeDescription.exec(description), _ref[0], this.type = _ref[1], this.text = _ref[2];
    }

    return Returns;

  })();

}).call(this);
