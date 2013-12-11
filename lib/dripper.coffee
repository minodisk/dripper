fs = require 'fs'
coffee = require 'coffee-script'


module.exports =

  filter: (source) ->
#    console.log coffee
#    console.log coffee.compile code
    code = new Code source
    console.log code.filter()

  find: ->


class Code

  constructor: (source) ->
    @tokens = coffee.tokens source

  filter: ->
    @tokens.filter (el, i, arr) ->
      el[0] is 'HERECOMMENT' and el[1].charAt(0) is '*'
