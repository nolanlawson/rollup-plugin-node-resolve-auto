'use strict'

var path = require('path')
var builtins = require('builtin-modules')
var _nodeResolve = require('resolve')
var browserResolve = require('browser-resolve')

var COMMONJS_BROWSER_EMPTY = _nodeResolve.sync('browser-resolve/empty.js', __dirname)
var ES6_BROWSER_EMPTY = path.resolve(__dirname, '../src/empty.js')
var CONSOLE_WARN = function () {
  var args = []
  var len = arguments.length
  while (len--) args[len] = arguments[len]

  return console.warn.apply(console, args)
} // eslint-disable-line no-console

var messaged = {}

function nodeResolve (options) {
  options = options || {}

  var preferBuiltins = true

  var onwarn = options.onwarn || CONSOLE_WARN
  var resolveId = options.browser ? browserResolve : _nodeResolve

  return {
    name: 'node-resolve-auto',

    resolveId: function resolveId$1 (importee, importer) {
      if (/\0/.test(importee)) return null // ignore IDs with null character, these belong to other plugins

      // disregard entry module
      if (!importer) return null

      var parts = importee.split(/[\/\\]/)
      var id = parts.shift()

      if (id[0] === '@' && parts.length) {
        // scoped packages
        id += '/' + (parts.shift())
      } else if (id[0] === '.') {
        // an import relative to the parent dir of the importer
        id = path.resolve(importer, '..', importee)
      }

      return new Promise(function (resolve, reject) {
        resolveId(
          importee,
          {
            basedir: path.dirname(importer),
            packageFilter: function packageFilter (pkg) {
              if (!pkg['jsnext:main'] && !pkg['module']) {
                resolve(false)
              } else {
                if (!messaged['_' + pkg.name]) {
                  messaged['_' + pkg.name] = true
                  onwarn("Treating '" + pkg.name + "' as ES6 (internal) dependency")
                }
                pkg['main'] = pkg['jsnext:main'] || pkg['module']
              }
              return pkg
            },
            extensions: options.extensions
          },
          function (err, resolved) {
            if (err) {
              reject(Error(("Could not resolve '" + importee + "' from " + (path.normalize(importer)))))
            } else {
              if (resolved === COMMONJS_BROWSER_EMPTY) {
                resolve(ES6_BROWSER_EMPTY)
              } else if (~builtins.indexOf(resolved)) {
                resolve(null)
              } else if (~builtins.indexOf(importee) && preferBuiltins) {
                onwarn(
                  "Preferring built-in module '" + importee + "' over local alternative " +
                  "at '" + resolved + "'"
                )
                resolve(null)
              } else {
                resolve(resolved)
              }
            }
          }
        )
      })
    }
  }
}

module.exports = nodeResolve
