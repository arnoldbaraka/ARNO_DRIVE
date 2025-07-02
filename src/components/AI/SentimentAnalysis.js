import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
let model;
let sentimentModel;
export const SentimentAnalyzer = {
  async loadModels() {
    if (!model) {
      model = await use.load();
    }
    if (!sentimentModel) {
      sentimentModel = await tf.loadLayersModel('/models/sentiment_model/model.json');
    }
  },
  async analyze(text) {
    await this.loadModels();
    
    const embeddings = await model.embed([text]);
    const prediction = sentimentModel.predict(embeddings);
    const score = prediction.dataSync()[0];
    prediction.dispose();
    
    return score > 0.6 ? 'positive' : score < 0.4 ? 'negative' : 'neutral';
  }
};