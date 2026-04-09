/* ============================================
   THE STREETS SESSION — App Logic v3.0
   ============================================ */

const TOURNAMENT_CONFIG = {
    bracket: { name:'Turnaj Pavúk', icon:'🏆', maxPlayers:16, multiplier:1.5, badgeClass:'badge-bracket',
        placements:{1:100,2:70,3:45,4:45,5:25,6:25,7:25,8:25,9:10,10:10,11:10,12:10,13:10,14:10,15:10,16:10} },
    king: { name:'King of the Court', icon:'👑', maxPlayers:30, multiplier:1.2, badgeClass:'badge-king',
        placements:{1:100,2:70,3:50,4:35,5:35,6:20,7:20,8:20,9:20,10:20,11:10,12:10,13:10,14:10,15:10,16:10,17:10,18:10,19:10,20:10,21:5,22:5,23:5,24:5,25:5,26:5,27:5,28:5,29:5,30:5} },
    '3v3': { name:'3v3', icon:'🤝', maxPlayers:12, multiplier:1.0, badgeClass:'badge-3v3',
        placements:{1:100,2:70,3:45,4:45,5:25,6:25,7:25,8:25,9:10,10:10,11:10,12:10} },
    '1v1': { name:'1v1', icon:'⚡', maxPlayers:8, multiplier:0.8, badgeClass:'badge-1v1',
        placements:{1:100,2:70,3:45,4:45,5:25,6:25,7:25,8:25} },
    skills: { name:'Skills Challenge', icon:'🎯', maxPlayers:20, multiplier:0.6, badgeClass:'badge-skills',
        placements:{1:100,2:70,3:50,4:35,5:35,6:20,7:20,8:20,9:20,10:20,11:10,12:10,13:10,14:10,15:10,16:5,17:5,18:5,19:5,20:5} }
};

const EXPERIENCE_LABELS = { beginner:'Rookie', intermediate:'Pokročilý', advanced:'Skúsený', pro:'Pro Player' };
const POSITION_LABELS = { guard:'Point Guard', sg:'Shooting Guard', forward:'Small Forward', pf:'Power Forward', center:'Center', 'all-around':'All-around' };

function calcPoints(type, placement) {
    const cfg = TOURNAMENT_CONFIG[type];
    return cfg ? Math.round((cfg.placements[placement] || 0) * cfg.multiplier) : 0;
}

// ── Store ──
const S = { players:'ss_players', sessions:'ss_sessions', regs:'ss_registrations', results:'ss_results', user:'ss_currentUser', live:'ss_liveSessions' };
const load = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const save = (k,d) => localStorage.setItem(k, JSON.stringify(d));

const getPlayers = () => load(S.players) || [];
const getSessions = () => load(S.sessions) || [];
const getRegs = () => load(S.regs) || [];
const getResults = () => load(S.results) || [];
const getUser = () => load(S.user);
const getLives = () => load(S.live) || [];

const savePlayers = d => save(S.players, d);
const saveSessions = d => save(S.sessions, d);
const saveRegs = d => save(S.regs, d);
const saveResults = d => save(S.results, d);
const setUser = d => save(S.user, d);
const setLives = d => save(S.live, d);

const getLive = id => getLives().find(l => l.sessionId === id) || null;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);

function addLive(live) {
    const arr = getLives();
    if (arr.length >= 4) { showToast('Max 4 live sessions naraz!','error'); return false; }
    const i = arr.findIndex(l => l.sessionId === live.sessionId);
    if (i >= 0) arr[i] = live; else arr.push(live);
    setLives(arr); return true;
}
function removeLive(id) { setLives(getLives().filter(l => l.sessionId !== id)); }
function updateLive(id, fn) {
    const arr = getLives();
    const i = arr.findIndex(l => l.sessionId === id);
    if (i < 0) return;
    arr[i] = fn(arr[i]);
    setLives(arr);
}

// ── Seed ──
function seedDemoData() {
    if (getSessions().length > 0) return;

    // No demo players — organizátor ich pridá cez Notepad
    savePlayers([]);

    const now = new Date();
    const d = (offset) => {
        const dt = new Date(now);
        dt.setDate(dt.getDate() + offset);
        return dt.toISOString().slice(0,10);
    };

    const completedId1 = uid();
    const completedId2 = uid();
    const liveId = uid();

    const sessions = [
        // 2 ukončené
        { id: completedId1, name:'BA Street Cup #6', type:'bracket', city:'Bratislava', venue:'Tyršovo nábrežie', date: d(-14), time:'14:00', desc:'Jarný bracket turnaj.', status:'completed' },
        { id: completedId2, name:'Praha King Night Vol.2', type:'king', city:'Praha', venue:'Letná Park', date: d(-7), time:'17:00', desc:'King of the Court v Prahe.', status:'completed' },
        // 1 prebiehajúca (live)
        { id: liveId, name:'KE 3v3 Jam', type:'3v3', city:'Košice', venue:'Mestský park', date: d(0), time:'15:00', desc:'Squad turnaj v Košiciach.', status:'open' },
        // Nadchádzajúce
        { id: uid(), name:'BA Street Cup #7', type:'bracket', city:'Bratislava', venue:'Tyršovo nábrežie', date: d(4), time:'14:00', desc:'Jarný turnaj pavúk.', status:'open' },
        { id: uid(), name:'Berlin 1v1 Showdown', type:'1v1', city:'Berlín', venue:'Mauerpark Courts', date: d(10), time:'16:00', desc:'1v1 duely v Berlíne.', status:'open' },
        { id: uid(), name:'BA Skills Night', type:'skills', city:'Bratislava', venue:'Sad Janka Kráľa', date: d(18), time:'18:00', desc:'Ukáž svoje skillz.', status:'open' },
        { id: uid(), name:'Praha Bracket Masters', type:'bracket', city:'Praha', venue:'Stromovka', date: d(25), time:'13:00', desc:'Najväčší bracket turnaj v Prahe.', status:'open' },
        { id: uid(), name:'KE King of Court', type:'king', city:'Košice', venue:'Anička', date: d(32), time:'15:00', desc:'King of the Court v Košiciach.', status:'open' },
        { id: uid(), name:'Summer BA Finals', type:'bracket', city:'Bratislava', venue:'Medická záhrada', date: d(50), time:'12:00', desc:'Letné finále sezóny.', status:'open' },
    ];
    saveSessions(sessions);

    // Spusti live session pre KE 3v3
    const livePlaceholderPlayers = ['p1','p2','p3','p4','p5','p6'];
    const liveSession = {
        sessionId: liveId,
        bracket: null,
        currentMatches: [
            { id: uid(), player1: null, player2: null, score1: 12, score2: 8, winner: null, status:'done', label:'Zápas 1' },
            { id: uid(), player1: null, player2: null, score1: null, score2: null, winner: null, status:'live', label:'Zápas 2' },
            { id: uid(), player1: null, player2: null, score1: null, score2: null, winner: null, status:'upcoming', label:'Zápas 3' },
        ],
        standings: [
            { playerId: null, name:'Tím A', wins:1, losses:0, points:3 },
            { playerId: null, name:'Tím B', wins:0, losses:1, points:0 },
            { playerId: null, name:'Tím C', wins:0, losses:0, points:0 },
        ]
    };
    setLives([liveSession]);
}

// ── Navigation ──
let currentPage = 'home';
let currentLiveTab = null;

