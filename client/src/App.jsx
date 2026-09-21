import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import InstructionBanner from './components/InstructionBanner';
import StatsOverview from './components/StatsOverview';
import LeaderboardTable from './components/LeaderboardTable';
import ModuleExpertGuide from './components/ModuleExpertGuide';
import UserSubmitModal from './components/UserSubmitModal';
import UserPostsModal from './components/UserPostsModal';
import { fetchLeaderboard, fetchCommunityStats } from './services/api';

export default function App() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [batches, setBatches] = useState(['All']);
  const [selectedBatch, setSelectedBatch] = useState('Batch 45');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeframe, setTimeframe] = useState('weekly'); // 'weekly' or 'all-time'
  const [weekInfo, setWeekInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // In-memory cache to enable 0ms instant tab switching between weekly and all-time
  const cacheRef = useRef(new Map());

  const loadStats = useCallback(async (batch) => {
    try {
      const st = await fetchCommunityStats(batch);
      setStats(st.stats || null);
      if (st.stats?.batches) setBatches(st.stats.batches);
      if (st.week) setWeekInfo(st.week);
    } catch (e) {
      console.error('Stats error:', e);
    }
  }, []);

  const loadLeaderboard = useCallback(async (batch, search, tf) => {
    const cacheKey = `${tf}_${batch}_${(search || '').trim().toLowerCase()}`;
    const cached = cacheRef.current.get(cacheKey);

    if (cached) {
      // Instant 0ms cache rendering!
      setUsers(cached.users);
      if (cached.week) setWeekInfo(cached.week);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const lb = await fetchLeaderboard({ batch, search, timeframe: tf });
      const data = { users: lb.users || [], week: lb.week || null };
      cacheRef.current.set(cacheKey, data);
      setUsers(data.users);
      if (data.week) setWeekInfo(data.week);
    } catch (e) {
      console.error('Leaderboard error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch community stats when selectedBatch changes
  useEffect(() => {
    loadStats(selectedBatch);
  }, [selectedBatch, loadStats]);

  // Fetch leaderboard when filters or timeframe change
  useEffect(() => {
    loadLeaderboard(selectedBatch, searchTerm, timeframe);
  }, [selectedBatch, searchTerm, timeframe, loadLeaderboard]);

  return (
    <div className="page-wrap">
      <Header onOpenSubmit={() => setIsSubmitOpen(true)} />

      <main className="main">
        <InstructionBanner onOpenSubmit={() => setIsSubmitOpen(true)} />
        <StatsOverview stats={stats} timeframe={timeframe} weekInfo={weekInfo} />
        <LeaderboardTable
          users={users}
          loading={loading}
          selectedBatch={selectedBatch}
          setSelectedBatch={setSelectedBatch}
          batches={batches}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          weekInfo={weekInfo}
          onViewUserPosts={setSelectedUser}
          onOpenSubmit={() => setIsSubmitOpen(true)}
        />
        <ModuleExpertGuide onOpenSubmit={() => setIsSubmitOpen(true)} />
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <span><strong style={{ color: '#475569' }}>CloudDevOpsHub</strong> · Mentored by Vikas Ratnawat</span>
          <span>Community Recognition &amp; Contribution Points System</span>
        </div>
      </footer>

      <UserSubmitModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        onSuccess={(u) => {
          cacheRef.current.clear();
          loadStats(selectedBatch);
          loadLeaderboard(selectedBatch, searchTerm, timeframe);
        }}
        onViewPosts={(u) => { if (u) setSelectedUser(u); }}
      />
      <UserPostsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
}
