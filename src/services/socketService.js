export async function createSocketClient(serverUrl) {
  try {
    const { io } = await import('socket.io-client');
    return io(serverUrl, {
      transports: ['websocket'],
    });
  } catch (error) {
    console.warn('Socket.IO client is not installed or could not be initialized', error);
    return null;
  }
}

export function subscribeBattleEvents(socket, handlers = {}) {
  if (!socket) return () => {};
  socket.on('battle:update', handlers.onBattleUpdate);
  socket.on('battle:joined', handlers.onJoined);
  socket.on('disconnect', handlers.onDisconnect);
  return () => {
    socket.off('battle:update');
    socket.off('battle:joined');
    socket.off('disconnect');
  };
}

export function emitBattleAction(socket, action) {
  if (!socket) return;
  socket.emit('battle:action', action);
}