function navigateTo(page) {
    currentPage = page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page)?.classList.add('active');
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.toggle('active', a.dataset.page === page));
    document.querySelector('.nav-links')?.classList.remove('open');
    updateLiveBanner();
    renderPage(page);
    window.scrollTo({ top:0, behavior:'smooth' });
}

function renderPage(p) {
    switch(p) {
        case 'home': renderHome(); break;
        case 'calendar': renderCalendar(); break;
        case 'leaderboard': renderLeaderboard(); break;
        case 'live': renderLive(); break;
        case 'profile': renderProfile(); break;
        case 'organizer': renderOrganizer(); break;
        case 'points': break; // static
    }
}

// ── Live Global Banner ──
function updateLiveBanner() {
    const lives = getLives();
    const banner = document.getElementById('live-global-banner');
    const items = document.getElementById('live-banner-items');
    const navLive = document.getElementById('nav-live-link');

    if (!lives.length) {
        banner?.classList.remove('visible');
        if (navLive) navLive.textContent = 'Live';
        document.querySelectorAll('.page').forEach(p => p.classList.remove('has-live-banner'));
        return;
    }

    banner?.classList.add('visible');
    if (navLive) navLive.textContent = `● Live (${lives.length})`;

    const sessions = getSessions();
    if (items) {
        items.innerHTML = lives.map(l => {
            const s = sessions.find(s => s.id === l.sessionId);
            return `<span class="live-banner-dot" onclick="navigateTo('live');switchLiveTab('${l.sessionId}')">
                <span class="dot"></span>${s?.name || 'Session'} · ${s?.city || ''}
            </span>`;
        }).join('');
    }

    document.querySelectorAll('.page').forEach(p => p.classList.add('has-live-banner'));
}

// ── Home ──
function renderHome() {
    const players = getPlayers();
    const sessions = getSessions();
    document.getElementById('stat-players').textContent = players.length;
    document.getElementById('stat-sessions').textContent = sessions.length;
    document.getElementById('stat-matches').textContent = players.reduce((s,p) => s + (p.matches||0), 0);

    const upcoming = sessions
        .filter(s => s.status !== 'completed' && new Date(s.date) >= new Date())
        .sort((a,b) => new Date(a.date)-new Date(b.date)).slice(0,3);

    document.getElementById('home-upcoming').innerHTML = upcoming.length
        ? upcoming.map(s => renderSessionCard(s)).join('')
        : '<p style="color:var(--text-secondary)">Žiadne nadchádzajúce sessions.</p>';

    const results = getResults();
    const rc = document.getElementById('home-results');
    if (results.length) {
        rc.innerHTML = [...results].sort((a,b)=>b.points-a.points).slice(0,5).map(r => {
            const pl = players.find(p=>p.id===r.playerId);
            const s = sessions.find(s=>s.id===r.sessionId);
            const pc = r.placement===1?'gold':r.placement===2?'silver':r.placement===3?'bronze':'';
            return `<div class="result-row">
                <div class="result-place ${pc}">#${r.placement}</div>
                <div class="result-info"><div class="name">${pl?.name||'?'}</div><div class="meta">${s?.name||''} · ${TOURNAMENT_CONFIG[s?.type]?.name||''}</div></div>
                <div class="result-points">+${r.points}b</div>
            </div>`;
        }).join('');
    } else {
        rc.innerHTML = '<p style="color:var(--text-secondary)">Zatiaľ žiadne výsledky.</p>';
    }
}

// ── Session Card ──
function renderSessionCard(session) {
    const cfg = TOURNAMENT_CONFIG[session.type];
    const regs = getRegs().filter(r=>r.sessionId===session.id);
    const spotsLeft = cfg.maxPlayers - regs.length;
    const fillPct = Math.round((regs.length/cfg.maxPlayers)*100);
    const fillCls = session.status==='completed'?'done':fillPct>80?'high':fillPct>50?'medium':'low';
    const user = getUser();
    const isReg = user && regs.some(r=>r.playerId===user.id);
    const isFull = spotsLeft<=0;
    const isCompleted = session.status==='completed';
    const isLive = !!getLive(session.id);

    return `<div class="session-card ${isCompleted?'completed-card':''}">
        <div class="session-card-header">
            <span class="session-type-badge ${cfg.badgeClass}">${cfg.icon} ${cfg.name}</span>
            <span class="session-city">${session.city}</span>
        </div>
        <h3>${session.name}${isLive?' <span class="live-badge" style="font-size:10px;display:inline-flex;padding:2px 7px;margin-left:4px;">● LIVE</span>':''}</h3>
        <div class="session-meta">
            <span>📅 ${formatDate(session.date)} · ${session.time}</span>
            <span>📍 ${session.venue}</span>
            <span>👥 ${regs.length} / ${cfg.maxPlayers}</span>
        </div>
        <div class="capacity-bar"><div class="capacity-fill ${fillCls}" style="width:${fillPct}%"></div></div>
        <div class="session-card-footer">
            <span class="spots-left ${spotsLeft<=3&&!isCompleted?'few':''}">
                ${isCompleted?'✓ Ukončená':isFull?'Plné':spotsLeft+' voľných'}
            </span>
            ${isCompleted ? '<span class="match-status status-done">Ukončená</span>' :
              isLive     ? '<span class="match-status status-live">● LIVE</span>' :
              isReg      ? `<div style="display:flex;gap:6px;align-items:center;">
                              <span class="match-status status-done">✓ Prihlásený</span>
                              <button class="btn-danger btn-sm" onclick="unregister('${session.id}')">Odhlásiť</button>
                           </div>` :
              isFull     ? '<span class="match-status status-upcoming">Plné</span>' :
              `<button class="btn-primary btn-sm" onclick="openRegModal('${session.id}')">Registrovať sa</button>`}
        </div>
    </div>`;
}

// ── Calendar ──
let calCity='all', calType='all';
function renderCalendar() {
    let sessions = getSessions();
    const month = document.getElementById('filter-month')?.value||'all';
    const status = document.getElementById('filter-status')?.value||'all';
    if (calCity!=='all') sessions=sessions.filter(s=>s.city===calCity);
    if (calType!=='all') sessions=sessions.filter(s=>s.type===calType);
    if (status!=='all') sessions=sessions.filter(s=>s.status===status);
    if (month!=='all') sessions=sessions.filter(s=>new Date(s.date).getMonth()+1===parseInt(month));
    sessions.sort((a,b)=>new Date(b.date)-new Date(a.date));
    const c = document.getElementById('calendar-sessions');
    c.innerHTML = sessions.length
        ? sessions.map(s=>renderSessionCard(s)).join('')
        : '<div class="empty-state"><div class="empty-icon">🔍</div><h3>Žiadne sessions</h3></div>';
}

