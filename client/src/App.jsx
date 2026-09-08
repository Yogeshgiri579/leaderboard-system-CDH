import React, { useState, useEffect } from 'react';
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
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeframe, setTimeframe] = useState('weekly'); // 'weekly' or 'all-time'
  const [weekInfo, setWeekInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lb, st] = await Promise.all([
        fetchLeaderboard({ batch: selectedBatch, search: searchTerm, timeframe }),
        fetchCommunityStats(),
      ]);
      setUsers(lb.users || []);
      if (lb.week) setWeekInfo(lb.week);
      setStats(st.stats || null);
      if (st.stats?.batches) setBatches(st.stats.batches);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [selectedBatch, searchTerm, timeframe]);

  return (
    <div className="page-wrap">
      <Header onOpenSubmit={() => setIsSubmitOpen(true)} />

      <main className="main">
        <InstructionBanner onOpenSubmit={() => setIsSubmitOpen(true)} />
        <StatsOverview stats={stats} timeframe={timeframe} weekInfo={weekInfo} />
        <LeaderboardTable
          users={users}
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
        onSuccess={(u) => { loadData(); }}
        onViewPosts={(u) => { if (u) setSelectedUser(u); }}
      />
      <UserPostsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
}
