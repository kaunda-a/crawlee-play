import { useState } from 'react';
import { Action } from '@/types/Action';

export const useActionManagement = () => {
  const [actions, setActions] = useState<Action[]>([]);

  const addAction = (action: Action) => {
    setActions(prev => [...prev, action]);
  };

  const resetActions = () => {
    setActions([]);
  };

  return {
    actions,
    addAction,
    resetActions,
  };
};
