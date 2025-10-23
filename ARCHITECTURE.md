# Architecture - API Integration

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Training Platform Frontend                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Setup Wizard Component                      │   │
│  │                                                           │   │
│  │  Step 1: Company Setup                                   │   │
│  │  ┌─────────────────────────────┐                        │   │
│  │  │  - Company Name Input       │                        │   │
│  │  │  - Industry Dropdown ◄──────┼────┐                   │   │
│  │  │  - Company Size Selection   │    │                   │   │
│  │  └─────────────────────────────┘    │                   │   │
│  │                                      │                   │   │
│  │  Step 2: Gig Selection (NEW)        │                   │   │
│  │  ┌─────────────────────────────┐    │                   │   │
│  │  │  GigSelector Component ◄────┼────┼───┐               │   │
│  │  │  - Display Gig Cards        │    │   │               │   │
│  │  │  - Select Gig               │    │   │               │   │
│  │  │  - Show Details             │    │   │               │   │
│  │  └─────────────────────────────┘    │   │               │   │
│  │                                      │   │               │   │
│  │  Step 3: Training Vision             │   │               │   │
│  │  Step 4: Team & Roles                │   │               │   │
│  │  Step 5: Methodology                 │   │               │   │
│  └──────────────────────────────────────┼───┼───────────────┘   │
│                                          │   │                   │
│  ┌──────────────────────────────────────┼───┼───────────────┐   │
│  │      OnboardingService               │   │               │   │
│  │                                      │   │               │   │
│  │  fetchIndustries() ─────────────────┘   │               │   │
│  │  fetchGigsByCompany(companyId) ─────────┘               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              │ (axios HTTP requests)             │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      External APIs                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────┐  ┌─────────────────────────┐ │
│  │     Industries API           │  │      Gigs API            │ │
│  │                              │  │                          │ │
│  │  GET /api/industries         │  │  GET /api/gigs/company/  │ │
│  │                              │  │       {companyId}        │ │
│  │  Returns:                    │  │                          │ │
│  │  {                           │  │  Returns:                │ │
│  │    success: true,            │  │  {                       │ │
│  │    data: [Industry],         │  │    message: string,      │ │
│  │    message: string           │  │    data: [Gig]           │ │
│  │  }                           │  │  }                       │ │
│  └──────────────────────────────┘  └─────────────────────────┘ │
│                                                                   │
│  api-repcreationwizard.harx.ai    api-gigsmanual.harx.ai        │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
SetupWizard
├── Step 1: Company Setup
│   ├── Company Name Input
│   ├── Industry Dropdown (Dynamic from API)
│   └── Company Size Selection
│
├── Step 2: Gig Selection
│   └── GigSelector
│       ├── Loading State
│       ├── Error State
│       ├── Gig Cards Grid
│       │   ├── Gig Card (multiple)
│       │   │   ├── Title & Status
│       │   │   ├── Description
│       │   │   ├── Details (Category, Level, Hours)
│       │   │   ├── Compensation Info
│       │   │   ├── Location
│       │   │   └── Selection Indicator
│       │   └── ...
│       └── Empty State
│
├── Step 3: Training Vision
├── Step 4: Team & Roles
└── Step 5: Methodology & Complete
    └── Summary (includes selected gig)
```

## Data Flow Diagram

```
User Action                 Component               Service              API
───────────                ───────────             ─────────          ─────────
    │                          │                      │                  │
    │ Opens Wizard             │                      │                  │
    ├─────────────────────────►│                      │                  │
    │                          │                      │                  │
    │                          │ useEffect()          │                  │
    │                          ├─────────────────────►│                  │
    │                          │                      │                  │
    │                          │                      │ fetchIndustries()│
    │                          │                      ├─────────────────►│
    │                          │                      │                  │
    │                          │                      │◄─────────────────┤
    │                          │                      │ Industry Array   │
    │                          │◄─────────────────────┤                  │
    │                          │ setIndustries()      │                  │
    │                          │                      │                  │
    │ Selects Industry         │                      │                  │
    ├─────────────────────────►│                      │                  │
    │                          │ setCompany()         │                  │
    │                          │                      │                  │
    │ Clicks Continue          │                      │                  │
    ├─────────────────────────►│                      │                  │
    │                          │ Step 2: Gig Selection│                  │
    │                          │                      │                  │
    │                          │ GigSelector mounts   │                  │
    │                          ├─────────────────────►│                  │
    │                          │                      │                  │
    │                          │                      │fetchGigsByCompany│
    │                          │                      ├─────────────────►│
    │                          │                      │                  │
    │                          │                      │◄─────────────────┤
    │                          │                      │ Gig Array        │
    │                          │◄─────────────────────┤                  │
    │                          │ setGigs()            │                  │
    │                          │                      │                  │
    │ Clicks on Gig Card       │                      │                  │
    ├─────────────────────────►│                      │                  │
    │                          │ handleGigSelect()    │                  │
    │                          │ setSelectedGig()     │                  │
    │                          │                      │                  │
    │ Clicks Continue          │                      │                  │
    ├─────────────────────────►│                      │                  │
    │                          │ Next Step            │                  │
    │                          │                      │                  │
    ...                       ...                    ...                ...
