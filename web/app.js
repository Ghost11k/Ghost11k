const CONFIG = {
  diasHabitos: 14,
  columnasKanban: [
    { id: 'hoy', label: '🔥 Hoy' },
    { id: 'manana', label: '🌅 Mañana' },
    { id: 'semana', label: '📅 Esta semana' },
    { id: 'proxima', label: '➡️ Próxima semana' }
  ],
  claveStorage: 'mi-organizacion-v2'
};

const DIAS_ES_CORTO = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const LETRAS_DIA = ['D','L','M','X','J','V','S'];
const NOMBRES_MES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function defaultData(){
  return {
    diario: [],
    habitos: [],
    tablero: [],
    plan: { vision: '', objetivos: [] },
    semana: []
  };
}

function cargar(){
  try{
    const raw = localStorage.getItem(CONFIG.claveStorage);
    if(!raw) return defaultData();
    const p = JSON.parse(raw);
    return {
      diario: p.diario || [],
      habitos: p.habitos || [],
      tablero: p.tablero || [],
      plan: p.plan || { vision: '', objetivos: [] },
      semana: p.semana || []
    };
  }catch(e){ return defaultData(); }
}

function guardar(d){
  try{ localStorage.setItem(CONFIG.claveStorage, JSON.stringify(d)); }
  catch(e){ alert('No se pudo guardar.'); }
}

function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function iso(d){ d = new Date(d); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function hoy(){ return iso(new Date()); }
function esc(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function fechaBonita(s){ if(!s) return ''; const [a,m,d] = s.split('-'); return d+'/'+m+'/'+a; }

function getMonday(date){
  const d = new Date(date); d.setHours(0,0,0,0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}
function addDays(date, n){ const d = new Date(date); d.setDate(d.getDate() + n); return d; }
function getQuarter(date){ return Math.floor(date.getMonth() / 3) + 1; }

function formatWeekRange(monday){
  const friday = addDays(monday, 4);
  const m1 = NOMBRES_MES[monday.getMonth()].slice(0,3);
  const m2 = NOMBRES_MES[friday.getMonth()].slice(0,3);
  if(monday.getMonth() === friday.getMonth()){
    return `${monday.getDate()}–${friday.getDate()} ${m1}`;
  }
  return `${monday.getDate()} ${m1} – ${friday.getDate()} ${m2}`;
}

function bottomNavHTML(active){
  const tabs = [
    { id: 'plan', label: 'Plan', href: 'index.html' },
    { id: 'diario', label: 'Diario', href: 'diario.html' },
    { id: 'habitos', label: 'Hábitos', href: 'habitos.html' },
    { id: 'tablero', label: 'Tablero', href: 'tablero.html' }
  ];
  return `<nav class="bottom-nav">${tabs.map((t, i) => `
    <a href="${t.href}" class="${active === t.id ? 'activo' : ''}">
      <span class="tab-num">0${i+1}</span>
      <span class="tab-label">${t.label}</span>
    </a>
  `).join('')}</nav>`;
}

function mountBackupBar(container, onImport){
  if(!container) return;
  container.insertAdjacentHTML('beforeend', `
    <div class="backup-bar">
      <p class="note">Los datos viven solo en este navegador. Exporta regularmente.</p>
      <button class="btn ghost" id="exportar">⬇ Exportar</button>
      <button class="btn ghost" id="importar-btn">⬆ Importar</button>
      <input type="file" id="importar" accept="application/json" hidden>
    </div>
  `);
  document.getElementById('exportar').addEventListener('click', () => {
    const d = cargar();
    const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'backup-' + hoy() + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  document.getElementById('importar-btn').addEventListener('click', () => {
    document.getElementById('importar').click();
  });
  document.getElementById('importar').addEventListener('change', ev => {
    const f = ev.target.files[0];
    if(!f) return;
    const r = new FileReader();
    r.onload = () => {
      try{
        const n = JSON.parse(r.result);
        if(!confirm('Esto reemplaza todos los datos. ¿Continuar?')) return;
        const merged = Object.assign(defaultData(), n);
        guardar(merged);
        if(onImport) onImport(merged);
        else location.reload();
      }catch(e){ alert('Archivo inválido.'); }
    };
    r.readAsText(f);
    ev.target.value = '';
  });
}