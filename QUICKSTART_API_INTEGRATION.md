# Quick Start Guide - API Integration

## Overview
This guide will help you test the newly integrated Industries API and Gigs API features in the training platform.

## Prerequisites

✅ Node.js installed  
✅ npm installed  
✅ Axios package installed (already done)

## Quick Start

### 1. Install Dependencies (if not already done)

```bash
cd v25_platform_training_frontend
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

The application will be available at: `http://localhost:5173` (or the port shown in terminal)

## Testing the Integration

### Option 1: Test via Setup Wizard (Full Flow)

1. Navigate to the application
2. Go to the Setup Wizard/Onboarding flow
3. **Step 1 - Company Setup**:
   - Enter a company name
   - Select an industry from the dropdown (loaded from API)
   - Choose company size
   - Click "Continue"

4. **Step 2 - Select Your Gig** (NEW!):
   - Browse available gigs (loaded from API)
   - Click on a gig card to select it
   - Review gig details (compensation, hours, location, etc.)
   - Click "Continue"

5. Continue through remaining steps...

### Option 2: Test GigSelector Independently

To test just the GigSelector component:

1. Create a route to the demo component in your router:

```typescript
// In your routing configuration
import GigSelectorDemo from './components/Demo/GigSelectorDemo';

// Add route
<Route path="/demo/gig-selector" element={<GigSelectorDemo />} />
```

2. Navigate to: `http://localhost:5173/demo/gig-selector`

3. Interact with the gig selector and view detailed information

### Option 3: Test APIs Directly

You can test the APIs using curl or a REST client:

**Industries API:**
```bash
curl https://api-repcreationwizard.harx.ai/api/industries
```

**Gigs API:**
```bash
curl https://api-gigsmanual.harx.ai/api/gigs/company/68cab073cfa9381f0ed56393
```

## What to Look For

### Industries API Integration
- ✅ Industry dropdown shows "Loading industries..." while fetching
- ✅ Dropdown populates with industries from API
- ✅ Industries are alphabetically ordered (if implemented)
- ✅ Only active industries are shown
- ✅ No console errors

### Gigs API Integration
- ✅ Loading spinner appears while fetching gigs
- ✅ Gig cards display with proper information
- ✅ Clicking a gig highlights it (blue border)
- ✅ Selected gig shows checkmark icon
- ✅ All gig details are visible (title, category, compensation, hours, etc.)
- ✅ Industry tags display correctly
- ✅ Language requirements show
- ✅ Location flag and name display
- ✅ No console errors

## Expected API Responses

### Industries API Response Structure
```json
{
  "success": true,
  "data": [
    {
      "_id": "687cc6372c780dc1639ce1a5",
      "name": "Automotive",
      "description": "Automotive industry and related services",
      "isActive": true,
      ...
    }
  ],
  "message": "Industries retrieved successfully"
}
```

### Gigs API Response Structure
```json
{
  "message": "Gigs retrieved successfully",
  "data": [
    {
      "_id": "68cb84f84583d7cf13fb04c6",
      "title": "Health Insurance Sales",
      "description": "...",
      "category": "Outbound Sales",
      "status": "active",
      ...
    }
  ]
}
```

## Troubleshooting

### Issue: Industries not loading

**Check:**
- Network tab in browser DevTools
- Console for error messages
- API endpoint is accessible: `https://api-repcreationwizard.harx.ai/api/industries`

**Solution:**
```typescript
// Check OnboardingService.ts
// Verify the API URL is correct
```

### Issue: Gigs not loading

**Check:**
- Network tab in browser DevTools
- Console for error messages
- Company ID is correct: `68cab073cfa9381f0ed56393`
- API endpoint is accessible

**Solution:**
```typescript
// Verify in SetupWizard.tsx
const DEFAULT_COMPANY_ID = '68cab073cfa9381f0ed56393';
```

### Issue: CORS errors

**Potential Solution:**
- Check if APIs support CORS
- May need backend proxy if CORS is not enabled on APIs
- Verify network requests in browser DevTools

### Issue: TypeScript errors

**Solution:**
```bash
# Check types are correctly imported
# Verify axios is installed
npm list axios

# If missing, install
npm install axios
```

## File Locations

For debugging or modifications:

```
v25_platform_training_frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   │   └── GigSelector.tsx          # Gig selection component
│   │   ├── Demo/
│   │   │   └── GigSelectorDemo.tsx      # Demo page for testing
│   │   └── JourneyBuilder/
│   │       └── SetupWizard.tsx          # Main wizard (modified)
│   ├── infrastructure/
│   │   └── services/
│   │       └── OnboardingService.ts     # API service layer
│   └── types/
│       └── index.ts                     # Type definitions (modified)
```

## Testing Checklist

- [ ] Industries load in dropdown
- [ ] Can select an industry
- [ ] Gigs load in step 2
- [ ] Can select a gig
- [ ] Selected gig is highlighted
- [ ] Selected gig info shows in final step
- [ ] No console errors
- [ ] Loading states work properly
- [ ] Error handling works (test by using wrong company ID)
- [ ] Responsive design works on mobile
- [ ] Can complete entire wizard flow

## API Configuration

To change the company ID for gig fetching:

```typescript
// In SetupWizard.tsx
const DEFAULT_COMPANY_ID = 'YOUR_COMPANY_ID_HERE';
```

To add more API endpoints:

```typescript
// In OnboardingService.ts
export const OnboardingService = {
  // Add new methods here
  async fetchYourNewEndpoint() {
    // Implementation
  }
};
```

## Next Steps

After testing:

1. ✅ Verify all APIs are working
2. ✅ Check data is displaying correctly
3. ✅ Test error scenarios
4. 📝 Document any issues found
5. 🚀 Ready for integration testing

## Support

For issues or questions:
1. Check browser console for errors
2. Check network tab for API responses
3. Review INTEGRATION_SUMMARY.md for detailed architecture
4. Check component files for inline comments

## Additional Resources

- [Axios Documentation](https://axios-http.com/docs/intro)
- [React TypeScript](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Note**: Make sure the APIs are accessible and returning valid responses before testing. If APIs are down or have changed, you may need to update the endpoint URLs in `OnboardingService.ts`.

