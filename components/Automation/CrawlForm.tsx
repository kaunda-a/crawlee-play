// components/Automation/CrawlForm.tsx
'use client';

import { useState } from 'react';

export default function CrawlForm() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Crawl task started successfully!');
        setUrl('');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error starting crawl:', error);
      alert('Failed to start crawl task.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL to crawl"
        className="w-full rounded-lg border border-stroke bg-transparent p-3 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
        required
      />
      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
      >
        {isLoading ? 'Adding...' : 'Start Crawl'}
      </button>
    </form>
  );
}