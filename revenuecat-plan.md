I need to integrate IAP with RevenueCat. Before providing a solution, ask me a set of relevant questions about my specific requirements and constraints so you can give me the most appropriate implementation advice.

Here are the docs: @https://www.revenuecat.com/docs/ 

Integration Doc (Optional - Ideally you create your own)

# RevenueCat Integration Guide

## Overview

This guide provides a complete implementation for integrating RevenueCat into your Expo React Native app for monthly and yearly subscriptions with content unlocking functionality. This implementation will allow users to subscribe to unlock premium content through RevenueCat's SDK, while maintaining webhook integration for server-side subscription management.

## Prerequisites

- Expo React Native app with Supabase backend
- Apple Developer Account ($99/year)
- Google Play Developer Account ($25 one-time)
- RevenueCat account (free tier available)

## Phase 1: Store Configuration

### 1.1 App Store Connect Setup

1. **Enable In-App Purchase Capability**
   - Log into Apple Developer Portal
   - Navigate to "Certificates, IDs & Profiles"
   - Find your app identifier and enable "In-App Purchase" capability

2. **Create Subscription Products**
   - Log into App Store Connect
   - Navigate to your app → Features → In-App Purchases
   - Create a subscription group (e.g., "Premium Subscriptions")
   - Add subscription products:
     - **Monthly**: `com.yourapp.premium.monthly` ($4.99/month)
     - **Yearly**: `com.yourapp.premium.yearly` ($39.99/year)
   - Fill out required metadata and review information

### 1.2 Google Play Console Setup

1. **Set up Google Play Developer Account**
   - Complete all profile requirements
   - Sign necessary agreements

2. **Create Subscription Products**
   - Navigate to Monetize → Products → Subscriptions
   - Create subscription products with same identifiers:
     - `com.yourapp.premium.monthly`
     - `com.yourapp.premium.yearly`
   - Set pricing and billing periods

3. **App Release for Testing**
   - Create internal testing track or closed testing
   - Add your test email accounts
   - Upload signed APK/AAB to testing track

### 1.3 RevenueCat Dashboard Setup

1. **Create RevenueCat Account**
   - Sign up at revenuecat.com
   - Create new project for your app

2. **Connect Store Integrations**
   
   **For iOS:**
   - In App Store Connect → Users and Access → Keys
   - Create new API key with "App Manager" role
   - Download .p8 file (save securely - only downloadable once)
   - In RevenueCat: Add iOS app → Enter Bundle ID → Upload API key

   **For Android:**
   - In Google Play Console → Setup → API access
   - Create service account and download JSON key
   - In RevenueCat: Add Android app → Enter Package Name → Upload service credentials

3. **Configure Products & Entitlements**
   
   **Create Entitlement:**
   - Name: `premium_content`
   - Identifier: `premium_content`
   
   **Import Products:**
   - Navigate to Products tab → Import Products
   - Select your subscription products from both stores
   
   **Create Offering:**
   - Name: "Premium Subscription"
   - Identifier: `premium_offering`
   - Add both monthly and yearly products as packages

4. **Create Paywall (Optional)**
   - Navigate to Paywalls in RevenueCat dashboard
   - Choose template or create custom paywall
   - Assign to your offering
   - Publish paywall

## Phase 2: Expo Configuration

### 2.1 Development Build Setup

Since RevenueCat requires native modules, you'll need to use EAS Build instead of Expo Go:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login and configure
eas login
eas build:configure

# Install RevenueCat packages
npx expo install react-native-purchases
```

### 2.2 App Configuration

Update your `app.json`:

```json
{
  "expo": {
    "name": "Your App",
    "slug": "your-app",
    "plugins": [
      ["react-native-purchases"]
    ],
    "ios": {
      "bundleIdentifier": "com.yourapp.yourapp"
    },
    "android": {
      "package": "com.yourapp.yourapp",
      "permissions": [
        "com.android.vending.BILLING"
      ]
    }
  }
}
```

## Phase 3: SDK Implementation

### 3.1 RevenueCat Provider Setup

Create `context/RevenueCatProvider.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import Purchases, { 
  CustomerInfo, 
  Offerings, 
  PurchasesPackage 
} from 'react-native-purchases';

// Replace with your actual API keys from RevenueCat dashboard
const API_KEYS = {
  apple: 'appl_YOUR_IOS_API_KEY',
  google: 'goog_YOUR_ANDROID_API_KEY',
};

