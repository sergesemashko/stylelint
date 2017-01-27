"use strict"

const getCacheFile = require("../getCacheFile")
const hash = require("../hash")
const path = require("path")

it("returns file path for given file", () => {
  const cacheFilename = ".cache_tmp"
  const cwd = "/tmp"
  expect(getCacheFile(cacheFilename, cwd)).toBe(path.resolve(cwd, cacheFilename))
})
it("returns file path for given directory", () => {
  const cacheDir = "stylelintcache/"
  const cwd = "/tmp"
  const expectedCacheLocation = path.resolve(cwd, cacheDir, `.stylelintcache_${hash(cwd)}`)
  expect(getCacheFile(cacheDir, cwd)).toBe(expectedCacheLocation)
})
