// YouTubeService.js
import { Linking, Platform } from 'react-native';

class YouTubeService {

    async searchAndPlay(query) {
        const searchQuery = encodeURIComponent(query);
        // Try web intent first
        // 'vnd.youtube:' works on Android to open App. 
        // 'youtube://' works on iOS if installed.
        // HTTPS fallback is safest.

        let url = `https://www.youtube.com/results?search_query=${searchQuery}`;

        // If we wanted to try to deep link directly:
        // const deepLink = Platform.OS === 'ios' ? `youtube://results?search_query=${searchQuery}` : `vnd.youtube://results?search_query=${searchQuery}`;

        // We stick to HTTPS for broad compatibility, usually OS redirects to App.

        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
            await Linking.openURL(url);
            return true;
        } else {
            console.warn("[YouTube] Cannot open URL:", url);
            return false;
        }
    }
}

export default new YouTubeService();
