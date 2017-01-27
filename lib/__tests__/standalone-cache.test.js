"use strict"

const path = require("path")
const sinon = require("sinon")
const standalone = require("../standalone")
const FileCache = require("../utils/FileCache")
const fixturesPath = path.join(__dirname, "fixtures")

describe("standalone cache is enabled", () => {
  let mockedFileCache
  const invalidFile1 = `${fixturesPath}/empty-block.css`
  const invalidFile2 = `${fixturesPath}/invalid-hex.css`
  const validFile = `${fixturesPath}/cache/valid.css`
  const validChangedFile = `${fixturesPath}/cache/validChanged.css`
  beforeEach(() => {
    mockedFileCache = sinon.mock(FileCache.prototype)
    // prevent persisting cache
    mockedFileCache.expects("reconcile").once()
  })
  it("only changed files are linted", () => {
    const csses = [ validFile, validChangedFile ]
    mockedFileCache.expects("removeEntry").withArgs(validFile).never()
    mockedFileCache.expects("removeEntry").withArgs(validChangedFile).never()
    mockedFileCache.expects("hasFileChanged").withArgs(validFile).returns(false)
    mockedFileCache.expects("hasFileChanged").withArgs(validChangedFile).returns(true)
    return standalone({
      files: csses,
      config: {
        rules: { "block-no-empty": true, "color-no-invalid-hex": true },
      },
      cache: true,
    }).then(() => {
      mockedFileCache.verify()
    })
  })
  it("failed files are not stored in cache", () => {
    const csses = [ invalidFile1, invalidFile2 ]
    mockedFileCache.expects("removeEntry").withArgs(invalidFile1).once()
    mockedFileCache.expects("removeEntry").withArgs(invalidFile2).once()
    mockedFileCache.expects("hasFileChanged").withArgs(invalidFile1).returns(true)
    mockedFileCache.expects("hasFileChanged").withArgs(invalidFile2).returns(true)
    return standalone({
      files: csses,
      config: {
        rules: { "block-no-empty": true, "color-no-invalid-hex": true },
      },
      cache: true,
    }).then(() => {
      mockedFileCache.verify()
    })
  })
  afterEach(() => {
    mockedFileCache.restore()
  })
})
describe("standalone cache is disabled", () => {
  let destroyStub
  beforeEach(() => {
    destroyStub = sinon.stub(FileCache.prototype, "destroy")
  })
  it("cache file is removed", () => {
    return standalone({
      files: `${fixturesPath}/empty-block.css`,
      // Path to config file
      configFile: path.join(__dirname, "fixtures/config-block-no-empty.json"),
    }).then(() => {
      expect(destroyStub.called).toBe(true)
    })
  })
  afterEach(() => {
    FileCache.prototype.destroy.restore()
  })
})
