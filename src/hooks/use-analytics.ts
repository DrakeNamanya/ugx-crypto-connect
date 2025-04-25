
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Simple in-app analytics event tracking
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  userId?: string;
}

// Store events in memory for demo
const analyticsEvents: AnalyticsEvent[] = [];

export const useAnalytics = (userId?: string) => {
  const location = useLocation();
  
  // Track page views
  useEffect(() => {
    trackPageView(location.pathname, userId);
  }, [location.pathname, userId]);
  
  const trackEvent = (event: AnalyticsEvent) => {
    console.log('Analytics event:', event);
    analyticsEvents.push(event);
    
    // In a real app, you would send this to your analytics service
    // Example: sendToGoogleAnalytics(event);
  };
  
  const trackPageView = (path: string, userId?: string) => {
    trackEvent({
      action: 'page_view',
      category: 'navigation',
      label: path,
      userId
    });
  };
  
  const trackConversion = (type: string, value?: number) => {
    trackEvent({
      action: 'conversion',
      category: 'engagement',
      label: type,
      value,
      userId
    });
  };
  
  const trackError = (error: string, context?: string) => {
    trackEvent({
      action: 'error',
      category: 'technical',
      label: `${context || 'general'}: ${error}`,
      userId
    });
  };
  
  return {
    trackEvent,
    trackPageView,
    trackConversion,
    trackError
  };
};

// For debugging during development
export const getAnalyticsEvents = () => analyticsEvents;
