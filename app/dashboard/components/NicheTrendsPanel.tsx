'use client';

import { useState } from 'react';
import { RefreshCw, Target, Instagram, Loader2, Trash2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendDetailModal } from '@/components/TrendDetailModal';
import { scrapeUserInstagramTrends, deleteUserNicheTrend, generateStrategicInsight } from '@/app/actions/user-trends';
import type { Trend } from '@/lib/types';

interface Props {
  initialTrends: Trend[];
  userId: string;
  userIndustries: string[];
}

export function NicheTrendsPanel({ initialTrends, userId, userIndustries }: Props) {
  const [trends, setTrends] = useState(initialTrends);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapingResult, setScrapingResult] = useState<any>(null);
  const [selectedIndustry, setSelectedIndustry] = useState(userIndustries[0] || '');
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatingInsightId, setGeneratingInsightId] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleScrape = async () => {
    setIsScraping(true);
    setScrapingResult(null);

    try {
      const result = await scrapeUserInstagramTrends(userId, selectedIndustry);
      setScrapingResult(result);

      if (result.success) {
        // Reload trends after successful scraping
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error: any) {
      setScrapingResult({
        success: false,
        errors: [error.message || 'Scraping failed'],
        trendsFound: 0,
        trendsAdded: 0,
      });
    } finally {
      setIsScraping(false);
    }
  };

  const handleDelete = async (trendId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this trend?')) {
      return;
    }

    try {
      await deleteUserNicheTrend(trendId, userId);
      setTrends(trends.filter((t) => t.id !== trendId));
    } catch (error: any) {
      alert(error.message || 'Failed to delete trend');
    }
  };

  const handleTrendClick = (trend: Trend) => {
    setSelectedTrend(trend);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedTrend(null), 200);
  };

  const handleGenerateInsight = async (trendId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    setGeneratingInsightId(trendId);

    try {
      await generateStrategicInsight(trendId, userId);
      alert('Strategic insight generated successfully! Check the Strategic Insights panel.');
      // Reload page to show the new insight
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      alert(error.message || 'Failed to generate strategic insight');
    } finally {
      setGeneratingInsightId(null);
    }
  };

  return (
    <Card className="bg-white rounded-3xl shadow-soft p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-dusty-rose" />
          <h2 className="font-serif text-2xl text-sage">Niche Trends</h2>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="ghost"
          size="sm"
          className="text-sage hover:bg-sage/10"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </Button>
      </div>

      {/* Instagram Scraper */}
      <div className="mb-6 space-y-2">
        {/* Industry selector — shown when multiple industries */}
        {userIndustries.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {userIndustries.map((ind) => (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedIndustry === ind
                    ? 'bg-dusty-rose text-cream'
                    : 'bg-sage/10 text-sage/60 hover:bg-sage/20'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        )}

        <Button
          onClick={handleScrape}
          disabled={isScraping || !selectedIndustry}
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
              Scrape {selectedIndustry || 'Industry'} Trends
            </>
          )}
        </Button>

        {userIndustries.length === 0 && (
          <p className="text-xs text-sage/60 text-center">
            Add your industry in your profile to enable scraping
          </p>
        )}
      </div>

      {/* Scraping Result */}
      {scrapingResult && (
        <div
          className={`mb-6 p-4 rounded-2xl border-2 ${
            scrapingResult.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {scrapingResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <h4
              className={`font-semibold text-sm ${
                scrapingResult.success ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {scrapingResult.success ? 'Scraping Complete!' : 'Scraping Failed'}
            </h4>
          </div>

          <div className="space-y-1 text-xs">
            <p className="text-sage">
              <strong>Trends Found:</strong> {scrapingResult.trendsFound}
            </p>
            <p className="text-sage">
              <strong>Trends Added:</strong> {scrapingResult.trendsAdded}
            </p>

            {scrapingResult.errors && scrapingResult.errors.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold text-red-800 mb-1">Errors:</p>
                <ul className="space-y-1 text-xs text-red-700">
                  {scrapingResult.errors.map((error: string, idx: number) => (
                    <li key={idx}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {trends.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-sage/30 mx-auto mb-3" />
            <p className="text-sage/50 mb-2">No niche trends yet.</p>
            <p className="text-xs text-sage/40">
              Click the button above to scrape Instagram trends for your industry
            </p>
          </div>
        ) : (
          trends.map((trend) => (
            <div
              key={trend.id}
              onClick={() => handleTrendClick(trend)}
              className="flex items-center gap-3 px-3 py-2.5 bg-dusty-rose/5 rounded-xl hover:bg-dusty-rose/10 transition-all cursor-pointer group"
            >
              {/* Relevance dot */}
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  trend.relevance_score && trend.relevance_score >= 80
                    ? 'bg-green-400'
                    : trend.relevance_score && trend.relevance_score >= 60
                    ? 'bg-dusty-rose'
                    : 'bg-sage/30'
                }`}
              />

              {/* Title + type */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sage group-hover:text-dusty-rose transition-colors truncate">
                  {trend.title}
                </p>
                {trend.trend_type && (
                  <p className="text-xs text-sage/50 truncate">{trend.trend_type}</p>
                )}
              </div>

              {/* Score badge */}
              {trend.relevance_score !== undefined && (
                <span className="text-xs font-bold text-sage/50 flex-shrink-0">
                  {trend.relevance_score}
                </span>
              )}

              {/* Actions (visible on hover) */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => handleGenerateInsight(trend.id, e)}
                  disabled={generatingInsightId === trend.id}
                  className="p-1.5 text-sage/50 hover:text-dusty-rose hover:bg-dusty-rose/10 rounded-lg transition-colors"
                  title="Generate Strategic Insight"
                >
                  {generatingInsightId === trend.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={(e) => handleDelete(trend.id, e)}
                  className="p-1.5 text-sage/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete trend"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <TrendDetailModal
        trend={selectedTrend}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </Card>
  );
}
