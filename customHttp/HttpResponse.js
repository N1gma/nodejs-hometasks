const {Writable} = require('stream')
const {linkWithErrorEmitter} = require('../utils')
const HttpHeaders = require('./HttpHeaders')

class HttpResponse extends Writable {
  constructor({connection, ...passedOpts}) {
    super({
      ...passedOpts
    })
    this.connection = connection
    this.headers = new HttpHeaders()
    this.setStatus = linkWithErrorEmitter(this._setStatus.bind(this), this.connection)
    this.on('finish', () => this.connection.end())
  }

  _setStatus (code) {
    this.headers.setStatus(code)
  }

  sendHeaders () {
    this.headers.sended = true
    this.connection.write(Buffer.from(this.headers.getHeaders()))
  }

  setHeader (name, value) {
    this.headers.setHeader(name, value)
  }

  writeHead (code) {
    this.headers.setStatus(code)
    this.sendHeaders()
  }

  _write (chunk, encoding, callback = () => {}) {
    if (!this.headers.sended) {
      this.sendHeaders()
    }
    this.connection.write(chunk)
    callback()
  }
}

module.exports = HttpResponse