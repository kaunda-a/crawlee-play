'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Proxy {
  id: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
  status: 'active' | 'inactive';
}

interface ExecutionLog {
  type: 'command' | 'flow' | 'performance' | 'error';
  timestamp: Date;
  data: any;
}


const ConsolePage = () => {
  const [activeTab, setActiveTab] = useState('command');
  const [command, setCommand] = useState('');
  const [flowNodes, setFlowNodes] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedActions, setRecordedActions] = useState([]);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [status, setStatus] = useState('idle');
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [selectedProxy, setSelectedProxy] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
 
  interface Template {
    name: string;
    description: string;
    defaultCommand: string;
  }
  
  interface Templates {
    [key: string]: Template;
  }
  
  const templates: Templates = {
    'googleSearch': {
      name: 'Google Search',
      description: 'Search and extract results',
      defaultCommand: 'Search Google for {query} and click {target}'
    },
    'socialMedia': {
      name: 'Social Media Interaction',
      description: 'Interact with social platforms',
      defaultCommand: 'Login to {platform} and post {content}'
    }
  };
  
  // Now you can safely use templates[selectedTemplate] and templates[templateId]
  
  useEffect(() => {
    loadConsoleData();
  }, []);

  const loadConsoleData = async () => {
    try {
      const response = await fetch('/api/console');
      const data = await response.json();
      setProxies(data.proxies);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load console data:', error);
      setIsLoading(false);
    }
  };

  const handleCommandSubmit = async () => {
    if (!command.trim() || !selectedProxy) return;
    
    setStatus('processing');
    try {
      const response = await fetch('/api/console', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          proxyId: selectedProxy
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setExecutionLogs(prev => [...prev, {
        type: 'command',
        timestamp: new Date(),
        data: result
      }]);
      
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setExecutionLogs(prev => [...prev, {
        type: 'error',
        timestamp: new Date(),
        data: error
      }]);
    }
  };

  const toggleRecording = () => {
    setIsRecording(prev => !prev);
    if (!isRecording) {
      setRecordedActions([]);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setCommand(templates[templateId].defaultCommand);
  };

  const renderProxySelector = () => (
      <Select value={selectedProxy} onValueChange={setSelectedProxy}>
        <SelectTrigger>
          <SelectValue placeholder="Select Proxy" />
        </SelectTrigger>
        <SelectContent>
          {proxies && proxies.length > 0 ? (
            proxies.map(proxy => (
              <SelectItem key={proxy.id} value={proxy.id}>
                {`${proxy.host}:${proxy.port} (${proxy.status})`}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-proxy" disabled>
              No proxies available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
  );
  

  return (
    <DefaultLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Console Vault</h1>
          <div className="status-indicator">
            Status: {status}
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="command">Command</TabsTrigger>
            <TabsTrigger value="visual">Visual Builder</TabsTrigger>
            <TabsTrigger value="recorder">Recorder</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="command">
            <Card>
              <CardContent>
                <div className="space-y-4">
                  {renderProxySelector()}
                  <Input
                    placeholder="Enter your command..."
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                  />
                  <Button 
                    onClick={handleCommandSubmit}
                    disabled={status === 'processing' || !command.trim() || !selectedProxy}
                  >
                    {status === 'processing' ? 'Processing...' : 'Process Command'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visual">
            <Card>
              <CardContent>
                <div className="flow-builder">
                  {flowNodes.map((node, index) => (
                    <div key={index} className="flow-node">
                      {/* Flow node visualization */}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recorder">
            <Card>
              <CardContent>
                <Button 
                  onClick={toggleRecording}
                  variant={isRecording ? "destructive" : "default"}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Button>
                <ScrollArea className="h-[400px] mt-4">
                  {recordedActions.map((action, index) => (
                    <div key={index} className="p-2 border-b">
                      {JSON.stringify(action, null, 2)}
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardContent>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Template" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(templates).map(([id, template]) => (
                      <SelectItem key={id} value={id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate && (
                  <div className="mt-4">
                    <h3 className="font-semibold">{templates[selectedTemplate].name}</h3>
                    <p className="text-sm text-gray-600">{templates[selectedTemplate].description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Execution Logs */}
        <Card className="mt-6">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Execution Logs</h2>
            <ScrollArea className="h-[200px]">
              {executionLogs.map((log, index) => (
                <div key={index} className="text-sm p-2 border-b">
                  <span className="text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`ml-2 ${log.type === 'error' ? 'text-red-500' : ''}`}>
                    {log.type}
                  </span>
                  <pre className="mt-1 text-xs">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default ConsolePage;
