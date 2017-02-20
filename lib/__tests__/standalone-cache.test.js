"use strict"

const path = require("path")
const standalone = require("../standalone")
const hash = require("../utils/hash")
const fixturesPath = path.join(__dirname, "fixtures")
const fsExtra = require("fs-extra")
const fs = require("fs")

const cwd = process.cwd()
const invalidFile = `${fixturesPath}/empty-block.css`
const validFile = `${fixturesPath}/cache/valid.css`
const changedFile = `${fixturesPath}/cache/validChanged.css`

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile()
  } catch (err) {
    return false
  }
}

// Config object is getting mutated internally.
// Return new object of the same structure to
// make sure config doesn't change between runs.
function getConfig() {
  return {
    files: `${fixturesPath}/cache/*.css`,
    config: {
      rules: { "block-no-empty": true, "color-no-invalid-hex": true },
    },
    cache: true,
  }
}

describe("standalone cache", () => {
  const expectedCacheFilePath = `${cwd}/.stylelintcache`

  beforeEach(() => {
    // Initial run to warm up the cache
    return standalone(getConfig())
  })

  afterEach(() => {
    // Clean up after each test case
    fsExtra.removeSync(expectedCacheFilePath)
    fsExtra.removeSync(changedFile)
  })

  it("cache file is created at $CWD/.stylelintcache", () => {
    // Ensure cache file exists
    expect(fileExists(expectedCacheFilePath)).toBe(true)
    const cacheFile = fsExtra.readJsonSync(expectedCacheFilePath)
    // Ensure cache file contains only linted css file
    expect(typeof cacheFile[validFile] === "object").toBe(true)
    expect(typeof cacheFile[changedFile] === "undefined").toBe(true)
  })

  it("only changed files are linted", () => {
    // Add "changed" file
    fsExtra.copySync(validFile, changedFile)
    // Next run should lint only changed files
    return standalone(getConfig()).then(output => {
      // Ensure only changed files are linted
      const isValidFileLinted = !!output.results.find(file => file.source === validFile)
      const isChangedFileLinted = !!output.results.find(file => file.source === changedFile)
      expect(isValidFileLinted).toBe(false)
      expect(isChangedFileLinted).toBe(true)
      // Ensure cache file contains linted css files
      const cachedFiles = fsExtra.readJsonSync(expectedCacheFilePath)
      expect(typeof cachedFiles[validFile] === "object").toBe(true)
      expect(typeof cachedFiles[changedFile] === "object").toBe(true)
    })
  })

  it("all files are linted on config change", () => {
    fsExtra.copySync(validFile, changedFile)
    const changedConfig = getConfig()
    changedConfig.config.rules["block-no-empty"] = false
    // All file should be re-linted as config has changed
    return standalone(changedConfig).then(output => {
      // Ensure all files are re-linted
      const isValidFileLinted = !!output.results.find(file => file.source === validFile)
      const isChangedFileLinted = !!output.results.find(file => file.source === changedFile)
      expect(isValidFileLinted).toBe(true)
      expect(isChangedFileLinted).toBe(true)
    })
  })

  it("invalid files are not cached", () => {
    fsExtra.copySync(invalidFile, changedFile)
    // Should lint only changed files
    return standalone(getConfig()).then((output) => {
      expect(output.errored).toBe(true)
      // Ensure only changed files are linted
      const isValidFileLinted = !!output.results.find(file => file.source === validFile)
      const isInvalidFileLinted = !!output.results.find(file => file.source === changedFile)
      expect(isValidFileLinted).toBe(false)
      expect(isInvalidFileLinted).toBe(true)
      // Ensure cache file doesn't contain invalid file
      const cachedFiles = fsExtra.readJsonSync(expectedCacheFilePath)
      expect(typeof cachedFiles[validFile] === "object").toBe(true)
      expect(typeof cachedFiles[changedFile] === "undefined").toBe(true)
    })
  })
  it("cache file is removed when cache is disabled", () => {
    const noCacheConfig = getConfig()

    noCacheConfig.cache = false
    return standalone(noCacheConfig).then(() => {
      expect(fileExists(expectedCacheFilePath)).toBe(false)
    })
  })
})
describe("standalone cache uses cacheLocation", () => {
  const cacheLocationFile = `${fixturesPath}/cache/.cachefile`
  const cacheLocationDir = `${fixturesPath}/cache/`
  const expectedCacheFilePath = `${cacheLocationDir}/.stylelintcache_${hash(cwd)}`
  afterEach(() => {
    // clean up after each test
    fsExtra.removeSync(cacheLocationFile)
    fsExtra.removeSync(expectedCacheFilePath)
  })
  it("cacheLocation is a file", () => {
    const config = getConfig()
    config.cacheLocation = cacheLocationFile
    return standalone(config).then(() => {
      // Ensure cache file is created
      expect(fileExists(cacheLocationFile)).toBe(true)
      // Ensure cache file contains cached entity
      const cacheFile = fsExtra.readJsonSync(cacheLocationFile)
      expect(typeof cacheFile[validFile] === "object").toBe(true)
    })
  })
  it("cacheLocation is a directory", () => {
    const config = getConfig()
    config.cacheLocation = cacheLocationDir
    return standalone(config).then(() => {
      // Ensure cache file is created
      expect(fileExists(expectedCacheFilePath)).toBe(true)
      // Ensure cache file contains cached entity
      const cacheFile = fsExtra.readJsonSync(expectedCacheFilePath)
      expect(typeof cacheFile[validFile] === "object").toBe(true)
    })
  })
})
