const linkWithErrorEmitter = (statement, connection) => (...args) => {
  try {
    statement(...args)
  } catch (e) {
    connection.emit('error', e)
  }
}

module.exports = {
  linkWithErrorEmitter
}