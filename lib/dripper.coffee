fs = require 'fs'
coffee = require 'coffee-script'


module.exports =

  parse: (source) ->
    code = new Code source
    code.filterJSDocs()

  render: (engine = 'ejs', options = {}) ->
    renderer = new Renderer engine, options

class Renderer

  constructor: ->
    engine = require engine
    engine.render template, options


class Code

  constructor: (source) ->
    @tokens = coffee.tokens(source).map (el) ->
      new Token el

  filterJSDocs: ->
    docs = []

    indent = 0
    classIndent = null
    classDoc = null

    @tokens.filter (token) =>
      switch token.type

        when 'INDENT'
          indent += token.source
          return

        when 'OUTDENT'
          indent -= token.source
          if classIndent? and classIndent is indent
            classDoc = classDoc.fixName()
            docs.push classDoc
            classDoc = null
            classIndent = null
          return

        when 'HERECOMMENT'
          return if token.source.charAt(0) isnt '*'

          doc = new Doc token.source
          name = null
          param = null
          isParam = false
          isParamValue = false
          @filterAt(token.range.last_line + 1).forEach (relatedToken) =>
            { type, source } = relatedToken
            switch type
              when 'CLASS'
                classDoc = doc = new ClassDoc doc.description
                classDoc.type = type
                classIndent = indent
              when '@'
                doc.modifier = 'static'
              when 'IDENTIFIER'
                if isParam
                  param = new Param source
                  doc.pushParam param
                else
                  name = source
#              when '.'
#                names?.push source
              when '='
                if isParam
                  isParamValue = true
                else
                  doc.name = name
                  docs.push doc
                  return
              when ':'
                return if isParam
                doc.name = name
                if classDoc?
                  if doc.modifier is 'static'
                    classDoc.pushStatic doc
                  else
                    doc.modifier = 'member'
                    classDoc.pushMember doc
                else
                  docs.push doc
              when 'PARAM_START'
                isParam = true
              when 'PARAM_END'
                isParam = false
              when '->', '=>'
                doc.type = 'function'
                '' # do nothing
              else
                if isParamValue
                  isParamValue = false
                  switch type
                    when 'NUMBER'
                      source = parseFloat source
                  param.value = source

        else
          return

    docs

  filterAt: (line) ->
    @tokens.filter (token) ->
      token.range.first_line is line


class Token

  constructor: ([@type, @source, @range, @newLine]) ->
    unless @newLine?
      @newLine = false

  toString: ->
    "[#{@type}] #{('' + @source).replace /\n/g, '\\n'}"


class Doc

  constructor: (comment = '') ->
    @type = 'variable'
    @description = new Description comment

  pushParam: ->
    unless @params?
      @params = []
    @params.push.apply @params, arguments


class ClassDoc extends Doc

  constructor: (@description = '') ->
    super @description
    @statics = []
    @members = []

  pushStatic: ->
    @statics.push.apply @statics, arguments

  pushMember: ->
    @members.push.apply @members, arguments


class Param

  constructor: (@name, @value = null) ->


class Description

  rMeta: /^@(\S+)\s+(.*)/m
  rComment: /^\*\s*(.*?)\s*$/

  constructor: (comment) ->
    @metas = []
    comment = comment.replace @rMeta, =>
      @metas.push new Meta arguments[1], arguments[2]
      ''
    @text = comment.replace @rComment, '$1'

#    console.log @text
#    console.log @metas


class Meta

  constructor: (@type, value) ->
    switch type
      when ''
      else
        @value = value