// ── Leaderboard ──
function renderLeaderboard() {
    const players = getPlayers();
    const city = document.getElementById('lb-city')?.value||'all';
    const type = document.getElementById('lb-type')?.value||'all';
    const q = document.getElementById('search-player')?.value?.toLowerCase()||'';
    let list = [...players];
    if (city!=='all') list=list.filter(p=>p.city===city);
    if (q) list=list.filter(p=>p.name.toLowerCase().includes(q)||p.username.toLowerCase().includes(q));
    if (type!=='all') {
        const results=getResults(), sessions=getSessions();
        list=list.map(p=>({...p,points:results.filter(r=>{const s=sessions.find(s=>s.id===r.sessionId);return r.playerId===p.id&&s?.type===type;}).reduce((s,r)=>s+r.points,0)})).filter(p=>p.points>0);
    }
    list.sort((a,b)=>b.points-a.points);

    // Podium: 2nd left, 1st center, 3rd right
    const podium = document.getElementById('podium');
    if (list.length >= 3) {
        const t = list.slice(0,3);
        const order = [
            {idx:1,cls:'second',lbl:'2. miesto 🥈'},
            {idx:0,cls:'first', lbl:'1. miesto 🥇'},
            {idx:2,cls:'third', lbl:'3. miesto 🥉'}
        ];
        podium.innerHTML = order.map(({idx,cls,lbl}) => `
            <div class="podium-card ${cls}" onclick="showPlayer('${t[idx].id}')">
                <div class="podium-ball">🏀</div>
                <div class="podium-rank">#${idx+1}</div>
                <div class="podium-name">${t[idx].name}</div>
                <div class="podium-points">${t[idx].points}<span>b</span></div>
                <div class="podium-city">${t[idx].city}</div>
                <div class="podium-label">${lbl}</div>
            </div>`).join('');
    } else { podium.innerHTML=''; }

    const medals = ['🥇','🥈','🥉'];
    document.getElementById('leaderboard-body').innerHTML = list.map((p,i) => `
        <tr class="${i<3?'top-'+(i+1):''}" onclick="showPlayer('${p.id}')">
            <td><span class="rank-medal">${medals[i]||(i+1)}</span></td>
            <td><div class="player-cell"><div class="player-avatar-sm">${p.name.charAt(0)}</div>
                <div><div class="player-name">${p.name}</div><div style="font-size:11px;color:var(--text-tertiary)">@${p.username}</div></div></div></td>
            <td>${p.city}</td>
            <td>${p.matches||0}</td>
            <td>${p.wins||0}</td>
            <td class="points-badge">${p.points}b</td>
        </tr>`).join('');
}

// ── Live ──
function renderLive() {
    const lives = getLives();
    const noSess = document.getElementById('live-no-session');
    const cont = document.getElementById('live-content');
    if (!lives.length) { noSess.style.display=''; cont.style.display='none'; return; }
    noSess.style.display='none'; cont.style.display='';
    if (!currentLiveTab || !lives.find(l=>l.sessionId===currentLiveTab)) currentLiveTab=lives[0].sessionId;

    const sessions = getSessions();
    document.getElementById('live-session-tabs').innerHTML = lives.map(l => {
        const s = sessions.find(s=>s.id===l.sessionId);
        return `<button class="live-session-tab ${l.sessionId===currentLiveTab?'active':''}" onclick="switchLiveTab('${l.sessionId}')">● ${s?.name||'Session'}</button>`;
    }).join('');

    const live = lives.find(l=>l.sessionId===currentLiveTab);
    const session = sessions.find(s=>s.id===currentLiveTab);
    if (!live||!session) return;

    const cfg = TOURNAMENT_CONFIG[session.type];
    document.getElementById('live-session-name').textContent = session.name;
    document.getElementById('live-session-info').textContent = `${cfg.icon} ${cfg.name} · ${session.city} · ${session.venue}`;

    const bDiv = document.getElementById('live-bracket');
    const sDiv = document.getElementById('live-standings');
    if (session.type==='bracket'||session.type==='1v1') {
        bDiv.style.display=''; sDiv.style.display='none';
        renderBracketView(live, bDiv);
    } else {
        bDiv.style.display='none'; sDiv.style.display='';
        renderStandingsView(live);
    }
    renderLiveMatches(live);
}

function switchLiveTab(id) { currentLiveTab=id; renderLive(); }

function renderBracketView(live, container) {
    if (!live.bracket?.length) { container.innerHTML='<p style="color:var(--text-secondary);padding:16px">Pavúk ešte nebol vygenerovaný.</p>'; return; }
    const players=getPlayers();
    const rNames=['1. kolo','Štvrťfinále','Semifinále','Finále'];
    const total=live.bracket.length;
    let html='<div class="bracket">';
    live.bracket.forEach((round,ri)=>{
        const rn=total<=4?rNames[rNames.length-total+ri]:`Kolo ${ri+1}`;
        html+=`<div class="bracket-round"><div class="bracket-round-title">${rn}</div>`;
        round.forEach(m=>{
            const p1=players.find(p=>p.id===m.player1);
            const p2=players.find(p=>p.id===m.player2);
            html+=`<div class="bracket-match">
                <div class="bracket-player ${m.winner===m.player1?'winner':''}"><span>${p1?.name||'TBD'}</span><span class="score">${m.score1??''}</span></div>
                <div class="bracket-player ${m.winner===m.player2?'winner':''}"><span>${p2?.name||'TBD'}</span><span class="score">${m.score2??''}</span></div>
            </div>`;
        });
        html+='</div>';
    });
    container.innerHTML=html+'</div>';
}

function renderStandingsView(live) {
    const players=getPlayers();
    const el=document.getElementById('live-standings-list');
    if (!live.standings?.length) { el.innerHTML='<p style="color:var(--text-secondary)">Poradie nie je k dispozícii.</p>'; return; }
    el.innerHTML=live.standings.map((s,i)=>{
        const name = s.playerId ? (players.find(p=>p.id===s.playerId)?.name||'?') : (s.name||'?');
        return `<div class="standing-row"><div class="standing-rank">${i+1}.</div><div class="standing-name">${name}</div><div class="standing-wins">${s.wins}V ${s.losses}P</div><div class="standing-points">${s.points}b</div></div>`;
    }).join('');
}

function renderLiveMatches(live) {
    const players=getPlayers();
    const el=document.getElementById('live-matches');
    if (!live.currentMatches?.length) { el.innerHTML='<p style="color:var(--text-secondary)">Žiadne zápasy.</p>'; return; }
    el.innerHTML=live.currentMatches.map(m=>{
        const p1name = m.player1 ? (players.find(p=>p.id===m.player1)?.name||'?') : (m.label||'Tím A');
        const p2name = m.player2 ? (players.find(p=>p.id===m.player2)?.name||'?') : 'Tím B';
        const sCls=m.status==='live'?'status-live':m.status==='done'?'status-done':'status-upcoming';
        const sTxt=m.status==='live'?'● LIVE':m.status==='done'?'Ukončený':'Čaká';
        return `<div class="match-card">
            <div class="match-players">
                <div class="match-player"><div class="player-avatar-sm">${p1name.charAt(0)}</div><span class="player-name">${p1name}</span></div>
                <div class="match-vs">VS</div>
                <div class="match-player right"><span class="player-name">${p2name}</span><div class="player-avatar-sm">${p2name.charAt(0)}</div></div>
            </div>
            <div class="match-score"><span>${m.score1??'-'}</span><span class="divider">:</span><span>${m.score2??'-'}</span></div>
            <span class="match-status ${sCls}">${sTxt}</span>
        </div>`;
    }).join('');
}

