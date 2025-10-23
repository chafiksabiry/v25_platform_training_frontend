# API Integration Summary

## Overview
This document summarizes the integration of the Industries API and Gigs API into the training platform's onboarding wizard.

## APIs Integrated

### 1. Industries API
- **Endpoint**: `https://api-repcreationwizard.harx.ai/api/industries`
- **Purpose**: Fetch all available industries for company setup
- **Usage**: Dynamically populates the industry dropdown in the setup wizard

### 2. Gigs API  
- **Endpoint**: `https://api-gigsmanual.harx.ai/api/gigs/company/{companyId}`
- **Purpose**: Fetch available gigs for a specific company
- **Default Company ID**: `68cab073cfa9381f0ed56393`
- **Usage**: Allows users to select a gig/role during onboarding

## Files Created

### 1. OnboardingService.ts
**Location**: `src/infrastructure/services/OnboardingService.ts`

Service layer that handles all API calls for onboarding:
- `fetchIndustries()`: Retrieves all active industries
- `fetchGigsByCompany(companyId)`: Retrieves gigs for a specific company

### 2. GigSelector.tsx
**Location**: `src/components/Dashboard/GigSelector.tsx`

New component that displays available gigs in a card-based layout:
- Shows gig details (title, description, category, seniority)
- Displays compensation information
- Shows required hours and location
- Highlights selected gig
- Handles loading and error states
- Responsive grid layout

## Files Modified

### 1. types/index.ts
Added new TypeScript interfaces:
- `Industry`: Industry data structure from API
- `IndustryApiResponse`: API response wrapper
- `GigFromApi`: Gig data structure from API
- `GigApiResponse`: API response wrapper

### 2. SetupWizard.tsx
**Location**: `src/components/JourneyBuilder/SetupWizard.tsx`

Major updates:
- Added new step (Step 2: Select Your Gig) between Company Setup and Training Vision
- Replaced hardcoded industries with dynamic fetch from API
- Integrated GigSelector component
- Added loading state for industries dropdown
- Updated step validation to require gig selection
- Updated all step numbers throughout the wizard (now 5 steps instead of 4)
- Added selected gig info to the completion summary

#### New Wizard Flow:
1. **Step 1**: Company Setup (includes dynamic industry selection)
2. **Step 2**: Select Your Gig (NEW - gig selection from API)
3. **Step 3**: Training Vision
4. **Step 4**: Team & Roles
5. **Step 5**: Training Methodology

## Dependencies Added

### Axios
- **Package**: `axios`
- **Purpose**: HTTP client for making API requests
- **Installation**: `npm install axios`

## Key Features

### Dynamic Industry Loading
- Industries are fetched from API on component mount
- Only active industries are displayed
- Loading state shown while fetching
- Fallback handling for API errors

### Gig Selection
- Visual card-based selection interface
- Detailed gig information display
- Selected state highlighting
- Required field validation
- Responsive design (1-2 columns based on screen size)

### Data Flow
1. User enters company information and selects industry (from API)
2. User selects a gig from available positions (from API)
3. User defines training vision and objectives
4. User identifies target learners
5. User chooses training methodology
6. Setup complete - all selections summarized

## Configuration

### Default Company ID
The gig selector uses a default company ID for fetching gigs:
```typescript
const DEFAULT_COMPANY_ID = '68cab073cfa9381f0ed56393';
```

This can be made dynamic in future iterations to use the actual company ID from the wizard.

## API Response Handling

### Industries API
- Success: Filters active industries and populates dropdown
- Error: Logs error and shows empty dropdown

### Gigs API
- Success: Displays gigs in card grid layout
- Loading: Shows spinner with loading message
- Error: Shows error message with alert icon
- Empty: Shows message when no gigs available

## UI/UX Enhancements

### Loading States
- Industries dropdown shows loading spinner
- Gig selector shows centered loading animation

### Error Handling
- Graceful error messages for API failures
- Console logging for debugging

### Visual Indicators
- Selected gig highlighted with blue border and background
- Check icon shown for selected gig
- Status badges for gig status (Active, To Activate)
- Currency and compensation details clearly displayed

## Testing Recommendations

1. **API Connectivity**: Verify both APIs are accessible
2. **Data Loading**: Test with various network conditions
3. **Error Scenarios**: Test API failures and empty responses
4. **Selection Flow**: Test complete wizard flow with all steps
5. **Responsive Design**: Test on different screen sizes

## Future Improvements

1. Make company ID dynamic based on actual user/company
2. Add search/filter functionality for gigs
3. Add pagination for large gig lists
4. Cache API responses to reduce redundant calls
5. Add retry logic for failed API calls
6. Implement more detailed error messages
7. Add gig comparison feature
8. Store selected gig in journey/company context

## Usage

To use the updated setup wizard:

```tsx
import SetupWizard from './components/JourneyBuilder/SetupWizard';

<SetupWizard
  onComplete={(company, journey, methodology) => {
    // Handle completion
    console.log('Company:', company);
    console.log('Selected Gig:', selectedGig);
    console.log('Journey:', journey);
    console.log('Methodology:', methodology);
  }}
/>
```

## Notes

- All API calls use axios for consistent HTTP handling
- TypeScript types ensure type safety across the application
- Components follow existing project patterns and styling
- Tailwind CSS used for consistent styling
- Lucide React icons for consistent iconography

