"use strict"

const hash = require("./hash")
const path = require("path")
const fs = require("fs")
/**
 * return the cacheFile to be used by stylelint, based on whether the provided parameter is
 * a directory or looks like a directory (ends in `path.sep`), in which case the file
 * name will be the `cacheFile/.cache_hashOfCWD`
 *
 * if cacheFile points to a file or looks like a file then in will just use that file
 *
 * @param {string} cacheFile The name of file to be used to store the cache
 * @param {string} cwd Current working directory
 * @returns {string} the resolved path to the cache file
 */
module.exports = function getCacheFile(cacheFile, cwd) {
  /*
   * make sure the path separators are normalized for the environment/os
   * keeping the trailing path separator if present
   */
  cacheFile = path.normalize(cacheFile)

  const resolvedCacheFile = path.resolve(cwd, cacheFile)
  const looksLikeADirectory = cacheFile[cacheFile.length - 1 ] === path.sep

  /**
   * return the name for the cache file in case the provided parameter is a directory
   * @returns {string} the resolved path to the cacheFile
   */
  function getCacheFileForDirectory() {
    return path.join(resolvedCacheFile, `.stylelintcache_${hash(cwd)}`)
  }

  let fileStats

  try {
    fileStats = fs.lstatSync(resolvedCacheFile)
  } catch (ex) {
    fileStats = null
  }

  /*
   * in case the file exists we need to verify if the provided path
   * is a directory or a file. If it is a directory we want to create a file
   * inside that directory
   */
  if (fileStats) {
    /*
     * is a directory or is a file, but the original file the user provided
     * looks like a directory but `path.resolve` removed the `last path.sep`
     * so we need to still treat this like a directory
     */
    if (fileStats.isDirectory() || looksLikeADirectory) {
      return getCacheFileForDirectory()
    }

    // is file so just use that file
    return resolvedCacheFile
  }

  /*
   * here we known the file or directory doesn't exist,
   * so we will try to infer if its a directory if it looks like a directory
   * for the current operating system.
   */

  // if the last character passed is a path separator we assume is a directory
  if (looksLikeADirectory) {
    return getCacheFileForDirectory()
  }

  return resolvedCacheFile
}
