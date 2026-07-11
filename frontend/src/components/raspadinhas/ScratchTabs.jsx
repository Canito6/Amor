import React from 'react';

export default function ScratchTabs({
  activeTab,
  setActiveTab,
  pendingCount,
  scratchedCount,
  createdCount,
  t
}) {
  return (
    <div className="scratch-tabs-container">
      <button
        className={`scratch-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
        onClick={() => setActiveTab('pending')}
      >
        {t.scratch_tab_pending.replace('{count}', pendingCount)}
      </button>
      <button
        className={`scratch-tab-btn ${activeTab === 'scratched' ? 'active' : ''}`}
        onClick={() => setActiveTab('scratched')}
      >
        {t.scratch_tab_scratched.replace('{count}', scratchedCount)}
      </button>
      <button
        className={`scratch-tab-btn ${activeTab === 'created' ? 'active' : ''}`}
        onClick={() => setActiveTab('created')}
      >
        {t.scratch_tab_created.replace('{count}', createdCount)}
      </button>
    </div>
  );
}
