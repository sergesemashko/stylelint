/* @flow */
"use strict"

const fileEntryCache = require("file-entry-cache")
const path = require("path")
const debug = require("debug")("stylelint:file-cache")
const getCacheFile = require("./getCacheFile")
const DEFAULT_CACHE_LOCATION = "./.stylelintcache"

function FileCache(cacheLocation, hashOfConfig) {
  const cacheFile = path.resolve(getCacheFile(cacheLocation || DEFAULT_CACHE_LOCATION, process.cwd()))
  debug(`cacheFile path: ${cacheFile}`)
  this._fileCache = fileEntryCache.create(cacheFile)
  this._hashOfConfig = hashOfConfig
}

FileCache.prototype.hasFileChanged = function (absoluteFilepath) {
  // get the descriptor for this file
  // with the metadata and the flag that determines if
  // the file has changed
  const descriptor = this._fileCache.getFileDescriptor(absoluteFilepath)
  const meta = descriptor.meta || {}
  const changed = descriptor.changed || meta.hashOfConfig !== this._hashOfConfig
  if (!changed) {
    // since the file passed we store the result here
    // successful runs as it will always should be 0 error 0 warnings
    debug(`File hasn't changed: ${absoluteFilepath}`)
  }
  return descriptor.changed
}

FileCache.prototype.reconcile = function () {
  this._fileCache.cache.keys().map(absoluteFilepath => {
    const descriptor = this._fileCache.getFileDescriptor(absoluteFilepath)
    descriptor.meta.hashOfConfig = this._hashOfConfig
  })
  this._fileCache.reconcile()
}

FileCache.prototype.destroy = function () {
  this._fileCache.destroy()
}

FileCache.prototype.removeEntry = function (absoluteFilepath) {
  this._fileCache.removeEntry(absoluteFilepath)
}

module.exports = FileCache
