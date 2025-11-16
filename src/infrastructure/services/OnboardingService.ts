import axios from 'axios';
import Cookies from 'js-cookie';
import { IndustryApiResponse, GigApiResponse, GigFromApi } from '../../types';

const INDUSTRIES_API_URL = 'https://api-repcreationwizard.harx.ai/api/industries';
const GIGS_API_URL = 'https://api-gigsmanual.harx.ai/api/gigs/company';

export const OnboardingService = {
  /**
   * Fetch all industries from the API
   */
  async fetchIndustries(): Promise<IndustryApiResponse> {
    try {
      const response = await axios.get<IndustryApiResponse>(INDUSTRIES_API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching industries:', error);
      throw new Error('Failed to fetch industries');
    }
  },

  /**
   * Get company ID from cookies
   */
  getCompanyIdFromCookie(): string | undefined {
    return Cookies.get('companyId');
  },

  /**
   * Fetch gigs for a specific company
   * @param companyId - The company ID to fetch gigs for (optional, will use cookie if not provided)
   */
  async fetchGigsByCompany(companyId?: string): Promise<GigApiResponse> {
    try {
      // Use provided companyId or get from cookie
      const effectiveCompanyId = companyId || this.getCompanyIdFromCookie();
      
      if (!effectiveCompanyId) {
        throw new Error('No company ID provided or found in cookies');
      }

      const response = await axios.get<GigApiResponse>(`${GIGS_API_URL}/${effectiveCompanyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching gigs for company:`, error);
      throw new Error('Failed to fetch gigs');
    }
  },

  /**
   * Fetch and filter gigs by industry
   * @param industryName - The industry name to filter by
   * @param companyId - The company ID (optional, will use cookie if not provided)
   */
  async fetchGigsByIndustry(industryName: string, companyId?: string): Promise<GigApiResponse> {
    try {
      // First fetch all gigs for the company
      const response = await this.fetchGigsByCompany(companyId);
      
      // Filter gigs by industry
      const filteredGigs = response.data.filter((gig: GigFromApi) => {
        return gig.industries && gig.industries.some(
          industry => industry.name.toLowerCase() === industryName.toLowerCase()
        );
      });

      return {
        ...response,
        data: filteredGigs
      };
    } catch (error) {
      console.error(`Error fetching gigs for industry ${industryName}:`, error);
      throw new Error('Failed to fetch gigs for industry');
    }
  },
};

