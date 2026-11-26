/* Ciela · datos compartidos entre la web y el panel.
   Boceto: todo se guarda en este navegador (localStorage). En la versión real va a una base de datos. */
(function () {
  var K = { cfg: 'ciela.cfg', res: 'ciela.res', gift: 'ciela.gift', qs: 'ciela.qs', acu: 'ciela.acu', seed: 'ciela.seed' };
  var VERSION = '4';
  var DEF = {
    sena: 30,
    precios: { tarot: [12000, 20000, 32000], cn: 35000, rs: 35000, tirada: 30000, inf: 40000, enc: 60000, encExtra: 8000 },
    activos: { tarot: true, cn: true, rs: true, tirada: true, inf: true, enc: true },
    horas: { 0: [], 1: ['10:00', '11:30', '15:00', '17:00', '18:30'], 2: ['15:00', '17:00', '18:30'], 3: ['10:00', '11:30', '15:00', '17:00', '18:30'], 4: ['15:00', '17:00', '18:30'], 5: ['10:00', '11:30', '15:00'], 6: ['10:00', '11:30'] },
    libres: []
  };
  var SERV = {
    tarot: { n: 'Lectura de Tarot', opts: ['Lectura express', 'Lectura básica', 'Lectura extensa'], dur: ['15 min', '30 min', '1 hora'] },
    cn: { n: 'Carta natal' }, rs: { n: 'Revolución Solar' }, tirada: { n: 'Tirada astrológica' }, inf: { n: 'Carta natal infantil' }, enc: { n: 'Encuentro y Tarot' }
  };
  function rd(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function wr(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { var p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2], 12); }
  function addD(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function precio(cfg, tipo, opt) { var p = cfg.precios[tipo]; return Array.isArray(p) ? p[opt == null ? 1 : opt] : p; }
  function code() { var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = 'CIELA-'; for (var i = 0; i < 4; i++) s += a[Math.floor(Math.random() * a.length)]; return s; }

  function seed() {
    if (localStorage.getItem(K.seed) === VERSION) return;
    var cfg = clone(DEF), t = new Date(); t.setHours(12, 0, 0, 0);
    var s = 11; function r() { s = (s * 16807) % 2147483647; return s / 2147483647; }
    var N = ['Laura', 'Vero', 'Sofía', 'Marina', 'Caro', 'Paula', 'Andrea', 'Mónica', 'Silvia', 'Romina', 'Flor', 'Gabi', 'Natalia', 'Julieta', 'Lorena', 'Cecilia', 'Mariela', 'Valeria'];
    var TEMAS = ['Trabajo', 'Un vínculo', 'Una decisión', 'Mudanza', 'Estudios', ''];
    var LUG = ['San Isidro', 'Tigre', 'CABA', 'Vicente López', 'Pilar', 'San Fernando'];
    var res = [], id = 1;
    for (var k = -26; k <= 30; k++) {
      var d = addD(t, k), hs = cfg.horas[d.getDay()] || [];
      for (var j = 0; j < hs.length; j++) {
        var h = hs[j], dens = k < 0 ? 0.55 : k === 0 ? 0.75 : k < 10 ? 0.5 : 0.28;
        if (r() > dens) continue;
        var tp = r(), tipo = tp < 0.44 ? 'tarot' : tp < 0.6 ? 'cn' : tp < 0.76 ? 'rs' : tp < 0.89 ? 'tirada' : 'enc';
        if (tipo === 'enc' && h !== '18:30') tipo = 'tarot';
        var opt = tipo === 'tarot' ? Math.floor(r() * 3) : null;
        var combo = (tipo === 'cn' && r() < 0.35) ? [{ tipo: 'cn', opt: null }, { tipo: 'rs', opt: null }] : null;
        var pr = precio(cfg, tipo, opt) + (combo ? cfg.precios.rs : 0) + (tipo === 'enc' ? Math.floor(r() * 4) * cfg.precios.encExtra : 0);
        var pas = k < 0;
        var estado = pas ? (r() < 0.07 ? 'cancelada' : 'hecha') : 'confirmada';
        var pagado = pas ? (r() < 0.16 ? Math.round(pr * 0.3) : pr) : Math.round(pr * cfg.sena / 100);
        var nom = N[Math.floor(r() * N.length)];
        res.push({
          id: 'r' + (id++), tipo: tipo, opt: opt, combo: combo, fecha: ymd(d), hora: h, nombre: nom,
          tel: '11 5555-0' + pad(Math.floor(r() * 99)) + Math.floor(r() * 9),
          mod: 'Videollamada',
          grupo: tipo === 'enc' ? 6 + Math.round((pr - cfg.precios.enc) / cfg.precios.encExtra) : null,
          precio: pr, pagado: pagado, estado: estado, origen: r() < 0.72 ? 'web' : 'manual',
          nac: (tipo === 'rs' || tipo === 'cn') ? { fecha: (1960 + Math.floor(r() * 40)) + '-' + pad(1 + Math.floor(r() * 12)) + '-' + pad(1 + Math.floor(r() * 28)), hora: pad(Math.floor(r() * 24)) + ':' + pad(Math.floor(r() * 60)), lugar: LUG[Math.floor(r() * LUG.length)] } : null,
          nota: tipo === 'tarot' ? TEMAS[Math.floor(r() * TEMAS.length)] : '',
          creado: ymd(addD(d, -1 - Math.floor(r() * 9)))
        });
      }
    }
    var acu = [
      { id: 'a1', nombre: 'Mariela', nene: 'Benjamín', nac: { fecha: '2025-03-14', hora: '08:40', lugar: 'San Isidro' }, etapa: 1, precio: cfg.precios.inf, pagado: cfg.precios.inf, creado: ymd(addD(t, -12)), tel: '11 5555-0141' },
      { id: 'a2', nombre: 'Cecilia', nene: 'Olivia', nac: { fecha: '2021-11-02', hora: '17:15', lugar: 'CABA' }, etapa: 0, precio: cfg.precios.inf, pagado: Math.round(cfg.precios.inf * 0.3), creado: ymd(addD(t, -3)), tel: '11 5555-0187' },
      { id: 'a3', nombre: 'Lorena', nene: 'Tomás', nac: { fecha: '2019-07-21', hora: '03:05', lugar: 'Tigre' }, etapa: 2, precio: cfg.precios.inf, pagado: cfg.precios.inf, creado: ymd(addD(t, -20)), tel: '11 5555-0112' },
      { id: 'a4', nombre: 'Paula', nene: 'Emma', nac: { fecha: '2024-12-09', hora: '11:50', lugar: 'Pilar' }, etapa: 3, precio: cfg.precios.inf, pagado: cfg.precios.inf, creado: ymd(addD(t, -34)), tel: '11 5555-0163' },
      { id: 'a5', nombre: 'Natalia', nene: 'Lucas', nac: { fecha: '2023-05-30', hora: '22:10', lugar: 'Vicente López' }, etapa: 0, precio: cfg.precios.inf, pagado: Math.round(cfg.precios.inf * 0.3), creado: ymd(addD(t, -1)), tel: '11 5555-0129' }
    ];
    var gift = [
      { code: 'CIELA-7K2Q', tipo: 'tarot', opt: 1, precio: cfg.precios.tarot[1], para: 'Mónica', de: 'Julieta', dedic: 'Feliz cumple, ma. Que el cielo te sorprenda', nota: '', vendida: ymd(addD(t, -9)), usada: false },
      { code: 'CIELA-M4HX', tipo: 'rs', opt: null, items: [{ tipo: 'rs', opt: null }], precio: cfg.precios.rs, para: 'Abuela Marta', de: 'Lu', dedic: 'Gracias por acompañarme siempre, este regalo es para vos', nota: '¡Abuela querida, feliz cumpleaños!', vendida: ymd(addD(t, -4)), usada: false },
      { code: 'CIELA-P9TD', tipo: 'cn', opt: null, items: [{ tipo: 'cn', opt: null }, { tipo: 'rs', opt: null }], precio: cfg.precios.cn + cfg.precios.rs, para: 'Silvia', de: 'Las chicas del trabajo', dedic: 'Para que arranques el año con todo', nota: '', vendida: ymd(addD(t, -18)), usada: true },
      { code: 'CIELA-W3RA', tipo: 'tarot', opt: 0, precio: cfg.precios.tarot[0], para: 'Flor', de: 'Gabi', dedic: 'Un mimo para vos', nota: '', vendida: ymd(addD(t, -1)), usada: false }
    ];
    var qs = [
      { id: 'q1', q: '¿Qué diferencia hay entre una luna nueva y una llena para empezar algo?', quien: 'Laura · alumna', r: 'La luna nueva es siembra: buen momento para intenciones. La llena es cosecha: ver resultados y soltar.', fecha: ymd(addD(t, -10)), pub: true },
      { id: 'q2', q: '¿Necesito la hora exacta para la Revolución Solar?', quien: 'Vero', r: 'Sí, con la hora de nacimiento la lectura es mucho más precisa. Está en la partida de nacimiento.', fecha: ymd(addD(t, -6)), pub: true },
      { id: 'q3', q: '¿Qué significa tener muchos planetas en la casa 12?', quien: 'Romina', r: null, fecha: ymd(addD(t, -2)), pub: true },
      { id: 'q4', q: '¿El tarot sirve para preguntas de trabajo?', quien: 'Andrea', r: null, fecha: ymd(addD(t, -1)), pub: true }
    ];
    wr(K.cfg, cfg); wr(K.res, res); wr(K.acu, acu); wr(K.gift, gift); wr(K.qs, qs);
    localStorage.setItem(K.seed, VERSION);
  }

  function cfg() { var c = rd(K.cfg, null) || clone(DEF); for (var k in DEF) if (c[k] == null) c[k] = clone(DEF[k]); return c; }
  function list(k) { return rd(k, []); }
  function tomado(res, fecha, hora) { return res.some(function (x) { return x.fecha === fecha && x.hora === hora && x.estado !== 'cancelada'; }); }
  // horarios del día con su estado: libre u ocupado (para la web y el panel)
  function horasDia(fecha) {
    var c = cfg(), d = parse(fecha), res = list(K.res);
    if (c.libres.indexOf(fecha) >= 0) return [];
    return (c.horas[d.getDay()] || []).slice().sort().map(function (h) { return { h: h, ocupado: tomado(res, fecha, h) }; });
  }
  try { seed(); } catch (e) {}

  window.CS = {
    K: K, SERV: SERV, DEF: DEF, ymd: ymd, parse: parse, addD: addD, precio: precio, code: code, horasDia: horasDia,
    cfg: cfg, saveCfg: function (c) { wr(K.cfg, c); },
    res: function () { return list(K.res); }, saveRes: function (v) { wr(K.res, v); },
    acu: function () { return list(K.acu); }, saveAcu: function (v) { wr(K.acu, v); },
    gifts: function () { return list(K.gift); }, saveGifts: function (v) { wr(K.gift, v); },
    qs: function () { return list(K.qs); }, saveQs: function (v) { wr(K.qs, v); },
    add: function (k, item) { var l = list(k); l.push(item); wr(k, l); return item; },
    nid: function (p) { return p + Date.now().toString(36) + Math.floor(Math.random() * 1e4); },
    reset: function () { [K.cfg, K.res, K.acu, K.gift, K.qs, K.seed].forEach(function (k) { localStorage.removeItem(k); }); seed(); }
  };
})();
