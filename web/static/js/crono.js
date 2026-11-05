(function () {
  'use strict';

  var CRONOLEAD_URL = 'https://cronolead.cronosoft.com.br/signup?utm_source=crono-scraper&utm_medium=app&utm_campaign=abordar';
  var SOCIAL = /(instagram\.com|facebook\.com|fb\.com|linktr\.ee|wa\.me|whatsapp\.com|tiktok\.com|linkedin\.com|youtube\.com|twitter\.com|x\.com)/i;
  var SIZE = {
    20: { depth: 1, maxTime: 600 },
    60: { depth: 3, maxTime: 900 },
    120: { depth: 6, maxTime: 1500 },
    200: { depth: 12, maxTime: 2400 }
  };

  var UF = {
    'acre': 'AC', 'alagoas': 'AL', 'amapa': 'AP', 'amazonas': 'AM', 'bahia': 'BA', 'ceara': 'CE',
    'distrito federal': 'DF', 'espirito santo': 'ES', 'goias': 'GO', 'maranhao': 'MA', 'mato grosso': 'MT',
    'mato grosso do sul': 'MS', 'minas gerais': 'MG', 'para': 'PA', 'paraiba': 'PB', 'parana': 'PR',
    'pernambuco': 'PE', 'piaui': 'PI', 'rio de janeiro': 'RJ', 'rio grande do norte': 'RN',
    'rio grande do sul': 'RS', 'rondonia': 'RO', 'roraima': 'RR', 'santa catarina': 'SC',
    'sao paulo': 'SP', 'sergipe': 'SE', 'tocantins': 'TO'
  };

  function uf(name) {
    var key = String(name || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^state of /, '').trim();
    return UF[key] || name || '';
  }

  var $ = function (id) { return document.getElementById(id); };
  var state = { job: null, places: [], filters: {}, map: null, layer: null, markers: {}, poll: null };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function toast(msg, ms) {
    var t = $('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { t.hidden = true; }, ms || 3500);
  }

  // Telefone brasileiro: devolve só dígitos com DDI 55 e se é celular.
  function phoneInfo(raw) {
    var d = String(raw || '').replace(/\D/g, '');
    if (!d) return { digits: '', mobile: false };
    if (d.length >= 12 && d.indexOf('55') === 0) d = d.slice(2);
    if (d.charAt(0) === '0') d = d.slice(1);
    var mobile = d.length === 11 && d.charAt(2) === '9';
    return { digits: d.length >= 10 ? '55' + d : '', mobile: mobile };
  }

  function enrich(p) {
    var site = (p.website || '').trim();
    var social = site && SOCIAL.test(site);
    var ph = phoneInfo(p.phone);
    var ig = /instagram\.com/i.test(site) ? site : '';
    return Object.assign({}, p, {
      _site: social ? '' : site,
      _social: social,
      _nosite: !site || social,
      _mobile: ph.mobile,
      _digits: ph.digits,
      _instagram: ig,
      _email: (p.emails || '').split(',')[0].trim(),
      _closed: /closed|fechad/i.test(p.status || '')
    });
  }

  function filtered() {
    var f = state.filters;
    var minRating = parseFloat($('f-rating').value) || 0;
    var minReviews = parseInt($('f-reviews').value, 10) || 0;
    return state.places.filter(function (p) {
      if (p._closed) return false;
      if (f.nosite && !p._nosite) return false;
      if (f.social && !p._social) return false;
      if (f.mobile && !p._mobile) return false;
      if (f.email && !p._email) return false;
      if (p.review_rating < minRating) return false;
      if (p.review_count < minReviews) return false;
      return true;
    });
  }

  function fmtRate(p) {
    if (!p.review_rating) return 'sem nota';
    return p.review_rating.toFixed(1).replace('.', ',') + ' (' + p.review_count + ')';
  }

  function renderStats() {
    var all = state.places.filter(function (p) { return !p._closed; });
    var count = function (k) { return all.filter(function (p) { return p[k]; }).length; };
    var rated = all.filter(function (p) { return p.review_rating > 0; });
    var avg = rated.length ? rated.reduce(function (a, p) { return a + p.review_rating; }, 0) / rated.length : 0;
    var items = [
      [all.length, 'empresas'],
      [count('_mobile'), 'com celular'],
      [count('_nosite'), 'sem site'],
      [count('_social'), 'só rede social'],
      [count('_email'), 'com e-mail'],
      [avg ? avg.toFixed(1).replace('.', ',') : '-', 'nota média']
    ];
    $('stats').innerHTML = items.map(function (i) {
      return '<div class="stat"><b>' + esc(i[0]) + '</b><span>' + esc(i[1]) + '</span></div>';
    }).join('');
  }

  function ensureMap() {
    if (state.map || !window.L) return;
    state.map = L.map('map', { scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(state.map);
    state.layer = L.layerGroup().addTo(state.map);
    state.map.setView([-15.78, -47.93], 4);
  }

  function renderList(rows) {
    var list = $('list');
    if (!rows.length) {
      list.innerHTML = '<li class="empty">' + (state.places.length ? 'Nenhuma empresa com esses filtros.' : 'Os resultados aparecem aqui conforme a busca anda.') + '</li>';
      return;
    }
    list.innerHTML = rows.map(function (p, i) {
      var tags = [];
      if (p._nosite) tags.push('<span class="tag hot">' + (p._social ? 'só rede social' : 'sem site') + '</span>');
      if (p._mobile) tags.push('<span class="tag">celular</span>');
      if (p._email) tags.push('<span class="tag">e-mail</span>');
      var links = [];
      if (p._mobile && p._digits) links.push('<a href="https://wa.me/' + esc(p._digits) + '" target="_blank" rel="noopener">WhatsApp</a>');
      if (p.link) links.push('<a href="' + esc(p.link) + '" target="_blank" rel="noopener">Google Maps</a>');
      if (p.website) links.push('<a href="' + esc(p.website) + '" target="_blank" rel="noopener">' + (p._social ? 'Rede social' : 'Site') + '</a>');
      var where = [p.borough, p.city].filter(Boolean).join(', ') || p.address || '';
      return '<li class="item" data-i="' + i + '">' +
        '<div class="item-top"><h4>' + esc(p.title) + '</h4><span class="rate">' + esc(fmtRate(p)) + '</span></div>' +
        '<p class="meta">' + esc([p.category, where].filter(Boolean).join(' · ')) + (p.phone ? ' · ' + esc(p.phone) : '') + '</p>' +
        '<div class="tags">' + tags.join('') + '</div>' +
        (links.length ? '<div class="links">' + links.join('') + '</div>' : '') +
        '</li>';
    }).join('');
  }

  function renderMap(rows) {
    ensureMap();
    if (!state.map) return;
    state.layer.clearLayers();
    state.markers = {};
    var bounds = [];
    rows.forEach(function (p, i) {
      var m = L.circleMarker([p.latitude, p.longitude], {
        radius: 7,
        weight: 2,
        color: p._nosite ? '#18181b' : '#71717a',
        fillColor: p._nosite ? '#18181b' : '#ffffff',
        fillOpacity: 0.9
      }).bindPopup('<strong>' + esc(p.title) + '</strong><br>' + esc(fmtRate(p)) + (p.phone ? '<br>' + esc(p.phone) : ''));
      m.on('click', function () { highlight(i, false); });
      m.addTo(state.layer);
      state.markers[i] = m;
      bounds.push([p.latitude, p.longitude]);
    });
    if (bounds.length) state.map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
    setTimeout(function () { state.map.invalidateSize(); }, 50);
  }

  function highlight(i, fromList) {
    var items = document.querySelectorAll('.item');
    items.forEach(function (el) { el.classList.toggle('on', el.getAttribute('data-i') === String(i)); });
    var m = state.markers[i];
    if (fromList && m) {
      state.map.setView(m.getLatLng(), Math.max(state.map.getZoom(), 15));
      m.openPopup();
    } else {
      var el = document.querySelector('.item[data-i="' + i + '"]');
      if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function render() {
    var rows = filtered();
    state.rows = rows;
    renderStats();
    renderList(rows);
    renderMap(rows);
    var name = state.job ? state.job.Name : '';
    $('results-title').textContent = rows.length + ' de ' + state.places.filter(function (p) { return !p._closed; }).length + (name ? ' · ' + name : '');
  }

  // Planilha com ; e BOM: abre certa no Excel em português e o importador do CronoLead reconhece as colunas.
  function csv(rows) {
    var head = ['Nome', 'WhatsApp', 'Telefone', 'Email', 'Cidade', 'Estado', 'Categoria', 'Site', 'Instagram', 'Observações'];
    var cell = function (v) {
      v = String(v == null ? '' : v);
      if (/^[=+\-@]/.test(v)) v = "'" + v;
      return /[;"\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    };
    var lines = rows.map(function (p) {
      var notes = [
        p.review_rating ? 'Nota ' + fmtRate(p) : '',
        p.borough ? 'Bairro: ' + p.borough : '',
        p.address ? 'Endereço: ' + p.address : '',
        p.link ? 'Maps: ' + p.link : ''
      ].filter(Boolean).join(' | ');
      return [
        p.title,
        p._mobile ? p._digits : '',
        p._mobile ? '' : p._digits,
        p._email,
        p.city,
        uf(p.state),
        p.category,
        p._site,
        p._instagram,
        notes
      ].map(cell).join(';');
    });
    return '﻿' + [head.join(';')].concat(lines).join('\r\n');
  }

  function download(rows, suffix) {
    if (!rows.length) { toast('Nenhuma empresa nos filtros atuais.'); return false; }
    var name = (state.job ? state.job.Name : 'empresas').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    var blob = new Blob([csv(rows)], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (name || 'empresas') + (suffix || '') + '.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    return true;
  }

  async function api(path, opts) {
    var r = await fetch(path, opts);
    if (!r.ok) {
      var msg = 'Erro ' + r.status;
      try { msg = (await r.json()).message || msg; } catch (e) { /* corpo não é JSON */ }
      throw new Error(msg);
    }
    var text = await r.text();
    return text ? JSON.parse(text) : null;
  }

  async function loadPlaces(id) {
    var places = await api('/api/v1/jobs/' + id + '/places');
    state.places = (places || []).map(enrich);
    render();
  }

  function setProgress(on, title, text) {
    $('progress').hidden = !on;
    if (title) $('progress-title').textContent = title;
    if (text) $('progress-text').textContent = text;
    $('f-submit').disabled = on;
  }

  async function follow(id) {
    clearInterval(state.poll);
    var tick = async function () {
      try {
        var job = await api('/api/v1/jobs/' + id);
        state.job = job;
        await loadPlaces(id);
        var n = state.places.length;
        if (job.Status === 'ok') {
          clearInterval(state.poll);
          setProgress(false);
          toast('Busca concluída: ' + n + ' empresas.');
          loadHistory();
        } else if (job.Status === 'failed') {
          clearInterval(state.poll);
          setProgress(false);
          toast('A busca falhou. Se aparecer captcha, espere algumas horas e tente com menos volume.', 6000);
          loadHistory();
        } else {
          setProgress(true, n ? n + ' empresas até agora…' : (job.Status === 'pending' ? 'Na fila…' : 'Buscando…'));
        }
      } catch (e) {
        clearInterval(state.poll);
        setProgress(false);
        toast('Não consegui acompanhar a busca: ' + e.message, 6000);
      }
    };
    $('results').hidden = false;
    await tick();
    if (state.job && (state.job.Status === 'pending' || state.job.Status === 'working')) {
      state.poll = setInterval(tick, 4000);
    }
  }

  async function loadHistory() {
    try {
      var jobs = (await api('/api/v1/jobs')) || [];
      jobs.sort(function (a, b) { return new Date(b.Date) - new Date(a.Date); });
      var label = { ok: 'pronta', failed: 'falhou', pending: 'na fila', working: 'buscando' };
      $('history').innerHTML = jobs.length ? jobs.slice(0, 15).map(function (j) {
        var d = new Date(j.Date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
        return '<li><button type="button" data-id="' + esc(j.ID) + '">' + esc(j.Name) + '</button><span class="status">' + esc(label[j.Status] || j.Status) + ' · ' + esc(d) + '</span></li>';
      }).join('') : '<li class="muted">Nenhuma busca ainda.</li>';
    } catch (e) { /* histórico é opcional */ }
  }

  $('search').addEventListener('submit', async function (ev) {
    ev.preventDefault();
    var niches = $('f-niche').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var place = $('f-place').value.trim();
    if (!niches.length || !place) return;
    var size = SIZE[$('f-size').value] || SIZE[60];
    var body = {
      Name: niches.join(', ') + ' em ' + place,
      keywords: niches.map(function (n) { return n + ' em ' + place; }),
      lang: 'pt',
      zoom: 15,
      lat: '',
      lon: '',
      fast_mode: false,
      radius: 10000,
      depth: size.depth,
      email: $('f-email').checked,
      max_time: size.maxTime
    };
    setProgress(true, 'Começando a busca…');
    try {
      var res = await api('/api/v1/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      state.places = [];
      state.job = { Name: body.Name };
      render();
      loadHistory();
      follow(res.id);
    } catch (e) {
      setProgress(false);
      toast('Não deu pra começar a busca: ' + e.message, 6000);
    }
  });

  $('filters').addEventListener('click', function (ev) {
    var b = ev.target.closest('.chip');
    if (!b) return;
    var k = b.getAttribute('data-f');
    state.filters[k] = !state.filters[k];
    b.setAttribute('aria-pressed', state.filters[k] ? 'true' : 'false');
    render();
  });
  $('f-rating').addEventListener('change', render);
  $('f-reviews').addEventListener('change', render);

  $('list').addEventListener('click', function (ev) {
    if (ev.target.closest('a')) return;
    var li = ev.target.closest('.item');
    if (li) highlight(li.getAttribute('data-i'), true);
  });

  $('history').addEventListener('click', function (ev) {
    var b = ev.target.closest('button[data-id]');
    if (!b) return;
    follow(b.getAttribute('data-id'));
    $('results').scrollIntoView({ behavior: 'smooth' });
  });

  $('a-download').addEventListener('click', function () {
    if (download(state.rows || [])) toast('Planilha baixada. Abre direto no Excel.');
  });

  $('a-copy').addEventListener('click', async function () {
    var phones = (state.rows || []).map(function (p) { return p._digits; }).filter(Boolean);
    if (!phones.length) { toast('Nenhum telefone nos filtros atuais.'); return; }
    try {
      await navigator.clipboard.writeText(phones.join('\n'));
      toast(phones.length + ' telefones copiados.');
    } catch (e) {
      toast('O navegador bloqueou a cópia. Use "Baixar planilha".');
    }
  });

  $('a-cronolead').addEventListener('click', function () {
    var rows = (state.rows || []).filter(function (p) { return p._mobile; });
    if (!download(rows, '-cronolead')) return;
    toast('Planilha com ' + rows.length + ' celulares baixada. No CronoLead, crie a conta e use Importar lista.', 8000);
    window.open(CRONOLEAD_URL, '_blank', 'noopener');
  });

  loadHistory();
})();
