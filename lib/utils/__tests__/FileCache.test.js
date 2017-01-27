"use strict"

const sinon = require("sinon")
const mock = require("mock-require")
const fileEntryCache = require("file-entry-cache")
let FileCache = require("../FileCache")

const hashOfConfig = "hashOfConfig"
it("cache file is created when empty cacheLocation", () => {
  // create mock
  const fileEntryCacheInstance = {}
  const mockedFileEntryCache = sinon.mock(fileEntryCache)
  mockedFileEntryCache.expects("create").once().returns(fileEntryCacheInstance)
  mock("file-entry-cache", mockedFileEntryCache)
  FileCache = mock.reRequire("../FileCache")

  const fileCache = new FileCache(undefined, hashOfConfig)
  // assertions
  expect(fileCache._fileCache).toBe(fileEntryCacheInstance)
  expect(fileCache._hashOfConfig).toBe(hashOfConfig)
  mockedFileEntryCache.verify()
  // restore mocked objects
  mockedFileEntryCache.restore()
  mock.stopAll()
})
it("reconcile() stores hash to descriptor", () => {
  // create stubs and mocks
  const validFile = "./valid-file.css"
  const fileDescriptor = {
    meta: {
      "size":5030,
      "mtime":1468447715000,
    },
  }
  const expectedMeta = Object.assign({}, fileDescriptor.meta, {
    hashOfConfig,
  })
  const keysStub = sinon.stub()
  keysStub.returns([validFile])
  const getFileDescriptorStub = sinon.stub()
  getFileDescriptorStub.withArgs(validFile).returns(fileDescriptor)
  const reconcileStub = sinon.stub()
  const fileCache = {
    _fileCache: {
      cache: {
        keys: keysStub,
      },
      getFileDescriptor: getFileDescriptorStub,
      reconcile: reconcileStub,
    },
    _hashOfConfig: hashOfConfig,
  }

  FileCache.prototype.reconcile.call(fileCache)
  // assertions
  expect(keysStub.called).toBe(true)
  expect(getFileDescriptorStub.called).toBe(true)
  expect(reconcileStub.called).toBe(true)
  expect(fileDescriptor.meta).toEqual(expectedMeta)
})
it("hasFileChanged validates changed file", () => {
  const validFile = "./valid-file.css"
  const validFileDescriptor = {
    meta: {
      "size":5030,
      "mtime":1468447715000,
      hashOfConfig,
    },
    changed: false,
  }
  const invalidFile1 = "./invalid-file.css"
  const invalidFileDescriptor1 = {
    meta: {
      "size":5030,
      "mtime":1468447715000,
    },
    changed: false,
  }
  const invalidFile2 = "./invalid-file.css"
  const invalidFileDescriptor2 = {
    meta: {
      "size":5030,
      "mtime":1468447715000,
    },
    changed: true,
  }
  const getFileDescriptorStub = sinon.stub()
  getFileDescriptorStub.withArgs(validFile).returns(validFileDescriptor)
  getFileDescriptorStub.withArgs(invalidFile1).returns(invalidFileDescriptor1)
  getFileDescriptorStub.withArgs(invalidFile2).returns(invalidFileDescriptor2)
  const fileCache = {
    _fileCache: {
      getFileDescriptor: getFileDescriptorStub,
    },
    _hashOfConfig: hashOfConfig,
  }
  const hasFileChanged = FileCache.prototype.hasFileChanged

  expect(hasFileChanged.call(fileCache, validFile)).toBe(false)
  expect(hasFileChanged.call(fileCache, invalidFile1)).toBe(true)
  expect(hasFileChanged.call(fileCache, invalidFile2)).toBe(true)
})
it("file-cache-entry methods are called", () => {
  const removeEntryStub = sinon.stub()
  const destroyStub = sinon.stub()
  const fileCache = {
    _fileCache: {
      removeEntry: removeEntryStub,
      destroy: destroyStub,
    },
    _hashOfConfig: hashOfConfig,
  }

  FileCache.prototype.destroy.call(fileCache)
  FileCache.prototype.removeEntry.call(fileCache)

  expect(removeEntryStub.called).toBe(true)
  expect(destroyStub.called).toBe(true)
})
