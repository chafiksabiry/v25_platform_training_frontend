import axios from 'axios';
import { IndustryApiResponse, GigApiResponse } from '../../types';

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
   * Fetch gigs for a specific company
   * @param companyId - The company ID to fetch gigs for
   */
  async fetchGigsByCompany(companyId: string): Promise<GigApiResponse> {
    try {
      const response = await axios.get<GigApiResponse>(`${GIGS_API_URL}/${companyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching gigs for company ${companyId}:`, error);
      throw new Error('Failed to fetch gigs');
    }
  },
};

