/**
 * AI Service 
 * Phase 1: Simulated responses using categorized intents.
 * Phase 2: Ready for Gemini API integration.
 */

// Simulated delay to mimic network latency and "typing"
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const simulatedIntents = {
  attendance: "To mark your attendance, click on 'QR Check-in' or 'Geofence' from your dashboard menu. Ensure you are at the event location!",
  events: "You can find all upcoming events in the 'Events' section. I highly recommend attending the 'Tech Symposium' next week for extra credits.",
  credits: "You earn credits by attending events and participating in clubs. Check the 'Achievements' page to see your current standing.",
  clubs: "We have over 50 active clubs! Go to the 'Clubs' tab to browse. The 'Robotics Club' is currently looking for new members.",
  dashboard: "Your dashboard gives you a quick overview of your credits, upcoming events, and active clubs. Use the sidebar to navigate to specific sections.",
  navigation: "Use the sidebar on the left to move between Dashboard, Events, Clubs, and your Settings. If you need help finding something specific, just ask!",
  default: "I'm here to help with CoordCamp! You can ask me about attendance, events, credits, clubs, or how to navigate the dashboard."
};

export const aiService = {
  /**
   * Send a message to the AI and get a response.
   * Architecture is ready to be swapped with a real LLM API call.
   */
  async sendMessage(message) {
    await delay(600); // Simulate network latency

    const lowerMsg = message.toLowerCase();
    
    // Simple intent routing
    if (lowerMsg.includes('attendance') || lowerMsg.includes('qr') || lowerMsg.includes('geofence')) {
      return simulatedIntents.attendance;
    } else if (lowerMsg.includes('event')) {
      return simulatedIntents.events;
    } else if (lowerMsg.includes('credit') || lowerMsg.includes('score')) {
      return simulatedIntents.credits;
    } else if (lowerMsg.includes('club') || lowerMsg.includes('join')) {
      return simulatedIntents.clubs;
    } else if (lowerMsg.includes('dashboard')) {
      return simulatedIntents.dashboard;
    } else if (lowerMsg.includes('where') || lowerMsg.includes('navigate') || lowerMsg.includes('how to')) {
      return simulatedIntents.navigation;
    }

    return simulatedIntents.default;
  },

  /**
   * Simulate a streaming response for the UI.
   * Yields characters to mimic typing.
   */
  async *streamMessage(message) {
    const fullResponse = await this.sendMessage(message);
    
    // Simulate streaming chunks
    const chunks = fullResponse.split(' ');
    for (let chunk of chunks) {
      await delay(Math.random() * 50 + 20); // 20-70ms delay per word
      yield chunk + ' ';
    }
  }
};
