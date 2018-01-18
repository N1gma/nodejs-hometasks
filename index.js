(function () {
  const operators = {
    '+': (x, y) => x + y,
    '-': (x, y) => x - y,
    '*': (x, y) => x * y,
    '/': (x, y) => x / y
  }

  const socket = new WebSocket('ws://rpn.javascript.ninja:8080')
  
  socket.onmessage = function (event) {
    let stack = []
    let expr = event.data
    expr.split(' ').forEach((token) => {
      if (token in operators) {
        let [y, x] = [stack.pop(), stack.pop()]
        stack.push(operators[token](x, y))
      } else {
        stack.push(parseFloat(token))
      }
    })
    socket.send(stack.pop())
  }
})()