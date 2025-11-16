import React, { useState, useEffect } from 'react';
import { Building2, Filter, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { OnboardingService } from '../../infrastructure/services/OnboardingService';
import { Industry, GigFromApi } from '../../types';
import Cookies from 'js-cookie';

/**
 * Demo component to showcase industry filtering functionality
 * This demonstrates how the gigs are filtered by industry
 */
export default function IndustryFilterDemo() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [allGigs, setAllGigs] = useState<GigFromApi[]>([]);
  const [filteredGigs, setFilteredGigs] = useState<GigFromApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const companyId = Cookies.get('companyId') || '68cab073cfa9381f0ed56393';

  // Fetch industries on mount
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await OnboardingService.fetchIndustries();
        if (response.success && response.data) {
          setIndustries(response.data.filter(ind => ind.isActive));
        }
      } catch (error) {
        console.error('Error fetching industries:', error);
      }
    };

    fetchIndustries();
  }, []);

  // Fetch all gigs on mount
  useEffect(() => {
    const fetchAllGigs = async () => {
      try {
        setLoading(true);
        const response = await OnboardingService.fetchGigsByCompany(companyId);
        setAllGigs(response.data || []);
      } catch (err) {
        setError('Failed to load gigs');
        console.error('Error loading gigs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllGigs();
  }, [companyId]);

  // Filter gigs when industry changes
  useEffect(() => {
    const filterGigs = async () => {
      if (selectedIndustry) {
        try {
          setLoading(true);
          setError(null);
          const response = await OnboardingService.fetchGigsByIndustry(selectedIndustry, companyId);
          setFilteredGigs(response.data || []);
        } catch (err) {
          setError('Failed to filter gigs');
          console.error('Error filtering gigs:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setFilteredGigs([]);
      }
    };

    filterGigs();
  }, [selectedIndustry, companyId]);

  const getGigIndustries = (gig: GigFromApi): string[] => {
    return gig.industries ? gig.industries.map(ind => ind.name) : [];
  };

  const isGigInSelectedIndustry = (gig: GigFromApi): boolean => {
    const gigIndustries = getGigIndustries(gig);
    return gigIndustries.some(ind => ind.toLowerCase() === selectedIndustry.toLowerCase());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔍 Industry Filter Demo
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Demonstration of gigs filtering by industry
          </p>
          <div className="flex gap-4 justify-center">
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
              <span className="font-medium">Company ID:</span> {companyId}
            </div>
            <div className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-lg">
              <span className="font-medium">Total Gigs:</span> {allGigs.length}
            </div>
            {selectedIndustry && (
              <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                <span className="font-medium">Filtered:</span> {filteredGigs.length}
              </div>
            )}
          </div>
        </div>

        {/* Industry Selector */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Select Industry to Filter</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {industries.map((industry) => (
              <button
                key={industry._id}
                onClick={() => setSelectedIndustry(industry.name)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedIndustry === industry.name
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{industry.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{industry.description}</p>
                  </div>
                  {selectedIndustry === industry.name && (
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 ml-2" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {selectedIndustry && (
            <button
              onClick={() => setSelectedIndustry('')}
              className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Comparison View */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* All Gigs */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="h-6 w-6 text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  All Gigs ({allGigs.length})
                </h2>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {allGigs.map((gig) => {
                  const inSelectedIndustry = selectedIndustry ? isGigInSelectedIndustry(gig) : false;
                  const gigIndustries = getGigIndustries(gig);

                  return (
                    <div
                      key={gig._id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedIndustry
                          ? inSelectedIndustry
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 bg-gray-50 opacity-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{gig.title}</h3>
                        {selectedIndustry && (
                          inSelectedIndustry ? (
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                          )
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{gig.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {gigIndustries.map((ind, idx) => (
                          <span
                            key={idx}
                            className={`text-xs px-2 py-1 rounded-full ${
                              selectedIndustry && ind.toLowerCase() === selectedIndustry.toLowerCase()
                                ? 'bg-green-100 text-green-800 border border-green-300 font-semibold'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                          >
                            {ind}
                          </span>
                        ))}
                        {gigIndustries.length === 0 && (
                          <span className="text-xs text-gray-400 italic">No industries</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filtered Gigs */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Filter className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Filtered Gigs ({filteredGigs.length})
                </h2>
              </div>

              {!selectedIndustry ? (
                <div className="text-center py-12">
                  <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Select an industry to see filtered results</p>
                </div>
              ) : filteredGigs.length === 0 ? (
                <div className="text-center py-12">
                  <XCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
                  <p className="text-gray-600">No gigs found for "{selectedIndustry}"</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {filteredGigs.map((gig) => {
                    const gigIndustries = getGigIndustries(gig);

                    return (
                      <div
                        key={gig._id}
                        className="p-4 rounded-xl border-2 border-green-300 bg-green-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{gig.title}</h3>
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{gig.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {gigIndustries.map((ind, idx) => (
                              <span
                                key={idx}
                                className={`text-xs px-2 py-1 rounded-full ${
                                  ind.toLowerCase() === selectedIndustry.toLowerCase()
                                    ? 'bg-green-100 text-green-800 border border-green-300 font-semibold'
                                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                                }`}
                              >
                                {ind}
                              </span>
                            ))}
                          </div>

                          {gig.commission && (
                            <div className="text-xs text-gray-600 pt-2 border-t border-gray-200">
                              <span className="font-semibold">Base:</span> {gig.commission.baseAmount} {gig.commission.currency?.symbol || gig.commission.currency?.code}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ How It Works</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Left panel</strong>: Shows ALL gigs from the company</li>
            <li>• <strong>Right panel</strong>: Shows ONLY gigs matching the selected industry</li>
            <li>• Filtering is done by checking if the gig's <code>industries</code> array contains the selected industry</li>
            <li>• The comparison is case-insensitive</li>
            <li>• Green checkmarks ✓ indicate gigs that match the filter</li>
            <li>• Red X marks indicate gigs that don't match</li>
          </ul>
        </div>

        {/* API Info */}
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-2">🔌 API Information</h3>
          <div className="text-sm text-gray-700 space-y-1 font-mono">
            <p><strong>Endpoint:</strong> https://api-gigsmanual.harx.ai/api/gigs/company/{companyId}</p>
            <p><strong>Method:</strong> GET</p>
            <p><strong>Company ID Source:</strong> Cookie 'companyId'</p>
          </div>
        </div>
      </div>
    </div>
  );
}

