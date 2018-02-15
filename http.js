const net = require('net')
const {EOL} = require('os')
const {Writable, Readable, Duplex, PassThrough} = require('stream')

const config = {
  headersDelimiter: '\r\n\r\n'
}

class HttpRequest extends Readable {
  constructor (opts) {
    super({
      ...opts,
      objectMode: true
    })
  }

  _read (size) {

  }
}

class HttpHeaders {
  constructor () {
    this.sended = false
    this.status = {
      code: '200',
      explanation: 'OK'
    }
    this.protocol = 'HTTP/1.1'
    this.headerPairs = {}
  }

  getStatusLine () {
    return `${this.protocol} ${this.status.code} ${this.status.explanation}\r\n`
  }

  setHeader (name, value) {
    this.headerPairs[name] = value
  }

  setStatus (code) {
    if (this.sended) {
      throw new Error('Headers already sended!')
    } else {
      this.status.code = code.toString()
    }
  }

  getHeaders () {
    const {headerPairs} = this
    return this.getStatusLine() + Object.entries(headerPairs)
      .map(([name, value]) => `${name}: ${value}`)
      .join('\r\n') + '\r\n\r\n'
  }
}

const linkWithErrorEmitter = (statement, connection) => (...args) => {
  try {
    statement(...args)
  } catch (e) {
    connection.emit('error', e)
  }
}

class HttpResponse extends Writable {
  constructor ({connection, ...passedOpts}) {
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

class HttpServer extends net.Server {

  static headersBoundaryEncounter (chunk) {
    return chunk.includes('\r\n\r\n')
  }

  constructor () {
    super()
    const server = this
    const {headersBoundaryEncounter} = this.constructor

    this.headers = Buffer.from('')
    this.RequestStream = new HttpRequest()

    function incomingMessageListener (chunk) {
      if (headersBoundaryEncounter(chunk)) {
        const headersPart = chunk.slice(0, chunk.indexOf(config.headersDelimiter))
        const bodyPart = chunk.slice(chunk.indexOf(config.headersDelimiter) + 4, chunk.length)
        server.RequestStream.headers = server.RequestStream.headers + headersPart
        server.headersWritten = true
        server.RequestStream.push(bodyPart)
        server.ResponseStream = new HttpResponse({connection: this})
        server.emit('request', server.RequestStream, server.ResponseStream)
      } else if (server.headersWritten) {
        server.RequestStream.push(chunk)
      } else {
        server.RequestStream.headers = server.headers + chunk
      }
    }

    this.on('connection', socket => {
      socket.on('data', incomingMessageListener)
      socket.on('error', (e) => console.log(e))
    })
  }

  listen (port) {
    super.listen(port)
  }
}

const createServer = () => new HttpServer()

module.exports = {
  createServer
}