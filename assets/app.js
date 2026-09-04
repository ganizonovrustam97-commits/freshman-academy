
// Navbar scroll state
var nav = document.getElementById('navbar');
window.addEventListener('scroll', function(){ nav.classList.toggle('scrolled', window.scrollY > 40); });

// Hamburger / mobile menu
document.getElementById('hamburger').addEventListener('click', function(){ document.getElementById('mobileMenu').classList.add('open'); });
var mcBtn = document.getElementById('mobileClose');
if(mcBtn) mcBtn.addEventListener('click', function(){ document.getElementById('mobileMenu').classList.remove('open'); });
function closeMobileMenu(){ document.getElementById('mobileMenu').classList.remove('open'); }

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener('click', function(e){
    var href = a.getAttribute('href');
    if(href.length < 2) return;
    var t = document.querySelector(href);
    if(t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth', block:'start'}); closeMobileMenu(); }
  });
});

// Reveal on scroll
var observer = new IntersectionObserver(function(entries){
  entries.forEach(function(e){ if(e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08 });
document.querySelectorAll('.fade-up').forEach(function(el){ observer.observe(el); });

// Schedule tabs (Offline / Online)
document.querySelectorAll('.sched-tab[data-target]').forEach(function(btn){
  btn.addEventListener('click', function(){
    document.querySelectorAll('.sched-tab[data-target]').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    var target = btn.dataset.target;
    document.querySelectorAll('.sched-panel').forEach(function(p){ p.classList.toggle('active', p.id === target); });
  });
});

// Pricing tabs (SAT / AP)
document.querySelectorAll('.sched-tab[data-pricing]').forEach(function(btn){
  btn.addEventListener('click', function(){
    document.querySelectorAll('.sched-tab[data-pricing]').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    var target = btn.dataset.pricing;
    document.querySelectorAll('.pricing-grid').forEach(function(p){ p.classList.toggle('active', p.id === target); });
  });
});

// Gallery filter
document.querySelectorAll('.gf-btn').forEach(function(btn){
  btn.addEventListener('click', function(){
    document.querySelectorAll('.gf-btn').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    var filter = btn.dataset.filter;
    document.querySelectorAll('.gal-item').forEach(function(item){
      item.style.display = (filter === 'all' || item.dataset.cat === filter) ? '' : 'none';
    });
  });
});

// FAQ accordion
function toggleFaq(q){
  var item = q.closest('.faq-item');
  var wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(function(i){ i.classList.remove('open'); });
  if(!wasOpen) item.classList.add('open');
}

/* ============================================================
   КОНСТРУКТОР ПАКЕТА
   ------------------------------------------------------------
   ЦЕНЫ — все в объекте PRICES ниже. Чтобы поменять стоимость,
   правьте только его (и подписи в разметке .svc-opt, если нужно).
   ВНИМАНИЕ: admissions / essay / applications — ВРЕМЕННЫЕ цены,
   поставлены как заглушка, замените на реальные.
   ============================================================ */
(function(){
  if(!document.getElementById('builder')) return;
  var PRICES = {
    sat:  { foundation:{1:99, 2:159}, advanced:{1:99, 2:159} },
    ap:   { 1:99, 3:180 },
    research: { emerging:350, extended:1050, advanced:1250, frontiers:2450, fellowship:4050, premier:8500 },
    admissions:  2050,
    essay:       650,   // ВРЕМЕННАЯ ЦЕНА
    applications:850    // ВРЕМЕННАЯ ЦЕНА
  };

  var MONTHS = { foundation:1.5, advanced:3, ap:3 };

  var RESEARCH = {
    emerging:  {label:'Emerging Researchers', note:'2 ч консультаций 1-на-1 · 4 занятия + 4 воркшопа', term:'8–10 недель'},
    extended:  {label:'Extended Research',    note:'10 ч консультаций 1-на-1 · 4 лекции + 4 семинара', term:'12–14 недель'},
    advanced:  {label:'Advanced Research',    note:'12 ч консультаций 1-на-1 · 4 лекции + 4 семинара', term:'12–14 недель'},
    frontiers: {label:'Frontiers Research',   note:'20 ч со старшими менторами · 4 лекции + 4 семинара', term:'12–14 недель'},
    fellowship:{label:'Research Fellowship',  note:'30 ч · стажировки с партнёрами · доп. часы по запросу', term:'14–18 недель'},
    premier:   {label:'Premier Research',     note:'40 ч с PhD-менторами · стажировки · 2–3 выезда', term:'6 месяцев'}
  };

  var ONCE = {
    admissions:  {label:'Admissions Program',   note:'3 месяца · 24 занятия · 19+ ч консультаций 1-на-1', term:'3 месяца'},
    essay:       {label:'Essay Program',        note:'Мотивационное и supplemental эссе 1-на-1', term:'—'},
    applications:{label:'Applications Program', note:'Заполнение и подача заявок, документы, дедлайны', term:'—'}
  };

  var LABELS = {
    grade:{'9':'9 класс','10':'10 класс','11':'11 класс','grad':'Выпускник'},
    field:{eng:'Инженерия / CS', biz:'Бизнес и экономика', sci:'Естественные науки', hum:'Гуманитарные науки'},
    country:{usa:'США', eu:'Европа', asia:'Азия', none:'Направление не выбрано'},
    english:{a2:'английский A2–B1', b2:'английский B2', c1:'английский C1+'},
    sat:{no:'SAT не сдавал', yes:'SAT сдавал'}
  };

  var state = {
    profile:{ grade:'10', field:'eng', country:'usa', english:'b2', sat:'no' },
    svc:{
      sat:{on:false, program:'foundation', subjects:2},
      ap:{on:false, subjects:3},
      research:{on:false, level:'extended'},
      admissions:{on:false}, essay:{on:false}, applications:{on:false}
    }
  };

  var $ = function(id){ return document.getElementById(id); };
  var money = function(n){
    return '$' + Math.round(n).toLocaleString('en-US');
  };

  /* ---- профиль: чипы ---- */
  document.querySelectorAll('.bp-chips').forEach(function(box){
    var group = box.dataset.group;
    box.querySelectorAll('.bp-chip').forEach(function(chip){
      chip.addEventListener('click', function(){
        box.querySelectorAll('.bp-chip').forEach(function(c){ c.classList.remove('on'); });
        chip.classList.add('on');
        state.profile[group] = chip.dataset.value;
        render();
      });
    });
  });

  /* ---- услуги: вкл/выкл и опции ---- */
  document.querySelectorAll('.svc-card').forEach(function(card){
    var key = card.dataset.svc;
    card.querySelector('.svc-head').addEventListener('click', function(){
      state.svc[key].on = !state.svc[key].on;
      render();
    });
    card.querySelectorAll('.svc-opt').forEach(function(opt){
      opt.addEventListener('click', function(e){
        e.stopPropagation();
        var field = opt.dataset.opt;
        var val = opt.dataset.value;
        card.querySelectorAll('.svc-opt[data-opt="'+field+'"]').forEach(function(o){ o.classList.remove('on'); });
        opt.classList.add('on');
        state.svc[key][field] = (field === 'subjects') ? parseInt(val,10) : val;
        render();
      });
    });
  });

  /* ---- автоподбор ---- */
  function autoPick(){
    var p = state.profile, s = state.svc, why = [];

    // SAT
    s.sat.on = true;
    if(p.sat === 'no'){
      s.sat.program = 'foundation';
      why.push('SAT ещё не сдавали — начинаем с Foundation: формат теста и базовая методология за 1.5 месяца.');
    } else {
      s.sat.program = 'advanced';
      why.push('SAT уже сдавали — берём Advanced: 3 месяца работы над сложными заданиями и ростом балла.');
    }
    s.sat.subjects = 2;
    if(p.english === 'a2'){
      why.push('При уровне A2–B1 берём оба предмета — английская часть теста потребует больше времени.');
    }

    // AP — профильные предметы важны для США и сильных заявок
    s.ap.on = (p.country === 'usa' || p.country === 'none' || p.field === 'eng' || p.field === 'sci');
    if(s.ap.on){
      s.ap.subjects = 3;
      why.push('AP усиливают академический профиль: 3 предмета по вашему направлению выгоднее по цене, чем поодиночке.');
    }

    // Research — уровень по классу
    s.research.on = true;
    if(p.grade === '9'){ s.research.level = 'emerging'; }
    else if(p.grade === '10'){ s.research.level = 'extended'; }
    else if(p.grade === '11'){ s.research.level = 'advanced'; }
    else { s.research.level = 'frontiers'; }
    var gradeWhen = {'9':'В 9 классе', '10':'В 10 классе', '11':'В 11 классе', 'grad':'После школы'};
    why.push(gradeWhen[p.grade] + ' подходит ' + RESEARCH[s.research.level].label + ' — успеваете довести проект до результата к подаче заявок.');

    // Программы поступления
    var applying = (p.country !== 'none');
    s.admissions.on = applying;
    s.essay.on = applying;
    s.applications.on = (p.grade === '11' || p.grade === 'grad');
    if(applying){
      why.push('Поступление в ' + (p.country === 'usa' ? 'США' : p.country === 'eu' ? 'Европу' : 'Азию') + ' — Admissions и Essay закрывают стратегию отбора и эссе, где чаще всего теряют шансы.');
    }
    if(s.applications.on){
      why.push('До подачи меньше года — Applications Program ведёт заявки, документы и дедлайны.');
    } else {
      why.push('Applications Program можно добавить позже — в год подачи заявок.');
    }

    syncUI();
    render();

    var list = $('bldWhyList');
    list.innerHTML = '';
    why.forEach(function(t){
      var li = document.createElement('li');
      li.textContent = t;
      list.appendChild(li);
    });
    $('bldWhy').classList.add('show');

    // подсветить рекомендованные
    document.querySelectorAll('.svc-rec').forEach(function(tag){
      tag.hidden = !state.svc[tag.dataset.rec].on;
    });
  }

  function syncUI(){
    document.querySelectorAll('.svc-card').forEach(function(card){
      var key = card.dataset.svc, st = state.svc[key];
      card.classList.toggle('on', st.on);
      card.querySelectorAll('.svc-opt').forEach(function(opt){
        var field = opt.dataset.opt;
        var val = (field === 'subjects') ? parseInt(opt.dataset.value,10) : opt.dataset.value;
        opt.classList.toggle('on', st[field] === val);
      });
    });
  }

  /* ---- сборка позиций ---- */
  function buildItems(){
    var s = state.svc, items = [];

    if(s.sat.on){
      var pr = PRICES.sat[s.sat.program][s.sat.subjects];
      var months = MONTHS[s.sat.program];
      items.push({
        name:'Подготовка к SAT — ' + (s.sat.program === 'foundation' ? 'Foundation' : 'Advanced'),
        note: (s.sat.subjects === 2 ? 'Math + English' : '1 предмет на выбор') + ' · 12 занятий в месяц на предмет',
        term: (months === 1.5 ? '1.5 месяца' : '3 месяца'),
        price: pr, monthly:true, months:months
      });
    }
    if(s.ap.on){
      items.push({
        name:'Курсы AP',
        note:(s.ap.subjects === 3 ? '3 предмета' : '1 предмет') + ' · 2 занятия в неделю, ≈24 занятия на предмет',
        term:'3 месяца',
        price:PRICES.ap[s.ap.subjects], monthly:true, months:MONTHS.ap
      });
    }
    if(s.research.on){
      var r = RESEARCH[s.research.level];
      items.push({ name:'Research Program — ' + r.label, note:r.note, term:r.term, price:PRICES.research[s.research.level], monthly:false });
    }
    ['admissions','essay','applications'].forEach(function(k){
      if(s[k].on){
        items.push({ name:ONCE[k].label, note:ONCE[k].note, term:ONCE[k].term, price:PRICES[k], monthly:false });
      }
    });
    return items;
  }

  function totals(items){
    var monthly = 0, once = 0, full = 0;
    items.forEach(function(i){
      if(i.monthly){ monthly += i.price; full += i.price * i.months; }
      else { once += i.price; full += i.price; }
    });
    return {monthly:monthly, once:once, full:full};
  }

  /* ---- рендер сводки ---- */
  function render(){
    syncUI();
    var items = buildItems(), t = totals(items);

    var p = state.profile;
    $('bldProfileLine').textContent = LABELS.grade[p.grade] + ' · ' + LABELS.field[p.field] + ' · ' + LABELS.country[p.country];

    var list = $('bldList');
    list.innerHTML = '';
    items.forEach(function(i){
      var li = document.createElement('li');
      var left = document.createElement('span');
      left.textContent = i.name;
      var right = document.createElement('b');
      right.textContent = money(i.price) + (i.monthly ? '/мес' : '');
      li.appendChild(left); li.appendChild(right);
      list.appendChild(li);
    });
    $('bldEmpty').style.display = items.length ? 'none' : 'block';

    $('bldMonthly').textContent = money(t.monthly) + (t.monthly ? '/мес' : '');
    $('bldOnce').textContent = money(t.once);
    $('bldTotal').textContent = money(t.full);

    // цены на карточках
    var s = state.svc;
    document.querySelector('[data-price="sat"]').innerHTML = money(PRICES.sat[s.sat.program][s.sat.subjects]) + '<small>в месяц</small>';
    document.querySelector('[data-price="ap"]').innerHTML = money(PRICES.ap[s.ap.subjects]) + '<small>в месяц</small>';
    document.querySelector('[data-price="research"]').innerHTML = money(PRICES.research[s.research.level]) + '<small>за программу</small>';
  }

  /* ---- КП ---- */
  function openKp(){
    var items = buildItems(), t = totals(items);
    if(!items.length){ return; }
    var p = state.profile;

    $('kpDate').textContent = new Date().toLocaleDateString('ru-RU', {day:'numeric', month:'long', year:'numeric'});
    $('kpProfile').innerHTML = '<b>Студент:</b> ' + LABELS.grade[p.grade] + ' · ' + LABELS.field[p.field] +
      ' · поступление: ' + LABELS.country[p.country] + ' · ' + LABELS.english[p.english] + ' · ' + LABELS.sat[p.sat];

    var body = $('kpBody');
    body.innerHTML = '';
    items.forEach(function(i){
      var tr = document.createElement('tr');
      var td1 = document.createElement('td');
      td1.className = 'svc';
      var b = document.createElement('b'); b.textContent = i.name;
      var sm = document.createElement('small'); sm.textContent = i.note;
      td1.appendChild(b); td1.appendChild(sm);
      var td2 = document.createElement('td'); td2.textContent = i.monthly ? 'Групповые занятия' : 'Индивидуально 1-на-1';
      var td3 = document.createElement('td'); td3.textContent = i.term;
      var td4 = document.createElement('td'); td4.className = 'price';
      td4.textContent = money(i.price) + (i.monthly ? ' / мес' : '');
      tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3); tr.appendChild(td4);
      body.appendChild(tr);
    });

    $('kpMonthly').textContent = money(t.monthly) + (t.monthly ? ' / мес' : '');
    $('kpOnce').textContent = money(t.once);
    $('kpTotal').textContent = money(t.full);

    $('kpModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function kpAsText(){
    var items = buildItems(), t = totals(items), p = state.profile;
    var lines = ['FRESHMAN ACADEMY — Коммерческое предложение', ''];
    lines.push('Студент: ' + LABELS.grade[p.grade] + ' · ' + LABELS.field[p.field] + ' · ' + LABELS.country[p.country] + ' · ' + LABELS.english[p.english] + ' · ' + LABELS.sat[p.sat]);
    lines.push('');
    items.forEach(function(i){
      lines.push('• ' + i.name + ' — ' + money(i.price) + (i.monthly ? '/мес' : '') + ' (' + i.term + ')');
      lines.push('  ' + i.note);
    });
    lines.push('');
    lines.push('Ежемесячно: ' + money(t.monthly));
    lines.push('Разово за программы: ' + money(t.once));
    lines.push('Бюджет целиком: ' + money(t.full));
    lines.push('');
    lines.push('Freshman Pte. Ltd. (202307332W) · Telegram @freshman_academy');
    return lines.join('\n');
  }

  $('bldAuto').addEventListener('click', autoPick);
  $('bldReset').addEventListener('click', function(){
    Object.keys(state.svc).forEach(function(k){ state.svc[k].on = false; });
    $('bldWhy').classList.remove('show');
    document.querySelectorAll('.svc-rec').forEach(function(t){ t.hidden = true; });
    render();
  });
  $('bldKp').addEventListener('click', openKp);
  $('kpClose').addEventListener('click', function(){
    $('kpModal').classList.remove('open');
    document.body.style.overflow = '';
  });
  $('kpModal').addEventListener('click', function(e){
    if(e.target === $('kpModal')){
      $('kpModal').classList.remove('open');
      document.body.style.overflow = '';
    }
  });
  $('kpPrint').addEventListener('click', function(){ window.print(); });
  $('kpCopy').addEventListener('click', function(){
    var text = kpAsText(), btn = $('kpCopy'), old = btn.textContent;
    var done = function(){ btn.textContent = 'Скопировано ✓'; setTimeout(function(){ btn.textContent = old; }, 1800); };
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(done).catch(function(){ fallbackCopy(text, done); });
    } else { fallbackCopy(text, done); }
  });
  function fallbackCopy(text, cb){
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); cb(); } catch(e){}
    document.body.removeChild(ta);
  }
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && $('kpModal').classList.contains('open')){
      $('kpModal').classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  render();
})();

