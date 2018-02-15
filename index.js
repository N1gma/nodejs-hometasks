const {
  createServer
} = require('./http.js')

const fs = require('fs')

const server = createServer()
server.on('request', (req, res) => {
  console.log('request emitted! ')
  res.setHeader('header1', 'header111')
  res.setHeader('header2', 'header222')
  res.setStatus(301)
  res.writeHead(400)
  res.write('hello223\r\n')
  fs.createReadStream('./token.txt').pipe(res)
  res.end('bye')
})

server.listen(8080)