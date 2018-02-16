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

module.exports = HttpHeaders
