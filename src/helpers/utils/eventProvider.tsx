import React, { createContext, useContext, ReactNode, FC } from 'react';

interface EventContextProps {
  emitEvent: (eventName: string, data?: any) => void;
  onEvent: (eventName: string, handler: (data?: any) => void) => void;
}

const EventContext = createContext<EventContextProps | undefined>(undefined);

const EventProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const listeners: Record<string, ((data?: any) => void)[]> = {};

  const emitEvent = (eventName: string, data?: any) => {
    if (listeners[eventName]) {
      listeners[eventName].forEach((handler) => handler(data));
    }
  };

  const onEvent = (eventName: string, handler: (data?: any) => void) => {
    if (!listeners[eventName]) {
      listeners[eventName] = [];
    }
    listeners[eventName].push(handler);
  };

  return <EventContext.Provider value={{ emitEvent, onEvent }}>{children}</EventContext.Provider>;
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};
export default EventProvider;
