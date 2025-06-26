import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

let model;
let sentimentModel;

export const loadModels = async () => {
  if (!model) {
    model = await use.load();
  }
  if (!sentimentModel) {
    sentimentModel = await tf.loadLayersModel('/models/sentiment/model.json');
  }
};

export const analyzeSentiment = async (text) => {
  await loadModels();
  
  const embeddings = await model.embed([text]);
  const prediction = sentimentModel.predict(embeddings);
  const score = prediction.dataSync()[0];
  prediction.dispose();
  
  if (score > 0.6) return 'positive';
  if (score < 0.4) return 'negative';
  return 'neutral';
};

export const generateResponse = async (message, context) => {
  // In production, this would call an API like OpenAI
  const responses = {
    greeting: [
      "Hey there! Ready for some racing action?",
      "Welcome back! How can I help you today?",
      "Great to see you! What's on your mind?"
    ],
    question: [
      "That's a great question! Our drivers are preparing for the next race.",
      "I'll need to check that information for you.",
      "Let me find out the details about that."
    ],
    feedback: [
      "Thanks for sharing your thoughts!",
      "We appreciate your feedback!",
      "Your opinion helps us improve!"
    ]
  };
  
  // Simple context detection
  let category = 'greeting';
  if (message.includes('?')) category = 'question';
  if (message.includes('like') || message.includes('love') || message.includes('hate')) category = 'feedback';
  
  const randomIndex = Math.floor(Math.random() * responses[category].length);
  return responses[category][randomIndex];
};