// ── Profile ──
function renderProfile() {
    const user = getUser();
    const loginDiv = document.getElementById('profile-login');
    const viewDiv = document.getElementById('profile-view');
    if (!user) { loginDiv.style.display=''; viewDiv.style.display='none'; return; }
    loginDiv.style.display='none'; viewDiv.style.display='';

    const players=getPlayers();
    const player=players.find(p=>p.id===user.id)||user;

    document.getElementById('profile-name').textContent=player.name;
    document.getElementById('profile-username').textContent='@'+player.username;
    document.getElementById('profile-points').textContent=player.points||0;
    document.getElementById('profile-matches').textContent=player.matches||0;
    document.getElementById('profile-wins').textContent=player.wins||0;

    const sorted=[...players].sort((a,b)=>b.points-a.points);
    const rank=sorted.findIndex(p=>p.id===player.id)+1;
    document.getElementById('profile-rank').textContent=rank>0?'#'+rank:'—';

    document.getElementById('profile-details').innerHTML=`
        <div class="detail-row"><span class="label">Prezývka</span><span class="value">@${player.username}</span></div>
        <div class="detail-row"><span class="label">Vek</span><span class="value">${player.age} r</span></div>
        <div class="detail-row"><span class="label">Výška</span><span class="value">${player.height} cm</span></div>
        <div class="detail-row"><span class="label">Váha</span><span class="value">${player.weight?player.weight+' kg':'—'}</span></div>
        <div class="detail-row"><span class="label">Mesto</span><span class="value">${player.city}</span></div>
        <div class="detail-row"><span class="label">Pozícia</span><span class="value">${POSITION_LABELS[player.position]||'—'}</span></div>
        <div class="detail-row"><span class="label">Úroveň</span><span class="value">${EXPERIENCE_LABELS[player.experience]||'—'}</span></div>
        ${player.bio?`<div class="detail-row"><span class="label">Bio</span><span class="value">${player.bio}</span></div>`:''}`;

    const regs=getRegs().filter(r=>r.playerId===player.id);
    const sessions=getSessions();
    const activeRegs=regs.map(r=>sessions.find(s=>s.id===r.sessionId)).filter(s=>s&&s.status!=='completed');
    document.getElementById('profile-registrations').innerHTML=activeRegs.length
        ?activeRegs.map(s=>`<div class="detail-row"><span class="label">${s.name}</span><span class="value">${formatDate(s.date)}</span></div>`).join('')
        :'<p style="font-size:13px;color:var(--text-secondary)">Žiadne aktívne registrácie.</p>';

    const results=getResults().filter(r=>r.playerId===player.id);
    document.getElementById('profile-history').innerHTML=results.length
        ?results.map(r=>{
            const s=sessions.find(s=>s.id===r.sessionId);
            const pc=r.placement===1?'gold':r.placement===2?'silver':r.placement===3?'bronze':'';
            return `<div class="result-row"><div class="result-place ${pc}">#${r.placement}</div><div class="result-info"><div class="name">${s?.name||'Session'}</div><div class="meta">${formatDate(s?.date)} · ${TOURNAMENT_CONFIG[s?.type]?.name||''}</div></div><div class="result-points">+${r.points}b</div></div>`;
        }).join('')
        :'<p style="color:var(--text-secondary)">Zatiaľ žiadna história.</p>';

    updateNavUsername();
}

// ── Organizer ──
function renderOrganizer() { renderOrgManage(); renderResultSelect(); }

function renderOrgManage() {
    const sessions=getSessions().sort((a,b)=>new Date(b.date)-new Date(a.date));
    const players=getPlayers(), regs=getRegs(), lives=getLives();
    const c=document.getElementById('org-sessions-list');
    if (!sessions.length) { c.innerHTML='<div class="empty-state"><h3>Žiadne sessions</h3></div>'; return; }
    c.innerHTML=sessions.map(s=>{
        const cfg=TOURNAMENT_CONFIG[s.type];
        const sRegs=regs.filter(r=>r.sessionId===s.id);
        const isLive=!!getLive(s.id);
        const canStart=lives.length<4;
        return `<div class="org-session-card">
            <div class="org-session-header">
                <div><h3>${s.name}</h3><span class="session-type-badge ${cfg.badgeClass}">${cfg.icon} ${cfg.name}</span></div>
                <span class="match-status ${s.status==='completed'?'status-done':isLive?'status-live':'status-upcoming'}">${s.status==='completed'?'Ukončená':isLive?'● LIVE':'Otvorená'}</span>
            </div>
            <div class="org-session-meta">${formatDate(s.date)} · ${s.time} · ${s.city} · ${s.venue} · ${sRegs.length}/${cfg.maxPlayers}</div>
            <div class="org-session-actions">
                ${s.status!=='completed'&&!isLive?`
                    ${(s.type==='bracket'||s.type==='1v1')?`<button class="btn-blue btn-sm" onclick="generateBracket('${s.id}')">🏆 Generovať pavúk</button>`:''}
                    ${canStart?`<button class="btn-primary btn-sm" onclick="startLive('${s.id}')">▶ Spustiť LIVE</button>`:'<span style="font-size:11px;color:var(--text-tertiary)">Max 4 live</span>'}
                    <button class="btn-danger btn-sm" onclick="deleteSession('${s.id}')">Zmazať</button>
                `:''}
                ${isLive?`<button class="btn-blue btn-sm" onclick="openLiveEditor('${s.id}')">✏️ Editovať</button>
                          <button class="btn-danger btn-sm" onclick="endLive('${s.id}')">⏹ Ukončiť</button>`:''}
            </div>
            <div class="org-players-list">
                <strong style="font-size:12px;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.05em;">Hráči (${sRegs.length})</strong>
                ${sRegs.length?sRegs.map(r=>{
                    const p=players.find(pl=>pl.id===r.playerId);
                    return p?`<div class="org-player-row">
                        <div class="org-player-info"><div class="player-avatar-sm">${p.name.charAt(0)}</div>
                        <div><span class="player-name">${p.name}</span><span class="org-player-details"> · ${p.age}r · ${p.height}cm · ${EXPERIENCE_LABELS[p.experience]||''}</span></div></div>
                        <button class="btn-ghost btn-sm" onclick="removeReg('${s.id}','${p.id}')">✕</button>
                    </div>`:'';
                }).join(''):'<p style="font-size:12px;color:var(--text-secondary);padding:6px 0">Žiadni hráči.</p>'}
            </div>
        </div>`;
    }).join('');
}

function renderResultSelect() {
    const s=document.getElementById('result-session');
    s.innerHTML='<option value="">Vyber session...</option>'+getSessions().filter(s=>s.status!=='completed').map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
}

function renderResultForm(sessionId) {
    const area=document.getElementById('result-form-area');
    if (!sessionId) { area.innerHTML=''; return; }
    const session=getSessions().find(s=>s.id===sessionId);
    const sRegs=getRegs().filter(r=>r.sessionId===sessionId);
    const players=getPlayers();
    const cfg=TOURNAMENT_CONFIG[session.type];
    area.innerHTML=`<p style="margin:14px 0;color:var(--text-secondary);font-size:13px;">Zadaj umiestnenie. Multiplikátor ×${cfg.multiplier}</p>
    <div class="score-input-grid">
        ${sRegs.map(r=>{const p=players.find(pl=>pl.id===r.playerId);return p?`<div class="score-input-row">
            <div class="player-avatar-sm">${p.name.charAt(0)}</div>
            <span class="player-name">${p.name}</span>
            <span style="flex:1;font-size:11px;color:var(--text-tertiary)">${p.city}</span>
            <input type="number" min="1" max="${cfg.maxPlayers}" placeholder="#" data-player-id="${p.id}" class="result-placement">
        </div>`:'';}).join('')}
    </div>
    <div style="margin-top:16px"><button class="btn-primary" onclick="submitResults('${sessionId}')">💾 Uložiť a prideliť body</button></div>`;
}

