import { useEffect } from 'react';

/**
 * Custom hook to listen to 'socket-update' events dispatched by the SocketContext.
 * 
 * @param {Function} callback - Function to run when a matching event is received
 * @param {Array<string|RegExp>} types - Array of event types (or prefixes) to listen for
 */
export default function useSocketUpdate(callback, types) {
  useEffect(() => {
    const handleUpdate = (e) => {
      const { type } = e.detail;
      const isMatch = types.some(t => {
        if (t instanceof RegExp) {
          return t.test(type);
        }
        return type === t || type.startsWith(t);
      });

      if (isMatch) {
        callback(e.detail);
      }
    };

    window.addEventListener('socket-update', handleUpdate);
    return () => {
      window.removeEventListener('socket-update', handleUpdate);
    };
  }, [callback, types]);
}
