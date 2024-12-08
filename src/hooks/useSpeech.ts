export function useSpeech() {
  const speak = (text: string, lang: string = 'en-US') => {
    // 检查浏览器是否支持语音合成
    if ('speechSynthesis' in window) {
      // 创建语音实例
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.0;  // 标准语速
      utterance.pitch = 1.0; // 标准音高
      
      // 播放语音
      window.speechSynthesis.speak(utterance);
    }
  };

  return { speak };
} 