// ── Live Editor ──
function openLiveEditor(sessionId) {
    const live=getLive(sessionId), session=getSessions().find(s=>s.id===sessionId);
    if (!live||!session) return;
    const players=getPlayers();
    const content=document.getElementById('modal-match-content');
    let html='';

    if (session.type==='bracket'||session.type==='1v1') {
        live.bracket?.forEach((round,ri)=>{
            const rn=['1. kolo','Štvrťfinále','Semifinále','Finále'][Math.max(0,4-live.bracket.length+ri)]||`Kolo ${ri+1}`;
            html+=`<h4 style="margin:14px 0 8px;font-size:12px;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.06em;">${rn}</h4>`;
            round.forEach((m,mi)=>{
                const p1=players.find(p=>p.id===m.player1);
                const p2=players.find(p=>p.id===m.player2);
                if (m.winner||(!p1&&!p2)) {
                    const w=players.find(p=>p.id===m.winner);
                    html+=`<div class="live-match-editor" style="opacity:.55"><div style="font-size:13px">✓ ${p1?.name||'TBD'} <strong>${m.score1}</strong>:<strong>${m.score2}</strong> ${p2?.name||'TBD'} — Víťaz: <strong>${w?.name||'TBD'}</strong></div></div>`;
                } else {
                    html+=`<div class="live-match-editor"><h4>${p1?.name||'TBD'} vs ${p2?.name||'TBD'}</h4>
                    <div class="score-editor-row">
                        <div class="score-editor-player"><div class="player-avatar-sm">${p1?.name?.charAt(0)||'?'}</div><span>${p1?.name||'TBD'}</span></div>
                        <input type="number" class="score-editor-input" id="s1_${ri}_${mi}" min="0" placeholder="0">
                        <span class="score-editor-vs">:</span>
                        <input type="number" class="score-editor-input" id="s2_${ri}_${mi}" min="0" placeholder="0">
                        <div class="score-editor-player"><div class="player-avatar-sm">${p2?.name?.charAt(0)||'?'}</div><span>${p2?.name||'TBD'}</span></div>
                        <button class="btn-primary btn-sm" onclick="saveBracketMatch('${sessionId}',${ri},${mi})">Potvrdiť</button>
                    </div></div>`;
                }
            });
        });
    } else {
        live.currentMatches?.forEach((m,mi)=>{
            const p1n=m.player1?(players.find(p=>p.id===m.player1)?.name||'?'):(m.label||`Zápas ${mi+1}`);
            const p2n=m.player2?(players.find(p=>p.id===m.player2)?.name||'?'):'Súper';
            if (m.status==='done') {
                html+=`<div class="live-match-editor" style="opacity:.55"><div style="font-size:13px">✓ ${p1n} <strong>${m.score1}</strong>:<strong>${m.score2}</strong> ${p2n}</div></div>`;
            } else {
                html+=`<div class="live-match-editor"><div class="score-editor-row">
                    <div class="score-editor-player"><div class="player-avatar-sm">${p1n.charAt(0)}</div><span>${p1n}</span></div>
                    <input type="number" class="score-editor-input" id="m1_${mi}" min="0" placeholder="0">
                    <span class="score-editor-vs">:</span>
                    <input type="number" class="score-editor-input" id="m2_${mi}" min="0" placeholder="0">
                    <div class="score-editor-player"><div class="player-avatar-sm">${p2n.charAt(0)}</div><span>${p2n}</span></div>
                    <button class="btn-primary btn-sm" onclick="saveStandingMatch('${sessionId}',${mi})">Potvrdiť</button>
                </div></div>`;
            }
        });
    }

    content.innerHTML=html||'<p style="color:var(--text-secondary)">Žiadne zápasy na editáciu.</p>';
    document.querySelector('#modal-match h2').textContent=`✏️ ${session.name}`;
    openModal('modal-match');
}

function saveBracketMatch(sid,ri,mi) {
    const s1=parseInt(document.getElementById(`s1_${ri}_${mi}`)?.value);
    const s2=parseInt(document.getElementById(`s2_${ri}_${mi}`)?.value);
    if (isNaN(s1)||isNaN(s2)) { showToast('Zadaj obe skóre!','error'); return; }
    if (s1===s2) { showToast('Remíza nie je povolená!','error'); return; }
    updateLive(sid, live=>{
        const m=live.bracket[ri][mi];
        m.score1=s1; m.score2=s2; m.winner=s1>s2?m.player1:m.player2; m.status='done';
        if (ri<live.bracket.length-1) {
            const next=live.bracket[ri+1][Math.floor(mi/2)];
            if (mi%2===0) next.player1=m.winner; else next.player2=m.winner;
        }
        return live;
    });
    showToast('Výsledok uložený!','success');
    openLiveEditor(sid); renderOrganizer();
}

function saveStandingMatch(sid,mi) {
    const s1=parseInt(document.getElementById(`m1_${mi}`)?.value);
    const s2=parseInt(document.getElementById(`m2_${mi}`)?.value);
    if (isNaN(s1)||isNaN(s2)) { showToast('Zadaj obe skóre!','error'); return; }
    updateLive(sid, live=>{
        const m=live.currentMatches[mi];
        m.score1=s1; m.score2=s2; m.winner=s1>=s2?m.player1:m.player2; m.status='done';
        if (live.standings) {
            // Update standings by name if no player id
            if (live.standings[0]?.name) {
                // name-based standings
                const wIdx = s1>=s2 ? 0 : 1;
                const lIdx = s1>=s2 ? 1 : 0;
                if (live.standings[wIdx]) { live.standings[wIdx].wins++; live.standings[wIdx].points+=3; }
                if (live.standings[lIdx]) live.standings[lIdx].losses++;
            }
            live.standings.sort((a,b)=>b.points-a.points||b.wins-a.wins);
        }
        const next=live.currentMatches[mi+1];
        if (next&&next.status==='upcoming') next.status='live';
        return live;
    });
    showToast('Zápas uložený!','success');
    openLiveEditor(sid);
}

// ── Actions ──
function openRegModal(sessionId) {
    const user=getUser();
    if (!user) { showToast('Najprv sa prihlás!','error'); navigateTo('profile'); return; }
    const session=getSessions().find(s=>s.id===sessionId);
    const cfg=TOURNAMENT_CONFIG[session.type];
    const regs=getRegs().filter(r=>r.sessionId===sessionId);
    if (regs.length>=cfg.maxPlayers) { showToast('Session je plná!','error'); return; }
    if (regs.some(r=>r.playerId===user.id)) { showToast('Už si registrovaný!','error'); return; }
    document.getElementById('modal-register-content').innerHTML=`
        <div class="reg-session-info">
            <h3>${session.name}</h3>
            <p>${cfg.icon} ${cfg.name} · Max ${cfg.maxPlayers}</p>
            <p>📅 ${formatDate(session.date)} · ${session.time}</p>
            <p>📍 ${session.city} · ${session.venue}</p>
            <p>👥 ${regs.length}/${cfg.maxPlayers} · <strong>${cfg.maxPlayers-regs.length} voľných</strong></p>
        </div>
        <div style="background:var(--bg);border-radius:var(--radius-md);padding:12px 14px;margin-bottom:16px;font-size:13px;">
            <strong>${user.name}</strong> · ${user.age}r · ${user.height}cm · ${EXPERIENCE_LABELS[user.experience]||''}
        </div>
        <button class="btn-primary btn-full" onclick="confirmReg('${sessionId}')">✓ Potvrdiť registráciu</button>`;
    openModal('modal-register');
}

