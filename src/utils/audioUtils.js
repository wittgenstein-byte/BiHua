/**
 * Web Speech API Audio Utility for Chinese Pronunciation (zh-CN)
 */

export function speakChinese(text, rate = 0.85) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported in this browser.');
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop active speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = rate; // slightly slower for language learners

    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find(
      v => v.lang === 'zh-CN' || v.lang === 'zh_CN' || v.lang.includes('zh')
    );

    if (zhVoice) {
      utterance.voice = zhVoice;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Speech synthesis error:', err);
    return false;
  }
}
