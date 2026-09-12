(function() {
  const KEY = 'nora_workspace_v1_demo_fresh';
  const TODAY = '2026-09-06';

  let state = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (!state) {
    console.log('No saved state; defaults will load after reload.');
    return;
  }

  console.log('=== Before patch ===');
  console.log('projects:', state.projects?.length, '| tasks:', state.tasks?.length, '| ideas:', state.ideas?.length, '| notes:', state.notes?.length, '| timeline:', state.timelineEvents?.length, '| goals:', state.goals?.length);

  // 1. Remove 股流 ideas (idea-1, idea-3) → they belong to project, not pool
  const guruIdeas = state.ideas?.filter(i => i.id === 'idea-1' || i.id === 'idea-3');
  if (guruIdeas?.length) {
    state.ideas = state.ideas.filter(i => i.id !== 'idea-1' && i.id !== 'idea-3');
    console.log('Removed from Ideas:', guruIdeas.map(i => i.title));
  }

  // 2. Add tasks for the two 股流 ideas
  state.tasks = [
    ...(state.tasks || []),
    { id: 'task-g1', title: '盤點主流/蓄勢/乘流/靜流指標', projectId: 'guru', due: TODAY, priority: '中', done: false },
    { id: 'task-g2', title: '建立股流歷史模式庫', projectId: 'guru', due: TODAY, priority: '低', done: false }
  ];
  console.log('Added tasks: 盤點主流/蓄勢/乘流/靜流指標, 建立股流歷史模式庫');

  // 3. Mark task-1 done (今天完成了監控面板第一版)
  if (state.tasks) {
    const t1 = state.tasks.find(t => t.id === 'task-1');
    if (t1 && !t1.done) {
      t1.done = true;
      t1.completedAt = Date.now();
      console.log('✓ task-1 done:', t1.title);
    }
  }

  // 4. Guru progress 38 → 45%, next = 收齊20則決策筆記
  if (state.projects) {
    const guru = state.projects.find(p => p.id === 'guru');
    if (guru) {
      guru.progress = 45;
      guru.lastUpdated = Date.now();
      guru.next = '收齊20則決策筆記';
      console.log('Guru progress: 38→45%, next:', guru.next);
    }
  }

  // 5. Goal-1 progress → 45% (linked to guru), Goal-2 progress → 30%
  if (state.goals) {
    const g1 = state.goals.find(g => g.id === 'goal-1');
    if (g1) { g1.progress = 45; console.log('Goal-1 progress → 45%'); }
    const g2 = state.goals.find(g => g.id === 'goal-2');
    if (g2) { g2.progress = 30; console.log('Goal-2 progress → 30%'); }
  }

  // 6. Fix typo: Rader → Radar
  if (state.timelineEvents) {
    state.timelineEvents.forEach(e => {
      e.title = e.title.replace('Rader', 'Radar');
    });
    console.log('Fixed typo: Rader → Radar');
  }

  // 7. Add a note about today's milestone
  const newNote = {
    id: 'note-' + Date.now(),
    title: '今天完成：監控面板第一版',
    content: '確認了四大水流態勢（主流/蓄勢/乘流/靜流）的定義已寫入專案筆記，接下來專注收齊決策筆記。',
    tags: ['股流', '成果'],
    projectId: 'guru',
    createdAt: Date.now()
  };
  state.notes = [...(state.notes || []), newNote];
  console.log('Added note:', newNote.title);

  // 8. Add timeline milestone
  const newEvent = {
    id: 'ev-' + Date.now(),
    date: TODAY,
    type: 'milestone',
    title: '監控面板第一版確認',
    projectId: 'guru',
    color: '#e76f51'
  };
  state.timelineEvents = [...(state.timelineEvents || []), newEvent];
  console.log('Added timeline event:', newEvent.title);

  localStorage.setItem(KEY, JSON.stringify(state));
  console.log('\n✅ Patch applied! Reload the page (F5) to see changes.');
})();