function confirmReg(sessionId) {
    const user=getUser(), regs=getRegs();
    regs.push({id:uid(),sessionId,playerId:user.id,registeredAt:new Date().toISOString()});
    saveRegs(regs); closeModal('modal-register');
    showToast('Registrovaný! 🏀','success'); renderPage(currentPage);
}

function unregister(sessionId) {
    const user=getUser();
    if (!user) return;
    saveRegs(getRegs().filter(r=>!(r.sessionId===sessionId&&r.playerId===user.id)));
    showToast('Odhlásený zo session.',''); renderPage(currentPage);
}

function removeReg(sid,pid) {
    saveRegs(getRegs().filter(r=>!(r.sessionId===sid&&r.playerId===pid)));
    showToast('Registrácia zrušená.',''); renderOrganizer();
}

// ── Auth ──
function loginUser(username, password) {
    const p=getPlayers().find(p=>p.username===username&&p.password===password);
    if (!p) { showToast('Nesprávna prezývka alebo heslo!','error'); return; }
    setUser(p); updateNavUsername();
    showToast(`Vitaj, ${p.name}! 🏀`,'success'); renderProfile();
}

function registerUser(data) {
    const players=getPlayers();
    if (players.some(p=>p.username===data.username)) { showToast('Prezývka už existuje!','error'); return; }
    if (data.password!==data.password2) { showToast('Heslá sa nezhodujú!','error'); return; }
    const np={id:uid(),...data,points:0,matches:0,wins:0};
    delete np.password2;
    players.push(np); savePlayers(players); setUser(np); updateNavUsername();
    showToast(`Účet vytvorený! Vitaj, ${np.name}! 🏀`,'success'); renderProfile();
}

function logoutUser() {
    localStorage.removeItem(S.user); updateNavUsername();
    showToast('Odhlásený.',''); renderProfile();
}

function updateNavUsername() {
    const u=getUser();
    document.getElementById('nav-username').textContent=u?u.name:'Prihlásenie';
}

function togglePassword(id,btn) {
    const inp=document.getElementById(id); if (!inp) return;
    const isText=inp.type==='text'; inp.type=isText?'password':'text';
    btn.textContent=isText?'👁':'🙈';
}

// ── Sessions ──
function createSession(data) {
    const ss=getSessions(); ss.push({id:uid(),...data,status:'open'}); saveSessions(ss);
    showToast('Session vytvorená!','success'); renderOrganizer();
}

function deleteSession(id) {
    saveSessions(getSessions().filter(s=>s.id!==id));
    saveRegs(getRegs().filter(r=>r.sessionId!==id));
    removeLive(id); showToast('Session zmazaná.',''); renderOrganizer();
}

// ── Bracket ──
function generateBracket(sessionId) {
    const session=getSessions().find(s=>s.id===sessionId);
    const regs=getRegs().filter(r=>r.sessionId===sessionId);
    if (regs.length<2) { showToast('Aspoň 2 hráči!','error'); return; }
    const shuffled=[...regs].sort(()=>Math.random()-0.5).map(r=>r.playerId);
    let size=2; while(size<shuffled.length) size*=2;
    while(shuffled.length<size) shuffled.push(null);
    const bracket=[];
    const r0=[];
    for (let i=0;i<shuffled.length;i+=2) {
        const m={id:uid(),player1:shuffled[i],player2:shuffled[i+1],score1:null,score2:null,winner:null,status:'upcoming'};
        if (!m.player2) { m.winner=m.player1; m.score1='W'; m.score2='-'; m.status='done'; }
        r0.push(m);
    }
    bracket.push(r0);
    let cnt=r0.length;
    while(cnt>1) {
        cnt=Math.floor(cnt/2);
        bracket.push(Array.from({length:cnt},()=>({id:uid(),player1:null,player2:null,score1:null,score2:null,winner:null,status:'upcoming'})));
    }
    for(let r=0;r<bracket.length-1;r++) for(let m=0;m<bracket[r].length;m++) {
        if (bracket[r][m].winner) {
            const next=bracket[r+1][Math.floor(m/2)];
            if(m%2===0) next.player1=bracket[r][m].winner; else next.player2=bracket[r][m].winner;
        }
    }
    const live={sessionId,bracket,currentMatches:r0.filter(m=>!m.winner),standings:null};
    const content=document.getElementById('modal-bracket-content');
    content.innerHTML=`<p style="margin-bottom:14px;color:var(--text-secondary);font-size:13px;">Pavúk pre ${regs.length} hráčov vygenerovaný.</p>`;
    const prev=document.createElement('div'); prev.className='bracket-container';
    renderBracketView(live,prev); content.appendChild(prev);
    const btn=document.createElement('button'); btn.className='btn-primary'; btn.style.marginTop='14px';
    btn.textContent='▶ Spustiť LIVE'; btn.onclick=()=>{ if(addLive(live)){closeModal('modal-bracket');currentLiveTab=sessionId;showToast('LIVE spustená! 🏀','success');navigateTo('live');renderOrganizer();} };
    content.appendChild(btn);
    openModal('modal-bracket');
}

function startLive(sessionId) {
    const session=getSessions().find(s=>s.id===sessionId);
    const regs=getRegs().filter(r=>r.sessionId===sessionId);
    if (regs.length<2) { showToast('Aspoň 2 hráči!','error'); return; }
    if (session.type==='bracket'||session.type==='1v1') { generateBracket(sessionId); return; }
    const pids=regs.map(r=>r.playerId).sort(()=>Math.random()-0.5);
    const matches=[];
    for(let i=0;i<pids.length-1;i+=2) matches.push({id:uid(),player1:pids[i],player2:pids[i+1],score1:null,score2:null,winner:null,status:i===0?'live':'upcoming'});
    const live={sessionId,bracket:null,currentMatches:matches,standings:pids.map(pid=>({playerId:pid,wins:0,losses:0,points:0}))};
    if (addLive(live)) { currentLiveTab=sessionId; showToast('LIVE spustená! 🏀','success'); navigateTo('live'); renderOrganizer(); }
}

function endLive(sessionId) {
    const ss=getSessions(); const i=ss.findIndex(s=>s.id===sessionId);
    if(i>=0){ss[i].status='completed';saveSessions(ss);}
    removeLive(sessionId); if(currentLiveTab===sessionId)currentLiveTab=null;
    updateLiveBanner(); showToast('Session ukončená.',''); renderOrganizer();
}

