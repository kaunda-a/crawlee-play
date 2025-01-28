'use client';

import { useEffect, useState } from 'react';

interface CrawlResult {
  id: string;
  title: string;
  url: string;
  created_at: string;
}

export default function Analytics() {
  const [results, setResults] = useState<CrawlResult[]>([]);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        // Ensure data is an array before setting it
        setResults(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error('Error fetching analytics:', error);
        setResults([]);
      });
  }, []);

  return (
    <div>
      {!results?.length ? (
        <p className="text-gray-500 dark:text-gray-400">No crawl results found.</p>
      ) : (
        <ul className="space-y-4">
          {results.map((result) => (
            <li key={result.id} className="border-b border-stroke pb-4 dark:border-strokedark">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                {result.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{result.url}</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Crawled on: {new Date(result.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
