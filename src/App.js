import { SignIn, SignUp, SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';
import React, { useEffect, useState, useCallback, useMemo } from 'react'; // Added useMemo
import './App.css';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import TermsPage from './components/TermsPage';
import PrivacyPage from './components/PrivacyPage';
import PricingPage from './components/PricingPage';
import LegalDocProcessor from './components/LegalDocProcessor';
import './components/HomePage.css';
import { pdfjs } from 'react-pdf';
import { showErrorAlert, showCreditErrorAlert } from './utils/alertUtils';

// ProgressBar Component
const ProgressBar = ({ progress, status }) => {
  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="progress-status">{status}</div>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [userCredits, setUserCredits] = useState(5); // Default to 5 credits for anonymous users
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  
  const [activePage, setActivePage] = useState('home');
  
  const { isSignedIn, user } = useUser();

  // Subscription plans with page limits - memoized to prevent re-renders
  const SUBSCRIPTION_PLANS = useMemo(() => ({
    'Nano': { pages: 400, price: 249 },
    'Starter': { pages: 1000, price: 399 },
    'Professional': { pages: 2500, price: 599 },
    'Business': { pages: 5000, price: 999 }
  }), []);
  
  // Language dropdown state
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  
  // Add state for current language
  const [currentLanguage, setCurrentLanguage] = useState('English');
  
  // Language names mapping - memoized to prevent re-renders
  const languageNames = useMemo(() => ({
    'en': 'English',
    'zh-CN': '简体',
    'ja': '日本語',
    'es': 'Español',
    'pt': 'Português',
    'de': 'Deutsch',
    'it': 'Italiano',
    'fr': 'Français',
    'hi': 'हिन्दी'
  }), []);
  
  // Handle logo click to return to home page
  const handleLogoClick = () => {
    setActivePage('home');
    setActiveTab('home');
  };

 // Update user credits in Clerk and local state
const updateUserCredits = useCallback(async (credits) => {
  try {
    if (isSignedIn && user) {
      await user.update({
        unsafeMetadata: {
          ...(user.unsafeMetadata || {}),
          credits: credits,
          lastCreditReset: user.unsafeMetadata?.lastCreditReset || new Date().toISOString()
        }
      });
      
      await user.reload();
      
      const updatedCredits = user.unsafeMetadata?.credits;
      if (updatedCredits !== credits) {
        throw new Error(`Credits update verification failed. Expected: ${credits}, Got: ${updatedCredits}`);
      }
    } else {
      localStorage.setItem('anonymousCredits', credits.toString());
    }
    
    setUserCredits(credits);
    
  } catch (error) {
    console.error('Failed to update credits:', error);
    throw error;
  }
}, [isSignedIn, user, setUserCredits]);

 // Get user subscription info from Clerk
const getUserSubscriptionInfo = useCallback(() => {
  if (!isSignedIn || !user) return null;
  
  const metadata = user.unsafeMetadata || {}; 
  return {
    plan: metadata.subscriptionPlan || null,
    credits: metadata.credits || 0, 
    expiryDate: metadata.subscriptionExpiry ? new Date(metadata.subscriptionExpiry) : null,
    isActive: metadata.subscriptionExpiry ? new Date(metadata.subscriptionExpiry) > new Date() : false
  };
}, [isSignedIn, user]);

 // Check and reset credits based on subscription or daily reset
const checkAndResetCredits = useCallback(async () => {
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  if (isSignedIn && user) {
    const subscriptionInfo = getUserSubscriptionInfo(); 
    
    if (subscriptionInfo?.isActive && subscriptionInfo.plan) {
      const lastReset = user.unsafeMetadata?.lastCreditReset; 
      const lastResetTime = lastReset ? new Date(lastReset).getTime() : 0;
      
      if ((now.getTime() - lastResetTime) >= oneDay) {
        const planCredits = SUBSCRIPTION_PLANS[subscriptionInfo.plan]?.pages || 0;
        await updateUserCredits(planCredits); 
        
        await user.update({
          unsafeMetadata: { 
            ...(user.unsafeMetadata || {}), 
            lastCreditReset: now.toISOString()
          }
        });
      } else {
         setUserCredits(user.unsafeMetadata?.credits ?? SUBSCRIPTION_PLANS[subscriptionInfo.plan]?.pages ?? 0); 
      }
    } else {
      // For registered but unsubscribed users
      const lastReset = user.unsafeMetadata?.lastCreditReset; 
      const lastResetTime = lastReset ? new Date(lastReset).getTime() : 0;
      
      if ((now.getTime() - lastResetTime) >= oneDay) {
        await updateUserCredits(10); // Reset to 10 credits (will use unsafeMetadata)
        await user.update({
          unsafeMetadata: { 
            ...(user.unsafeMetadata || {}), 
            lastCreditReset: now.toISOString()
          }
        });
      } else if (typeof user.unsafeMetadata?.credits === 'number') { 
        setUserCredits(user.unsafeMetadata.credits); 
      } else {
        // Initialize new user with 10 credits if no credit info found
        await updateUserCredits(10); 
         await user.update({ 
          unsafeMetadata: { 
            ...(user.unsafeMetadata || {}), 
            credits: 10, 
            lastCreditReset: now.toISOString()
          }
        });
      }
    }
  } else {
    // Anonymous user logic remains the same (uses localStorage)
    const storedCredits = localStorage.getItem('anonymousCredits');
    const lastReset = localStorage.getItem('lastAnonymousReset');
    const lastResetTime = lastReset ? new Date(parseInt(lastReset, 10)).getTime() : 0;
    
    if ((now.getTime() - lastResetTime) >= oneDay) {
      localStorage.setItem('anonymousCredits', '5');
      localStorage.setItem('lastAnonymousReset', now.getTime().toString());
      setUserCredits(5);
    } else if (storedCredits) {
      setUserCredits(parseInt(storedCredits, 10));
    } else {
      localStorage.setItem('anonymousCredits', '5');
      localStorage.setItem('lastAnonymousReset', now.getTime().toString());
      setUserCredits(5);
    }
  }
}, [isSignedIn, user, updateUserCredits, getUserSubscriptionInfo, SUBSCRIPTION_PLANS]); // Added SUBSCRIPTION_PLANS

  // Decrement credits based on pages processed
  const decrementCredits = useCallback(async (pageCount) => {
    if (userCredits >= pageCount) {
      const newCredits = userCredits - pageCount;
      await updateUserCredits(newCredits);
      return true;
    }
    return false;
  }, [userCredits, updateUserCredits]);

  // Handle subscription success
const handleSubscriptionSuccess = useCallback(async (plan, billingCycle) => {
  if (!isSignedIn || !user) {
    return;
  }
  
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + (billingCycle === 'annual' ? 12 : 1));
  
  const planCredits = SUBSCRIPTION_PLANS[plan]?.pages || 0;
  
  try {
    await user.update({
      unsafeMetadata: {
        ...(user.unsafeMetadata || {}),
        subscriptionPlan: plan,
        subscriptionExpiry: expiryDate.toISOString(),
        credits: planCredits,
        lastCreditReset: new Date().toISOString()
      }
    });
    
    await user.reload();
    
    setUserCredits(planCredits); 
    
    window.dispatchEvent(new CustomEvent('creditsUpdated', { 
      detail: { 
        credits: planCredits, 
        plan: plan,
        isActive: true 
      } 
    }));
    
    setTimeout(async () => {
      try {
        await user.reload();
        const updatedCredits = user.unsafeMetadata?.credits;
        if (updatedCredits !== planCredits) {
          setUserCredits(updatedCredits || planCredits);
        }
      } catch (error) {
        // Handle error silently
      }
    }, 2000);
    
  } catch (error) {
    throw error;
  }
}, [isSignedIn, user, SUBSCRIPTION_PLANS, setUserCredits]);

 // Helper function to count PDF pages
    const countPdfPages = useCallback(async (pdfFile) => {
      try {
        const arrayBuffer = await pdfFile.arrayBuffer();
        
        pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        return pdf.numPages;
      } catch (error) {
        console.error('Error counting PDF pages:', error);
        showErrorAlert('It might be corrupted or an unsupported format.');
        return 0;
      }
    }, []);
  
    // Check if user has enough credits for the number of pages
    const checkCreditsForPages = useCallback(async (pdfFile) => {
      const pageCount = await countPdfPages(pdfFile);
      if (pageCount === 0 && pdfFile) { 
          return false; 
      }
      if (userCredits < pageCount) {
        showCreditErrorAlert(pageCount, userCredits);
        return false;
      }
      return pageCount;
    }, [userCredits, countPdfPages]);

  // Effect for initializing/resetting credits
  useEffect(() => {
    if (isSignedIn && user) {
      checkAndResetCredits();
    } else if (!isSignedIn) {
      checkAndResetCredits(); 
    }
  }, [isSignedIn, user, checkAndResetCredits]);

  // Effect for handling credits update events
  useEffect(() => {
    const handleCreditsUpdate = (event) => {
      const { credits } = event.detail;
      setUserCredits(credits);
      
      setTimeout(() => {
        if (isSignedIn && user) {
          checkAndResetCredits();
        }
      }, 500);
    };

    window.addEventListener('creditsUpdated', handleCreditsUpdate);
    
    return () => {
      window.removeEventListener('creditsUpdated', handleCreditsUpdate);
    };
  }, [isSignedIn, user, checkAndResetCredits]);

  // Effect for syncing user credits from Clerk metadata
  useEffect(() => {
    if (isSignedIn && user && user.unsafeMetadata?.credits !== undefined) {
      const clerkCredits = user.unsafeMetadata.credits;
      
      if (clerkCredits !== userCredits) {
        setUserCredits(clerkCredits);
      }
    }
  }, [isSignedIn, user, user?.unsafeMetadata?.credits, userCredits]);

  // Effect for setting up global functions
  useEffect(() => {
    window.checkCreditsForPages = checkCreditsForPages;
    window.decrementCredits = decrementCredits;
    window.getCurrentCredits = () => userCredits; 
    window.getUserSubscriptionInfo = getUserSubscriptionInfo;
    window.handleSubscriptionSuccess = handleSubscriptionSuccess;
    window.countPdfPages = countPdfPages;
    
    return () => {
      delete window.checkCreditsForPages;
      delete window.decrementCredits;
      delete window.getCurrentCredits;
      delete window.getUserSubscriptionInfo;
      delete window.handleSubscriptionSuccess;
      delete window.countPdfPages;
    };
  }, [checkCreditsForPages, decrementCredits, userCredits, getUserSubscriptionInfo, handleSubscriptionSuccess, countPdfPages]);

  // Handle authentication
  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };
  
  // Add an event listener for navigation events
  useEffect(() => {
    const handleNavigation = (event) => {
      if (event.detail && event.detail.page) {
        setActivePage(event.detail.page);
      }
    };
    window.addEventListener('navigate', handleNavigation);
    return () => window.removeEventListener('navigate', handleNavigation);
  }, []);

  // Make the global subscription handler available
  useEffect(() => {
    const currentHandleSubscriptionSuccess = handleSubscriptionSuccess;
    window.handleSubscriptionSuccess = currentHandleSubscriptionSuccess;
    
    return () => {
      if (window.handleSubscriptionSuccess === currentHandleSubscriptionSuccess) {
        delete window.handleSubscriptionSuccess;
      }
    };
  }, [handleSubscriptionSuccess]);

  // Helper function to toggle language dropdown
  const toggleLanguageDropdown = () => {
    setShowLanguageDropdown(!showLanguageDropdown);
  };

  // changeLanguage function
  const changeLanguage = useCallback((languageCode) => {
    setShowLanguageDropdown(false);
    setCurrentLanguage(languageNames[languageCode] || 'English');
  
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = function() {
        if (window.google && window.google.translate) { 
            new window.google.translate.TranslateElement({
            pageLanguage: 'en',
            autoDisplay: false,
            includedLanguages: 'en,zh-CN,ja,es,pt,de,it,fr,hi',
            }, 'google_translate_element');
        }
      };
    }
  
    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  
    const setGoogleTranslateCookie = (langCode) => {
      const domainParts = window.location.hostname.split('.');
      const domain = domainParts.length > 1 ? '.' + domainParts.slice(-2).join('.') : window.location.hostname;
      
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`; 
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`; 
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`; 

      const cookieValue = (langCode === 'en') ? '/en/en' : `/en/${langCode}`;
      document.cookie = `googtrans=${cookieValue}; path=/`;
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain}`; 
      }
    };
  
    setGoogleTranslateCookie(languageCode);
  
    if (languageCode === 'en') {
      if (window.location.hash && window.location.hash.startsWith('#googtrans')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } else {
      window.location.hash = `#googtrans(en|${languageCode})`;
    }
  
    setTimeout(() => {
      window.location.reload(true);
    }, 300);
  }, [languageNames]); 
  
  // useEffect for language detection
  useEffect(() => {
    const detectLanguage = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#googtrans')) {
        const match = hash.match(/\((\w{2}(?:-\w{2})?)\|(\w{2}(?:-\w{2})?)\)/);
        if (match && match[3] && languageNames[match[3]]) return languageNames[match[3]];
      }
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
      };
      const translateCookie = getCookie('googtrans');
      if (translateCookie) {
        const parts = translateCookie.split('/');
        if (parts.length >= 3 && languageNames[parts[2]]) return languageNames[parts[2]];
      }
      return 'English';
    };
    setCurrentLanguage(detectLanguage());

    if (!document.getElementById('google_translate_element')) {
      const translateDiv = document.createElement('div');
      translateDiv.id = 'google_translate_element';
      translateDiv.style.display = 'none'; 
      document.body.appendChild(translateDiv);
    }
    
    if (typeof window.googleTranslateElementInit === 'undefined') {
        window.googleTranslateElementInit = function() {
            if (window.google && window.google.translate) {
                new window.google.translate.TranslateElement({
                    pageLanguage: 'en',
                    autoDisplay: false,
                    includedLanguages: 'en,zh-CN,ja,es,pt,de,it,fr,hi',
                }, 'google_translate_element');
            }
        };
    }

    if (!document.querySelector('script[src*="//translate.google.com/translate_a/element.js"]')) {
        const script = document.createElement('script');
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
    } else {
        if (window.google && window.google.translate && !document.querySelector('.goog-te-combo')) {
            if (typeof window.googleTranslateElementInit === 'function') {
            }
        }
    }
  }, [languageNames]); 

  // Main render function
  return (
    <div className="App full-page">
      <header className="App-header">
        <div className="content-container">
          <div className="header-content">
            <div className="logo-title-container" onClick={handleLogoClick} >
              <img src={process.env.PUBLIC_URL + '/gg.png'} alt="Logo"/>
              <h1 className="app-logo">eCase<span style={{fontSize: '0.6em',fontWeight: '410'}}>.site</span></h1>
            </div>
         
            <div className="auth-buttons">
              <SignedIn>
                <div className="user-info">
                  <button 
                    className={`nav-link ${activePage === 'pricing' ? 'active' : ''}`} 
                    onClick={() => setActivePage('pricing')}
                  >
                    Pricing
                  </button>
                  <span className="credits-counter">
                    {(() => {
                      const subInfo = getUserSubscriptionInfo(); 
                      if (subInfo?.isActive && subInfo.plan) {
                        return `Credits: ${userCredits}`; 
                      } else if (isSignedIn) { 
                        return `Credits: ${userCredits}`; 
                      }
                      return `Credits: ${userCredits}`; 
                    })()}
                  </span>
                  <UserButton />
                </div>
              </SignedIn>
              
              <SignedOut>
                <button 
                  className={`nav-link ${activePage === 'pricing' ? 'active' : ''}`} 
                  onClick={() => setActivePage('pricing')}
                >
                  Pricing
                </button>
                <span className="credits-counter">Credits: {userCredits}</span>
                <button className="auth-btn signin" onClick={() => openAuthModal('signin')}>Log In</button>
                <button className="auth-btn signup" onClick={() => openAuthModal('signup')}>Sign Up</button>
              </SignedOut>
              
              <div className="language-selector">
                <button 
                  className="language-selector-button" onClick={toggleLanguageDropdown}
                  aria-expanded={showLanguageDropdown} aria-label="Select language"
                >
                  {currentLanguage} <span className="dropdown-arrow">▾</span>
                </button>
                {showLanguageDropdown && (
                  <div className="language-dropdown">
                    {Object.entries(languageNames).map(([code, name]) => (
                        <button key={code} onClick={() => changeLanguage(code)}>{name}</button>
                    ))}
                  </div>
                )}
                 <div id="google_translate_element" style={{ display: 'none' }}></div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="App-main">
        <div className="content-container">
          {activePage === 'home' && <HomePage setActiveTab={(tab) => {setActiveTab(tab); setActivePage('tool');}} />}
          {activePage === 'about' && <AboutPage />}
          {activePage === 'terms' && <TermsPage />}
          {activePage === 'privacy' && <PrivacyPage />}
          {activePage === 'pricing' && <PricingPage />}
          
          {activePage === 'tool' && (
            <LegalDocProcessor />
          )}
        </div>
      </main>
      
      <footer className="App-footer">
        <div className="content-container">
        <div className="footer-copyright">
            © {new Date().getFullYear()} Earth
          </div>
          <div className="footer-links">     
            <button className="footer-link" onClick={() => setActivePage('about')}>About</button>
            <span className="separator">|</span>
            <button className="footer-link" onClick={() => setActivePage('terms')}>Terms</button>
            <span className="separator">|</span>
            <button className="footer-link" onClick={() => setActivePage('privacy')}>Privacy</button>
          </div>
        </div>
      </footer>
      
      {showAuthModal && (
        <div className="auth-modal-overlay" onClick={closeAuthModal}>
          <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeAuthModal}>
              <i className="fas fa-times"></i>
            </button>
            {authMode === 'signin' ? <SignIn signUpUrl="/sign-up" redirectUrl={window.location.href} /> : <SignUp signInUrl="/sign-in" redirectUrl={window.location.href} />}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;