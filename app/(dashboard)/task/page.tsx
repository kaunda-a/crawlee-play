"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { z } from 'zod';
import { Action } from '@/types/Action';
import { useActionManagement } from '@/hooks/useActionManagement';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const taskSchema = z.object({
  taskType: z.string().min(1, "Task type is required"),
  taskUrl: z.string().url("Invalid URL"),
  googleSearchQuery: z.string().optional(),
  googleSearchTarget: z.string().optional(),
});

const TaskPage: React.FC = () => {
  const {
    savedTasks,
    addTask,
    updateTask,
    deleteTask,
    taskToEdit,
    setTaskToEdit,
    taskToDelete,
    setTaskToDelete
  } = useTaskManagement();
  const { actions, addAction, resetActions } = useActionManagement();

  const [activeTab, setActiveTab] = useState('create');
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(600);
  const [savedTasksContainerHeight, setSavedTasksContainerHeight] = useState(600);
  
  const [taskType, setTaskType] = useState('');
  const [taskUrl, setTaskUrl] = useState('');
  const [googleSearchQuery, setGoogleSearchQuery] = useState('');
  const [googleSearchTarget, setGoogleSearchTarget] = useState('');
  const [taskParameters, setTaskParameters] = useState('');
  const [currentAction, setCurrentAction] = useState<Action>({ type: 'click', selector: '' });
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);
  const [priority, setPriority] = useState(1);
  const [duration, setDuration] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const height = Math.max(entry.contentRect.height - 200, 400);
          if (entry.target.classList.contains('create-task-container')) {
            setContainerHeight(height);
          } else if (entry.target.classList.contains('saved-tasks-container')) {
            setSavedTasksContainerHeight(height);
          }
        }
      });
  
      const createTaskContainer = document.querySelector('.create-task-container');
      const savedTasksContainer = document.querySelector('.saved-tasks-container');
  
      if (createTaskContainer) {
        resizeObserver.observe(createTaskContainer);
      }
      if (savedTasksContainer) {
        resizeObserver.observe(savedTasksContainer);
      }
  
      return () => {
        if (createTaskContainer) {
          resizeObserver.unobserve(createTaskContainer);
        }
        if (savedTasksContainer) {
          resizeObserver.unobserve(savedTasksContainer);
        }
      };
    }
  }, []);
  

  
  const handleActionChange = (key: string, value: string | number) => {
    setCurrentAction(prev => {
      switch (prev.type) {
        case 'click':
        case 'type':
        case 'hover':
          return { ...prev, [key]: value } as Action;
        case 'wait':
          return { ...prev, duration: Number(value) } as Action;
        case 'scroll':
          return { ...prev, value: value.toString() } as Action;
        case 'moveMouse':
          return { ...prev, [key]: Number(value) } as Action;
        case 'dragAndDrop':
          return { ...prev, [key]: value } as Action;
        default:
          return prev;
      }
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const taskData = {
      taskType,
      taskUrl,
      googleSearchQuery,
      googleSearchTarget,
    };

    const result = taskSchema.safeParse(taskData);
    if (!result.success) {
      setErrors(result.error.issues);
      return;
    }

    setErrors([]);

    let parsedTaskParams = {};
    try {
      parsedTaskParams = JSON.parse(taskParameters);
    } catch (error) {
      console.error('Invalid JSON in taskParameters:', error);
    }

    const taskParams = {
      ...parsedTaskParams,
      ...(taskType === 'GoogleSearch' && { searchQuery: googleSearchQuery, googleSearchTarget })
    };

    const task = {
      type: taskType,
      parameters: taskParams,
      url: taskUrl,
      googleSearchQuery,
      googleSearchTarget,
      actions,
    };

    addTask(task, duration, priority, dateRange?.from || undefined);
    resetForm();
  };

  const resetForm = () => {
    setTaskType('');
    setTaskUrl('');
    setGoogleSearchQuery('');
    setGoogleSearchTarget('');
    setTaskParameters('');
    setPriority(1);
    setDuration(0);
    setDateRange(undefined);
    resetActions();
    setErrors([]);
  };

  const confirmDeleteTask = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  const confirmEditTask = async () => {
    if (taskToEdit) {
      await updateTask(taskToEdit.id, taskToEdit);
      setTaskToEdit(null);
    }
  };
  
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Task" />
    <div className="container mx-auto p-6" ref={containerRef}>
      <h1 className="text-3xl font-bold mb-6">Task Management</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Task</TabsTrigger>
          <TabsTrigger value="saved">Saved Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="create">
          <Card>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit}>
                <Select value={taskType} onValueChange={setTaskType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Task Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WebScraping">Web Scraping</SelectItem>
                    <SelectItem value="SocialMediaInteraction">Social Media Interaction</SelectItem>
                    <SelectItem value="DataEntry">Data Entry</SelectItem>
                    <SelectItem value="GoogleSearch">Google Search</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Enter URL for the bot to visit"
                  value={taskUrl}
                  onChange={(e) => setTaskUrl(e.target.value)}
                />

                {taskType === 'GoogleSearch' && (
                  <>
                    <Input
                      placeholder="Enter Google search query"
                      value={googleSearchQuery}
                      onChange={(e) => setGoogleSearchQuery(e.target.value)}
                    />
                    <Input
                      placeholder="Enter target website"
                      value={googleSearchTarget}
                      onChange={(e) => setGoogleSearchTarget(e.target.value)}
                    />
                  </>
                )}
                <Input
                  type="number"
                  placeholder="Task Priority"
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  min={1}
                  max={10}
                />

                <Input
                  type="number"
                  placeholder="Task Duration (minutes)"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min={0}
                />

                <DatePickerWithRange
                  className="w-full"
                  date={dateRange}
                  setDate={(newDateRange: React.SetStateAction<DateRange | undefined>) => setDateRange(newDateRange)}
                />

                <h3 className="text-lg font-semibold mb-2">Add Actions</h3>
                <Select
                  value={currentAction.type}
                  onValueChange={(value: Action['type']) => {
                    switch (value) {
                      case 'click':
                      case 'hover':
                        setCurrentAction({ type: value, selector: '' });
                        break;
                      case 'type':
                        setCurrentAction({ type: value, selector: '', value: '', text: '' });
                        break;
                      case 'wait':
                        setCurrentAction({ type: value, time: new Date().toISOString() });
                        break;
                      case 'scroll':
                        setCurrentAction({ type: value });
                        break;
                      case 'moveMouse':
                        setCurrentAction({ type: value, x: 0, y: 0 });
                        break;
                      case 'dragAndDrop':
                        setCurrentAction({ type: value, sourceSelector: '', targetSelector: '' });
                        break;
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Action Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="click">Click</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                    <SelectItem value="wait">Wait</SelectItem>
                    <SelectItem value="scroll">Scroll</SelectItem>
                    <SelectItem value="moveMouse">Move Mouse</SelectItem>
                    <SelectItem value="dragAndDrop">Drag and Drop</SelectItem>
                    <SelectItem value="hover">Hover</SelectItem>
                  </SelectContent>
                </Select>

                {/* Render input fields based on action type */}
                {currentAction.type === 'click' && (
                  <Input
                    placeholder="Selector"
                    value={currentAction.selector}
                    onChange={(e) => handleActionChange('selector', e.target.value)}
                  />
                )}
                {currentAction.type === 'type' && (
                  <>
                    <Input
                      placeholder="Selector"
                      value={currentAction.selector}
                      onChange={(e) => handleActionChange('selector', e.target.value)}
                    />
                    <Input
                      placeholder="Text to Type"
                      value={currentAction.value}
                      onChange={(e) => handleActionChange('value', e.target.value)}
                    />
                  </>
                )}
                {currentAction.type === 'wait' && (
                  <Input
                    placeholder="Duration (ms)"
                    type="number"
                    onChange={(e) => handleActionChange('duration', e.target.value)}
                  />
                )}
                {currentAction.type === 'scroll' && (
                  <Input
                    placeholder="Scroll Value"
                    onChange={(e) => handleActionChange('value', e.target.value)}
                  />
                )}
                {currentAction.type === 'moveMouse' && (
                  <>
                    <Input
                      placeholder="X Coordinate"
                      type="number"
                      onChange={(e) => handleActionChange('x', e.target.value)}
                    />
                    <Input
                      placeholder="Y Coordinate"
                      type="number"
                      onChange={(e) => handleActionChange('y', e.target.value)}
                    />
                  </>
                )}
                {currentAction.type === 'dragAndDrop' && (
                  <>
                    <Input
                      placeholder="Source Selector"
                      onChange={(e) => handleActionChange('sourceSelector', e.target.value)}
                    />
                    <Input
                      placeholder="Target Selector"
                      onChange={(e) => handleActionChange('targetSelector', e.target.value)}
                    />
                  </>
                )}

                <Button onClick={() => addAction(currentAction)}>Add Action</Button>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Added Actions</h3>
                  <Select
                    value={selectedAction ? selectedAction.type : ''}
                    onValueChange={(value) => {
                      const action = actions.find(a => a.type === value);
                      setSelectedAction(action || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Action" />
                    </SelectTrigger>
                    <SelectContent>
                       {actions.map((action: Action, index: number) => (
                         <SelectItem key={index} value={action.type.toString()}>
                           <strong>{action.type}</strong>: {JSON.stringify(action)}
                            </SelectItem>
                         ))}
                   </SelectContent>

                  </Select>
                </div>

                {errors.map((error, index) => (
                  <p key={index} className="text-red-500">{error.message}</p>
                ))}

                <div className="mt-4 space-x-2">
                  <Button type="submit">Create Task</Button>
                  <Button type="button" onClick={resetForm} variant="outline">Reset Form</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="saved">
          <ScrollArea className="w-full rounded-md border p-4" style={{ height: `${savedTasksContainerHeight}px` }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(savedTasks) && savedTasks.length > 0 ? (
                savedTasks.map((task: any) => (
                  <Card key={task._id} className="w-full">
                    <CardContent className="p-4">
                      <h3 className="font-bold">{task.type}</h3>
                      <p className="text-sm">Status: {task.status}</p>
                      <p className="text-sm">Parameters: {JSON.stringify(task.parameters)}</p>
                      <p className="text-sm">URL: {task.url}</p>
                      <h4 className="font-semibold mt-2 text-sm">Actions:</h4>
                      {task.actions.map((action: Action, index: number) => (
                        <p key={index} className="text-xs">
                          {`${action.type} - Selector: ${('selector' in action) ? action.selector : 'N/A'}, Value: ${('value' in action) ? action.value : 'N/A'}`}
                        </p>
                      ))}
                      <div className="mt-4 flex justify-end space-x-2">
                      <Button onClick={() => setTaskToEdit(task)}>Edit</Button>
                        <Button variant="destructive" onClick={() => setTaskToDelete(task)}>Delete</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Alert>
                  <AlertTitle>No Tasks</AlertTitle>
                  <AlertDescription>No saved tasks available.</AlertDescription>
                </Alert>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!taskToEdit} onOpenChange={() => setTaskToEdit(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Task</AlertDialogTitle>
            <AlertDialogDescription>
              Make changes to your task here. Click save when you're done.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {taskToEdit && (
            <div className="space-y-4">
              <Select
                value={taskToEdit.type}
                onValueChange={(value) => setTaskToEdit({ ...taskToEdit, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Task Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WebScraping">Web Scraping</SelectItem>
                  <SelectItem value="SocialMediaInteraction">Social Media Interaction</SelectItem>
                  <SelectItem value="DataEntry">Data Entry</SelectItem>
                  <SelectItem value="GoogleSearch">Google Search</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Task Parameters (JSON)"
                value={JSON.stringify(taskToEdit.parameters)}
                onChange={(e) => {
                  try {
                    const parsedParams = JSON.parse(e.target.value);
                    setTaskToEdit({ ...taskToEdit, parameters: parsedParams });
                  } catch (error) {
                    // Handle JSON parse error
                  }
                }}
              />
              <Input
                placeholder="Task URL"
                value={taskToEdit.url}
                onChange={(e) => setTaskToEdit({ ...taskToEdit, url: e.target.value })}
              />
              <div>
                <h4 className="font-semibold mb-2">Actions:</h4>
                {taskToEdit.actions.map((action: Action, index: number) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <Input
                      value={action.type}
                      onChange={(e) => {
                        const newActions = [...taskToEdit.actions];
                        newActions[index] = { ...newActions[index], type: e.target.value as Action['type'] };
                        setTaskToEdit({ ...taskToEdit, actions: newActions });
                      }}
                    />
                    <Input
                      value={(action as any).selector || ''}
                      onChange={(e) => {
                        const newActions = [...taskToEdit.actions];
                        newActions[index] = { ...newActions[index], selector: e.target.value };
                        setTaskToEdit({ ...taskToEdit, actions: newActions });
                      }}
                    />
                    <Button onClick={() => {
                      const newActions = taskToEdit.actions.filter((_: Action, i: number) => i !== index);
                      setTaskToEdit({ ...taskToEdit, actions: newActions });
                    }}>Remove</Button>
                  </div>
                ))}
                <Button onClick={() => {
                  setTaskToEdit({
                    ...taskToEdit,
                    actions: [...taskToEdit.actions, { type: 'click', selector: '' }]
                  });
                }}>Add Action</Button>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEditTask}>Save Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
    </DefaultLayout>
  );
};

export default TaskPage;

