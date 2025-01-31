"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FaApple, FaAndroid, FaWindows } from 'react-icons/fa';
import { SiSafari, SiFirefox } from 'react-icons/si';
import { SiGooglechrome as SiChrome } from 'react-icons/si';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { CookieManager } from '@/lib/CookieManager';
interface Bot {
  name: string;
  device: string;
  viewport: string;
  browser: string;
  category: string;
  proxy: string;
}
interface BotInstance {
  id: string;
  name: string;
  device: string;
  viewport: string;
  browser: string;
  category: string;
  proxy: string;
  currentIp: string;
  fingerprint: any; // You can create a more specific type if needed
  browserVersion: string;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center space-x-2 mt-4">
      <Button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <span className="py-2">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
};

const getDeviceIcon = (device: string, size: number = 16) => {
  if (device.toLowerCase().includes('iphone') ||
      device.toLowerCase().includes('ipad') ||
      device.toLowerCase().includes('mac') ||
      device.toLowerCase().includes('apple')) {
    return <FaApple size={size} />;
  } else if (device.toLowerCase().includes('android') ||
             device.toLowerCase().includes('pixel') ||
             device.toLowerCase().includes('samsung')) {
    return <FaAndroid size={size} />;
  } else if (device.toLowerCase().includes('desktop')) {
    return <FaWindows size={size} />;
  }
  return null;
};

const getBrowserIcon = (browser: string, size: number = 16) => {
  switch (browser.toLowerCase()) {
    case 'chrome':
    case 'chromium':
      return <SiChrome size={size} />;
    case 'firefox':
      return <SiFirefox size={size} />;
    case 'safari':
    case 'webkit':
      return <SiSafari size={size} />;
    default:
      return null;
  }
};

const LaunchPage: React.FC = () => {
  const { toast } = useToast();
  const [bots, setBots] = useState<Bot[]>([]);
  const [botInstances, setBotInstances] = useState<BotInstance[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>(['all']);
  const cookieManager = new CookieManager();
  const [windowWidth, setWindowWidth] = useState(0);
  const botsPerPage = 6;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(600);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
    }
    fetchBots();

    // Set up ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const height = entry.contentRect.height;
        setContainerHeight(height - 200); // Adjust 200 as needed to account for other elements
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Cleanup function
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  const fetchBots = async () => {
    try {
      const response = await fetch('/api/bots');
      const data = await response.json();
      setBots(data);
      const uniqueCategories = ['all', ...Array.from(new Set(data.map((bot: Bot) => bot.category).filter(Boolean))) as string[]];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to fetch bots:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bots. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLaunchBot = async (botName: string) => {
    const bot = bots.find(b => b.name === botName);
    if (!bot) return;

    try {
      const response = await fetch('/api/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          botName, 
          category: bot.category,
          location: 'default' // You can add a location selector in the UI if needed
        }),
      });

      const data = await response.json();
      if (data.instance) {
        const newInstance = {
          ...data.instance,
          id: Date.now().toString(),
        };
        setBotInstances(prevInstances => [...prevInstances, newInstance]);

        toast({
          title: "Bot Launched",
          description: `${botName} has been successfully launched with IP: ${data.instance.currentIp}`,
        });
      } else {
        toast({
          title: "Launch Failed",
          description: data.error || `Failed to launch ${botName}.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to launch bot instance:', error);
      toast({
        title: "Launch Failed",
        description: `An error occurred while launching ${botName}.`,
        variant: "destructive",
      });
    }
  };

  const handleStopBot = async (botId: string, botName: string) => {
    try {
      const response = await fetch('/api/terminate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ botName }),
      });

      const data = await response.json();
      if (data.success) {
        setBotInstances(prevInstances => prevInstances.filter(instance => instance.id !== botId));
        toast({
          title: "Bot Terminated",
          description: `${botName} has been successfully terminated.`,
        });
      } else {
        toast({
          title: "Termination Failed",
          description: data.error || `Failed to terminate ${botName}.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to stop bot instance:', error);
      toast({
        title: "Termination Failed",
        description: `An error occurred while terminating ${botName}.`,
        variant: "destructive",
      });
    }
  };

  const filteredBots = bots.filter(bot => 
    (selectedCategory === 'all' || bot.category === selectedCategory) &&
    (bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     bot.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
     bot.browser.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastBot = currentPage * botsPerPage;
  const indexOfFirstBot = indexOfLastBot - botsPerPage;
  const currentBots = filteredBots.slice(indexOfFirstBot, indexOfLastBot);
  const totalPages = Math.ceil(filteredBots.length / botsPerPage);

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Launcher" />
    <div className="container mx-auto p-4" ref={containerRef}>
      <h1 className="text-3xl font-bold mb-4">Bot Launcher</h1>
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">Available Bots</TabsTrigger>
          <TabsTrigger value="active">Active Bot Instances</TabsTrigger>
        </TabsList>
        <TabsContent value="available">
          <div className="mb-4 flex space-x-4">
            <Input
              type="text"
              placeholder="Search bots..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.filter(Boolean).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category ? category.charAt(0).toUpperCase() + category.slice(1) : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className={`h-[${containerHeight}px] w-full rounded-md border p-4`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentBots.map((bot, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {getDeviceIcon(bot.device, 24)}
                      {getBrowserIcon(bot.browser, 24)}
                      <span>{bot.name}</span>
                    </CardTitle>
                    <CardDescription>
                      Device: {bot.device}, Browser: {bot.browser}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">{bot.viewport}</Badge>
                    <Badge variant="outline" className="ml-2">{bot.category}</Badge>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button variant="outline">Manage</Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>{bot.name}</DrawerTitle>
                          <DrawerDescription>Manage bot instance</DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4 flex justify-around">
                          <DrawerClose asChild>
                            <Button onClick={() => handleLaunchBot(bot.name)} className="bg-green-500 hover:bg-green-700">
                              Launch
                            </Button>
                          </DrawerClose>
                          <DrawerClose asChild>
                            <Button onClick={() => handleStopBot(bot.name, bot.name)} className="bg-red-500 hover:bg-red-700">
                              Terminate
                            </Button>
                          </DrawerClose>
                        </div>
                        <DrawerFooter>
                          <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page: number) => setCurrentPage(page)}
          />
        </TabsContent>
        <TabsContent value="active">
          <ScrollArea className={`h-[${containerHeight}px] w-full rounded-md border p-4`}>
            {botInstances.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {botInstances.map((instance) => (
                  <Card key={instance.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        {getDeviceIcon(instance.device, 24)}
                        {getBrowserIcon(instance.browser, 24)}
                        <span>{instance.name}</span>
                      </CardTitle>
                      <CardDescription>
                        Device: {instance.device}, Browser: {instance.browser}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="secondary">{instance.viewport}</Badge>
                      <Badge variant="outline" className="ml-2">{instance.proxy}</Badge>
                      <Badge variant="outline" className="ml-2">IP: {instance.currentIp}</Badge>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={() => handleStopBot(instance.id, instance.name)} variant="destructive">
                        Stop
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No active bot instances</p>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
    </DefaultLayout>
  );
};

export default LaunchPage;