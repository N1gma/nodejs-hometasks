const {Readable, Writable} = require('stream')

class FileStream extends Readable {
  _read(size) {
    console.log('read: ' + size)
  }
}

class MultipartParser extends Writable {
  constructor({headers}){
    super()
    this.headers = headers
    this.fileStream = new FileStream()
  }

  getAttribute(attribute, block) {
    const attr = new RegExp(`${attribute}="(.+?)"`).exec(block)
    return attr && attr[1]
  }

  getHeading(name, block) {
    const attr = new RegExp(`${name}: (.+?)(?:[;\\s]|$)`).exec(block)
    return attr && attr[1]
  }

  getBody(body) {
    if(body.includes(this.boundary.replace(/(\r\n|\n|\r)/gm,''))) {
      this.emit('finish')
      return body.substring(0, body.indexOf(this.boundary.replace(/(\r\n|\n|\r)/gm,'')))
    } else {
      return body
    }
  }

  _write(chunk) {
    if (!this.boundary) {
      this.boundary = chunk.toString().split('\n')[0]
    }
    const incomingData = chunk.toString().split(this.boundary).filter(data => data.trim())
    incomingData.forEach(stringData => {
      const [head, body] = stringData.split(/\r\n\r\n/)
      this.emit('field',
        this.getAttribute('name', head),
        this.getBody(body)
      )
      if(this.getAttribute('filename', head)) {
        this.fileStream.push(body)
        this.emit('file',
          this.getAttribute('name', head),
          this.fileStream,
          this.getAttribute('filename', head),
          this.getHeading('Content-Type', head)
        )
      }
    })
   }
}

module.exports = MultipartParser
