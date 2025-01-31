"use client";

import { useState, useEffect } from 'react';
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface Bot {
  id: string;
  name: string;
  browser: string;
  device: string;
  userAgent: string;
  fingerprint: any;
}

interface Proxy {
  id: string;
  name: string;
  host: string;
  port: string;
  username: string;
  password: string;
  country: string;
  status: string;
}

const InstancePage = () => {
  const [selectedProxy, setSelectedProxy] = useState<string>('');
  const [selectedBot, setSelectedBot] = useState<string>('');
  const [bots, setBots] = useState<Bot[]>([]);
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchBots();
    fetchProxies();
  }, []);

  const fetchBots = async () => {
    const response = await fetch('/api/bots');
    const data = await response.json();
    setBots(data);
  };

  const fetchProxies = async () => {
    const response = await fetch('/api/proxies');
    const data = await response.json();
    setProxies(data);
  };

  const launchBrowser = async () => {
    try {
      const response = await fetch('/api/instance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botId: selectedBot,
          proxyId: selectedProxy,
        }),
      });

      const data = await response.json();
      
      toast({
        title: "Success",
        description: "Browser instance launched successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to launch browser instance",
        variant: "destructive",
      });
    }
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Browser Instance Manager</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Bot Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={setSelectedBot}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a bot profile" />
                </SelectTrigger>
                <SelectContent>
                  {bots.map((bot) => (
                    <SelectItem key={bot.id} value={bot.id}>
                      {bot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Proxy Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={setSelectedProxy}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a proxy" />
                </SelectTrigger>
                <SelectContent>
                  {proxies.map((proxy) => (
                    <SelectItem key={proxy.id} value={proxy.id}>
                      {proxy.name} - {proxy.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-center">
          <Button 
            size="lg"
            onClick={launchBrowser}
            disabled={!selectedBot || !selectedProxy}
            className="px-8"
          >
            Launch Browser Instance
          </Button>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default InstancePage;