interface RevenueCatContextType {
  customerInfo: CustomerInfo | null;
  offerings: Offerings | null;
  isPremium: boolean;
  isLoading: boolean;
  purchasePackage: (packageToPurchase: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined);

export const useRevenueCat = () => {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error('useRevenueCat must be used within RevenueCatProvider');
  }
  return context;
};

interface RevenueCatProviderProps {
  children: ReactNode;
}

export const RevenueCatProvider: React.FC<RevenueCatProviderProps> = ({ children }) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<Offerings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializePurchases();
  }, []);

  const initializePurchases = async () => {
    try {
      // Configure RevenueCat
      const apiKey = Platform.OS === 'ios' ? API_KEYS.apple : API_KEYS.google;
      
      if (__DEV__) {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      }
      
      await Purchases.configure({ apiKey });

      // Fetch initial data
      await Promise.all([
        fetchCustomerInfo(),
        fetchOfferings()
      ]);
    } catch (error) {
      console.error('Error initializing RevenueCat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerInfo = async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
    } catch (error) {
      console.error('Error fetching customer info:', error);
    }
  };

  const fetchOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      setOfferings(offerings);
    } catch (error) {
      console.error('Error fetching offerings:', error);
    }
  };

  const purchasePackage = async (packageToPurchase: PurchasesPackage): Promise<boolean> => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      setCustomerInfo(customerInfo);
      return customerInfo.entitlements.active['premium_content'] !== undefined;
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error('Purchase error:', error);
      }
      return false;
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    try {
      const customerInfo = await Purchases.restoreTransactions();
      setCustomerInfo(customerInfo);
      return customerInfo.entitlements.active['premium_content'] !== undefined;
    } catch (error) {
      console.error('Restore error:', error);
      return false;
    }
  };

  const isPremium = customerInfo?.entitlements.active['premium_content'] !== undefined;

  const value: RevenueCatContextType = {
    customerInfo,
    offerings,
    isPremium,
    isLoading,
    purchasePackage,
    restorePurchases,
  };

  return (
    <RevenueCatContext.Provider value={value}>
      {children}
    </RevenueCatContext.Provider>
  );
};
```

### 3.2 App Layout Integration

Update your `app/_layout.tsx`:

```typescript
import { Stack } from 'expo-router';
import { RevenueCatProvider } from '../context/RevenueCatProvider';

export default function RootLayout() {
  return (
    <RevenueCatProvider>
      <Stack>
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        {/* Other screens */}
      </Stack>
    </RevenueCatProvider>
  );
}
```

### 3.3 Premium Content Hook

Create `hooks/usePremiumContent.ts`:

```typescript
import { useRevenueCat } from '../context/RevenueCatProvider';

export const usePremiumContent = () => {
  const { isPremium, isLoading } = useRevenueCat();

  const checkAccess = (requiresPremium: boolean = true): boolean => {
    if (!requiresPremium) return true;
    return isPremium;
  };

  const getPremiumStatus = () => ({
    isPremium,
    isLoading,
    hasAccess: isPremium,
  });

  return {
    checkAccess,
    getPremiumStatus,
    isPremium,
    isLoading,
  };
};
```

## Phase 4: UI Implementation

### 4.1 Paywall Component

Create `components/Paywall.tsx`:

```typescript
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  StyleSheet,
  ScrollView 
} from 'react-native';
import { useRevenueCat } from '../context/RevenueCatProvider';

interface PaywallProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const Paywall: React.FC<PaywallProps> = ({ onSuccess, onCancel }) => {
  const { offerings, purchasePackage, restorePurchases, isLoading } = useRevenueCat();
  const [purchasing, setPurchasing] = useState(false);

  const currentOffering = offerings?.current;

