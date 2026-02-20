export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string;
}

export class TextToSpeech {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
      this.loadVoices();
    } else {
      // Fallback for SSR
      this.synth = {} as SpeechSynthesis;
    }
  }

  private loadVoices() {
    if (typeof window === 'undefined') return;
    
    this.voices = this.synth.getVoices();
    
    // Reload voices when they change (some browsers load voices asynchronously)
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  }

  public speak(text: string, options: SpeechOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set default options
      utterance.rate = options.rate ?? 1.0;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;

      // Try to find a preferred voice (English voice preferred)
      if (options.voice) {
        const voice = this.voices.find(v => v.name === options.voice);
        if (voice) utterance.voice = voice;
      } else {
        // Default to first English voice available
        const englishVoice = this.voices.find(v => v.lang.startsWith('en'));
        if (englishVoice) utterance.voice = englishVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech error: ${event.error}`));

      this.synth.speak(utterance);
    });
  }

  public stop() {
    this.synth.cancel();
  }

  public pause() {
    this.synth.pause();
  }

  public resume() {
    this.synth.resume();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  public isSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }
}

// Create a singleton instance
export const textToSpeech = new TextToSpeech();

// Helper function to announce order ready for serving
export const announceOrderReady = async (orderNumber: string, customerName?: string): Promise<void> => {
  if (!textToSpeech.isSupported()) {
    console.warn('Text-to-speech is not supported in this browser');
    return;
  }

  try {
    let announcement = `Order ${orderNumber} is ready for serving`;
    if (customerName) {
      announcement += ` for ${customerName}`;
    }
    announcement += '. Please collect your order.';

    await textToSpeech.speak(announcement, {
      rate: 0.9, // Slightly slower for clarity
      pitch: 1.0,
      volume: 1.0
    });
  } catch (error) {
    console.error('Error announcing order:', error);
  }
};
