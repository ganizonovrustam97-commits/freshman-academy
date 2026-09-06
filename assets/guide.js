/* ============================================================
   Freshman Academy — рендер страниц «Страны», «Гранты», «Как поступать»
   Данные: assets/data.js (window.FA). Разметка строится из тех же
   компонентов, что и остальной сайт.
   ============================================================ */
(function () {
  if (!window.FA) return;
  var D = window.FA;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function mark(v) {
    if (v === true) return '<span class="cm-badge ok" title="Подтверждено официальным источником">проверено</span>';
    if (v === false) return '<span class="cm-badge check" title="Требует проверки на официальном сайте">уточнить</span>';
    return '';
  }
  function el(id) { return document.getElementById(id); }

  var TAG_LABEL = {
    top: 'Топ-направление', value: 'Лучшая цена', scholarships: 'Гранты',
    easier: 'Проще поступить', elite: 'Элитные вузы'
  };
  var REGION_LABEL = {
    usa: 'США', canada: 'Канада', uk: 'Великобритания', europe: 'Европа', asia: 'Азия и Ближний Восток'
  };
  var SCH_LABEL = {
    'full-ride': 'Full ride', 'full-tuition': 'Full tuition', partial: 'Partial',
    merit: 'Merit', 'need-based': 'Need-based', government: 'Government'
  };

  /* ---------- краткие показатели страны из сравнительной таблицы ---------- */
  var cmpByName = {};
  (D.comparison || []).forEach(function (r) { cmpByName[r.country] = r; });

  function cmpRow(c) {
    return cmpByName[c.name] || cmpByName[c.flag + ' ' + c.name] || null;
  }

  /* ============================================================
     1. КАРТОЧКИ СТРАН
     ============================================================ */
  var grid = el('countryGrid');
  if (grid) {
    var current = 'all';

    function cardHTML(c) {
      var r = cmpRow(c) || {};
      var tags = (c.tags || []).slice(0, 2).map(function (t, i) {
        return '<span class="ctry-tag' + (i === 0 ? ' gold' : '') + '">' + esc(TAG_LABEL[t] || t) + '</span>';
      }).join('');
      var rows = [
        ['Обучение', r.tuition],
        ['Проживание', r.living],
        ['IELTS', r.ielts],
        ['SAT', r.sat],
        ['100% финансирование', r.fullFunding]
      ].filter(function (x) { return x[1]; }).map(function (x) {
        return '<div class="ctry-row"><span>' + esc(x[0]) + '</span><b>' + esc(x[1]) + '</b></div>';
      }).join('');
      return '<button class="ctry-card fade-up" data-id="' + esc(c.id) + '" data-region="' + esc(c.region) +
        '" data-tags="' + esc((c.tags || []).join(' ')) + '">' +
        '<div class="ctry-head"><span class="ctry-flag">' + esc(c.flag) + '</span><h3>' + esc(c.name) + '</h3></div>' +
        '<div class="ctry-tags">' + tags + '</div>' +
        '<div class="ctry-rows">' + rows + '</div>' +
        '<div class="ctry-more">Требования, гранты, дедлайны →</div>' +
        '</button>';
    }

    grid.innerHTML = D.countries.map(cardHTML).join('');

    function applyFilter(f) {
      current = f;
      var shown = 0;
      Array.prototype.forEach.call(grid.children, function (card) {
        var ok = f === 'all' || card.dataset.region === f || card.dataset.tags.split(' ').indexOf(f) >= 0;
        card.style.display = ok ? '' : 'none';
        if (ok) shown++;
      });
      var note = el('countryCount');
      if (note) note.textContent = 'Показано стран: ' + shown + ' из ' + D.countries.length;
    }
    applyFilter('all');

    document.querySelectorAll('[data-cfilter]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('[data-cfilter]').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        applyFilter(b.dataset.cfilter);
      });
    });

    /* ---------- модальное окно страны ---------- */
    var overlay = el('countryModal'), body = el('countryModalBody');

    function kv(rows) {
      return '<table class="cm-kv">' + rows.map(function (r) {
        return '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + (r[2] !== undefined ? mark(r[2]) : '') + '</td></tr>';
      }).join('') + '</table>';
    }

    function detailHTML(c) {
      var h = '<div class="cm-head"><span class="ctry-flag">' + esc(c.flag) + '</span><h2>' + esc(c.name) + '</h2></div>';
      if (c.summary) h += '<p class="cm-sum">' + esc(c.summary) + '</p>';

      /* требования: официальные и конкурентные — строго раздельно */
      var req = c.requirements || {};
      if ((req.official && req.official.length) || (req.competitive && req.competitive.length)) {
        h += '<div class="cm-sec"><h3>Требования</h3>';
        if (req.official && req.official.length) {
          h += '<p class="mini" style="font-size:.78rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);margin-bottom:.5rem;">Официальные требования — формальный минимум</p>';
          h += kv(req.official.map(function (o) { return [o.item, o.value, o.verified]; }));
        }
        if (req.competitive && req.competitive.length) {
          h += '<p class="mini" style="font-size:.78rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--gold-dark);margin:1.2rem 0 .5rem;">Конкурентный профиль поступивших — это не минимум</p>';
          h += '<div class="cmp-wrap"><table class="cmp" style="min-width:640px;"><thead><tr><th>Уровень вуза</th><th>SAT</th><th>GPA</th><th>English</th><th>Активности</th></tr></thead><tbody>' +
            req.competitive.map(function (r) {
              return '<tr><td class="c-name">' + esc(r.level) + '</td><td>' + esc(r.sat || '—') + '</td><td>' + esc(r.gpa || '—') +
                '</td><td>' + esc(r.english || '—') + '</td><td>' + esc(r.extra || '—') + '</td></tr>';
            }).join('') + '</tbody></table></div>';
        }
        h += '</div>';
      }

      /* стоимость */
      if (c.cost && c.cost.rows && c.cost.rows.length) {
        h += '<div class="cm-sec"><h3>Стоимость' + (c.cost.currency ? ', ' + esc(c.cost.currency) + '/год' : '') + '</h3>' +
          kv(c.cost.rows.map(function (r) { return [r.item + (r.note ? ' (' + r.note + ')' : ''), r.value, r.verified]; }));
        if (c.cost.totalValue) {
          h += '<div class="cm-callout"><b>' + esc(c.cost.totalLabel || 'Итого') + ':</b> ' + esc(c.cost.totalValue) + '</div>';
        }
        h += '</div>';
      }

      /* стипендии и полное финансирование */
      if (c.scholarshipsSummary || c.fullFunding) {
        h += '<div class="cm-sec"><h3>Стипендии и полное финансирование</h3>';
        if (c.scholarshipsSummary) h += '<p style="font-size:.92rem;">' + esc(c.scholarshipsSummary) + '</p>';
        if (c.fullFunding) {
          var ff = c.fullFunding, label = { yes: 'Да, возможно', partial: 'Частично', no: 'Нет' }[ff.possible] || ff.possible;
          h += kv([['100% финансирование', label], ['Каким образом', ff.how || '—']]);
          if (ff.caveat) h += '<div class="cm-callout"><b>Честная оговорка:</b> ' + esc(ff.caveat) + '</div>';
        }
        var own = (D.scholarships || []).filter(function (s) { return s.country === c.name; });
        if (own.length) {
          h += '<p style="font-size:.86rem;color:var(--muted);margin-top:1rem;">Программы в базе: ' +
            own.slice(0, 6).map(function (s) { return esc(s.name); }).join(' · ') +
            (own.length > 6 ? ' и ещё ' + (own.length - 6) : '') +
            ' — <a href="scholarships.html" style="color:var(--gold-dark);font-weight:600;">все гранты</a></p>';
        }
        h += '</div>';
      }

      /* дедлайны */
      if (c.deadlines && c.deadlines.length) {
        h += '<div class="cm-sec"><h3>Дедлайны</h3>' +
          kv(c.deadlines.map(function (d) { return [d.event, d.date || 'уточняется на сайте вуза', d.verified]; })) + '</div>';
      }

      /* процесс подачи */
      if (c.process && c.process.length) {
        h += '<div class="cm-sec"><h3>Как подаваться</h3><ul class="cm-list">' +
          c.process.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div>';
      }

      /* документы + foundation */
      if ((c.documents && c.documents.length) || c.foundation) {
        h += '<div class="cm-sec"><h3>Документы и подготовительный год</h3><div class="cm-two">';
        if (c.documents && c.documents.length) {
          h += '<div><ul class="cm-list">' + c.documents.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul></div>';
        }
        if (c.foundation) h += '<div><p style="font-size:.9rem;">' + esc(c.foundation) + '</p></div>';
        h += '</div></div>';
      }

      /* кому подходит / плюсы / минусы */
      if ((c.pros && c.pros.length) || (c.cons && c.cons.length) || (c.goodFor && c.goodFor.length)) {
        h += '<div class="cm-sec"><h3>Кому подходит</h3>';
        if (c.goodFor && c.goodFor.length) {
          h += '<ul class="cm-list">' + c.goodFor.map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ul>';
        }
        h += '<div class="cm-two" style="margin-top:1rem;">';
        if (c.pros && c.pros.length) h += '<div><b style="font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;color:var(--gold-dark);">Плюсы</b><ul class="cm-list">' + c.pros.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div>';
        if (c.cons && c.cons.length) h += '<div><b style="font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);">Минусы</b><ul class="cm-list cons">' + c.cons.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div>';
        h += '</div></div>';
      }

      /* университеты */
      if (c.universities) {
        var u = c.universities, blocks = [['elite', 'Элитные'], ['target', 'Целевые'], ['accessible', 'Доступные']]
          .filter(function (b) { return u[b[0]] && u[b[0]].length; });
        if (blocks.length) {
          h += '<div class="cm-sec"><h3>Университеты</h3>' + blocks.map(function (b) {
            return '<p style="font-size:.8rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:.9rem 0 .1rem;">' + b[1] + '</p>' +
              '<div class="cm-uni">' + u[b[0]].map(function (n) { return '<span>' + esc(n) + '</span>'; }).join('') + '</div>';
          }).join('') + '</div>';
        }
      }

      h += '<div class="cm-sec" style="text-align:center;"><a href="https://t.me/freshman_academy" target="_blank" rel="noopener" class="btn btn-gold">Разобрать мой профиль под эту страну</a></div>';
      return h;
    }

    function openCountry(id) {
      var c = D.countries.filter(function (x) { return x.id === id; })[0];
      if (!c || !overlay) return;
      body.innerHTML = detailHTML(c);
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      overlay.scrollTop = 0;
    }
    function closeCountry() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
    grid.addEventListener('click', function (e) {
      var card = e.target.closest('.ctry-card');
      if (card) openCountry(card.dataset.id);
    });
    if (overlay) {
      overlay.addEventListener('click', function (e) { if (e.target === overlay) closeCountry(); });
      var cbtn = el('cmClose');
      if (cbtn) cbtn.addEventListener('click', closeCountry);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('open')) closeCountry(); });
    }
  }

  /* ============================================================
     2. СРАВНИТЕЛЬНАЯ ТАБЛИЦА
     ============================================================ */
  var cmpBody = el('cmpBody');
  if (cmpBody) {
    cmpBody.innerHTML = (D.comparison || []).map(function (r) {
      return '<tr><td class="c-name">' + esc(r.flag || '') + ' ' + esc(r.country) + '</td>' +
        '<td>' + esc(r.tuition || '—') + '</td><td>' + esc(r.living || '—') + '</td>' +
        '<td>' + esc(r.ielts || '—') + '</td><td>' + esc(r.sat || '—') + '</td>' +
        '<td>' + esc(r.scholarships || '—') + '</td><td>' + esc(r.fullFunding || '—') + '</td>' +
        '<td>' + esc(r.admissionDifficulty || '—') + '</td><td>' + esc(r.scholarshipDifficulty || '—') + '</td></tr>';
    }).join('');
  }

  /* бюджет и профиль */
  var budget = el('budgetGrid');
  if (budget) {
    budget.innerHTML = (D.byBudget || []).map(function (b, i) {
      return '<div class="why-card fade-up"><span class="why-num">0' + (i + 1) + '</span>' +
        '<h3>' + esc(b.range) + '</h3>' +
        '<p>' + esc((b.countries || []).join(' · ')) + '</p>' +
        (b.note ? '<p style="font-size:.85rem;">' + esc(b.note) + '</p>' : '') + '</div>';
    }).join('');
  }
  var profile = el('profileGrid');
  if (profile) {
    profile.innerHTML = (D.byProfile || []).map(function (p) {
      return '<div class="journey-step fade-up"><h3>' + esc(p.profile) + '</h3><p>' + esc(p.recommendation) + '</p></div>';
    }).join('');
  }

  /* ============================================================
     3. ГРАНТЫ
     ============================================================ */
  var schGrid = el('schGrid');
  if (schGrid) {
    function schCard(s) {
      var types = (s.types && s.types.length ? s.types : [s.type]).filter(Boolean);
      var badges = types.map(function (t) {
        var cls = t === 'full-ride' ? ' full' : (t === 'government' ? ' gov' : '');
        return '<span class="sch-b' + cls + '">' + esc(SCH_LABEL[t] || t) + '</span>';
      }).join('');
      var rows = [
        ['Покрытие', s.coverage], ['Кто может подать', s.eligibility],
        ['Уровень', s.level], ['Дедлайн', s.deadline || 'уточняется'], ['Конкурс', s.competition]
      ].filter(function (x) { return x[1]; }).map(function (x) {
        return '<div><b>' + esc(x[0]) + '</b>' + esc(x[1]) + '</div>';
      }).join('');
      var notUG = s.level && /PG|магистрат|PhD/i.test(s.level) && !/UG|бакалавр/i.test(s.level);
      return '<div class="sch-card fade-up" data-types="' + esc(types.join(' ')) + '" data-name="' +
        esc((s.name + ' ' + (s.country || '') + ' ' + (s.org || '')).toLowerCase()) + '">' +
        '<div class="sch-top"><span class="ctry-flag">' + esc(s.flag || '') + '</span>' +
        '<div><h3>' + esc(s.name) + '</h3><div class="sch-org">' + esc(s.country || '') +
        (s.org ? ' · ' + esc(s.org) : '') + '</div></div></div>' +
        '<div class="sch-badges">' + badges + mark(s.verified) + '</div>' +
        '<div class="sch-kv">' + rows + '</div>' +
        (notUG ? '<div class="sch-warn">Только магистратура и выше — школьнику не подходит</div>' : '') +
        (s.link ? '<a class="sch-link" href="' + esc(s.link) + '" target="_blank" rel="noopener">Официальный сайт →</a>' : '') +
        '</div>';
    }
    schGrid.innerHTML = (D.scholarships || []).map(schCard).join('');

    function schFilter() {
      var t = document.querySelector('[data-sfilter].active');
      var type = t ? t.dataset.sfilter : 'all';
      var q = (el('schSearch') ? el('schSearch').value : '').trim().toLowerCase();
      var shown = 0;
      Array.prototype.forEach.call(schGrid.children, function (card) {
        var okType = type === 'all' || card.dataset.types.split(' ').indexOf(type) >= 0;
        var okQ = !q || card.dataset.name.indexOf(q) >= 0;
        card.style.display = (okType && okQ) ? '' : 'none';
        if (okType && okQ) shown++;
      });
      var n = el('schCount');
      if (n) n.textContent = 'Показано программ: ' + shown + ' из ' + D.scholarships.length;
    }
    document.querySelectorAll('[data-sfilter]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('[data-sfilter]').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        schFilter();
      });
    });
    if (el('schSearch')) el('schSearch').addEventListener('input', schFilter);
    schFilter();
  }

  /* матрица полного финансирования */
  var ffBody = el('ffBody');
  if (ffBody) {
    ffBody.innerHTML = (D.fullFundingMatrix || []).map(function (r) {
      return '<tr><td class="c-name">' + esc(r.flag || '') + ' ' + esc(r.country) + '</td><td>' +
        esc(r.fullRide || '—') + '</td><td>' + esc(r.mechanism || '—') + '</td></tr>';
    }).join('');
  }
  var ffTruths = el('ffTruths');
  if (ffTruths) {
    ffTruths.innerHTML = (D.fullFundingTruths || []).map(function (t, i) {
      return '<div class="why-card fade-up"><span class="why-num">0' + (i + 1) + '</span><p>' + esc(t) + '</p></div>';
    }).join('');
  }
  var ffMistakes = el('ffMistakes');
  if (ffMistakes) {
    ffMistakes.innerHTML = '<ul class="perfect-for fade-up">' + (D.fullFundingMistakes || []).map(function (m) {
      return '<li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg> ' + esc(m) + '</li>';
    }).join('') + '</ul>';
  }

  /* ============================================================
     4. КАЛЕНДАРЬ, ДОКУМЕНТЫ, FOUNDATION, ПРОФИЛИ, FAQ
     ============================================================ */
  var cal = el('calGrid');
  if (cal) {
    cal.innerHTML = (D.calendar || []).map(function (m) {
      return '<div class="cal-month fade-up' + (m.urgent ? ' urgent' : '') + '">' +
        '<h3>' + esc(m.month) + (m.urgent ? '<span class="sch-b gov">пик подачи</span>' : '') + '</h3>' +
        (m.items || []).map(function (i) {
          return '<div class="cal-item"><b>' + esc(i.what) + '</b><span>' + esc(i.date || 'уточняется') + '</span>' + mark(i.verified) + '</div>';
        }).join('') + '</div>';
    }).join('');
  }

  var exams = el('examList');
  if (exams) {
    exams.innerHTML = (D.exams || []).map(function (e) {
      return '<div class="journey-step fade-up"><h3>' + esc(e.exam) + mark(e.verified) + '</h3><p>' +
        esc((e.dates || []).join(' · ')) + '</p></div>';
    }).join('');
  }

  var docBase = el('docBase');
  if (docBase && D.documents) {
    docBase.innerHTML = '<ul class="perfect-for fade-up">' + (D.documents.base || []).map(function (d) {
      return '<li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> ' + esc(d) + '</li>';
    }).join('') + '</ul>';
  }
  var docMatrix = el('docMatrixBody');
  if (docMatrix && D.documents) {
    docMatrix.innerHTML = (D.documents.matrix || []).map(function (r) {
      return '<tr><td class="c-name">' + esc(r.country) + '</td><td>' + esc(r.translation || '—') + '</td>' +
        '<td>' + esc(r.notary || '—') + '</td><td>' + esc(r.apostille || '—') + '</td><td>' + esc(r.legalization || '—') + '</td></tr>';
    }).join('');
  }
  var docUz = el('docUz');
  if (docUz && D.documents) {
    docUz.innerHTML = (D.documents.uzbekistan || []).map(function (u) {
      return '<div class="journey-step fade-up"><h3>' + esc(u.title) + '</h3><p>' + esc(u.text) + '</p></div>';
    }).join('');
  }

  var fnd = el('foundationMap');
  if (fnd && D.foundation) {
    fnd.innerHTML = (D.foundation.map || []).map(function (m) {
      var cls = /обязателен/i.test(m.status) ? ' gold' : '';
      return '<div class="ctry-row" style="padding:.7rem 0;border-bottom:1px solid var(--border);">' +
        '<span style="min-width:180px;color:var(--text);font-weight:600;">' + esc(m.country) + '</span>' +
        '<b style="text-align:left;flex:1;"><span class="ctry-tag' + cls + '">' + esc(m.status) + '</span> ' +
        '<span style="font-weight:400;color:var(--muted);">' + esc(m.note || '') + '</span></b></div>';
    }).join('');
  }

  var prof = el('profilesGrid');
  if (prof) {
    prof.innerHTML = (D.profiles || []).map(function (p) {
      return '<div class="prof-card fade-up"><div class="journey-num">' + esc(p.code) + '</div>' +
        '<h3>' + esc(p.title) + '</h3>' +
        (p.input ? '<p style="font-size:.88rem;color:var(--muted);">' + esc(p.input) + '</p>' : '') +
        (p.recommended && p.recommended.length ? '<div class="prof-rec">' + p.recommended.map(function (r) { return '<span>' + esc(r) + '</span>'; }).join('') + '</div>' : '') +
        (p.strategy ? '<p style="font-size:.9rem;">' + esc(p.strategy) + '</p>' : '') + '</div>';
    }).join('');
  }

  var faq = el('faqList');
  if (faq) {
    faq.innerHTML = (D.faq || []).map(function (f, i) {
      return '<div class="faq-item' + (i === 0 ? ' open' : '') + '">' +
        '<div class="faq-q" onclick="toggleFaq(this)"><h3>' + esc(f.q) + '</h3><div class="faq-plus">+</div></div>' +
        '<div class="faq-a"><p>' + esc(f.a) + '</p></div></div>';
    }).join('');
  }

  var vnotes = el('verifyNotes');
  if (vnotes && D.verifyNotes) {
    var v = D.verifyNotes;
    vnotes.innerHTML = (v.disclaimer ? '<p>' + esc(v.disclaimer) + '</p>' : '') +
      ((v.critical || []).length ? '<p style="margin-top:1rem;"><b>Проверять в первую очередь:</b> ' +
        esc(v.critical.slice(0, 6).join('; ')) + '</p>' : '');
  }

  /* оживляем анимацию появления для отрисованных блоков */
  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.06 });
    document.querySelectorAll('.fade-up:not(.visible)').forEach(function (n) { io.observe(n); });
  }
})();
