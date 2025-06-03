import React from "react";
import { Sparkles, Tag, TrendingUp, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AIInsights({
  aiAnalysis,
}: {
  aiAnalysis: {
    summary?: string;
    topics?: Array<{ topic: string; confidence: number }>;
    sentiment?: { label: string; score: number };
    keyPhrases?: Array<{ text: string; label: string; confidence: number }>;
  } | null;
}) {
  if (!aiAnalysis) return null;

  interface Sentiment {
    label: string;
    score: number;
  }

  const getSentimentColor = (sentiment: Sentiment): string => {
    switch (sentiment?.label?.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Summary */}
      {aiAnalysis.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              AI-Generated Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {aiAnalysis.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Topic Classification */}
      {aiAnalysis.topics && aiAnalysis.topics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-green-600" />
              Research Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {aiAnalysis.topics.map((topic) => (
                <Badge
                  key={topic.topic}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {topic.topic}
                  <span className="text-xs text-gray-500">
                    {Math.round(topic.confidence * 100)}%
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sentiment Analysis */}
      {aiAnalysis.sentiment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Research Tone Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className={getSentimentColor(aiAnalysis.sentiment)}>
                {aiAnalysis.sentiment.label}
              </Badge>
              <span className="text-sm text-gray-600">
                Confidence: {Math.round(aiAnalysis.sentiment.score * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Phrases */}
      {aiAnalysis.keyPhrases && aiAnalysis.keyPhrases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-orange-600" />
              Key Terms & Entities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {aiAnalysis.keyPhrases.slice(0, 10).map((phrase, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium">{phrase.text}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {phrase.label}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {Math.round(phrase.confidence * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