function submitResults(sessionId) {
    const session=getSessions().find(s=>s.id===sessionId);
    const players=getPlayers();
    const placements=[];
    document.querySelectorAll('.result-placement').forEach(inp=>{
        const pl=parseInt(inp.value);
        if(!isNaN(pl)&&pl>0) placements.push({playerId:inp.dataset.playerId,placement:pl});
    });
    if(!placements.length){showToast('Zadaj umiestnenia!','error');return;}
    const vals=placements.map(p=>p.placement);
    if(new Set(vals).size!==vals.length){showToast('Duplicitné umiestnenie!','error');return;}
    const newRes=placements.map(({playerId,placement})=>{
        const pts=calcPoints(session.type,placement);
        const pi=players.findIndex(p=>p.id===playerId);
        if(pi>=0){players[pi].points=(players[pi].points||0)+pts;players[pi].matches=(players[pi].matches||0)+1;if(placement===1)players[pi].wins=(players[pi].wins||0)+1;}
        return {id:uid(),sessionId,playerId,placement,points:pts};
    });
    saveResults([...getResults(),...newRes]); savePlayers(players);
    const ss=getSessions(); const si=ss.findIndex(s=>s.id===sessionId);
    if(si>=0){ss[si].status='completed';saveSessions(ss);}
    showToast('Body pridelené! 🏀','success'); renderOrganizer();
}

// ── Edit Profile (with username change) ──
function openEditProfile() {
    const user=getUser(); if(!user) return;
    document.getElementById('modal-edit-content').innerHTML=`
        <form id="form-edit-profile" class="auth-form">
            <div class="form-row">
                <div class="form-group"><label>Celé meno</label><input type="text" id="edit-name" value="${user.name}" required></div>
                <div class="form-group"><label>Prezývka</label><input type="text" id="edit-username" value="${user.username}" required></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Vek</label><input type="number" id="edit-age" value="${user.age}" required min="10" max="60"></div>
                <div class="form-group"><label>Výška (cm)</label><input type="number" id="edit-height" value="${user.height}" required min="100" max="230"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Váha (kg)</label><input type="number" id="edit-weight" value="${user.weight||''}"></div>
                <div class="form-group"><label>Mesto</label>
                    <select id="edit-city" required>${['Bratislava','Praha','Košice','Berlín'].map(c=>`<option value="${c}" ${c===user.city?'selected':''}>${c}</option>`).join('')}</select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Pozícia</label>
                    <select id="edit-position">${Object.entries(POSITION_LABELS).map(([k,v])=>`<option value="${k}" ${k===user.position?'selected':''}>${v}</option>`).join('')}</select>
                </div>
                <div class="form-group"><label>Úroveň</label>
                    <select id="edit-experience" required>${Object.entries(EXPERIENCE_LABELS).map(([k,v])=>`<option value="${k}" ${k===user.experience?'selected':''}>${v}</option>`).join('')}</select>
                </div>
            </div>
            <div class="form-group"><label>Bio</label><textarea id="edit-bio" rows="2">${user.bio||''}</textarea></div>
            <div id="edit-username-hint" class="password-hint"></div>
            <button type="submit" class="btn-primary btn-full">Uložiť zmeny</button>
        </form>`;

    // username uniqueness check
    document.getElementById('edit-username').addEventListener('input', e => {
        const val = e.target.value.trim();
        const hint = document.getElementById('edit-username-hint');
        if (!val) { hint.textContent=''; return; }
        if (val === user.username) { hint.textContent=''; return; }
        const taken = getPlayers().some(p=>p.username===val&&p.id!==user.id);
        hint.textContent = taken ? '✗ Prezývka je obsadená' : '✓ Prezývka je voľná';
        hint.className = 'password-hint ' + (taken?'error':'ok');
    });

    document.getElementById('form-edit-profile').addEventListener('submit', e=>{
        e.preventDefault();
        const newUsername = document.getElementById('edit-username').value.trim();
        const players=getPlayers();
        if (newUsername!==user.username && players.some(p=>p.username===newUsername&&p.id!==user.id)) {
            showToast('Prezývka je obsadená!','error'); return;
        }
        const idx=players.findIndex(p=>p.id===user.id); if(idx<0) return;
        players[idx]={...players[idx],
            name:document.getElementById('edit-name').value,
            username:newUsername,
            age:parseInt(document.getElementById('edit-age').value),
            height:parseInt(document.getElementById('edit-height').value),
            weight:parseInt(document.getElementById('edit-weight').value)||null,
            city:document.getElementById('edit-city').value,
            position:document.getElementById('edit-position').value,
            experience:document.getElementById('edit-experience').value,
            bio:document.getElementById('edit-bio').value
        };
        savePlayers(players); setUser(players[idx]);
        closeModal('modal-edit-profile'); showToast('Profil uložený!','success'); renderProfile();
    });
    openModal('modal-edit-profile');
}

// ── Player Detail ──
function showPlayer(playerId) {
    const players=getPlayers(), p=players.find(p=>p.id===playerId); if(!p) return;
    const sorted=[...players].sort((a,b)=>b.points-a.points);
    const rank=sorted.findIndex(pl=>pl.id===playerId)+1;
    const wr=p.matches>0?Math.round((p.wins/p.matches)*100):0;
    document.getElementById('modal-player-content').innerHTML=`
        <div style="text-align:center;margin-bottom:18px;">
            <div style="font-size:44px;margin-bottom:8px">🏀</div>
            <h2 style="font-size:19px;margin-bottom:2px">${p.name}</h2>
            <p style="color:var(--text-secondary);font-size:13px">@${p.username} · Rank #${rank}</p>
        </div>
        <div class="stats-row" style="grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:18px;">
            <div class="stat-card" style="padding:12px"><span class="stat-number" style="font-size:20px">${p.points||0}</span><span class="stat-label">Body</span></div>
            <div class="stat-card" style="padding:12px"><span class="stat-number" style="font-size:20px">${p.matches||0}</span><span class="stat-label">Zápasy</span></div>
            <div class="stat-card" style="padding:12px"><span class="stat-number" style="font-size:20px">${wr}%</span><span class="stat-label">Win rate</span></div>
        </div>
        <div class="detail-rows">
            <div class="detail-row"><span class="label">Vek</span><span class="value">${p.age} r</span></div>
            <div class="detail-row"><span class="label">Výška</span><span class="value">${p.height} cm</span></div>
            <div class="detail-row"><span class="label">Váha</span><span class="value">${p.weight?p.weight+' kg':'—'}</span></div>
            <div class="detail-row"><span class="label">Mesto</span><span class="value">${p.city}</span></div>
            <div class="detail-row"><span class="label">Pozícia</span><span class="value">${POSITION_LABELS[p.position]||'—'}</span></div>
            <div class="detail-row"><span class="label">Úroveň</span><span class="value">${EXPERIENCE_LABELS[p.experience]||'—'}</span></div>
        </div>
        ${p.bio?`<p style="margin-top:14px;font-size:13px;color:var(--text-secondary);font-style:italic">"${p.bio}"</p>`:''}`;
    openModal('modal-player');
}

