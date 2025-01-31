import { useState, useEffect } from 'react';
import { supabase } from '@/lib/database/client';
import { useToast } from "@/components/ui/use-toast";

interface Task {
  id: string;
  type: string;
  parameters: any;
  url: string;
  duration: number;
  priority: number;
  status: string;
  actions: any[];
  created_at: string;
  updated_at: string;
  start_date?: string;
}

export const useTaskManagement = () => {
  const [savedTasks, setSavedTasks] = useState<Task[]>([]);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
      return;
    }

    setSavedTasks(data);
  };

  const addTask = async (task: any, duration: number, priority: number, startDate?: Date) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...task,
        duration,
        priority,
        start_date: startDate?.toISOString(),
        status: 'Active',
      }])
      .select();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Task added successfully",
    });
    fetchTasks();
  };

  const updateTask = async (id: string, updatedTask: any) => {
    const { error } = await supabase
      .from('tasks')
      .update({
        ...updatedTask,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Task updated successfully",
    });
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Task deleted successfully",
    });
    fetchTasks();
  };

  return {
    savedTasks,
    addTask,
    updateTask,
    deleteTask,
    taskToEdit,
    setTaskToEdit,
    taskToDelete,
    setTaskToDelete,
  };
};
