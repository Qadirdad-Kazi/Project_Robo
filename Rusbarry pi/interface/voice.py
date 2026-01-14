"""
Interface Module - Voice Recognition
====================================

This module handles audio input and converts speech to text using
the SpeechRecognition library. It supports offline engines (Sphinx)
and online APIs (Google).
"""

import sys

try:
    import speech_recognition as sr
except ImportError:
    sr = None

class VoiceRecognizer:
    """
    Handles listening to the microphone and recognizing speech.
    """
    def __init__(self):
        if sr:
            self.recognizer = sr.Recognizer()
            self.microphone = sr.Microphone()
            print("Interface: Voice Recognizer initialized.")
            # Adjust for ambient noise
            with self.microphone as source:
                print(" - Adjusting for ambient noise... (Please be quiet)")
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
                print(" - Ready to listen.")
        else:
            print("Interface: Voice Recognition unavailable (libraries missing)")

    def listen(self):
        """
        Listens for a single command.
        
        Returns:
            str: The recognized text, or None if failed/timeout.
        """
        if not sr:
            return None
        
        print("[Voice] Listening...")
        try:
            with self.microphone as source:
                # Listen with a timeout
                audio = self.recognizer.listen(source, timeout=5, phrase_time_limit=5)
            
            print("[Voice] Processing...")
            # Using Google Web Speech API (default key) - requires internet
            # For offline, use Recognize Sphinx (requires pocketsphinx)
            text = self.recognizer.recognize_google(audio)
            print(f"[Voice] Heard: '{text}'")
            return text
            
        except sr.WaitTimeoutError:
            print("[Voice] Cleanup: No speech detected.")
            return None
        except sr.UnknownValueError:
            print("[Voice] Could not understand audio.")
            return None
        except sr.RequestError as e:
            print(f"[Voice] Service error: {e}")
            return None
        except Exception as e:
            print(f"[Voice] Error: {e}")
            return None

if __name__ == "__main__":
    # Test
    vr = VoiceRecognizer()
    if sr:
        while True:
            cmd = vr.listen()
            if cmd:
                if "exit" in cmd.lower():
                    break
