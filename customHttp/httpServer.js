const net = require('net')
const HttpResponse = require('./HttpResponse')
const HttpRequest = require('./HttpRequest')

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
      server.RequestStream.headersWritten = false
      if (headersBoundaryEncounter(chunk) && !server.RequestStream.headersWritten) {
        const headersPart = chunk.slice(0, chunk.indexOf('\r\n\r\n'))
        const bodyPart = chunk.slice(chunk.indexOf('\r\n\r\n') + 4, chunk.length)
        server.RequestStream.concatHeaders(headersPart)
        server.RequestStream.extractHeadersInfo()
        server.RequestStream.push(bodyPart)
        server.ResponseStream = new HttpResponse({connection: this})
        server.emit('request', server.RequestStream, server.ResponseStream)
      } else if (server.RequestStream.headersWritten) {
        server.RequestStream.push(chunk)
      } else {
        server.RequestStream.concatHeaders(chunk)
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