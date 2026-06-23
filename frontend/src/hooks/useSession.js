import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

function getOrCreateSession() {
  let id = localStorage.getItem('paka.sessionId');
  if (!id) { id = uuidv4(); localStorage.setItem('paka.sessionId', id); }
  return id;
}

export function useSession() {
  const [sessionId] = useState(getOrCreateSession);
  return sessionId;
}
