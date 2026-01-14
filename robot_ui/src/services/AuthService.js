import { Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

class AuthService {
    constructor() {
        this.isAuthenticated = false;
    }

    async authenticateAdmin() {
        // Quick bypass for development simulator if needed, but let's try real auth
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !isEnrolled) {
            // Fallback to simple simulated password if no biometric
            return new Promise(resolve => {
                Alert.alert(
                    "Admin Access",
                    "Enter PIN (Simulated: use 1234)",
                    [
                        {
                            text: "Cancel",
                            style: "cancel",
                            onPress: () => resolve(false)
                        },
                        {
                            text: "Login",
                            onPress: () => resolve(true) // Allow loose auth for demo
                        }
                    ]
                );
            });
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Authenticate for Admin Access',
            fallbackLabel: 'Enter PIN'
        });

        if (result.success) {
            this.isAuthenticated = true;
            return true;
        }

        return false;
    }

    ensureAdmin(navigation) {
        if (!this.isAuthenticated) {
            Alert.alert("Access Denied", "You must authenticate to view this screen.");
            navigation.goBack();
            return false;
        }
        return true;
    }

    logout() {
        this.isAuthenticated = false;
    }
}

export default new AuthService();
