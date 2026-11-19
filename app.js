// ============================================================================
// SCHOOL MANAGEMENT ERP — CLEAN CONSOLIDATED CONTROLLER (PART 1 OF 4)
// ============================================================================

const sanitize = (str) => {
  const div = document.createElement('div');
  div.textContent = String(str ?? '');
  return div.innerHTML;
};

const defaultLogoSvg = "data:image/svg+xml;utf8,<svg xmlns='http://w3.org' viewBox='0 0 40 40'><rect width='40' height='40' rx='10' fill='%232563eb'/><path d='M20 9L8 15l12 6 12-6-12-6zm-8 9v6c0 3 3.6 5 8 5s8-2 8-5v-6l-8 4-8-4z' fill='white'/></svg>";

const STORAGE_KEY = 'schoolErpCleanV1';

const createInitialState = () => {
  const firstNames = new Array('Aarav', 'Ayesha', 'Bilal', 'Zainab', 'Hamza', 'Fatima', 'Usman', 'Hira', 'Hassan', 'Maryam', 'Ali', 'Sana', 'Omar', 'Iqra', 'Daniyal', 'Noor', 'Taha', 'Mahnoor', 'Zayd', 'Amina');
  const lastNames = new Array('Khan', 'Ahmed', 'Malik', 'Tariq', 'Siddiqui', 'Raza', 'Qureshi', 'Chaudhry', 'Sheikh', 'Abbasi', 'Butt', 'Javed', 'Farooq', 'Hussain', 'Mirza');
  const grades = new Array('Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10');
  const subjectSets = new Array(
    'Math, English, Science, Urdu, Islamiyat',
    'Physics, Chemistry, Math, English, CS',
    'Biology, Chemistry, Physics, English, Urdu',
    'Computer Sci, Math, Economics, English, Pak Studies'
  );
  const periods = new Array('present', 'present', 'present', 'past', 'future');
  const students = new Array();
  const examMarks = {};

  for (let i = 1; i <= 100; i++) {
    const fName = firstNames.at(i % firstNames.length);
    const lName = lastNames.at((i * 3) % lastNames.length);
    const id = `STU-2026-${1000 + i}`;
    const rollNo = `R-${100 + i}`;
    const gradeOnly = grades.at(i % grades.length);
    const period = periods.at(i % periods.length);
    const subjects = subjectSets.at(i % subjectSets.length);
    const isPaid = i % 4 !== 0;
    const feeAmount = 8500 + ((i % 3) * 1000);
    const dueDate = i % 6 === 0 ? '2026-10-10' : '2026-12-10';
    const feeState = isPaid ? 'Paid' : (dueDate < '2026-11-18' ? 'Overdue' : 'Due');
    const score = `${74 + (i % 25)}%`;

    students.push({
      id,
      rollNo,
      name: `${fName} ${lName}`,
      grade: `${gradeOnly} • Roll ${rollNo}`,
      gradeOnly,
      admissionDate: period === 'past' ? '2025-04-10' : period === 'future' ? '2027-04-10' : '2026-04-10',
      feeAmount,
      dueDate,
      feeState,
      feeStatus: `${feeState} (PKR ${feeAmount.toLocaleString()})`,
      subjects,
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@parent.edu`,
      score,
      period,
      photo: '',
      file: `${id}_Dossier.pdf`
    });

    const termMarks = {};
    subjects.split(',').map((s) => s.trim()).forEach((sub, idx) => {
      termMarks[sub] = 72 + ((i * 3 + idx * 7) % 27);
    });
    examMarks[id] = { 'Mid-Term Exam 2026': termMarks };
  }

  return {
    brand: { name: 'SM Info.', tagline: 'All-in-One School ERP', logo: '' },
    baseStudentCount: 100,
    financials: { monthlyRevenue: 950000, monthlyExpenses: 580000, teacherCount: 102 },
    accounts: new Array(
      { user: 'owner', pass: 'owner123', role: 'owner', fullName: 'School Owner', subjects: 'All Departments', salary: 'Owner Equity', perms: { editStudents: true, deleteRecords: true, exportCsv: true, sendEmail: true } },
      { user: 'admin', pass: 'admin123', role: 'admin', fullName: 'Principal / Admin', subjects: 'Operations', salary: 'PKR 120,000', perms: { editStudents: true, deleteRecords: true, exportCsv: true, sendEmail: true } },
      { user: 'teacher1', pass: 'teach123', role: 'teacher', fullName: 'Ms. Sara Kamran', subjects: 'English, Science, Islamiyat', salary: 'PKR 55,000', perms: { editStudents: false, deleteRecords: false, exportCsv: true, sendEmail: true } },
      { user: 'teacher2', pass: 'teach123', role: 'teacher', fullName: 'Mr. Tariq Mehmood', subjects: 'Mathematics, Math, Computer Sci, CS', salary: 'PKR 65,000', perms: { editStudents: false, deleteRecords: false, exportCsv: true, sendEmail: true } },
      { user: 'teacher3', pass: 'teach123', role: 'teacher', fullName: 'Mrs. Nadia Farooq', subjects: 'Physics, Chemistry, Biology', salary: 'PKR 78,000', perms: { editStudents: false, deleteRecords: false, exportCsv: true, sendEmail: true } }
    ),
    students,
    examMarks
  };
};

let appState = JSON.parse(localStorage.getItem(STORAGE_KEY)) || createInitialState();
let activeAccount = JSON.parse(sessionStorage.getItem('activeSchoolUser')) || null;
let currentPeriod = 'present';

const saveState = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));

const showToast = (msg) => {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
};

const getVisibleStudents = () => {
  if (activeAccount && activeAccount.role === 'teacher' && activeAccount.subjects) {
    const subs = activeAccount.subjects.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    return appState.students.filter((st) => subs.some((sb) => (st.subjects || '').toLowerCase().includes(sb)));
  }
  return appState.students;
};
// ============================================================================
// PART 2 OF 4 — BRANDING, AUTH, ROLE KPIs, 3D PHYSICS & ANALYTICS CHARTS
// ============================================================================

const applyBranding = () => {
  const nameEl = document.getElementById('schoolNameDisplay');
  const tagEl = document.getElementById('schoolTaglineDisplay');
  const logoEl = document.getElementById('schoolLogoImg');
  if (nameEl) nameEl.textContent = appState.brand.name;
  if (tagEl) tagEl.textContent = appState.brand.tagline;
  if (logoEl) logoEl.src = appState.brand.logo || defaultLogoSvg;
  document.title = `${appState.brand.name} — School Management`;
};

const renderWaveChart = (metricKey = 'earning') => {
  let box = document.getElementById('svgWaveBox');
  const canvas = document.getElementById('waveChart');
  if (!box && canvas) {
    box = document.createElement('div');
    box.id = 'svgWaveBox';
    canvas.replaceWith(box);
  }
  if (!box) return;

  const pool = getVisibleStudents();
  const totalStudents = Math.max(pool.length, 1);
  const paidStudents = pool.filter((s) => s.feeState === 'Paid').length;
  const paidRatio = Math.round((paidStudents / totalStudents) * 100);
  const liveRevK = Math.max(10, Math.round(Number(appState.financials.monthlyRevenue || 950000) / 1000));

  const configs = {
    earning: {
      title: 'Weekly Fee Collection (PKR)',
      gradStart: '#0284c7',
      gradEnd: '#10b981',
      fillStart: 'rgba(2, 132, 199, 0.32)',
      fillEnd: 'rgba(16, 185, 129, 0.04)',
      values: new Array(
        Math.round(liveRevK * 0.14),
        Math.round(liveRevK * 0.16),
        Math.round(liveRevK * 0.19),
        Math.round(liveRevK * 0.15),
        Math.round(liveRevK * 0.17),
        Math.round(liveRevK * 0.19)
      ),
      format: (v) => `PKR ${v.toLocaleString()}k`
    },
    present: {
      title: 'Live Attendance Rate (%)',
      gradStart: '#0d9488',
      gradEnd: '#06b6d4',
      fillStart: 'rgba(13, 148, 136, 0.32)',
      fillEnd: 'rgba(6, 182, 212, 0.04)',
      values: new Array(88, 91, 94, 92, 95, Math.min(99, 85 + Math.round(paidRatio / 8))),
      format: (v) => `${v}% (${Math.round((v / 100) * totalStudents)} Students)`
    },
    absent: {
      title: 'Absenteeism & Leave (%)',
      gradStart: '#f59e0b',
      gradEnd: '#ef4444',
      fillStart: 'rgba(245, 158, 11, 0.30)',
      fillEnd: 'rgba(239, 68, 68, 0.04)',
      values: new Array(12, 9, 6, 8, 5, Math.max(1, 15 - Math.round(paidRatio / 8))),
      format: (v) => `${v}% (${Math.max(1, Math.round((v / 100) * totalStudents))} Absent)`
    }
  };

  const cfg = configs[metricKey] || configs.earning;
  const maxVal = Math.max(...cfg.values, 1);
  const minVal = Math.min(...cfg.values, 0);
  const span = Math.max(maxVal - minVal, 1);
  const xCoords = new Array(28, 102, 176, 250, 324, 396);
  const points = cfg.values.map((val, idx) => {
    const x = xCoords.at(idx);
    const y = Math.round(115 - ((val - minVal) / span) * 75);
    return { x, y, val, wk: `Week ${idx + 1}` };
  });

  const polyStr = points.map((p) => `${p.x},${p.y}`).join(' ');
  const dotsHtml = points.map((p) => `
    <g class="wave-node" style="cursor:pointer;" data-tip="${p.wk}: ${cfg.format(p.val)}">
      <circle cx="${p.x}" cy="${p.y}" r="11" fill="${cfg.gradStart}" opacity="0.16" />
      <circle cx="${p.x}" cy="${p.y}" r="5.5" fill="#ffffff" stroke="${cfg.gradEnd}" stroke-width="3" />
    </g>`).join('');

  box.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; font-size:0.8rem;">
      <span class="subtitle">${cfg.title} • Live Sync (${pool.length} Students)</span>
      <strong id="waveLiveTooltip" style="color:${cfg.gradStart};">${points.at(-1).wk}: ${cfg.format(points.at(-1).val)}</strong>
    </div>
    <svg viewBox="0 0 420 155" style="width:100%; height:175px; overflow:visible;">
      <defs>
        <linearGradient id="waveStrokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${cfg.gradStart}" />
          <stop offset="100%" stop-color="${cfg.gradEnd}" />
        </linearGradient>
        <linearGradient id="waveAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${cfg.fillStart}" />
          <stop offset="100%" stop-color="${cfg.fillEnd}" />
        </linearGradient>
      </defs>
      <line x1="20" y1="40" x2="402" y2="40" stroke="rgba(148,163,184,0.18)" stroke-dasharray="4 4" />
      <line x1="20" y1="85" x2="402" y2="85" stroke="rgba(148,163,184,0.18)" stroke-dasharray="4 4" />
      <polygon points="28,132 ${polyStr} 396,132" fill="url(#waveAreaGrad)" />
      <polyline fill="none" stroke="url(#waveStrokeGrad)" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round" points="${polyStr}" />
      ${dotsHtml}
      ${points.map((p) => `<text x="${p.x - 12}" y="149" font-size="10.5" fill="#64748b">Wk${p.wk.split(' ').at(1)}</text>`).join('')}
    </svg>`;

  box.querySelectorAll('.wave-node').forEach((node) => {
    node.addEventListener('mouseenter', () => {
      const tip = document.getElementById('waveLiveTooltip');
      if (tip) tip.textContent = node.dataset.tip;
    });
  });
};

const renderDonutChart = () => {
  let box = document.getElementById('dynamicDonutBox');
  const canvas = document.getElementById('donutChart');
  if (!box && canvas) {
    box = document.createElement('div');
    box.id = 'dynamicDonutBox';
    canvas.replaceWith(box);
  }
  if (!box) return;

  const list = getVisibleStudents();
  const total = Math.max(list.length, 1);
  const male = list.filter((s, i) => (s.gender ? s.gender === 'Male' : i % 2 === 0)).length;
  const female = list.length - male;

  const paid = list.filter((s) => s.feeState === 'Paid').length;
  const unpaid = list.length - paid;

  const segments = new Array(
    { label: 'Male Students', count: male, color: '#0284c7' },
    { label: 'Female Students', count: female, color: '#8b5cf6' },
    { label: 'Fees Cleared', count: paid, color: '#10b981' },
    { label: 'Fees Due/Overdue', count: unpaid, color: '#f59e0b' }
  );

  const circumference = 276;
  let offset = 0;
  const arcsHtml = segments.map((seg) => {
    const pct = Math.round((seg.count / total) * 100);
    const dash = Math.max(4, Math.round((seg.count / (total * 2)) * circumference));
    const currentOffset = offset;
    offset += dash;
    return `<circle class="donut-seg" cx="60" cy="60" r="44" fill="none" stroke="${seg.color}" stroke-width="15"
      stroke-dasharray="${dash} ${circumference}" stroke-dashoffset="-${currentOffset}"
      style="cursor:pointer; transition:stroke-width 0.2s ease;"
      data-title="${seg.label}" data-val="${seg.count} (${pct}%)" />`;
  }).join('');

  box.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-around; gap:12px; padding-top:6px;">
      <div style="position:relative; width:142px; height:142px; display:grid; place-items:center;">
        <svg viewBox="0 0 120 120" style="width:142px; height:142px; transform:rotate(-90deg);">
          ${arcsHtml}
        </svg>
        <div style="position:absolute; text-align:center; pointer-events:none;">
          <strong id="donutCenterVal" style="font-size:1.05rem; display:block;">${list.length}</strong>
          <span id="donutCenterLbl" class="subtitle" style="font-size:0.68rem;">Total Scope</span>
        </div>
      </div>
      <div style="display:flex; flex-direction:column; gap:7px; font-size:0.82rem;">
        ${segments.map((s) => `
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="width:10px; height:10px; border-radius:50%; background:${s.color}; display:inline-block;"></span>
            <span>${s.label}: <strong>${s.count}</strong></span>
          </div>`).join('')}
      </div>
    </div>`;

  box.querySelectorAll('.donut-seg').forEach((seg) => {
    seg.addEventListener('mouseenter', () => {
      seg.setAttribute('stroke-width', '18');
      document.getElementById('donutCenterVal').textContent = seg.dataset.val;
      document.getElementById('donutCenterLbl').textContent = seg.dataset.title;
    });
    seg.addEventListener('mouseleave', () => {
      seg.setAttribute('stroke-width', '15');
      document.getElementById('donutCenterVal').textContent = String(list.length);
      document.getElementById('donutCenterLbl').textContent = 'Total Scope';
    });
  });
};

const renderSubjectBars = () => {
  const el = document.getElementById('subjectBars');
  if (!el) return;
  const palette = new Array('#2563eb', '#4f46e5', '#06b6d4', '#0284c7', '#6366f1');
  const items = (activeAccount && activeAccount.role === 'teacher' && activeAccount.subjects)
    ? activeAccount.subjects.split(',').map((s) => s.trim()).filter(Boolean).map((name, i) => ({
        name,
        pct: 78 + ((name.length * 7 + i * 5) % 21),
        color: palette.at(i % palette.length)
      }))
    : new Array(
        { name: 'Mathematics', pct: 80, color: '#2563eb' },
        { name: 'English', pct: 92, color: '#4f46e5' },
        { name: 'Physics', pct: 75, color: '#06b6d4' },
        { name: 'Computer Sci', pct: 88, color: '#0284c7' },
        { name: 'Islamiyat', pct: 96, color: '#6366f1' }
      );

  el.innerHTML = items.map((s) => `
    <div class="bar-row">
      <span class="bar-label">${sanitize(s.name)}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:${s.pct}%; background:${s.color};">${s.pct}%</div>
      </div>
    </div>`).join('');
};

const applyRoleDashboard = () => {
  const badge = document.getElementById('loggedUserBadge');
  const loginBtn = document.getElementById('openLoginModalBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const isOwner = activeAccount && activeAccount.role === 'owner';
  const isTeacher = activeAccount && activeAccount.role === 'teacher';
  const perms = (activeAccount && activeAccount.perms) || {
    feeAccess: !isTeacher,
    examAccess: true,
    searchAccess: true,
    editStudents: isOwner,
    deleteRecords: isOwner,
    exportCsv: true,
    sendEmail: true
  };

  if (badge && loginBtn && logoutBtn) {
    if (activeAccount) {
      badge.textContent = `${activeAccount.role.toUpperCase()}: ${activeAccount.fullName}`;
      loginBtn.classList.add('hidden');
      logoutBtn.classList.remove('hidden');
    } else {
      badge.textContent = 'Guest (Preview)';
      loginBtn.classList.remove('hidden');
      logoutBtn.classList.add('hidden');
    }
  }

  const earningPill = document.querySelector('.m-pill[data-metric="earning"]');
  const presentPill = document.querySelector('.m-pill[data-metric="present"]');
  if (earningPill) {
    earningPill.style.display = isTeacher ? 'none' : '';
    if (isTeacher && earningPill.classList.contains('active') && presentPill) {
      document.querySelectorAll('.m-pill').forEach((p) => p.classList.remove('active'));
      presentPill.classList.add('active');
      renderWaveChart('present');
    }
  }

  const feeNavBtn = document.querySelector('.nav-item[data-view="fees-view"]');
  const permNavBtn = document.getElementById('navPermissionsBtn');
  const examNavBtn = document.querySelector('.nav-item[data-view="exams-view"]');
  const searchNavBtn = document.querySelector('.nav-item[data-view="search-dir"]');
  const csvBtn = document.getElementById('exportCsvBtn');
  const emailBtn = document.getElementById('sendEmailBtn');

  if (feeNavBtn) feeNavBtn.style.display = (!isTeacher && (isOwner || perms.feeAccess !== false)) ? '' : 'none';
  if (permNavBtn) permNavBtn.style.display = isOwner ? '' : 'none';
  if (examNavBtn) examNavBtn.style.display = (isOwner || perms.examAccess !== false) ? '' : 'none';
  if (searchNavBtn) searchNavBtn.style.display = (isOwner || perms.searchAccess !== false) ? '' : 'none';
  if (csvBtn) csvBtn.style.display = (isOwner || perms.exportCsv !== false) ? '' : 'none';
  if (emailBtn) emailBtn.style.display = (isOwner || perms.sendEmail !== false) ? '' : 'none';


    const rev = Number(appState.financials.monthlyRevenue || 0);
  const exp = Number(appState.financials.monthlyExpenses || 0);
  const visible = getVisibleStudents();
  const kpi4Card = document.getElementById('kpiCard4');

  if (isOwner) {
    if (kpi4Card) kpi4Card.style.display = '';
    document.getElementById('kpi1Value').textContent = `PKR ${rev.toLocaleString()}`;
    document.getElementById('kpi1Label').textContent = 'Gross Revenue';
    document.getElementById('kpi2Value').textContent = `PKR ${exp.toLocaleString()}`;
    document.getElementById('kpi2Label').textContent = 'Expenses';
    document.getElementById('kpi3Value').textContent = `PKR ${(rev - exp).toLocaleString()}`;
    document.getElementById('kpi3Label').textContent = 'Net Profit';
    document.getElementById('kpi4Value').textContent = `${appState.baseStudentCount} / ${appState.financials.teacherCount}`;
    document.getElementById('kpi4Label').textContent = 'Total Students & Staff';
  } else if (isTeacher) {
    if (kpi4Card) kpi4Card.style.display = 'none';
    document.getElementById('kpi1Value').textContent = String(visible.length);
    document.getElementById('kpi1Label').textContent = 'My Subject Students';
    document.getElementById('kpi2Value').textContent = activeAccount.subjects;
    document.getElementById('kpi2Label').textContent = 'Assigned Subjects';
    document.getElementById('kpi3Value').textContent = activeAccount.salary;
    document.getElementById('kpi3Label').textContent = 'Monthly Salary';
  } else {
    if (kpi4Card) kpi4Card.style.display = 'none';
    document.getElementById('kpi1Value').textContent = String(appState.baseStudentCount);
    document.getElementById('kpi1Label').textContent = 'Total Enrolled Students';
    document.getElementById('kpi2Value').textContent = String(appState.financials.teacherCount);
    document.getElementById('kpi2Label').textContent = 'Total Staff';
    document.getElementById('kpi3Value').textContent = '94.8%';
    document.getElementById('kpi3Label').textContent = 'Overall Attendance';
  }

  renderDonutChart();
  renderSubjectBars();
  if (typeof renderStudentList === 'function') renderStudentList();
  if (typeof switchView === 'function') switchView(document.querySelector('.nav-item.active')?.dataset.view || 'dashboard');

};
// ============================================================================
// PART 3A — STUDENT VAULT LIST & DIRECTORY SEARCH
// ============================================================================

const renderStudentList = (queryText = '') => {
  const list = document.getElementById('studentList');
  if (!list) return;
  list.style.maxHeight = '420px';
  list.style.overflowY = 'auto';

  const isOwner = activeAccount && activeAccount.role === 'owner';
  const perms = (activeAccount && activeAccount.perms) || {};
  const canEdit = isOwner || Boolean(perms.editStudents);
  const canDelete = isOwner || Boolean(perms.deleteRecords);

  const q = queryText.trim().toLowerCase();
  const filtered = getVisibleStudents().filter((s) => {
    const matchPeriod = q ? true : s.period === currentPeriod;
    const hay = `${s.id || ''} ${s.rollNo || ''} ${s.name} ${s.grade || ''} ${s.subjects || ''}`.toLowerCase();
    return matchPeriod && hay.includes(q);
  });

  list.innerHTML = filtered.slice(0, 60).map((s) => `
    <div class="student-item" style="flex-direction:column; align-items:flex-start; gap:6px;">
      <div style="display:flex; justify-content:space-between; width:100%; align-items:center; gap:8px;">
        <div class="student-meta">
          ${s.photo
            ? `<img src="${s.photo}" class="avatar-thumb" alt="Photo" />`
            : `<div class="avatar-thumb">${sanitize(s.name.charAt(0).toUpperCase())}</div>`}
          <div>
            <strong>${sanitize(s.name)}</strong> <span class="edit-badge">(${sanitize(s.id)})</span>
            <div class="subtitle">${sanitize(s.grade || '')} • ${sanitize(s.feeStatus || '')}</div>
          </div>
        </div>
        <div style="display:flex; gap:6px;">
          ${canEdit ? `<button class="mini-btn" type="button" data-edit-stu="${sanitize(s.id)}">✎ Edit</button>` : ''}
          ${canDelete ? `<button class="mini-btn" type="button" style="color:#ef4444;" data-del-stu="${sanitize(s.id)}">🗑</button>` : ''}
        </div>
      </div>
      <div class="subtitle" style="font-size:0.78rem; padding-left:50px;">
        📚 <strong>Subjects:</strong> ${sanitize(s.subjects || '')} • 📊 <strong>Avg:</strong> ${sanitize(s.score)}
      </div>
    </div>`).join('') || '<p class="subtitle">No student records matched this filter.</p>';
};

const openFullRecordCard = (studentId) => {
  const cardBox = document.getElementById('fullRecordCard');
  const stu = getVisibleStudents().find((s) => (s.id || '').toLowerCase() === String(studentId).toLowerCase());
  if (!cardBox || !stu) return;

  const parentName = stu.parentName || `Mr. ${stu.name.split(' ').at(1) || 'Tariq'} Ahmed`;
  const address = stu.address || 'House 14, Street 8, Sector F-10/3, Islamabad';
  const marksMap = (appState.examMarks[stu.id] && appState.examMarks[stu.id]['Mid-Term Exam 2026']) || {};
  const palette = new Array('#0284c7', '#0ea5e9', '#0d9488', '#6366f1', '#2563eb');
  const subs = (stu.subjects || 'Mathematics, English, Science').split(',').map((s) => s.trim()).filter(Boolean);

  const individualBars = subs.map((sub, i) => {
    const pct = Number(marksMap[sub]) || (78 + ((sub.length * 5 + i * 7) % 20));
    return `
      <div class="bar-row">
        <span class="bar-label">${sanitize(sub)}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%; background:${palette.at(i % palette.length)};">${pct}%</div>
        </div>
      </div>`;
  }).join('');

  cardBox.classList.remove('hidden');
  cardBox.innerHTML = `
    <div class="panel-header" style="border-bottom:2px solid var(--border-glass); padding-bottom:14px;">
      <div style="display:flex; align-items:center; gap:14px;">
        ${stu.photo
          ? `<img src="${stu.photo}" style="width:64px; height:64px; border-radius:14px; object-fit:cover;" alt="Photo" />`
          : `<div style="width:64px; height:64px; border-radius:14px; background:linear-gradient(135deg,#0284c7,#0ea5e9); color:#fff; display:grid; place-items:center; font-size:1.6rem; font-weight:700;">${sanitize(stu.name.charAt(0).toUpperCase())}</div>`}
        <div>
          <span class="badge-secure">${sanitize(appState.brand.name)} • Official Student Record</span>
          <h2 style="margin-top:4px;">${sanitize(stu.name)}</h2>
          <p class="subtitle">Student ID: <strong>${sanitize(stu.id)}</strong> • Roll No: <strong>${sanitize(stu.rollNo || '')}</strong></p>
        </div>
      </div>
      <div class="no-print" style="display:flex; gap:8px;">
        <button class="btn-primary" type="button" data-action="print">🖨 Print</button>
        <button class="btn-secondary" type="button" data-action="print">📄 Save as PDF</button>
        <button class="mini-btn" type="button" data-action="close-panel">✕</button>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:10px; margin-top:14px; font-size:0.88rem;">
      <div class="student-item" style="flex-direction:column; align-items:flex-start;"><span class="subtitle">Parent / Guardian Name</span><strong>${sanitize(parentName)}</strong></div>
      <div class="student-item" style="flex-direction:column; align-items:flex-start;"><span class="subtitle">Parent Email</span><strong>${sanitize(stu.email)}</strong></div>
      <div class="student-item" style="flex-direction:column; align-items:flex-start;"><span class="subtitle">Home Address</span><strong>${sanitize(address)}</strong></div>
      <div class="student-item" style="flex-direction:column; align-items:flex-start;"><span class="subtitle">Grade & Session</span><strong>${sanitize(stu.gradeOnly || stu.grade)} (${sanitize(stu.period.toUpperCase())})</strong></div>
      <div class="student-item" style="flex-direction:column; align-items:flex-start;"><span class="subtitle">Enrollment Date</span><strong>${sanitize(stu.admissionDate)}</strong></div>
      <div class="student-item" style="flex-direction:column; align-items:flex-start;"><span class="subtitle">Academic Avg & Fee</span><strong>${sanitize(stu.score)} • ${sanitize(stu.feeStatus)}</strong></div>
    </div>

    <div style="margin-top:16px; padding-top:14px; border-top:1px solid var(--border-glass);">
      <h4 style="margin-bottom:10px;">📊 Individual Subject Task & Academic Completion</h4>
      <div class="bars-container">${individualBars}</div>
    </div>`;
  cardBox.scrollIntoView({ behavior: 'smooth' });
};


const runDirectorySearch = () => {
  const input = document.getElementById('dirSearchInput');
  const list = document.getElementById('dirResultsList');
  const title = document.getElementById('dirResultsTitle');
  const cardBox = document.getElementById('fullRecordCard');
  if (!list) return;

  const pool = getVisibleStudents();
  const q = input ? input.value.trim().toLowerCase() : '';
  const exact = q ? pool.find((s) => (s.id || '').toLowerCase() === q) : null;
  const rows = exact ? new Array(exact) : (q ? pool.filter((s) => s.name.toLowerCase().includes(q)) : pool);

  if (exact) openFullRecordCard(exact.id);
  else if (cardBox) cardBox.classList.add('hidden');

  if (title) title.textContent = q ? `Found ${rows.length} Matching Student(s)` : `Enrolled Students (${rows.length})`;
  list.innerHTML = rows.slice(0, 60).map((s) => `
    <div class="student-item">
      <div class="student-meta">
        <div class="avatar-thumb">${sanitize(s.name.charAt(0).toUpperCase())}</div>
        <div>
          <strong>${sanitize(s.name)}</strong> <span class="edit-badge">• ${sanitize(s.id)}</span>
          <div class="subtitle">${sanitize(s.grade)} • ${sanitize(s.feeStatus)}</div>
        </div>
      </div>
      <button class="btn-primary" type="button" data-view-record="${sanitize(s.id)}">View Full Record</button>
    </div>`).join('') || '<p class="subtitle">No enrolled students matched that Name or Student ID.</p>';
};
// ============================================================================
// PART 3B — REPORT CARD & EXAM ADMIT CARD RENDERER
// ============================================================================

const renderReportCard = (studentId, termName, isAdmitCard = false) => {
  const box = document.getElementById('studentReportCardBox');
  const stu = getVisibleStudents().find((s) => s.id === studentId);
  if (!box || !stu) return showToast('⚠️ Select a valid student first.');

  const term = termName || document.getElementById('examTermSelect').value;
  box.classList.remove('hidden');

  if (isAdmitCard) {
    const subs = (stu.subjects || '').split(',').map((s) => s.trim()).filter(Boolean);
    const sched = subs.map((sub, i) => `
      <tr style="border-bottom:1px solid var(--border-glass);">
        <td style="padding:8px; font-weight:600;">${sanitize(sub)}</td>
        <td style="padding:8px; text-align:center;">2026-12-${String(10 + i).padStart(2, '0')}</td>
        <td style="padding:8px; text-align:center;">09:00 AM – 12:00 PM</td>
        <td style="padding:8px; text-align:right;">Hall-${(i % 4) + 1}</td>
      </tr>`).join('');

    box.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid var(--border-glass); padding-bottom:12px;">
        <div>
          <h2>${sanitize(appState.brand.name)} — 🪪 Exam Admit Card</h2>
          <p class="subtitle">${sanitize(term)} • ${sanitize(stu.name)} (${sanitize(stu.id)} • ${sanitize(stu.rollNo)})</p>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn-primary" type="button" data-action="print">🖨 Print</button>
          <button class="mini-btn" type="button" data-action="close-panel">✕</button>
        </div>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:0.88rem; margin-top:12px;">
        <thead>
          <tr style="background:rgba(59,130,246,0.12); text-align:left;">
            <th style="padding:8px;">Subject</th>
            <th style="padding:8px; text-align:center;">Date</th>
            <th style="padding:8px; text-align:center;">Time</th>
            <th style="padding:8px; text-align:right;">Room</th>
          </tr>
        </thead>
        <tbody>${sched}</tbody>
      </table>`;
    return;
  }

  const stuTerms = appState.examMarks[studentId] || {};
  const marksMap = stuTerms[term] || stuTerms['Mid-Term Exam 2026'] || {};
  const entries = Object.entries(marksMap);
  const obtained = entries.reduce((sum, p) => sum + Number(p.at(1) || 0), 0);
  const maxTotal = Math.max(entries.length * 100, 100);
  const pct = entries.length ? Math.round((obtained / maxTotal) * 100) : 0;
  const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F';

  const rowsHtml = entries.map((p) => `
    <tr style="border-bottom:1px solid var(--border-glass);">
      <td style="padding:8px; font-weight:600;">${sanitize(p.at(0))}</td>
      <td style="padding:8px; text-align:center;">100</td>
      <td style="padding:8px; text-align:center; font-weight:700;">${p.at(1)}</td>
      <td style="padding:8px; text-align:right; color:${p.at(1) >= 50 ? '#10b981' : '#ef4444'};">${p.at(1) >= 50 ? 'PASS' : 'FAIL'}</td>
    </tr>`).join('');

  box.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid var(--border-glass); padding-bottom:12px;">
      <div>
        <h2>${sanitize(appState.brand.name)} — Official Report Card</h2>
        <p class="subtitle">${sanitize(term)} • ${sanitize(stu.name)} (${sanitize(stu.id)}) • ${sanitize(stu.gradeOnly)}</p>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn-primary" type="button" data-action="print">🖨 Print</button>
        <button class="mini-btn" type="button" data-action="close-panel">✕</button>
      </div>
    </div>
    <table style="width:100%; border-collapse:collapse; font-size:0.9rem; margin-top:12px;">
      <thead>
        <tr style="background:rgba(59,130,246,0.12); text-align:left;">
          <th style="padding:8px;">Subject</th>
          <th style="padding:8px; text-align:center;">Max</th>
          <th style="padding:8px; text-align:center;">Obtained</th>
          <th style="padding:8px; text-align:right;">Status</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <div style="display:flex; justify-content:space-between; margin-top:14px; padding:12px; border-radius:12px; background:rgba(59,130,246,0.1); font-weight:700;">
      <span>Total: ${obtained} / ${maxTotal}</span>
      <span>Percentage: ${pct}%</span>
      <span>Grade: ${grade}</span>
      <span style="color:${pct >= 50 ? '#10b981' : '#ef4444'};">${pct >= 50 ? '✔ PROMOTED' : '✖ DETAINED'}</span>
    </div>`;
};
// ============================================================================
// PART 4A — 10,000-STUDENT FEE AUTOMATION & AUTO-OVERDUE ENGINE
// ============================================================================

const initFeeAutomation = () => {
  const feesSec = document.getElementById('feesView');
  if (!feesSec) return;

  const topPanel = feesSec.querySelector('.panel');
  if (topPanel && !document.getElementById('fastFeeScanInput')) {
    topPanel.innerHTML = `
      <div class="panel-header">
        <h3>⚡ Automated Fee Collection & Ledger</h3>
        <span class="badge-secure">10,000+ Students Ready</span>
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <input type="text" id="fastFeeScanInput" class="pill-select" style="flex:2; min-width:210px;" placeholder="⚡ Scan/Type Student ID (STU-2026-1003) or Roll No & press Enter..." />
        <select id="feeStatusFilterSel" class="pill-select">
          <option value="all">Filter: All Students</option>
          <option value="Paid">🟢 Paid Only</option>
          <option value="Due">🟡 Due Only</option>
          <option value="Overdue">🔴 Overdue Only</option>
        </select>
        <button id="fastPaySubmitBtn" class="btn-primary" type="button">✔ Mark Paid</button>
        <label class="btn-secondary" style="cursor:pointer; display:inline-flex; align-items:center;">
          📤 CSV Import
          <input type="file" id="bulkFeeCsvInput" accept=".csv" style="display:none;" />
        </label>
        <button id="printLedgerBtn" class="btn-secondary" type="button" data-action="print">🖨 Print</button>
      </div>`;
  }

  let statusFilter = 'all';
  let queryStr = '';

  const showReceiptCard = (stu, method) => {
    const box = document.getElementById('feeReceiptBox');
    if (!box || !stu) return;
    const isPaid = stu.feeState === 'Paid';
    const paidDateText = isPaid ? (stu.paidDate || new Date().toISOString().split('T').at(0)) : 'Not Paid Yet';
    const statusColor = isPaid ? '#0d9488' : stu.feeState === 'Overdue' ? '#ef4444' : '#f59e0b';

    box.classList.remove('hidden');
    box.innerHTML = `
      <div class="panel-header" style="border-bottom:2px solid var(--border-glass); padding-bottom:12px;">
        <div>
          <span class="badge-secure">${sanitize(appState.brand.name)} • Official Fee Voucher</span>
          <h3 style="margin-top:4px;">Student Fee Receipt & Status Statement</h3>
        </div>
        <div class="no-print" style="display:flex; gap:8px;">
          <button class="btn-primary" type="button" data-action="print">🖨 Print</button>
          <button class="btn-secondary" type="button" data-action="print">📄 Save as PDF</button>
          <button class="mini-btn" type="button" data-action="close-panel">✕</button>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px; margin-top:12px; font-size:0.88rem;">
        <div class="student-item" style="flex-direction:column; align-items:flex-start;"><span class="subtitle">Student Name</span><strong>${sanitize(stu.name)}</strong></div>
        <div class="student-item" style="flex-direction:column; align-items:flex-start;"><span class="subtitle">Student ID & Roll No</span><strong>${sanitize(stu.id)} • ${sanitize(stu.rollNo || '')}</strong></div>
        <div class="student-item" style="flex-direction:column; align-items:flex-start;"><span class="subtitle">Fee Amount</span><strong>PKR ${Number(stu.feeAmount || 8500).toLocaleString()}</strong></div>
        <div class="student-item" style="flex-direction:column; align-items:flex-start;"><span class="subtitle">Due Date</span><strong>${sanitize(stu.dueDate || '2026-12-10')}</strong></div>
        <div class="student-item" style="flex-direction:column; align-items:flex-start;"><span class="subtitle">${isPaid ? 'Paid Date & Method' : 'Current Status'}</span><strong style="color:${statusColor};">${isPaid ? `${paidDateText} (${sanitize(method || 'Counter')})` : stu.feeState.toUpperCase()}</strong></div>
      </div>`;
    box.scrollIntoView({ behavior: 'smooth' });
  };

  const renderLedger = () => {
    const list = document.getElementById('feeLedgerList');
    const title = document.getElementById('feeLedgerTitle');
    if (!list) return;

    const todayISO = new Date().toISOString().split('T').at(0);
    appState.students.forEach((s) => {
      if (!s.feeAmount) s.feeAmount = 8500;
      if (!s.dueDate) s.dueDate = '2026-12-10';
      if (!s.feeState) s.feeState = (s.feeStatus || '').toLowerCase().includes('pending') ? 'Due' : 'Paid';
      if (s.feeState !== 'Paid' && s.dueDate < todayISO) s.feeState = 'Overdue';
    });

    const q = queryStr.trim().toLowerCase();
    const filtered = appState.students.filter((s) => {
      const matchStatus = statusFilter === 'all' ? true : s.feeState === statusFilter;
      const matchText = !q || `${s.id || ''} ${s.rollNo || ''} ${s.name}`.toLowerCase().includes(q);
      return matchStatus && matchText;
    });

    const overdueCount = appState.students.filter((s) => s.feeState === 'Overdue').length;
    const dueCount = appState.students.filter((s) => s.feeState === 'Due').length;
    if (title) title.textContent = `Fee Ledger (${filtered.length} Shown) • 🔴 ${overdueCount} Overdue • 🟡 ${dueCount} Due`;

    list.innerHTML = filtered.slice(0, 50).map((s) => {
      const color = s.feeState === 'Paid' ? '#0d9488' : s.feeState === 'Overdue' ? '#ef4444' : '#f59e0b';
      const icon = s.feeState === 'Paid' ? '🟢' : s.feeState === 'Overdue' ? '🔴' : '🟡';
      return `
        <div class="student-item">
          <div class="student-meta">
            <div class="avatar-thumb">${sanitize(s.name.charAt(0).toUpperCase())}</div>
            <div>
              <strong>${sanitize(s.name)}</strong> <span class="edit-badge">(${sanitize(s.id)} • ${sanitize(s.rollNo || '')})</span>
              <div class="subtitle">${sanitize(s.gradeOnly || '')} • PKR ${Number(s.feeAmount).toLocaleString()} • Due: ${sanitize(s.dueDate)}</div>
            </div>
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <span style="font-weight:700; font-size:0.8rem; color:${color};">${icon} ${s.feeState.toUpperCase()}</span>
            ${s.feeState !== 'Paid' ? `<button class="btn-primary" type="button" data-quickpay="${sanitize(s.id)}">✔ Mark Paid</button>` : ''}
            <button class="mini-btn" type="button" data-receipt="${sanitize(s.id)}">🧾 Receipt</button>
          </div>
        </div>`;
    }).join('') || '<p class="subtitle">No matching fee records found.</p>';
  };

  const markPaid = (idOrRoll) => {
    if (!activeAccount || (activeAccount.role !== 'owner' && activeAccount.role !== 'admin')) {
      return showToast('🔒 Login as Admin or Owner to record fee payments.');
    }
    const q = String(idOrRoll || '').trim().toLowerCase();
    const stu = appState.students.find((s) => (s.id || '').toLowerCase() === q || (s.rollNo || '').toLowerCase() === q);
    if (!stu) return showToast(`⚠️ Student ID or Roll No not found: ${idOrRoll}`);

    const amt = Number(stu.feeAmount) || 8500;
    stu.feeState = 'Paid';
    stu.paidDate = new Date().toISOString().split('T').at(0);
    stu.feeStatus = `Paid (PKR ${amt.toLocaleString()})`;
    appState.financials.monthlyRevenue = Number(appState.financials.monthlyRevenue || 0) + amt;
    saveState();
    renderLedger();
    applyRoleDashboard();
    showReceiptCard(stu, 'Counter / Verified');
    showToast(`✅ Paid: ${stu.name} (PKR ${amt.toLocaleString()})`);
  };

  const scan = document.getElementById('fastFeeScanInput');
  const filterSel = document.getElementById('feeStatusFilterSel');
  if (scan) {
    scan.oninput = () => { queryStr = scan.value; renderLedger(); };
    scan.onkeydown = (ev) => {
      if (ev.key === 'Enter' && scan.value.trim()) {
        markPaid(scan.value.trim());
        scan.value = '';
        queryStr = '';
      }
    };
  }
  if (filterSel) filterSel.onchange = () => { statusFilter = filterSel.value; renderLedger(); };
  document.getElementById('fastPaySubmitBtn').onclick = () => {
    if (!scan.value.trim()) return showToast('Enter a Student ID or Roll No first.');
    markPaid(scan.value.trim());
    scan.value = '';
    queryStr = '';
  };

  document.getElementById('bulkFeeCsvInput').onchange = (ev) => {
    const file = ev.target.files.item(0);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (r) => {
      let count = 0;
      r.target.result.split('\n').forEach((line) => {
        const token = line.split(',').at(0).trim().toLowerCase();
        const stu = appState.students.find((s) => (s.id || '').toLowerCase() === token || (s.rollNo || '').toLowerCase() === token);
        if (stu && stu.feeState !== 'Paid') {
          stu.feeState = 'Paid';
          stu.paidDate = new Date().toISOString().split('T').at(0);
          stu.feeStatus = `Paid (PKR ${Number(stu.feeAmount || 8500).toLocaleString()})`;
          count += 1;
        }
      });
      saveState();
      renderLedger();
      showToast(`✅ Bulk CSV Import: Marked ${count} student(s) PAID!`);
    };
    reader.readAsText(file);
  };

  feesSec.onclick = (ev) => {
    const payBtn = ev.target.closest('button[data-quickpay]');
    if (payBtn) markPaid(payBtn.dataset.quickpay);
    const recBtn = ev.target.closest('button[data-receipt]');
    if (recBtn) {
      const stu = appState.students.find((s) => s.id === recBtn.dataset.receipt);
      if (stu) showReceiptCard(stu, 'Verified Record');
    }
  };

  renderLedger();
};

// ============================================================================
// PART 4B-1 — NAVIGATION ROUTING & GLOBAL CLICK DELEGATION
// ============================================================================

const switchView = (view) => {
  if (view === 'fees-view' && activeAccount && activeAccount.role === 'teacher') {
    showToast('🔒 Access Denied: Teachers do not have permission to view Fee Management.');
    return switchView('dashboard');
  }

  document.querySelectorAll('.nav-item[data-view]').forEach((n) => {
    n.classList.toggle('active', n.dataset.view === view);
  });

  const titles = {
    'dashboard': 'Dashboard',
    'search-dir': 'Student Directory & Lookup',
    'exams-view': 'Exams, Marks & Report Cards',
    'fees-view': 'Automated Fee Collection & Billing',
    'students': 'Students & Document Vault',
    'courses': 'Courses & Subject Tasks',
    'records': 'Past, Present & Future Records'
  };
  const titleEl = document.getElementById('pageTitle');
  if (titleEl && titles[view]) titleEl.textContent = titles[view];

  const kpiSec = document.querySelector('.kpi-grid');
  const chartSec = document.querySelector('.charts-grid');
  const bottomSec = document.querySelector('.bottom-grid');
  const searchSec = document.getElementById('searchDirView');
  const examsSec = document.getElementById('examsView');
  const feesSec = document.getElementById('feesView');
  const permSec = document.getElementById('permissionsView');

  new Array(kpiSec, chartSec, bottomSec, searchSec, examsSec, feesSec, permSec).forEach((el) => {
    if (el) el.style.display = 'none';
  });

  // 1. Show "+ New Admission" ONLY on main Dashboard
  const admBtn = document.getElementById('openAdmissionBtn');
  if (admBtn) admBtn.style.display = (view === 'dashboard') ? '' : 'none';

  // 2. Show "Subject Task Completion" ONLY on Dashboard & Courses
  const subjectPanel = document.getElementById('subjectBars')?.closest('.panel');
  const isTeacher = activeAccount && activeAccount.role === 'teacher';
  const showClassSubjects = (view === 'dashboard' && isTeacher);
  if (subjectPanel) subjectPanel.style.display = showClassSubjects ? '' : 'none';
  if (bottomSec) bottomSec.style.gridTemplateColumns = showClassSubjects ? '' : '1fr';

  if (view === 'dashboard') {
    if (kpiSec) kpiSec.style.display = '';
    if (chartSec) chartSec.style.display = '';
    if (bottomSec) bottomSec.style.display = '';
  } else if (view === 'students') {
    if (bottomSec) bottomSec.style.display = '';
  } else if (view === 'courses') {
    if (chartSec) chartSec.style.display = '';
    if (bottomSec) bottomSec.style.display = '';
  } else if (view === 'records') {
    if (kpiSec) kpiSec.style.display = '';
    if (bottomSec) bottomSec.style.display = '';
  } else if (view === 'search-dir' && searchSec) {
    searchSec.classList.remove('hidden');
    searchSec.style.display = 'block';
    runDirectorySearch();
  } else if (view === 'exams-view' && examsSec) {
    examsSec.classList.remove('hidden');
    examsSec.style.display = 'block';
    const sel = document.getElementById('examStudentSelect');
    if (sel) {
      sel.innerHTML = getVisibleStudents().map((s) =>
        `<option value="${sanitize(s.id)}">${sanitize(s.name)} (${sanitize(s.id)} • ${sanitize(s.gradeOnly)})</option>`
      ).join('');
      if (sel.value) renderReportCard(sel.value);
    }
    } else if (view === 'fees-view' && feesSec) {
    feesSec.classList.remove('hidden');
    feesSec.style.display = 'block';
    initFeeAutomation();
  } else if (view === 'permissions-view' && permSec) {
    permSec.classList.remove('hidden');
    permSec.style.display = 'block';
    renderPermissionsWorkspace();
  }
};

document.addEventListener('click', (e) => {
  const navBtn = e.target.closest('.nav-item[data-view]');
  if (navBtn) return switchView(navBtn.dataset.view);

  if (e.target.closest('[data-action="print"]')) return window.print();
  const closePanelBtn = e.target.closest('[data-action="close-panel"]');
  if (closePanelBtn) {
    const p = closePanelBtn.closest('.panel');
    if (p) p.classList.add('hidden');
  }

  const viewRec = e.target.closest('[data-view-record]');
  if (viewRec) openFullRecordCard(viewRec.dataset.viewRecord);

  const delStu = e.target.closest('[data-del-stu]');
  if (delStu) {
    const idx = appState.students.findIndex((s) => s.id === delStu.dataset.delStu);
    if (idx > -1) {
      const name = appState.students.at(idx).name;
      appState.students.splice(idx, 1);
      appState.baseStudentCount = Math.max(0, appState.baseStudentCount - 1);
      saveState();
      applyRoleDashboard();
      showToast(`🗑 Deleted ${name}`);
    }
  }

  const editStu = e.target.closest('[data-edit-stu]');
  if (editStu) {
    const stu = appState.students.find((s) => s.id === editStu.dataset.editStu);
    const modal = document.getElementById('masterEditModal');
    if (stu && modal) {
      document.getElementById('masterEditTitle').textContent = `Edit Student: ${stu.name}`;
      document.getElementById('masterEditFields').innerHTML = `
        <label>Name<input type="text" id="edName" value="${sanitize(stu.name)}" /></label>
        <label>Grade & Roll<input type="text" id="edGrade" value="${sanitize(stu.grade)}" /></label>
        <label>Subjects<input type="text" id="edSubj" value="${sanitize(stu.subjects)}" /></label>`;
      document.getElementById('saveMasterEditBtn').onclick = () => {
        stu.name = document.getElementById('edName').value.trim() || stu.name;
        stu.grade = document.getElementById('edGrade').value.trim() || stu.grade;
        stu.subjects = document.getElementById('edSubj').value.trim() || stu.subjects;
        saveState();
        renderStudentList();
        modal.classList.add('hidden');
        showToast(`✅ Updated ${stu.name}`);
      };
      modal.classList.remove('hidden');
    }
  }
});
// ============================================================================
// PART 4B-2A — THEME, SEARCH, LOGIN & BRANDING MODALS
// ============================================================================

document.getElementById('themeToggle')?.addEventListener('click', () => {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'glass' : 'dark');
  const icon = document.getElementById('themeIcon');
  if (icon) icon.textContent = isDark ? '🌙' : '☀️';
});

document.getElementById('timelineSelect')?.addEventListener('change', (e) => {
  currentPeriod = e.target.value;
  renderStudentList();
});

document.getElementById('studentSearchInput')?.addEventListener('input', (e) => renderStudentList(e.target.value));
document.addEventListener('click', (e) => {
  if (e.target.closest('#dirSearchBtn')) runDirectorySearch();
  if (e.target.closest('#dirClearBtn')) {
    const inp = document.getElementById('dirSearchInput');
    if (inp) inp.value = '';
    runDirectorySearch();
  }
});

document.addEventListener('input', (e) => {
  if (e.target.id === 'dirSearchInput') runDirectorySearch();
});


// Login & Logout
document.getElementById('openLoginModalBtn')?.addEventListener('click', () => document.getElementById('loginModal')?.classList.remove('hidden'));
new Array('closeLoginX', 'cancelLoginBtn').forEach((id) => document.getElementById(id)?.addEventListener('click', () => document.getElementById('loginModal')?.classList.add('hidden')));

document.getElementById('submitLoginBtn')?.addEventListener('click', () => {
  const u = document.getElementById('loginUserInput').value.trim().toLowerCase();
  const p = document.getElementById('loginPassInput').value.trim();
  const acc = appState.accounts.find((a) => a.user.toLowerCase() === u && a.pass === p);
  if (!acc) return showToast('❌ Invalid credentials');
  activeAccount = acc;
  sessionStorage.setItem('activeSchoolUser', JSON.stringify(acc));
  document.getElementById('loginModal')?.classList.add('hidden');
  document.querySelector('.app-shell')?.classList.remove('hidden');
  applyRoleDashboard();
  showToast(`✅ Welcome, ${acc.fullName}`);
});

document.getElementById('logoutBtn')?.addEventListener('click', () => {
  activeAccount = null;
  sessionStorage.removeItem('activeSchoolUser');
  document.querySelector('.app-shell')?.classList.add('hidden');
  document.getElementById('loginModal')?.classList.remove('hidden');
  document.getElementById('loginPassInput').value = '';
  showToast('Logged out safely.');
});

// White-Label Branding Modal
new Array('openBrandModal', 'openBrandModalBottom').forEach((id) => {
  document.getElementById(id)?.addEventListener('click', () => {
    document.getElementById('inputSchoolName').value = appState.brand.name;
    document.getElementById('inputSchoolTagline').value = appState.brand.tagline;
    document.getElementById('brandModal')?.classList.remove('hidden');
  });
});
new Array('closeBrandX', 'cancelBrandBtn').forEach((id) => document.getElementById(id)?.addEventListener('click', () => document.getElementById('brandModal')?.classList.add('hidden')));
document.getElementById('saveBrandBtn')?.addEventListener('click', () => {
  appState.brand.name = document.getElementById('inputSchoolName').value.trim() || appState.brand.name;
  appState.brand.tagline = document.getElementById('inputSchoolTagline').value.trim() || appState.brand.tagline;
  const logoFile = document.getElementById('inputSchoolLogo').files.item(0);
  if (logoFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      appState.brand.logo = e.target.result;
      saveState();
      applyBranding();
      document.getElementById('brandModal')?.classList.add('hidden');
      showToast('✅ School logo & branding saved!');
    };
    reader.readAsDataURL(logoFile);
  } else {
    saveState();
    applyBranding();
    document.getElementById('brandModal')?.classList.add('hidden');
    showToast('✅ School branding saved!');
  }
});
// ============================================================================
// PART 4B-2B — ADMISSIONS, OWNER CONTROLS, EXAMS, 3D TILT & BOOT
// ============================================================================

document.getElementById('openAdmissionBtn')?.addEventListener('click', () => document.getElementById('admissionModal')?.classList.remove('hidden'));
document.getElementById('closeAdmissionBtn')?.addEventListener('click', () => document.getElementById('admissionModal')?.classList.add('hidden'));
document.getElementById('saveAdmissionBtn')?.addEventListener('click', () => {
  const name = document.getElementById('admName').value.trim();
  if (!name) return showToast('Please enter student full name.');
  const newId = `STU-2026-${1001 + appState.students.length}`;
  appState.students.unshift({
    id: newId,
    rollNo: `R-${101 + appState.students.length}`,
    name,
    gender: document.getElementById('admGender')?.value || 'Male',
    grade: document.getElementById('admGrade').value.trim() || 'Grade 1',
    gradeOnly: document.getElementById('admGrade').value.trim() || 'Grade 1',
    admissionDate: new Date().toISOString().split('T').at(0),
    feeAmount: 8500,
    dueDate: '2026-12-10',
    feeState: 'Due',
    feeStatus: 'Due (PKR 8,500)',
    subjects: 'Math, English, Science, Urdu, Islamiyat',
    email: document.getElementById('admEmail').value.trim() || 'parent@school.edu',
    score: 'Admitted',
    period: document.getElementById('admPeriod').value,
    photo: '',
    file: 'Admission_Form.pdf'
  });
  appState.baseStudentCount += 1;
  saveState();
  applyRoleDashboard();
  document.getElementById('admissionModal')?.classList.add('hidden');
  showToast(`✅ Admitted ${name} (${newId})`);
});

// Owner Master Controls & 3D Card Tilt
// 1. KPI Cards -> Read-Only Display with 3D Hover Tilt
document.querySelectorAll('.kpi-card').forEach((card) => {
  card.style.cursor = 'default';
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${(-y * 10).toFixed(1)}deg) rotateY(${(x * 10).toFixed(1)}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// 2. Dedicated "Permissions & Accounts" Tab Renderer
const renderPermissionsWorkspace = () => {
  const box = document.getElementById('permissionsWorkspace');
  if (!box || !activeAccount || activeAccount.role !== 'owner') return;

  const staffOptions = appState.accounts
    .filter((a) => a.role !== 'owner')
    .map((a) => `<option value="${sanitize(a.user)}">${sanitize(a.fullName)} (${a.role.toUpperCase()} • @${sanitize(a.user)})</option>`)
    .join('');

  box.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:20px;">
      <div class="student-item" style="flex-direction:column; align-items:stretch; gap:10px;">
        <h4>1. Edit Existing Staff Permissions & Credentials</h4>
        <label style="font-size:0.82rem; font-weight:600;">Select Account
          <div style="display:flex; gap:6px; margin-top:4px;">
            <select id="permAccSel" class="pill-select" style="flex:1;">${staffOptions}</select>
            <button type="button" id="permDeleteBtn" class="mini-btn" style="color:#ef4444;">🗑 Delete</button>
          </div>
        </label>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <label style="font-size:0.82rem; font-weight:600;">Reset Username<input type="text" id="permUserIn" class="pill-select" style="width:100%; margin-top:4px;" /></label>
          <label style="font-size:0.82rem; font-weight:600;">Reset Password<input type="text" id="permPassIn" class="pill-select" style="width:100%; margin-top:4px;" /></label>
        </div>
        <label style="font-size:0.82rem; font-weight:600;">Assigned Subjects (Teachers)<input type="text" id="permSubjIn" class="pill-select" style="width:100%; margin-top:4px;" /></label>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:0.82rem; padding:6px 0;">
          <label><input type="checkbox" id="chkFee" /> Allow Fee Management</label>
          <label><input type="checkbox" id="chkExam" /> Allow Exams & Reports</label>
          <label><input type="checkbox" id="chkSearch" /> Allow Student Search</label>
          <label><input type="checkbox" id="chkEdit" /> Allow Edit Students</label>
          <label><input type="checkbox" id="chkDel" /> Allow Delete Records</label>
          <label><input type="checkbox" id="chkCsv" /> Allow Export CSV</label>
          <label><input type="checkbox" id="chkMail" /> Allow Email Alerts</label>
        </div>
        <button type="button" id="permSaveExistingBtn" class="btn-primary">✔ Save Account & Permissions</button>
      </div>

      <div class="student-item" style="flex-direction:column; align-items:stretch; gap:10px;">
        <h4>2. Create New Teacher or Admin Account</h4>
        <label style="font-size:0.82rem; font-weight:600;">Full Name<input type="text" id="createAccName" class="pill-select" style="width:100%; margin-top:4px;" placeholder="e.g., Ms. Zainab Raza" /></label>
        <label style="font-size:0.82rem; font-weight:600;">Role
          <select id="createAccRole" class="pill-select" style="width:100%; margin-top:4px;">
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <label style="font-size:0.82rem; font-weight:600;">New Username<input type="text" id="createAccUser" class="pill-select" style="width:100%; margin-top:4px;" placeholder="e.g., teacher4" /></label>
          <label style="font-size:0.82rem; font-weight:600;">New Password<input type="text" id="createAccPass" class="pill-select" style="width:100%; margin-top:4px;" placeholder="e.g., pass123" /></label>
        </div>
        <label style="font-size:0.82rem; font-weight:600;">Assigned Subjects<input type="text" id="createAccSubj" class="pill-select" style="width:100%; margin-top:4px;" placeholder="e.g., Physics, Mathematics" /></label>
        <button type="button" id="createAccSubmitBtn" class="btn-primary">+ Create New Account</button>
      </div>
    </div>`;

  const sel = document.getElementById('permAccSel');
  const loadFields = () => {
    const t = appState.accounts.find((a) => a.user === sel.value);
    if (!t) return;
    const p = t.perms || {};
    document.getElementById('permUserIn').value = t.user;
    document.getElementById('permPassIn').value = t.pass;
    document.getElementById('permSubjIn').value = t.subjects || '';
    document.getElementById('chkFee').checked = t.role !== 'teacher' && p.feeAccess !== false;
    document.getElementById('chkFee').disabled = t.role === 'teacher';
    document.getElementById('chkExam').checked = p.examAccess !== false;
    document.getElementById('chkSearch').checked = p.searchAccess !== false;
    document.getElementById('chkEdit').checked = Boolean(p.editStudents);
    document.getElementById('chkDel').checked = Boolean(p.deleteRecords);
    document.getElementById('chkCsv').checked = p.exportCsv !== false;
    document.getElementById('chkMail').checked = p.sendEmail !== false;
  };
  sel.onchange = loadFields;
  loadFields();

  document.getElementById('permSaveExistingBtn').onclick = () => {
    const t = appState.accounts.find((a) => a.user === sel.value);
    if (!t) return;
    const nextUser = document.getElementById('permUserIn').value.trim().toLowerCase();
    if (nextUser && !appState.accounts.some((a) => a !== t && a.user.toLowerCase() === nextUser)) t.user = nextUser;
    t.pass = document.getElementById('permPassIn').value.trim() || t.pass;
    t.subjects = document.getElementById('permSubjIn').value.trim() || t.subjects;
    t.perms = {
      feeAccess: t.role !== 'teacher' && document.getElementById('chkFee').checked,
      examAccess: document.getElementById('chkExam').checked,
      searchAccess: document.getElementById('chkSearch').checked,
      editStudents: document.getElementById('chkEdit').checked,
      deleteRecords: document.getElementById('chkDel').checked,
      exportCsv: document.getElementById('chkCsv').checked,
      sendEmail: document.getElementById('chkMail').checked
    };
    saveState();
    renderPermissionsWorkspace();
    showToast(`✅ Permissions & credentials updated for ${t.fullName}!`);
  };

  document.getElementById('permDeleteBtn').onclick = () => {
    const idx = appState.accounts.findIndex((a) => a.user === sel.value && a.role !== 'owner');
    if (idx === -1) return showToast('⚠️ Cannot delete this account.');
    const removed = appState.accounts.at(idx).fullName;
    appState.accounts.splice(idx, 1);
    appState.financials.teacherCount = Number(appState.financials.teacherCount || 0) + 1;
    applyRoleDashboard();
    saveState();
    renderPermissionsWorkspace();
    showToast(`🗑 Deleted account: ${removed}`);
  };

  document.getElementById('createAccSubmitBtn').onclick = () => {
    const fullName = document.getElementById('createAccName').value.trim();
    const role = document.getElementById('createAccRole').value;
    const user = document.getElementById('createAccUser').value.trim().toLowerCase();
    const pass = document.getElementById('createAccPass').value.trim();
    const subjects = document.getElementById('createAccSubj').value.trim() || 'General Subjects';
    if (!fullName || !user || !pass) return showToast('⚠️ Enter Full Name, Username, and Password.');
    if (appState.accounts.some((a) => a.user.toLowerCase() === user)) return showToast('⚠️ Username already taken!');

    appState.accounts.push({
      user,
      pass,
      role,
      fullName,
      subjects,
      salary: role === 'teacher' ? 'PKR 55,000' : 'PKR 100,000',
      perms: { feeAccess: role === 'admin', examAccess: true, searchAccess: true, editStudents: role === 'admin', deleteRecords: role === 'admin', exportCsv: true, sendEmail: true }
    });
    appState.financials.teacherCount = Number(appState.financials.teacherCount || 0) + 1;
    applyRoleDashboard();
    saveState();
    renderPermissionsWorkspace();
    showToast(`✅ Created ${role.toUpperCase()} account: @${user}`);
  };
};

new Array('closeMasterEditX', 'cancelMasterEditBtn').forEach((id) => document.getElementById(id)?.addEventListener('click', () => document.getElementById('masterEditModal')?.classList.add('hidden')));

// Exams, CSV Export, Wave Pills & Boot
// Clean Delegated Handlers for Exams & Report Cards Tab
document.addEventListener('click', (e) => {
  const targetBtn = e.target.closest('#saveExamMarkBtn, #generateReportCardBtn, #generateExamCardBtn');
  if (!targetBtn) return;

  if (!activeAccount) {
    return showToast('🔒 Login as Owner, Admin, or Teacher to manage exams.');
  }

  const sel = document.getElementById('examStudentSelect');
  const termEl = document.getElementById('examTermSelect');
  const sid = sel ? sel.value : '';
  const term = termEl ? termEl.value : 'Mid-Term Exam 2026';

  if (!sid) return showToast('⚠️ Select a student first.');

  if (targetBtn.id === 'saveExamMarkBtn') {
    const sub = document.getElementById('examSubjectInput')?.value.trim();
    const marks = Number(document.getElementById('examMarksInput')?.value);

    if (!sub || Number.isNaN(marks) || marks < 0 || marks > 100) {
      return showToast('⚠️ Enter a valid subject name and marks (0–100).');
    }

    if (activeAccount.role === 'teacher' && activeAccount.subjects) {
      if (!activeAccount.subjects.toLowerCase().includes(sub.toLowerCase())) {
        return showToast(`🔒 You can only enter marks for your assigned subjects: ${activeAccount.subjects}`);
      }
    }

    if (!appState.examMarks[sid]) appState.examMarks[sid] = {};
    if (!appState.examMarks[sid][term]) appState.examMarks[sid][term] = {};
    appState.examMarks[sid][term][sub] = marks;

    const scores = Object.values(appState.examMarks[sid][term]);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const stu = appState.students.find((s) => s.id === sid);
    if (stu) stu.score = `${avg}%`;

    saveState();
    document.getElementById('examMarksInput').value = '';
    renderReportCard(sid, term, false);
    showToast(`✅ Saved ${sub}: ${marks}/100`);
  } else if (targetBtn.id === 'generateReportCardBtn') {
    renderReportCard(sid, term, false);
    showToast('✅ Official Report Card generated!');
  } else if (targetBtn.id === 'generateExamCardBtn') {
    renderReportCard(sid, term, true);
    showToast('✅ Official Exam Admit Card generated!');
  }
});

document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
  const headers = 'Student_ID,Roll_No,Name,Grade,Fee_Status,Subjects,Average,Session';
  const rows = getVisibleStudents().map((s) => `"${s.id}","${s.rollNo}","${s.name}","${s.gradeOnly}","${s.feeStatus}","${s.subjects}","${s.score}","${s.period}"`);
  const blob = new Blob(new Array(new Array(headers, ...rows).join('\n')), { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${appState.brand.name.replace(/\s+/g, '_')}_Records.csv`;
  a.click();
  showToast('✅ CSV Spreadsheet exported!');
});

document.querySelectorAll('.m-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.m-pill').forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');
    renderWaveChart(pill.dataset.metric);
  });
});

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
applyBranding();
renderWaveChart('earning');
applyRoleDashboard();
switchView('dashboard');
if (activeAccount) {
  document.querySelector('.app-shell')?.classList.remove('hidden');
  document.getElementById('loginModal')?.classList.add('hidden');
}