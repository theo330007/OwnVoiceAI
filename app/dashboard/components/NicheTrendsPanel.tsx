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
  userIndustry: string;
}

export function NicheTrendsPanel({ initialTrends, userId, userIndustry }: Props) {
  const [trends, setTrends] = useState(initialTrends);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapingResult, setScrapingResult] = useState<any>(null);
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
      const result = await scrapeUserInstagramTrends(userId, userIndustry);
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

      {/* Instagram Scraper Button */}
      <div className="mb-6">
        <Button
          onClick={handleScrape}
          disabled={isScraping || !userIndustry}
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
              Scrape {userIndustry || 'Industry'} Trends
            </>
          )}
        </Button>

        {!userIndustry && (
          <p className="text-xs text-sage/60 mt-2 text-center">
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

      <div className="space-y-4">
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
              className="p-4 bg-dusty-rose/5 rounded-2xl hover:bg-dusty-rose/10 transition-all cursor-pointer hover:shadow-soft group relative"
            >
              <button
                onClick={(e) => handleDelete(trend.id, e)}
                className="absolute top-2 right-2 p-2 text-sage/40 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                title="Delete trend"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-start justify-between mb-2 pr-8">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sage group-hover:text-dusty-rose transition-colors">
                      {trend.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        trend.relevance_score && trend.relevance_score >= 80
                          ? 'bg-green-100 text-green-700'
                          : trend.relevance_score && trend.relevance_score >= 60
                          ? 'bg-dusty-rose/20 text-dusty-rose'
                          : 'bg-sage/10 text-sage/70'
                      }`}
                    >
                      {trend.relevance_score || 0}
                    </span>
                  </div>
                  {trend.trend_type && (
                    <span className="text-xs px-2 py-1 bg-sage/10 text-sage/70 rounded-full">
                      {trend.trend_type}
                    </span>
                  )}
                </div>
              </div>
              {trend.description && (
                <p className="text-sm text-sage/70 mb-3 line-clamp-2">
                  {trend.description}
                </p>
              )}
              {trend.keywords && trend.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {trend.keywords.slice(0, 4).map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-dusty-rose/20 text-dusty-rose text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                  {trend.keywords.length > 4 && (
                    <span className="px-3 py-1 bg-sage/20 text-sage text-xs rounded-full">
                      +{trend.keywords.length - 4} more
                    </span>
                  )}
                </div>
              )}

              {/* Generate Strategic Insight Button */}
              <Button
                onClick={(e) => handleGenerateInsight(trend.id, e)}
                disabled={generatingInsightId === trend.id}
                size="sm"
                className="w-full mt-3 bg-gradient-to-r from-sage to-dusty-rose hover:from-sage/90 hover:to-dusty-rose/90 text-white"
              >
                {generatingInsightId === trend.id ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    Generating Insight...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-2" />
                    Generate Strategic Insight
                  </>
                )}
              </Button>
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
