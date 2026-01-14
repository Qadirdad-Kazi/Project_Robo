"""
Utilities Module - Media Controller
===================================

This module handles media playback, specifically focusing on YouTube.
It uses `webbrowser` to open URLs (simplest method for a local robot)
and `pywhatkit` or direct search URL construction for searching.
"""

import webbrowser
import urllib.parse
import time

try:
    import pywhatkit
except ImportError:
    pywhatkit = None

class MediaController:
    """
    Handles multimedia actions like playing music or videos.
    """
    def __init__(self):
        print("Utilities: Media Controller initialized.")

    def play_youtube(self, query):
        """
        Searches for and plays a video on YouTube.
        
        Args:
            query (str): The search term (e.g., "Taylor Swift Shake it Off").
        """
        print(f"Media: Playing '{query}' on YouTube...")
        
        if pywhatkit:
            try:
                pywhatkit.playonyt(query)
                return True
            except Exception as e:
                print(f"Media Error (pywhatkit): {e}")
                # Fallback
        
        # Fallback: Open browser search directly
        # If query is a URL, open it.
        if "youtube.com" in query or "youtu.be" in query:
            webbrowser.open(query)
        else:
            # Construct search URL
            encoded_query = urllib.parse.quote(query)
            url = f"https://www.youtube.com/results?search_query={encoded_query}"
            # Note: This just opens search results. 
            # To auto-play simplisticly without API, we might use "I feel lucky" equivalents or just open the search.
            # Using a simplified 'play' logic usually requires a library like pywhatkit which finds the first video.
            webbrowser.open(url)
        return True

    def pause(self):
        """
        Simulate pause (system dependent, often requires keyboard media keys).
        """
        pass
