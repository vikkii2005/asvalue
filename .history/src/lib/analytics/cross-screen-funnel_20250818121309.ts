// src/lib/analytics/cross-screen-funnel.ts
// FIXED - ESLint compliant

interface ScreenTiming {
  screen: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  events: AnalyticsEvent[];
}

interface AnalyticsEvent {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
}

interface CrossScreenSession {
  sessionId: string;
  startTime: number;
  screens: ScreenTiming[];
  userId?: string;
}

class CrossScreenFunnelTracker {
  private sessions: Map<string, CrossScreenSession> = new Map();
  
  startCrossScreenSession(): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const session: CrossScreenSession = {
      sessionId,
      startTime: Date.now(),
      screens: []
    };
    
    this.sessions.set(sessionId, session);
    console.log('📊 Cross-screen session started:', sessionId);
    return sessionId;
  }
  
  trackScreenTransition(sessionId: string, screen: string, timing: Record<string, unknown>): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    const screenTiming: ScreenTiming = {
      screen,
      startTime: Date.now(),
      events: [{
        type: 'screen_enter',
        timestamp: Date.now(),
        data: timing
      }]
    };
    
    session.screens.push(screenTiming);
    console.log('📊 Screen transition:', { sessionId, screen, timing });
  }
  
  trackUserHesitation(sessionId: string, screen: string, duration: number): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    const currentScreen = session.screens.find(s => s.screen === screen);
    if (currentScreen) {
      currentScreen.events.push({
        type: 'user_hesitation',
        timestamp: Date.now(),
        data: { duration }
      });
    }
    
    console.log('📊 User hesitation detected:', { sessionId, screen, duration });
  }
  
  correlateScreenTimings(sessionId: string): CrossScreenSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    // Calculate durations for completed screens - FIXED: prefix unused parameter
    session.screens.forEach((screen, _index) => {
      if (screen.endTime) {
        screen.duration = screen.endTime - screen.startTime;
      }
    });
    
    return session;
  }
  
  identifyFunnelBottlenecks(): Record<string, unknown> {
    const bottlenecks: Record<string, unknown> = {};
    
    this.sessions.forEach((session) => {
      session.screens.forEach((screen) => {
        if (screen.duration && screen.duration > 30000) { // >30 seconds
          bottlenecks[screen.screen] = (bottlenecks[screen.screen] as number || 0) + 1;
        }
      });
    });
    
    return bottlenecks;
  }
}

export const crossScreenTracker = new CrossScreenFunnelTracker();

export const {
  startCrossScreenSession,
  trackScreenTransition,
  trackUserHesitation,
  correlateScreenTimings,
  identifyFunnelBottlenecks
} = crossScreenTracker;