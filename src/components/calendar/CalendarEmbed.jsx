import React, { useEffect } from 'react';

export default function CalendarEmbed({ calLink }) {
  useEffect(() => {
    // Load the Cal.com API script
    const script = document.createElement('script');
    script.src = 'https://app.cal.com/embed/embed.js';
    script.async = true;
    script.onload = () => {
      // Initialize Cal.com
      window.Cal.init({ origin: 'https://cal.com' });
      
      // Embed the calendar
      window.Cal.inline({
        elementOrSelector: '#cal-embed-container',
        calLink: calLink || 'robertkolar/expat-savvy',
        config: {
          layout: 'month_view',
          theme: 'light',
          hideEventTypeDetails: false
        }
      });
      
      console.log('Cal.com calendar initialized with link:', calLink);
    };
    
    document.head.appendChild(script);
    
    // Cleanup on unmount
    return () => {
      document.head.removeChild(script);
    };
  }, [calLink]);

  return (
    <div 
      id="cal-embed-container" 
      style={{ 
        width: '100%', 
        height: '750px', 
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}
    />
  );
} 