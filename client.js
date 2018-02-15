var net = require('net');

var client = new net.Socket();

const writeTimeout = (stream, str, time = 500) => {
  setTimeout(stream.write(str), time)
}

client.connect(8080, '127.0.0.1', function() {
  console.log('Connected');
  client.write(Buffer.from('GET'))
  client.write(Buffer.from(' / '))
  client.write(Buffer.from('HTTP'))
  client.write(Buffer.from('/1.1\r\n'))
  client.write(Buffer.from('Host: alizar.habrahabr.ru\r\n\r\n'))
  client.write(Buffer.from('some-random-body'))
  client.write(Buffer.from('some-random-body2'))
});

client.on('data', function(data) {
  console.log('Received: ' + data.toString());
});

client.on('close', function() {
  console.log('Connection closed');
});
