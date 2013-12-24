chai = require 'chai'
should = chai.should()

dripper = require '../lib/dripper'
{ inspect } = require 'util'

codes =
  'class': """
###*
class
###
class Foo

  ###*
  class property
  ###
  @a: 3

  ###*
  class function
  ###
  @add: (a, b) ->
    new Foo a.value + b.value

  ###*
  prototype property
  ###
  a: 3

  ###*
  constructor
  ###
  constructor: (value = 0) ->

  ###*
  member function
  ###
  add: (value) ->
    @value += value
""",
  'extended function': """
$.fn.extend
  ###*
  extended function
  ###
  findBranch = (items...) -> @find items.join '>'
"""

dump = (args...) ->
#  console.log inspect.apply inspect, arguments, depth: null
  for arg in args
    console.log JSON.stringify arg, null, 2


describe 'dripper', ->

  it 'should not parse normal comment out', ->
    code = """
# single-line comment
abc # single-line comment
### herecomment ###
abc ### herecomment ###
###
multi-line herecomment
###
###
multi-line herecomment
###
abc
"""
    docs = dripper.parse code
    docs.should.be.length 0

  it 'should parse plane variable', ->
    code = """
###*
plane variable
###
doublePi = Math.PI * 2
"""
    doc = dripper.parse(code)[0]
    doc.type.should.be.equal 'variable'
    doc.description.text.should.be.equal 'plane variable'
    doc.name.should.be.equal 'doublePi'

  it 'should parse plane function', ->
    code = """
###*
plane function
###
add = (a, b = 0) -> a + b
"""
    doc = dripper.parse(code)[0]
    doc.type.should.be.equal 'function'
    doc.description.text.should.be.equal 'plane function'
    doc.name.should.be.equal 'add'
    doc.params.should.have.length 2
    doc.params[0].name.should.be.equal 'a'
    should.not.exist doc.params[0].value
    doc.params[1].name.should.be.equal 'b'
    doc.params[1].value.should.be.equal 0

  it 'should parse dotted variable', ->
    code = """
###*
dotted variable
@namespace $
###
$.$window = $ window
"""
    doc = dripper.parse(code)[0]
    doc.type.should.be.equal 'variable'
    doc.description.text.should.be.equal 'dotted variable'
    doc.description.meta.namespace.should.be.equal '$'
    doc.name.should.be.equal '$window'

  it 'should parse dotted function', ->
    code = """
###*
dotted function
@namespace $.fn
###
$.fn.findAt = (selector, index = 0) -> @find(selector).eq(index)
"""
    doc = dripper.parse(code)[0]
    doc.type.should.be.equal 'function'
    doc.description.text.should.be.equal 'dotted function'
    doc.description.meta.namespace.should.be.equal '$.fn'
    doc.name.should.be.equal 'findAt'
    doc.params[0].name.should.be.equal 'selector'
    should.not.exist doc.params[0].value
    doc.params[1].name.should.be.equal 'index'
    doc.params[1].value.should.be.equal 0

  it 'should parse objective variable and function', ->
    code = """
$ =
  ###*
  objective variable
  @namespace $
  ###
  halfPi: Math.PI / 2
  fn:
    ###*
    objective function
    @namespace $.fn
    @param {String} selector This is 1st param description.
    @returns {jQuery} This is returns description.
    ###
    findAndSelf: (selector) -> @find(selector).addBack().find selector
"""
    docs = dripper.parse code
#    dump docs
    docs[0].type.should.be.equal 'variable'
    docs[0].description.text.should.be.equal 'objective variable'
    docs[0].description.meta.namespace.should.be.equal '$'
    docs[0].name.should.be.equal 'halfPi'
    docs[1].type.should.be.equal 'function'
    docs[1].description.text.should.be.equal 'objective function'
    docs[1].description.meta.namespace.should.be.equal '$.fn'
    docs[1].name.should.be.equal 'findAndSelf'
    docs[1].params[0].name.should.be.equal 'selector'
    should.not.exist docs[1].params[0].value
