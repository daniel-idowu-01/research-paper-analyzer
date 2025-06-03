import React, { useState } from "react";
import { MessageSquare, Send, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConversationItem {
  type: "question" | "answer" | "error";
  content: string;
  timestamp: Date;
  confidence?: number;
}

interface QuestionResponse {
  answer: string;
  confidence: number;
}

interface HandleAskQuestionEvent extends React.FormEvent<HTMLFormElement> {
  preventDefault: () => void;
}

const [conversation, setConversation] = useState<ConversationItem[]>([]);
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";

export function QuestionAnswering({
  paperId,
  paperTitle,
}: {
  paperId: string;
  paperTitle: string;
}) {
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const { sendRequest } = useApi();

  const handleAskQuestion = async (
    e: HandleAskQuestionEvent
  ): Promise<void> => {
    e.preventDefault();
    if (!question.trim()) return;

    const currentQuestion = question.trim();
    setQuestion("");
    setIsAsking(true);

    // Add question to conversation
    setConversation((prev: ConversationItem[]) => [
      ...prev,
      {
        type: "question",
        content: currentQuestion,
        timestamp: new Date(),
      },
    ]);

    try {
      const response: QuestionResponse = await sendRequest(
        "/api/question",
        "POST",
        {
          question: currentQuestion,
          paperId,
        }
      );

      // Add answer to conversation
      setConversation((prev: ConversationItem[]) => [
        ...prev,
        {
          type: "answer",
          content: response.answer,
          confidence: response.confidence,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Question failed:", error);
      setConversation((prev: ConversationItem[]) => [
        ...prev,
        {
          type: "error",
          content:
            "Sorry, I couldn't answer that question. Please try rephrasing.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const suggestedQuestions = [
    "What is the main research question?",
    "What methodology was used?",
    "What are the key findings?",
    "What are the limitations of this study?",
    "What future research is suggested?",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Ask Questions About This Paper
        </CardTitle>
        <p className="text-sm text-gray-600">
          Get AI-powered answers about "{paperTitle}"
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Conversation History */}
        <div className="max-h-96 overflow-y-auto space-y-3">
          {conversation.map((item, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                item.type === "question"
                  ? "bg-blue-50 ml-8"
                  : item.type === "error"
                  ? "bg-red-50 mr-8"
                  : "bg-gray-50 mr-8"
              }`}
            >
              <div className="flex items-start gap-2">
                {item.type === "question" ? (
                  <MessageSquare className="w-4 h-4 text-blue-600 mt-1" />
                ) : (
                  <Brain className="w-4 h-4 text-purple-600 mt-1" />
                )}
                <div className="flex-1">
                  <p className="text-sm">{item.content}</p>
                  {item.confidence && (
                    <p className="text-xs text-gray-500 mt-1">
                      Confidence: {Math.round(item.confidence * 100)}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isAsking && (
            <div className="bg-gray-50 mr-8 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600 animate-pulse" />
                <p className="text-sm text-gray-600">Thinking...</p>
              </div>
            </div>
          )}
        </div>

        {/* Question Input */}
        <form onSubmit={handleAskQuestion} className="flex gap-2">
          <Input
            type="text"
            placeholder="Ask a question about this paper..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1"
            disabled={isAsking}
          />
          <Button type="submit" disabled={isAsking || !question.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>

        {/* Suggested Questions */}
        {conversation.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Suggested questions:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => setQuestion(q)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
