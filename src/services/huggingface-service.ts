import { InferenceClient } from "@huggingface/inference";

class HuggingFaceService {
  private hf;
  private models;
  constructor() {
    this.hf = new InferenceClient(process.env.HUGGINGFACE_TOKEN);
    this.models = {
      summarization: "facebook/bart-large-cnn",
      classification: "microsoft/DialoGPT-medium",
      sentiment: "cardiffnlp/twitter-roberta-base-sentiment-latest",
      embeddings: "sentence-transformers/all-MiniLM-L6-v2",
      questionAnswering: "deepset/roberta-base-squad2",
      topicModeling: "facebook/bart-large-mnli",
    };
  }

  // Generate research paper summary
  async generateSummary(text: string, maxLength = 300) {
    try {
      const response = await this.hf.summarization({
        model: this.models.summarization,
        inputs: text,
        parameters: {
          max_length: maxLength,
          min_length: 50,
          do_sample: false,
        },
      });
      return response.summary_text;
    } catch (error) {
      console.error("Summarization error:", error);
      throw new Error("Failed to generate summary");
    }
  }

  // Classify research paper topics
  async classifyResearchTopics(text: string) {
    const researchCategories = [
      "Computer Science",
      "Biology",
      "Physics",
      "Chemistry",
      "Mathematics",
      "Medicine",
      "Engineering",
      "Psychology",
      "Economics",
      "Environmental Science",
    ];

    try {
      const results = [];
      for (const category of researchCategories) {
        const response = (await this.hf.zeroShotClassification({
          model: this.models.topicModeling,
          inputs: text,
          parameters: {
            candidate_labels: [category, "other"],
          },
        })) as any;

        console.log("Zeroshot classification response", response);

        const categoryScore = response.sequence_scores?.[0] ?? 0;
        if (categoryScore > 0.5) {
          results.push({
            topic: category,
            confidence: response.sequence_scores[0],
          });
        }
      }

      return results.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
    } catch (error) {
      console.error("Classification error:", error);
      throw new Error("Failed to classify topics");
    }
  }

  // Generate embeddings for semantic search
  async generateEmbeddings(text: string) {
    try {
      const response = await this.hf.featureExtraction({
        model: this.models.embeddings,
        inputs: text,
      });
      return response;
    } catch (error) {
      console.error("Embedding error:", error);
      throw new Error("Failed to generate embeddings");
    }
  }

  // Answer questions about the research paper
  async answerQuestion(context: string, question: string) {
    try {
      const response = await this.hf.questionAnswering({
        model: this.models.questionAnswering,
        inputs: {
          question: question,
          context: context,
        },
      });
      return {
        answer: response.answer,
        confidence: response.score,
      };
    } catch (error) {
      console.error("Question answering error:", error);
      throw new Error("Failed to answer question");
    }
  }

  // Analyze sentiment of research conclusions
  async analyzeSentiment(text: string) {
    try {
      const response = await this.hf.textClassification({
        model: this.models.sentiment,
        inputs: text,
      });
      return response[0];
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      throw new Error("Failed to analyze sentiment");
    }
  }

  // Extract key phrases and entities
  async extractKeyPhrases(text: string) {
    try {
      const response = await this.hf.tokenClassification({
        model: "dbmdz/bert-large-cased-finetuned-conll03-english",
        inputs: text,
      });

      const entities = response
        .filter((entity) => entity.score > 0.9)
        .map((entity) => ({
          text: entity.word,
          label: entity.entity_group,
          confidence: entity.score,
        }));

      return entities;
    } catch (error) {
      console.error("Key phrase extraction error:", error);
      throw new Error("Failed to extract key phrases");
    }
  }
}

export default new HuggingFaceService();
