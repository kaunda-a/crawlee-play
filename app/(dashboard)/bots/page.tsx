"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bot } from '@/types/Bot';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Flex } from '@radix-ui/themes';
import { ScrollArea } from "@/components/ui/scroll-area";
import type { devices as playwrightDevices } from 'playwright';
import { FaApple, FaAndroid, FaWindows } from 'react-icons/fa';
import { SiSafari, SiFirefox } from 'react-icons/si';
import { SiGooglechrome as SiChrome } from 'react-icons/si';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getPlaywrightDevices, getPlaywrightBrowsers, BrowserType, getRandomDevice } from '@/lib/crawlers/playwrightUtils';
import { FingerprintManager } from '@/lib/FingerprintManager';
import { useInView } from 'react-intersection-observer';
import Spinner  from "@/components/ui/spinner";

const BotsPage = () => {
  const [savedBots, setSavedBots] = useState<Bot[]>([]);
  const [displayedBots, setDisplayedBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newBot, setNewBot] = useState<Bot>({
    name: '',
    browser: 'chromium',
    device: 'Desktop Chrome',
    os: 'Windows',
    userAgent: '',
    type: 'bot',
    fingerprint: {
      userAgent: '',
      hardwareConcurrency: 4,
      deviceMemory: 8,
      platform: 'Win32',
      canvas: '',
      webgl: '',
      audioContext: '',
      fonts: [],
      plugins: [],
      timezone: '',
      locale: '',
      colorDepth: 24,
      touchSupport: [],
      doNotTrack: null,
      webRTC: '',
      battery: '',
      cpuClass: undefined,
      vendorSub: '',
      productSub: '',
      oscpu: '',
      hardwareFamily: '',
      devicePixelRatio: 1,
      pixelRatio: 1,
      webGLVendor: '',
      webGLRenderer: '',
      screenResolution: '',
      availableScreenResolution: '',
    },
  });

  const [devices, setDevices] = useState<Partial<typeof playwrightDevices>>({});
  const [browsers, setBrowsers] = useState<BrowserType[]>([]);
  const [activeTab, setActiveTab] = useState('create');
  const { toast } = useToast();
  const botsPerPage = 9;
  const [botToDelete, setBotToDelete] = useState<Bot | null>(null);
  const [fingerprint, setFingerprint] = useState({});
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
 
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchBots();
      getPlaywrightDevices().then(setDevices);
      setBrowsers(getPlaywrightBrowsers());

      if (containerRef.current) {
        const resizeObserver = new ResizeObserver((entries) => {
          for (let entry of entries) {
            setContainerSize({
              width: entry.contentRect.width,
              height: entry.contentRect.height,
            });
          }
        });

        resizeObserver.observe(containerRef.current);

        return () => {
          resizeObserver.disconnect();
        };
      }
    }
  }, []);

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

  const fetchBots = async () => {
    if (typeof window === 'undefined') return;
    try {
      const response = await fetch('/api/bots');
      const data = await response.json();
      setSavedBots(Array.isArray(data) ? data : []);
      setDisplayedBots((Array.isArray(data) ? data : []).slice(0, botsPerPage));
    } catch (error) {
      console.error('Failed to fetch bots:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bots",
        variant: "destructive",
      });
    }
  };

  const handleSaveBot = async () => {
    if (typeof window === 'undefined') return;
    try {
      const botWithFingerprint = {
        ...newBot,
        fingerprint: FingerprintManager.generateFingerprint(),
      };

      const response = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(botWithFingerprint),
      });

      if (response.ok) {
        await fetchBots();
        setNewBot({
          name: '',
          browser: 'chromium',
          device: 'Desktop Chrome',
          os: 'Windows',
          userAgent: '',
          type: 'bot',
          fingerprint: {
            userAgent: '',
            hardwareConcurrency: 4,
            deviceMemory: 8,
            platform: 'Win32',
            canvas: '',
            webgl: '',
            audioContext: '',
            fonts: [],
            plugins: [],
            timezone: '',
            locale: '',
            colorDepth: 24,
            touchSupport: [],
            doNotTrack: null,
            webRTC: '',
            battery: '',
            cpuClass: undefined,
            vendorSub: '',
            productSub: '',
            oscpu: '',
            hardwareFamily: '',
            devicePixelRatio: 1,
            pixelRatio: 1,
            webGLVendor: '',
            webGLRenderer: '',
            screenResolution: '',
            availableScreenResolution: '',
          },
        });
        toast({
          title: "Success",
          description: "Bot created successfully",
        });
      }
    } catch (error) {
      console.error('Failed to save bot:', error);
      toast({
        title: "Error",
        description: "Failed to create bot",
        variant: "destructive",
      });
    }
  };

  const handleEditBot = (bot: Bot) => {
    setSelectedBot(bot);
    setIsEditDialogOpen(true);
  };

  const handleDeleteBot = (bot: Bot) => {
    setBotToDelete(bot);
  };

  const confirmDeleteBot = async () => {
    if (typeof window === 'undefined') return;
    if (botToDelete) {
      try {
        const response = await fetch(`/api/bots/${botToDelete.name}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          await fetchBots();
          toast({
            title: "Success",
            description: "Bot deleted successfully",
          });
        }
      } catch (error) {
        console.error('Failed to delete bot:', error);
        toast({
          title: "Error",
          description: "Failed to delete bot",
          variant: "destructive",
        });
      }
      setBotToDelete(null);
    }
  };

  const handleUpdateBot = async (updatedBot: Bot) => {
    if (typeof window === 'undefined') return;
    try {
      const response = await fetch(`/api/bots/${updatedBot.name}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBot),
      });
      if (response.ok) {
        await fetchBots();
        setIsEditDialogOpen(false);
        toast({
          title: "Success",
          description: "Bot updated successfully",
        });
      }
    } catch (error) {
      console.error('Failed to update bot:', error);
      toast({
        title: "Error",
        description: "Failed to update bot",
        variant: "destructive",
      });
    }
  };

  const handleDeviceChange = (value: string) => {
    const selectedDevice = devices[value];
    setNewBot({
      ...newBot,
      device: value,
      userAgent: selectedDevice?.userAgent || '',
    });
  };

  const handleDeviceRotation = () => {
    const [deviceName, deviceConfig] = getRandomDevice();
    setNewBot({
      ...newBot,
      device: deviceName,
      userAgent: deviceConfig.userAgent,
    });
  };

  const getGridColumns = () => {
    if (containerSize.width < 640) return 1;
    if (containerSize.width < 1024) return 2;
    return 3;
  };

  const loadMoreBots = useCallback(() => {
    if (displayedBots.length < savedBots.length) {
      const nextBots = savedBots.slice(displayedBots.length, displayedBots.length + botsPerPage);
      setDisplayedBots(prevBots => [...prevBots, ...nextBots]);
    }
  }, [savedBots, displayedBots, botsPerPage]);
  
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      loadMoreBots(); 
    }
  }, [inView, loadMoreBots]);

  return (
    <DefaultLayout>
    <div className="container mx-auto p-6" ref={containerRef}>
      <h1 className="text-3xl font-bold mb-6">Bots Management</h1>
      
      <Tabs
        defaultValue="create"
        className="mb-8"
        onValueChange={(value) => {
          setActiveTab(value);
          if (value === 'saved') {
            setDisplayedBots(savedBots.slice(0, botsPerPage));
          }
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create New Bot</TabsTrigger>
          <TabsTrigger value="saved">Saved Bots</TabsTrigger>
        </TabsList>
        <TabsContent value="create">
          <div className="space-y-4">
            <Input
              placeholder="Bot Name"
              value={newBot.name}
              onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
            />
            <ToggleGroup type="single" value={newBot.browser} onValueChange={(value: BrowserType) => setNewBot({ ...newBot, browser: value })}>
              {browsers.map((browser) => (
                <ToggleGroupItem
                  key={browser}
                  value={browser}
                  aria-label={browser}
                  className="p-4 transition-all duration-200 ease-in-out data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <div className="flex flex-col items-center">
                    {getBrowserIcon(browser, 32)}
                    <span className="mt-1">{browser}</span>
                  </div>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Select
              value={newBot.device}
              onValueChange={handleDeviceChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Device" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(devices).map((deviceName) => (
                  <SelectItem key={deviceName} value={deviceName}>
                    <div className="flex items-center">
                      {getDeviceIcon(deviceName, 20)}
                      <span className="ml-2">{deviceName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="User Agent"
              value={newBot.userAgent}
              onChange={(e) => setNewBot({ ...newBot, userAgent: e.target.value })}
            />
            <Flex className="flex justify-between items-center mt-4 w-full">
              <Button onClick={handleDeviceRotation}>Rotate Device</Button>
              <div className="w-4" /> {/* Spacer */}
              <Button onClick={handleSaveBot}>Create Bot</Button>
            </Flex>
          </div>
        </TabsContent>
        <TabsContent value="saved">
        <div className="space-y-4">
  <ScrollArea className="h-[600px] w-[1050px] rounded-md border p-4">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap- p-4">
      {displayedBots.map((bot) => (
        <Card key={`${bot.name}-${bot.device}-${bot.browser}`} className="mb-2 p-2 text-sm">
          <CardHeader className="p-2">
            <CardTitle className="text-base">{bot.name}</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <p className="flex items-center text-xs">
              {getBrowserIcon(bot.browser, 16)}
              <span className="ml-1">Browser: {bot.browser}</span>
            </p>
            <p className="flex items-center text-xs">
              {getDeviceIcon(bot.device, 16)}
              <span className="ml-1">Device: {bot.device}</span>
            </p>
            <p className="text-xs">OS: {bot.os}</p>
            <p className="text-xs truncate">UA: {bot.userAgent}</p>
            <div className="flex mt-2">
              <Button onClick={() => handleEditBot(bot)} className="mr-1 text-xs py-1 px-2">Edit</Button>
              <Button onClick={() => handleDeleteBot(bot)} variant="destructive" className="text-xs py-1 px-2">Delete</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    {displayedBots.length < savedBots.length && (
  <div ref={ref} className="flex justify-center py-4">
    <Spinner />
  </div>
)}
  </ScrollArea>
  </div>
</TabsContent>
      </Tabs>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bot</DialogTitle>
          </DialogHeader>
          {selectedBot && (
            <div className="space-y-4">
              <Input
                value={selectedBot.name}
                onChange={(e) => setSelectedBot({ ...selectedBot, name: e.target.value })}
              />
              <ToggleGroup type="single" value={selectedBot.browser} onValueChange={(value: BrowserType) => setSelectedBot({ ...selectedBot, browser: value })}>
                {browsers.map((browser) => (
                  <ToggleGroupItem
                    key={browser}
                    value={browser}
                    aria-label={browser}
                    className="p-4 transition-all duration-200 ease-in-out data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    <div className="flex flex-col items-center">
                      {getBrowserIcon(browser, 32)}
                      <span className="mt-1">{browser}</span>
                    </div>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <Select
                value={selectedBot.device}
                onValueChange={(value) => {
                  const selectedDevice = devices[value];
                  setSelectedBot({
                    ...selectedBot,
                    device: value,
                    userAgent: selectedDevice?.userAgent || selectedBot.userAgent,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Device" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(devices).map((deviceName) => (
                    <SelectItem key={deviceName} value={deviceName}>
                      <div className="flex items-center">
                        {getDeviceIcon(deviceName, 20)}
                        <span className="ml-2">{deviceName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="User Agent"
                value={selectedBot.userAgent}
                onChange={(e) => setSelectedBot({ ...selectedBot, userAgent: e.target.value })}
              />
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => handleUpdateBot(selectedBot!)}>Update Bot</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!botToDelete} onOpenChange={() => setBotToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the bot
              and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteBot}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Toaster />
    </div>
    </DefaultLayout>
  );
};

export default BotsPage;