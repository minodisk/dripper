chai = require 'chai'
dripper = require '../lib/dripper'
{ spawn } = require 'child_process'

should = chai.should()


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
""",
  'extended object': """
$ =
  fn:
    ###*
    objective parameter
    ###
    a: 100

    ###*
    objective function
    ###
    findAndSelf: (selector) -> @find(selector).addBack().find selector
"""

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
    doc.description.should.be.equal 'plane variable'
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
    doc.description.should.be.equal 'plane function'
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
###
$.$window = $ window
"""
    doc = dripper.parse(code)[0]
    console.log doc
    doc.type.should.be.equal 'variable'
    doc.description.should.be.equal 'dotted variable'
    doc.name.should.be.equal '$.$window'

  it 'should parse dotted function', ->
    code = """
###*
dotted function
###
$.fn.findAt = (selector, index = 0) -> @find(selector).eq(index)
"""
    doc = dripper.parse(code)[0]
    console.log doc
    doc.type.should.be.equal 'function'
    doc.description.should.be.equal 'dotted function'
    doc.name.should.be.equal '$.fn.findAt'
    doc.params[0].name.should.be.equal 'selector'
    should.not.exist doc.params[0].value
    doc.params[1].name.should.be.equal 'index'
    doc.params[1].value.should.be.equal 0

