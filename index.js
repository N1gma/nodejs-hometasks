const fs = require('fs')
const {
  createServer
} = require('./customHttp/httpServer')
const Parser = require('./customHttp/multipartParser')

const server = createServer()

server.on('request', (req, res) => {
  console.log('request emitted! ')
  // res.setHeader('header1', 'header111')
  // res.setHeader('header2', 'header222')
  // res.setStatus(301)
  // res.writeHead(400)
  // res.write('hello223\r\n')
  // fs.createReadStream('./token.txt').pipe(res)
  if (req.method === 'POST') {
    const parser = new Parser({ headers: req.headers });
    parser.on('file', (fieldname, file, filename, contentType) => {
      console.log('emitted')
      // file должен быть Readable stream
      file.on('data', ({ length }) => console.log(`Got ${length} bytes`));
      file.on('end', () => console.log('File finished'));
    });
    parser.on('field', (fieldname, value) => console.log(`${fieldname} ==> ${value}`));
    parser.on('finish', function() {
      console.log('Done parsing form!');
      res.writeHead(200);
      res.end(JSON.stringify('{ success: true }'));
    });
    req.pipe(parser)
  } else if (req.method === 'GET') {
    res.writeHead(200, { Connection: 'close' });
    res.end('OK');
  }
})

server.listen(8080)