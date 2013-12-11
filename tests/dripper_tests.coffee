chai = require 'chai'
dripper = require '../lib/dripper'
{ spawn } = require 'child_process'

should = chai.should()


sampleCode =
"""
###
test
###

# single-line comment 1
abc # single-line comment 2
### herecomment 1 ###
abc ### herecomment 2 ###

###*
class
###
class Foo

  ###*
  class property
  ###
  @a: 3

  ###*
  class method
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
  member method
  ###
  add: (value) ->
    @value += value

###*
method
###
$.fn.bar = (selector) -> $.find selector
"""

describe 'dripper', ->

  it 'should filter comment', ->
    dripper.filter(sampleCode)[0].should.be.equal 'test'

