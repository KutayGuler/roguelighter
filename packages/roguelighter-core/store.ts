import { writable, derived, type Writable, Readable } from 'svelte/store';
import { generate_id } from './utils';
const NOTIFICATION_TIMEOUT = 3000;

// BACKLOG: migrate stores
// BACKLOG: use svelte-french-toast library

export type NotificationType = 'danger' | 'info' | 'success' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  shake: boolean;
}

function createNotificationStore() {
  const _notifications: Writable<Array<Notification>> = writable([]);

  const send = (message: string, type: NotificationType) => {
    _notifications.update((state) => {
      if (state.length && message === state[state.length - 1].message) {
        if (state[state.length - 1].shake) {
          state[state.length - 1].shake = false;
        } else {
          state[state.length - 1].shake = true;
        }
        return state;
      } else {
        return [...state, { id: '_' + generate_id(), type, message, shake: false }];
      }
    });
  };

  const notifications = derived(_notifications, ($_notifications, set) => {
    set($_notifications);
    if ($_notifications.length > 0) {
      const timeout = setTimeout(() => {
        _notifications.update((state) => {
          state.shift();
          return state;
        });
      }, NOTIFICATION_TIMEOUT);
      return () => {
        clearTimeout(timeout);
      };
    }
  });
  const { subscribe } = notifications as Readable<Array<Notification>>;

  return {
    subscribe,
    send,
    danger: (msg: string) => send(msg, 'danger'),
    warning: (msg: string) => send(msg, 'warning'),
    info: (msg: string) => send(msg, 'info'),
    success: (msg: string) => send(msg, 'success')
  };
}

export const notifications = createNotificationStore();
export const errors = writable('');
export const parse_errors = writable({
  json: '',
  error: ''
});
