import { useState, useMemo } from 'react';
import dayjs from 'dayjs';

// Define types - unified with backend API
export type MatchStatus = 'scheduled' | 'in_progress' | 'completed' | 'canceled';
export type FilterTab = 'all' | MatchStatus;

export interface FilterOptions {
  league: string | null;
  status: FilterTab;
  team: string | null;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export interface Match {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
  homeScore: number;
  awayScore: number;
  homeFG: number;
  awayFG: number;
  homeRebounds: number;
  awayRebounds: number;
  homeAssists: number;
  awayAssists: number;
  mvp: {
    id: string;
    name: string;
    image: string;
    points: number;
    assists: number;
    rebounds: number;
  };
  status: MatchStatus;
  venue: string;
  league: string;
  events?: Array<{
    id: string;
    time: string;
    teamId: string;
    type: 'goal' | 'foul' | 'substitution' | 'card' | 'timeout';
    player: string;
    description: string;
    icon?: string;
  }>;
  highlights?: string[];
}

export const useMatchFilters = (allMatches: Match[], defaultTab: FilterTab = 'all') => {
  // State for filter UI
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<FilterTab>(defaultTab);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // State for filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    league: null,
    status: defaultTab,
    team: null,
    dateRange: {
      start: null,
      end: null,
    },
  });

  // Toggle filter modal visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Handle tab change
  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    
    // Update filter options to match the selected tab
    setFilterOptions(prev => ({
      ...prev,
      status: tab,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilterOptions({
      league: null,
      status: activeTab,
      team: null,
      dateRange: {
        start: null,
        end: null,
      },
    });
    setSearchQuery('');
  };

  // Update a specific filter option
  const updateFilterOption = (
    key: keyof FilterOptions, 
    value: any
  ) => {
    setFilterOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Toggle league filter
  const toggleLeagueFilter = (league: string) => {
    setFilterOptions(prev => ({
      ...prev,
      league: prev.league === league ? null : league,
    }));
  };

  // Update team filter
  const updateTeamFilter = (team: string) => {
    setFilterOptions(prev => ({
      ...prev,
      team: team || null,
    }));
  };

  // Filter matches based on all criteria
  const filteredMatches = useMemo(() => {
    console.log('Filtering matches with status:', activeTab);
    console.log('Current matches:', allMatches.map(m => ({ id: m.id, status: m.status })));
    
    return allMatches.filter(match => {
      // Filter by tab/status
      if (activeTab !== 'all' && match.status !== activeTab) {
        return false;
      }
      
      // Filter by league
      if (filterOptions.league && match.league !== filterOptions.league) {
        return false;
      }
      
      // Filter by team
      if (filterOptions.team) {
        const teamQuery = filterOptions.team.toLowerCase();
        const homeTeam = match.homeTeam.toLowerCase();
        const awayTeam = match.awayTeam.toLowerCase();
        
        if (!homeTeam.includes(teamQuery) && !awayTeam.includes(teamQuery)) {
          return false;
        }
      }
      
      // Filter by date range
      if (filterOptions.dateRange.start) {
        const matchDate = dayjs(match.date);
        const startDate = dayjs(filterOptions.dateRange.start);
        
        if (matchDate.isBefore(startDate, 'day')) {
          return false;
        }
      }
      
      if (filterOptions.dateRange.end) {
        const matchDate = dayjs(match.date);
        const endDate = dayjs(filterOptions.dateRange.end);
        
        if (matchDate.isAfter(endDate, 'day')) {
          return false;
        }
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          match.homeTeam.toLowerCase().includes(query) ||
          match.awayTeam.toLowerCase().includes(query) ||
          match.league.toLowerCase().includes(query) ||
          match.venue.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [allMatches, activeTab, filterOptions, searchQuery]);

  return {
    // State
    showFilters,
    activeTab,
    searchQuery,
    filterOptions,
    filteredMatches,
    
    // Actions
    setSearchQuery,
    toggleFilters,
    handleTabChange,
    applyFilters,
    resetFilters,
    updateFilterOption,
    toggleLeagueFilter,
    updateTeamFilter,
  };
};