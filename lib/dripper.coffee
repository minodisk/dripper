fs = require 'fs'
coffee = require 'coffee-script'


module.exports =

  filter: (source) ->
#    console.log coffee
#    console.log coffee.compile code
    code = new Code source
    code.filterJSDocs()

  find: ->


class Code

  constructor: (source) ->
    @tokens = coffee.tokens(source).map (el) -> new Token el

  filterJSDocs: ->
    @tokens.filter (token, i, tokens) =>
      return unless token.type is 'HERECOMMENT' and token.source.charAt(0) is '*'
      console.log token.toString()
      console.log @filterAt token.range.last_line + 1

  filterAt: (line) -> @tokens.filter (token) -> token.range.first_line is line

class Token

  constructor: ([@type, @source, @range, @newLine]) ->
    unless @newLine?
      @newLine = false

  toString: ->
    "[#{@type}] #{('' + @source).replace /\n/g, '\\n'}"
