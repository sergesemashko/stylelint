"use strict"

const messages = require("..").messages
const ruleName = require("..").ruleName
const rules = require("../../../rules")
const testRule = require("../../../testUtils/testRule")

const rule = rules[ruleName]

testRule(rule, {
  ruleName,
  config: [true],

  accept: [ {
    code: "a { color: pink !important; }",
  }, {
    code: "@keyframes important { from { margin: 1px; } }",
  }, {
    code: "@-webkit-keyframes important { from { margin: 1px; } }",
  }, {
    code: "@-WEBKIT-KEYFRAMES important { from { margin: 1px; } }",
  }, {
    code: "@non-keyframes important { from { margin: 1px !important; } }",
  }, {
    code: "@keyframes-non important { from { margin: 1px !important; } }",
  } ],

  reject: [ {
    code: "@keyframes important { from { margin: 1px !important; } }",
    description: "with !important",
    message: messages.rejected,
    line: 1,
    column: 44,
  }, {
    code: "@-webkit-keyframes important { from { margin: 1px !important; } }",
    description: "with !important",
    message: messages.rejected,
    line: 1,
    column: 52,
  }, {
    code: "@-WEBKIT-KEYFRAMES important { from { margin: 1px !important; } }",
    description: "with !important",
    message: messages.rejected,
    line: 1,
    column: 52,
  }, {
    code: "@keyframes important { from { margin: 1px!important; } }",
    description: "with !important",
    message: messages.rejected,
    line: 1,
    column: 43,
  }, {
    code: "@keyframes important { from { margin: 1px ! important; } }",
    description: "with !important",
    message: messages.rejected,
    line: 1,
    column: 45,
  }, {
    code: "@kEyFrAmEs important { from { margin: 1px !important; } }",
    description: "with !important",
    message: messages.rejected,
    line: 1,
    column: 44,
  }, {
    code: "@KEYFRAMES important { from { margin: 1px !important; } }",
    description: "with !important",
    message: messages.rejected,
    line: 1,
    column: 44,
  } ],
})