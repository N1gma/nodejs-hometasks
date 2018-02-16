const {Readable} = require('stream')

class HttpRequest extends Readable {
  constructor (opts) {
    super({
      ...opts,
      objectMode: true
    })
    this.headers = ''
    this.headersWritten = false
  }

  concatHeaders(headers) {
    this.headers += headers
  }

  extractHeadersInfo() {
    this.headersWritten = true
    const parsedHeaders = this.headers.split('\r\n')
    const [method, url] = parsedHeaders[0].split(' ')
    this.method = method
    this.url = url
    this.headersWritten = true
  }

  _read (size) {

  }
}

module.exports = HttpRequest