// ── Bulk Players ──
function bulkCreatePlayers() {
    const text=document.getElementById('notepad-names').value.trim();
    if (!text) { showToast('Zadaj aspoň jedno meno!','error'); return; }
    const city=document.getElementById('notepad-city').value;
    const names=text.split('\n').map(n=>n.trim()).filter(Boolean);
    const cities=['Bratislava','Praha','Košice','Berlín'];
    const positions=Object.keys(POSITION_LABELS);
    const exps=Object.keys(EXPERIENCE_LABELS);
    const bios=['Street baller.','Playoff mode.','Defense wins.','Buckets on demand.','Built different.','Court vision 1000.'];
    const players=getPlayers();
    const existing=new Set(players.map(p=>p.username));
    const created=[];
    names.forEach(name=>{
        const first=name.split(' ')[0]||name;
        let uname=(first.toLowerCase().replace(/[^a-z0-9]/g,'')+'_'+Math.floor(Math.random()*99));
        while(existing.has(uname)) uname+=Math.floor(Math.random()*9);
        existing.add(uname);
        const np={id:uid(),username:uname,password:'streets',name,
            age:Math.floor(Math.random()*14)+17,height:Math.floor(Math.random()*36)+170,weight:Math.floor(Math.random()*41)+65,
            city:city||cities[Math.floor(Math.random()*4)],
            position:positions[Math.floor(Math.random()*positions.length)],
            experience:exps[Math.floor(Math.random()*exps.length)],
            bio:bios[Math.floor(Math.random()*bios.length)],
            points:0,matches:0,wins:0};
        players.push(np); created.push(np);
    });
    savePlayers(players);
    document.getElementById('notepad-result').innerHTML=`
        <div style="background:var(--accent-light);border:1px solid var(--accent-mid);border-radius:var(--radius-md);padding:14px;margin-top:4px;">
            <p style="font-weight:700;color:var(--accent);margin-bottom:8px">✓ Vytvorených ${created.length} hráčov:</p>
            ${created.map(p=>`<div style="font-size:12px;padding:3px 0;border-bottom:1px solid var(--border)">
                <strong>${p.name}</strong> · @${p.username} · ${p.city} · ${p.height}cm · ${EXPERIENCE_LABELS[p.experience]} · heslo: <code style="background:var(--bg);padding:1px 5px;border-radius:4px">streets</code>
            </div>`).join('')}
        </div>`;
    showToast(`${created.length} hráčov pridaných! 🏀`,'success');
    if(currentPage==='home') renderHome();
}

// ── Modal helpers ──
function openModal(id) { document.getElementById(id).classList.add('open'); document.body.style.overflow='hidden'; }
function closeModal(id) { document.getElementById(id).classList.remove('open'); document.body.style.overflow=''; }
document.querySelectorAll('.modal-overlay').forEach(o=>o.addEventListener('click',e=>{ if(e.target===o){o.classList.remove('open');document.body.style.overflow='';} }));

// ── Toast ──
function showToast(msg,type='') {
    const c=document.getElementById('toast-container');
    const t=document.createElement('div'); t.className=`toast ${type}`; t.textContent=msg;
    c.appendChild(t); setTimeout(()=>t.remove(),3000);
}

// ── Utils ──
function formatDate(ds) {
    if(!ds) return '';
    const d=new Date(ds);
    const days=['Nedeľa','Pondelok','Utorok','Streda','Štvrtok','Piatok','Sobota'];
    const months=['jan','feb','mar','apr','máj','jún','júl','aug','sep','okt','nov','dec'];
    return `${days[d.getDay()]}, ${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function setupPwHint(id1,id2,hintId) {
    const check=()=>{
        const h=document.getElementById(hintId); if(!h) return;
        const v2=document.getElementById(id2)?.value;
        const v1=document.getElementById(id1)?.value;
        if(!v2){h.textContent='';h.className='password-hint';return;}
        if(v1===v2){h.textContent='✓ Heslá sa zhodujú';h.className='password-hint ok';}
        else{h.textContent='✗ Heslá sa nezhodujú';h.className='password-hint error';}
    };
    document.getElementById(id1)?.addEventListener('input',check);
    document.getElementById(id2)?.addEventListener('input',check);
}

// ── Init ──
document.addEventListener('DOMContentLoaded',()=>{
    seedDemoData();

    document.querySelectorAll('[data-page]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();navigateTo(el.dataset.page);}));
    document.getElementById('mobile-toggle')?.addEventListener('click',()=>document.querySelector('.nav-links')?.classList.toggle('open'));

    document.querySelectorAll('.city-tab').forEach(tab=>tab.addEventListener('click',()=>{
        document.querySelectorAll('.city-tab').forEach(t=>t.classList.remove('active'));
        tab.classList.add('active'); calCity=tab.dataset.city; renderCalendar();
    }));
    document.getElementById('filter-type')?.addEventListener('change',e=>{calType=e.target.value;renderCalendar();});
    document.getElementById('filter-month')?.addEventListener('change',()=>renderCalendar());
    document.getElementById('filter-status')?.addEventListener('change',()=>renderCalendar());
    ['lb-city','lb-type'].forEach(id=>document.getElementById(id)?.addEventListener('change',renderLeaderboard));
    document.getElementById('search-player')?.addEventListener('input',renderLeaderboard);

    document.querySelectorAll('.auth-tab').forEach(tab=>tab.addEventListener('click',()=>{
        document.querySelectorAll('.auth-tab').forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        const isLogin=tab.dataset.auth==='login';
        document.getElementById('form-login').style.display=isLogin?'':'none';
        document.getElementById('form-register').style.display=isLogin?'none':'';
    }));

    document.getElementById('form-login')?.addEventListener('submit',e=>{
        e.preventDefault();
        loginUser(document.getElementById('login-username').value, document.getElementById('login-password').value);
    });

    document.getElementById('form-register')?.addEventListener('submit',e=>{
        e.preventDefault();
        registerUser({
            name:document.getElementById('reg-name').value,
            username:document.getElementById('reg-username').value,
            age:parseInt(document.getElementById('reg-age').value),
            height:parseInt(document.getElementById('reg-height').value),
            weight:parseInt(document.getElementById('reg-weight').value)||null,
            city:document.getElementById('reg-city').value,
            position:document.getElementById('reg-position').value,
            experience:document.getElementById('reg-experience').value,
            bio:document.getElementById('reg-bio').value,
            password:document.getElementById('reg-password').value,
            password2:document.getElementById('reg-password2').value
        });
    });

    setupPwHint('reg-password','reg-password2','reg-hint');

    document.getElementById('btn-logout')?.addEventListener('click',logoutUser);
    document.getElementById('btn-edit-profile')?.addEventListener('click',openEditProfile);

    document.querySelectorAll('.org-tab').forEach(tab=>tab.addEventListener('click',()=>{
        document.querySelectorAll('.org-tab').forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.org-panel').forEach(p=>p.classList.remove('active'));
        document.getElementById('org-'+tab.dataset.org)?.classList.add('active');
        if(tab.dataset.org==='manage') renderOrgManage();
        if(tab.dataset.org==='results') renderResultSelect();
    }));

    document.getElementById('form-session')?.addEventListener('submit',e=>{
        e.preventDefault();
        createSession({
            name:document.getElementById('session-name').value,
            type:document.getElementById('session-type').value,
            city:document.getElementById('session-city').value,
            venue:document.getElementById('session-venue').value,
            date:document.getElementById('session-date').value,
            time:document.getElementById('session-time').value,
            desc:document.getElementById('session-desc').value
        }); e.target.reset();
    });

    document.getElementById('result-session')?.addEventListener('change',e=>renderResultForm(e.target.value));

    window.addEventListener('scroll',()=>{
        document.getElementById('navbar').style.boxShadow=window.scrollY>5?'0 2px 20px rgba(0,0,0,0.4)':'none';
    });

    updateNavUsername();
    updateLiveBanner();
    renderHome();
});