  const handlePurchase = async (packageToPurchase: any) => {
    setPurchasing(true);
    try {
      const success = await purchasePackage(packageToPurchase);
      if (success) {
        Alert.alert('Success', 'Welcome to Premium!');
        onSuccess?.();
      } else {
        Alert.alert('Error', 'Purchase failed. Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    try {
      const success = await restorePurchases();
      if (success) {
        Alert.alert('Success', 'Purchases restored!');
        onSuccess?.();
      } else {
        Alert.alert('No Purchases', 'No previous purchases found.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading subscription options...</Text>
      </View>
    );
  }

  if (!currentOffering) {
    return (
      <View style={styles.container}>
        <Text>No subscription options available at this time.</Text>
        <TouchableOpacity style={styles.button} onPress={onCancel}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Unlock Premium Content</Text>
      <Text style={styles.subtitle}>
        Get unlimited access to all premium features and content
      </Text>

      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>Premium Benefits:</Text>
        <Text style={styles.benefit}>✓ Unlimited content access</Text>
        <Text style={styles.benefit}>✓ No advertisements</Text>
        <Text style={styles.benefit}>✓ Exclusive premium features</Text>
        <Text style={styles.benefit}>✓ Priority customer support</Text>
      </View>

      {currentOffering.availablePackages.map((pkg) => (
        <TouchableOpacity
          key={pkg.identifier}
          style={[
            styles.packageButton,
            pkg.packageType === 'ANNUAL' && styles.popularPackage
          ]}
          onPress={() => handlePurchase(pkg)}
          disabled={purchasing}
        >
          {pkg.packageType === 'ANNUAL' && (
            <Text style={styles.popularBadge}>Most Popular</Text>
          )}
          <Text style={styles.packageTitle}>
            {pkg.packageType === 'MONTHLY' ? 'Monthly' : 'Yearly'}
          </Text>
          <Text style={styles.packagePrice}>{pkg.product.priceString}</Text>
          {pkg.packageType === 'ANNUAL' && (
            <Text style={styles.savings}>Save 33%</Text>
          )}
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.restoreButton}
        onPress={handleRestore}
        disabled={purchasing}
      >
        <Text style={styles.restoreText}>Restore Purchases</Text>
      </TouchableOpacity>

      {purchasing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Processing...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  benefitsContainer: {
    marginBottom: 30,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  benefit: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  packageButton: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  popularPackage: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#007AFF',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  packageTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
  },
  packagePrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  savings: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
    marginTop: 5,
  },
  restoreButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  restoreText: {
    color: '#007AFF',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

### 4.2 Premium Content Component

Create `components/PremiumGate.tsx`:

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePremiumContent } from '../hooks/usePremiumContent';

interface PremiumGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUpgradePress?: () => void;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({ 
  children, 
  fallback, 
  onUpgradePress 
}) => {
  const { isPremium, isLoading } = usePremiumContent();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isPremium) {
    return fallback || (
      <View style={styles.lockedContainer}>
        <Text style={styles.lockedTitle}>Premium Content</Text>
        <Text style={styles.lockedMessage}>
          This content is available to premium subscribers only.
        </Text>
        <TouchableOpacity style={styles.upgradeButton} onPress={onUpgradePress}>
          <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    margin: 20,
  },
  lockedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  lockedMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

## Phase 5: Content Implementation

### 5.1 Usage in Screens

Example implementation in a content screen:

```typescript
// app/(protected)/(tabs)/premium-content.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal } from 'react-native';
import { PremiumGate } from '../../../components/PremiumGate';
import { Paywall } from '../../../components/Paywall';

export default function PremiumContentScreen() {
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Premium Content</Text>
      
      <PremiumGate onUpgradePress={() => setShowPaywall(true)}>
        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>Exclusive Content</Text>
          <Text style={styles.paragraph}>
            This is premium content that only subscribers can see.
            Add your exclusive content, features, or functionality here.
          </Text>
          
          {/* Your premium content here */}
        </ScrollView>
      </PremiumGate>

      <Modal
        visible={showPaywall}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <Paywall
          onSuccess={() => setShowPaywall(false)}
          onCancel={() => setShowPaywall(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});
```

## Phase 6: Webhook Integration

### 6.1 RevenueCat Webhook Setup

1. **Configure Webhook in RevenueCat Dashboard**
   - Navigate to Integrations → Webhooks
   - Add new webhook configuration
   - Set URL: `https://your-domain.com/api/webhooks/revenuecat`
   - Set authorization header: `Bearer your-secret-token`
   - Select events: `initial_purchase`, `renewal`, `cancellation`, `expiration`

### 6.2 Supabase Edge Function for Webhooks

Create `supabase/functions/revenuecat-webhook/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify webhook authorization
    const authHeader = req.headers.get('authorization')
    const expectedToken = Deno.env.get('REVENUECAT_WEBHOOK_SECRET')
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return new Response('Unauthorized', { status: 401 })
    }

    const payload = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Extract event data
    const { event, app_user_id } = payload
    const eventType = event.type
    const productId = event.product_id
    const subscriptionStatus = event.is_family_share ? 'family_shared' : 'active'

    console.log(`Processing ${eventType} for user ${app_user_id}`)

    // Handle different event types
    switch (eventType) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
        // User subscribed or renewed
        await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: app_user_id,
            product_id: productId,
            status: subscriptionStatus,
            expires_at: event.expiration_at_ms ? new Date(event.expiration_at_ms) : null,
            updated_at: new Date(),
          })
        
        // Update user profile to mark as premium
        await supabase
          .from('profiles')
          .update({ is_premium: true })
          .eq('id', app_user_id)
        
        break

      case 'CANCELLATION':
        // User cancelled subscription (but may still have access until expiration)
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date(),
          })
          .eq('user_id', app_user_id)
        
        break

      case 'EXPIRATION':
        // Subscription expired
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'expired',
            updated_at: new Date(),
          })
          .eq('user_id', app_user_id)
        
        // Remove premium access
        await supabase
          .from('profiles')
          .update({ is_premium: false })
          .eq('id', app_user_id)
        
        break

      default:
        console.log(`Unhandled event type: ${eventType}`)
    }

    return new Response('OK', { 
      status: 200,
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal Server Error', { 
      status: 500,
      headers: corsHeaders 
    })
  }
})
```

### 6.3 Database Schema

Create migration for subscription tracking:

```sql
-- Create user_subscriptions table
CREATE TABLE user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'family_shared')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Add premium flag to profiles
ALTER TABLE profiles ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;

-- Create RLS policies
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
```

## Phase 7: Testing

### 7.1 Development Testing

1. **Build Development App**
   ```bash
   eas build --platform ios --profile development
   eas build --platform android --profile development
   ```

2. **Install on Physical Device**
   - iOS: Download from TestFlight or install directly
   - Android: Install APK from EAS build

3. **Test with Sandbox Accounts**
   - iOS: Create sandbox tester in App Store Connect
   - Android: Use internal testing track with test accounts

### 7.2 Testing Checklist

- [ ] App initializes RevenueCat correctly
- [ ] Offerings load successfully
- [ ] Purchase flow completes
- [ ] Premium content unlocks after purchase
- [ ] Restore purchases works
- [ ] Webhooks receive and process events
- [ ] Database updates reflect subscription status
- [ ] Subscription renewals work (accelerated in sandbox)
- [ ] Cancellation flow works

## Phase 8: Production Deployment

### 8.1 Pre-Production Checklist

- [ ] Replace API keys with production keys
- [ ] Test webhook endpoints are accessible
- [ ] Database migrations are applied
- [ ] Privacy policy updated with subscription terms
- [ ] App Store/Play Store metadata complete
- [ ] Screenshots include subscription content

### 8.2 Production Build

```bash
# Create production builds
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Phase 9: Monitoring & Analytics

### 9.1 RevenueCat Dashboard Monitoring

Monitor key metrics in RevenueCat dashboard:
- Conversion rates
- Subscription retention
- Revenue trends
- Customer lifetime value

### 9.2 Custom Analytics

Track custom events in your app:

```typescript
// Track subscription events
const trackSubscriptionEvent = (event: string, properties?: object) => {
  // Your analytics implementation
  console.log('Subscription event:', event, properties);
};

// Usage in components
const handleSubscriptionSuccess = () => {
  trackSubscriptionEvent('subscription_purchased', {
    package_type: selectedPackage.packageType,
    price: selectedPackage.product.price,
  });
};
```

## Troubleshooting

### Common Issues

1. **Products not loading**
   - Verify API keys are correct
   - Ensure products are active in stores
   - Check RevenueCat product configuration

2. **Purchase failures**
   - Test on physical devices only
   - Verify sandbox/testing setup
   - Check store account status

3. **Webhooks not working**
   - Verify endpoint URL is accessible
   - Check authorization headers
   - Monitor webhook delivery in RevenueCat dashboard

4. **Entitlements not updating**
   - Verify entitlement identifiers match
   - Check webhook processing logic
   - Ensure proper error handling

### Debug Tips

- Enable debug logging: `Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG)`
- Use RevenueCat debugger in dashboard
- Monitor webhook delivery logs
- Test restore purchases functionality

## Conclusion

This integration provides a complete subscription system with:
- Cross-platform support (iOS/Android)
- Content unlocking based on subscription status
- Webhook integration for server-side management
- Comprehensive testing approach
- Production-ready implementation

The modular architecture allows for easy customization and scaling as your app grows. The webhook integration ensures your backend stays synchronized with subscription events, enabling additional business logic and customer management features. 