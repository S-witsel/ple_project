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

export function subscribeProjectEvents(socket, handlers = {}) {
  if (!socket) return () => {};
  socket.on('project:update', handlers.onProjectUpdate);
  socket.on('project:joined', handlers.onJoined);
  socket.on('disconnect', handlers.onDisconnect);
  return () => {
    socket.off('project:update');
    socket.off('project:joined');
    socket.off('disconnect');
  };
}

export function joinProject(socket, projectId) {
  if (!socket || !projectId) return;
  socket.emit('joinProject', { projectId });
}

export function leaveProject(socket, projectId) {
  if (!socket || !projectId) return;
  socket.emit('leaveProject', { projectId });
}

export function emitBattleAction(socket, action) {
  if (!socket) return;
  socket.emit('battle:action', action);
}
