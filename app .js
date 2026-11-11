// 1. CONFIGURACIÓN Y CREDENCIALES
const CONFIG = {
  diasHabitos: 14,
  columnasKanban: [
    { id: 'hoy', label: '🔥 Hoy' },
    { id: 'manana', label: '🌅 Mañana' },
    { id: 'semana', label: '📅 Esta semana' },
    { id: 'proxima', label: '➡️ Próxima semana' }
  ]
};

// CREDENCIALES CONFIGURADAS
const SUPABASE_URL = 'https://bifqmpixcempiambmlft.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bJxzX3aevjW4Hl_Zcd8Jqg_tSa-q0uZ';

// Inicializamos el cliente (Usando window.supabase para evitar el error de variable)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. UTILIDADES
const DIAS_ES_CORTO = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const LETRAS_DIA = ['D','L','M','X','J','V','S'];
const NOMBRES_MES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

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

// 3. LÓGICA DE AUTENTICACIÓN (LOGIN)
async function checkUser(){
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if(error) throw error;
    
    if(!session){
      if(!window.location.pathname.includes('login.html')){
        window.location.href = 'login.html';
      }
    } else {
      if(window.location.pathname.includes('login.html')){
        window.location.href = 'index.html';
      }
    }
    return session;
  } catch(e) {
    console.error("Error comprobando sesión:", e);
    return null;
  }
}

async function logout(){
  await supabase.auth.signOut();
  window.location.href = 'login.html';
}

// 4. NAVEGACIÓN INFERIOR
function bottomNavHTML(active){
  const tabs = [
    { id: 'plan', label: 'Plan', href: 'index.html' },
    { id: 'diario', label: 'Diario', href: 'diario.html' },
    { id: 'habitos', label: 'Hábitos', href: 'habitos.html' },
    { id: 'tablero', label: 'Tablero', href: 'tablero.html' }
  ];
  return `<nav class="bottom-nav">
    ${tabs.map((t, i) => `
      <a href="${t.href}" class="${active === t.id ? 'activo' : ''}">
        <span class="tab-num">0${i+1}</span>
        <span class="tab-label">${t.label}</span>
      </a>
    `).join('')}
    <a href="#" onclick="logout()" style="background:#a8563c; color:white;">
      <span class="tab-num">SALIR</span>
    </a>
  </nav>`;
}
