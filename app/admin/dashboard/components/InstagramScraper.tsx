'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Instagram, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export function InstagramScraper() {
  const [isScraping, setIsScraping] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleScrape = async () => {
    setIsScraping(true);
    setResult(null);

    try {
      const response = await fetch('/api/scrape/instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hashtags: ['trending', 'viral', 'fyp', 'explore'],
          layer: 'macro',
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        errors: [error.message || 'Scraping failed'],
        trendsFound: 0,
        trendsAdded: 0,
      });
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <Card className="bg-white rounded-3xl shadow-soft p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
          <Instagram className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-serif text-xl text-sage">Instagram Scraper</h3>
          <p className="text-sm text-sage/60">
            Extract MEGA trends across all industries
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-sage/5 rounded-2xl">
          <p className="text-sm text-sage/70 mb-2">
            <strong>Hashtags to scrape:</strong>
          </p>
          <div className="flex flex-wrap gap-2">
            {['#trending', '#viral', '#fyp', '#explore'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-dusty-rose/20 text-dusty-rose text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <Button
          onClick={handleScrape}
          disabled={isScraping}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          {isScraping ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Scraping Instagram...
            </>
          ) : (
            <>
              <Instagram className="w-4 h-4 mr-2" />
              Scrape Trends Now
            </>
          )}
        </Button>

        {result && (
          <div
            className={`p-4 rounded-2xl border-2 ${
              result.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <h4
                className={`font-semibold ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {result.success ? 'Scraping Complete!' : 'Scraping Failed'}
              </h4>
            </div>

            <div className="space-y-2 text-sm">
              <p className="text-sage">
                <strong>Trends Found:</strong> {result.trendsFound}
              </p>
              <p className="text-sage">
                <strong>Trends Added:</strong> {result.trendsAdded}
              </p>

              {result.trends && result.trends.length > 0 && (
                <div className="mt-3">
                  <p className="font-semibold text-sage mb-2">New Trends:</p>
                  <div className="space-y-1">
                    {result.trends.slice(0, 5).map((trend: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-white rounded-xl"
                      >
                        <span className="text-sage text-xs">{trend.title}</span>
                        <span className="text-xs font-semibold text-dusty-rose">
                          {trend.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.errors && result.errors.length > 0 && (
                <div className="mt-3">
                  <p className="font-semibold text-red-800 mb-2">Errors:</p>
                  <ul className="space-y-1 text-xs text-red-700">
                    {result.errors.map((error: string, idx: number) => (
                      <li key={idx}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> Firecrawl API configured. Scraping cross-industry MEGA trends from Instagram, capturing what's working RIGHT NOW regardless of industry (tech, fashion, business, lifestyle, etc.).
          </p>
        </div>
      </div>
    </Card>
  );
}