// Lightbox
(function(){
  if(!document.getElementById('lightbox')) return;
  var items = document.querySelectorAll('.gal-item');
  var lbOverlay = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbVideo = document.getElementById('lbVideo');
  var lbCaption = document.getElementById('lbCaption');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var current = 0;
  var visibleItems = [];

  function getVisible(){
    visibleItems = [];
    items.forEach(function(item, idx){ if(item.style.display !== 'none') visibleItems.push(idx); });
  }

  window.openLightbox = function(idx){
    getVisible();
    current = visibleItems.indexOf(idx);
    if(current < 0) current = 0;
    showLb();
  };

  function showLb(){
    var realIdx = visibleItems[current];
    if(realIdx === undefined) return;
    var item = items[realIdx];
    var cap = item.querySelector('.gal-caption');
    var videoSrc = item.dataset.video;
    lbCaption.textContent = cap ? cap.textContent : '';
    if(videoSrc){
      lbImg.style.display = 'none';
      lbVideo.style.display = 'block';
      lbVideo.src = videoSrc;
      lbVideo.play().catch(function(){});
    } else {
      var img = item.querySelector('img');
      lbVideo.pause(); lbVideo.removeAttribute('src'); lbVideo.load(); lbVideo.style.display = 'none';
      lbImg.style.display = 'block';
      lbImg.src = img.src;
      lbImg.alt = img.alt;
    }
    lbOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLb(){
    lbVideo.pause(); lbVideo.removeAttribute('src'); lbVideo.load();
    lbOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  lbClose.addEventListener('click', closeLb);
  lbOverlay.addEventListener('click', function(e){ if(e.target === lbOverlay) closeLb(); });
  lbPrev.addEventListener('click', function(){ current = (current - 1 + visibleItems.length) % visibleItems.length; showLb(); });
  lbNext.addEventListener('click', function(){ current = (current + 1) % visibleItems.length; showLb(); });
  document.addEventListener('keydown', function(e){
    if(!lbOverlay.classList.contains('open')) return;
    if(e.key === 'ArrowLeft'){ current = (current - 1 + visibleItems.length) % visibleItems.length; showLb(); }
    if(e.key === 'ArrowRight'){ current = (current + 1) % visibleItems.length; showLb(); }
    if(e.key === 'Escape') closeLb();
  });
})();
