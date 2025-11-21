import React from 'react';
import { useParams } from 'react-router-dom';
import App from '../App';

/**
 * Rep Dashboard Page
 * This component wraps the main App component and ensures it renders in rep/trainee mode
 * It can receive an optional journey ID from the URL route parameter
 */
export default function RepDashboard() {
  const { idjourneytraining } = useParams<{ idjourneytraining?: string }>();
  
  // Pass the journey ID to App component via a prop or context
  // For now, App will read it from the URL directly
  return <App journeyIdFromRoute={idjourneytraining} />;
}

