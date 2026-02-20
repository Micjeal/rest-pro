// Simple test for text-to-speech functionality
// Run this in browser console or as a temporary component

if ('speechSynthesis' in window) {
  console.log('Speech synthesis is supported!');
  
  // Test basic speech
  const utterance = new SpeechSynthesisUtterance('Order ABC123 is ready for serving. Please collect your order.');
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  
  // Get available voices
  const voices = speechSynthesis.getVoices();
  console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
  
  // Try to find an English voice
  const englishVoice = voices.find(v => v.lang.startsWith('en'));
  if (englishVoice) {
    utterance.voice = englishVoice;
    console.log('Using voice:', englishVoice.name);
  }
  
  // Speak
  speechSynthesis.speak(utterance);
  
} else {
  console.error('Speech synthesis is not supported in this browser');
}