```

## State Management

### SetupWizard State

```typescript
// Setup Wizard maintains:
{
  currentStep: number,              // Current wizard step (1-5)
  company: Partial<Company>,        // Company information
  journey: Partial<TrainingJourney>,// Journey details
  selectedMethodology: TrainingMethodology | null,
  
  // NEW API-related state:
  industries: Industry[],           // Fetched from API
  loadingIndustries: boolean,       // Loading state
  selectedGig: GigFromApi | null,   // Selected gig
}
```

### GigSelector State

```typescript
// GigSelector maintains:
{
  gigs: GigFromApi[],              // Fetched from API
  loading: boolean,                // Loading state
  error: string | null,            // Error message
}
```

## API Service Layer

```typescript
// OnboardingService.ts
export const OnboardingService = {
  
  // Fetch all industries
  async fetchIndustries(): Promise<IndustryApiResponse> {
    const response = await axios.get(INDUSTRIES_API_URL);
    return response.data;
  },
  
  // Fetch gigs by company
  async fetchGigsByCompany(companyId: string): Promise<GigApiResponse> {
    const response = await axios.get(`${GIGS_API_URL}/${companyId}`);
    return response.data;
  }
};
```

## Type System

```typescript
// Industry Types
interface Industry {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IndustryApiResponse {
  success: boolean;
  data: Industry[];
  pagination: any | null;
  message: string;
}

// Gig Types
interface GigFromApi {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  seniority: {
    level: string;
    yearsExperience: string;
  };
  availability: {
    minimumHours: { daily, weekly, monthly };
    schedule: any[];
    time_zone: any;
    flexibility: string[];
  };
  commission: {
    base: string;
    baseAmount: string;
    bonus: string;
    bonusAmount: string;
    currency: {
      code: string;
      name: string;
      symbol: string;
    };
    additionalDetails: string;
  };
  industries: Industry[];
  destination_zone: any;
  // ... other fields
}

interface GigApiResponse {
  message: string;
  data: GigFromApi[];
}
```

## Error Handling Strategy

```
┌──────────────────┐
│  API Call        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐      Success     ┌──────────────────┐
│  Try/Catch       ├─────────────────►│  Update State    │
└────────┬─────────┘                  │  Display Data    │
         │                             └──────────────────┘
         │ Error
         ▼
┌──────────────────┐
│  Catch Error     │
│  - Log to console│
│  - Set error msg │
│  - Show UI error │
└──────────────────┘
```

### Error Handling Levels

1. **Network Level**: Axios interceptors (if implemented)
2. **Service Level**: Try/catch in service methods
3. **Component Level**: Error state management
4. **UI Level**: User-friendly error messages

## Security Considerations

1. **CORS**: APIs must support CORS for browser requests
2. **API Keys**: No API keys exposed in frontend code
3. **Data Validation**: Validate API responses before using
4. **Error Messages**: Don't expose sensitive info in errors
5. **HTTPS**: All API calls use HTTPS

## Performance Optimizations

### Current

- APIs called only once per component mount
- Loading states prevent multiple requests
- Data filtered client-side (active industries only)

### Future Improvements

1. **Caching**: Cache API responses
   ```typescript
   const cache = new Map();
   ```

2. **Debouncing**: If adding search functionality

3. **Pagination**: For large gig lists

4. **Lazy Loading**: Load gig details on demand

5. **Retry Logic**: Automatic retry on failure
   ```typescript
   async fetchWithRetry(url, retries = 3) {
     // Implementation
   }
   ```

## Testing Strategy

### Unit Tests
```typescript
// OnboardingService.test.ts
describe('OnboardingService', () => {
  it('should fetch industries', async () => {
    // Test implementation
  });
  
  it('should fetch gigs by company', async () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
// SetupWizard.test.tsx
describe('SetupWizard', () => {
  it('should load industries on mount', async () => {
    // Test implementation
  });
  
  it('should allow gig selection', async () => {
    // Test implementation
  });
});
```

### E2E Tests
```typescript
// setupWizard.spec.ts
test('complete wizard flow with API data', async () => {
  // Navigate through all steps
  // Verify API data is loaded
  // Verify selections are saved
});
```

## Deployment Considerations

1. **Environment Variables**: Use for API URLs
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
   ```

2. **Build Optimization**: Code splitting for demo components

3. **API Availability**: Ensure APIs are accessible in production

4. **Monitoring**: Log API failures for monitoring

5. **Fallbacks**: Provide fallback data if APIs fail

## Scalability

### Current Load
- Industries API: ~14 items (lightweight)
- Gigs API: Variable (depends on company)

### Scaling Considerations
- If industries grow to 100+: Add search/filter
- If gigs grow to 100+: Add pagination
- If many companies: Optimize company lookup

## Documentation

1. **Code Comments**: Inline documentation
2. **Type Definitions**: Self-documenting types
3. **README Files**: Setup and usage guides
4. **Architecture Docs**: This document
5. **API Docs**: External API documentation (if available)

---

**Last Updated**: October 21, 2025
**Version**: 1.0.0
**Authors**: Development Team

