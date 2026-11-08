(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var progress = document.querySelector('.scroll-progress span');
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('mobile-menu');

  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', (window.scrollY || 0) > 36);
    if (progress) {
      var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      progress.style.transform = 'scaleX(' + ratio + ')';
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    menu.setAttribute('aria-hidden', String(!open));
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    var main = document.getElementById('main');
    var footer = document.querySelector('.site-footer');
    var bar = document.querySelector('.mobile-bar');
    [main, footer, bar].forEach(function (el) { if (el) el.inert = open; });
    if (open) {
      var first = menu.querySelector('a');
      if (first) window.requestAnimationFrame(function () { first.focus(); });
    } else if (menu.contains(document.activeElement)) {
      toggle.focus();
    }
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        setMenu(false);
        return;
      }
      if (e.key === 'Tab' && menu.classList.contains('is-open')) {
        var focusable = Array.from(menu.querySelectorAll('a, button')).filter(function (el) { return el.offsetParent !== null; });
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 980) setMenu(false);
    });
  }

  var reveal = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('reveal-on');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    reveal.forEach(function (el) { io.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add('is-visible'); });
  }

  var video = document.querySelector('.hero-video');
  var videoToggle = document.querySelector('.video-toggle');
  if (video && videoToggle) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause();
      videoToggle.setAttribute('aria-pressed', 'true');
      videoToggle.setAttribute('aria-label', 'Воспроизвести видео');
    }
    videoToggle.addEventListener('click', function () {
      if (video.paused) {
        video.play().catch(function () {});
        videoToggle.setAttribute('aria-pressed', 'false');
        videoToggle.setAttribute('aria-label', 'Пауза видео');
      } else {
        video.pause();
        videoToggle.setAttribute('aria-pressed', 'true');
        videoToggle.setAttribute('aria-label', 'Воспроизвести видео');
      }
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && !video.paused) {
        video.pause();
        videoToggle.setAttribute('aria-pressed', 'true');
        videoToggle.setAttribute('aria-label', 'Воспроизвести видео');
      }
    });
  }

  var dialog = document.getElementById('lightbox');
  var dialogImage = document.getElementById('lightbox-image');
  var dialogCaption = document.getElementById('lightbox-caption');
  if (dialog && dialogImage) {
    document.querySelectorAll('.lightbox-trigger').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var img = trigger.querySelector('img');
        var figure = trigger.closest('figure');
        var caption = figure ? figure.querySelector('figcaption') : null;
        if (!img) return;
        dialogImage.src = img.currentSrc || img.src;
        dialogImage.alt = img.alt;
        dialogCaption.textContent = caption ? caption.innerText.replace(/\s+/g, ' ') : '';
        if (typeof dialog.showModal === 'function') dialog.showModal();
      });
    });
    var close = dialog.querySelector('.lightbox-close');
    if (close) close.addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', function () { dialogImage.src = ''; });
  }

  var format = document.getElementById('format');
  var nights = document.getElementById('nights');
  document.querySelectorAll('[data-format]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (format) format.value = link.getAttribute('data-format');
      var requestedNights = link.getAttribute('data-nights');
      if (nights && requestedNights) nights.value = requestedNights;
      if (format) format.dispatchEvent(new Event('change', { bubbles: true }));
      setMenu(false);
    });
  });
  if (format) {
    format.addEventListener('change', function () {
      var option = format.options[format.selectedIndex];
      var requestedNights = option && option.getAttribute('data-nights');
      if (nights && requestedNights) nights.value = requestedNights;
    });
  }

  // Events use the same request form. Surface the dedicated CTA when that
  // scenario is selected instead of silently sending an ordinary stay request.
  var formatSelect = document.getElementById('format');
  if (formatSelect) {
    var syncRequestNote = function () {
      var noteEl = document.getElementById('form-note');
      var submit = document.querySelector('.form-submit');
      if (!noteEl) return;
      var isEvent = formatSelect.value === 'Событие в отеле';
      if (submit && !submit.dataset.baseLabel) submit.dataset.baseLabel = submit.innerHTML;
      if (submit) submit.innerHTML = isEvent ? 'Запросить событие <span aria-hidden="true">↗</span>' : submit.dataset.baseLabel;
      if (noteEl && !noteEl.classList.contains('is-error')) noteEl.textContent = isEvent ? 'Откроется WhatsApp с запросом на событие. Проверьте состав и отправьте.' : 'Откроется WhatsApp с готовым сообщением. Проверьте его и отправьте.';
      var arrivalLabel = document.getElementById('arrival-label');
      var nightsLabel = document.getElementById('nights-label');
      if (arrivalLabel) arrivalLabel.textContent = isEvent ? 'Дата события' : 'Дата заезда';
      if (nightsLabel) nightsLabel.textContent = isEvent ? 'Продолжительность' : 'Ночей';
      var nightsSelect = document.getElementById('nights');
      if (nightsSelect) {
        var dayOption = Array.from(nightsSelect.options).find(function (o) { return o.value === 'day'; });
        if (dayOption) dayOption.textContent = isEvent ? 'Один день' : 'Без ночёвки';
      }
    };
    formatSelect.addEventListener('change', syncRequestNote);
    syncRequestNote();
  }

  var form = document.getElementById('booking-form');
  var note = document.getElementById('form-note');
  var defaultNote = 'Откроется WhatsApp с готовым сообщением. Проверьте его и отправьте.';
  var arrival = document.getElementById('arrival');
  var guestName = document.getElementById('guest-name');
  var contact = document.getElementById('contact');

  if (arrival) {
    var now = new Date();
    arrival.min = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var comment = document.getElementById('comment');
      [arrival, guestName, contact, comment].forEach(function (el) { if (el) el.removeAttribute('aria-invalid'); });

      if (!arrival || !arrival.value) {
        if (arrival) arrival.setAttribute('aria-invalid', 'true');
        note.textContent = 'Укажите дату заезда.';
        note.classList.add('is-error');
        if (arrival) arrival.focus();
        return;
      }

      var chosen = new Date(arrival.value + 'T12:00:00');
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(chosen.getTime()) || chosen < today) {
        arrival.setAttribute('aria-invalid', 'true');
        note.textContent = 'Дата заезда должна быть сегодня или позже.';
        note.classList.add('is-error');
        arrival.focus();
        return;
      }

      if (!guestName || !guestName.value.trim()) {
        if (guestName) guestName.setAttribute('aria-invalid', 'true');
        note.textContent = 'Укажите, как к вам обращаться.';
        note.classList.add('is-error');
        if (guestName) guestName.focus();
        return;
      }

      if (!contact || !contact.value.trim()) {
        if (contact) contact.setAttribute('aria-invalid', 'true');
        note.textContent = 'Оставьте телефон или e-mail для ответа.';
        note.classList.add('is-error');
        if (contact) contact.focus();
        return;
      }

      var parts = arrival.value.split('-');
      var dateText = parts[2] + '.' + parts[1] + '.' + parts[0];
      var nightsValue = document.getElementById('nights').value;
      var isEventRequest = document.getElementById('format').value === 'Событие в отеле';
      var nightsText = nightsValue === 'day' ? (isEventRequest ? 'Один день' : 'Без ночёвки') : (nightsValue === '7plus' ? '7+' : nightsValue);
      var dateLabel = isEventRequest ? 'Дата события' : 'Дата заезда';
      var requestLabel = isEventRequest ? 'Событие' : 'Сценарий';
      var lines = [
        isEventRequest ? 'Здравствуйте! Хочу обсудить событие в Pattaya SPA Chundzha.' : 'Здравствуйте! Хочу обсудить поездку в Pattaya SPA Chundzha.',
        'Имя: ' + guestName.value.trim(),
        'Контакт: ' + contact.value.trim(),
        dateLabel + ': ' + dateText,
        (isEventRequest ? 'Продолжительность: ' : 'Ночей: ') + nightsText,
        'Гостей: ' + document.getElementById('guests').value,
        requestLabel + ': ' + document.getElementById('format').value
      ];
      if (comment && comment.value.trim()) lines.push('Важно учесть: ' + comment.value.trim());

      note.textContent = 'Открываем WhatsApp с готовым сообщением. Если он не открылся, напишите на info@pattayaspa.kz или позвоните: +7 707 842 41 19.';
      note.classList.remove('is-error');
      var waUrl = 'https://wa.me/77078424119?text=' + encodeURIComponent(lines.join('\n'));
      var waWindow = window.open(waUrl, '_blank');
      if (waWindow) waWindow.opener = null;
      if (!waWindow) window.location.href = waUrl;
    });

    form.querySelectorAll('input, textarea, select').forEach(function (field) {
      field.addEventListener('input', function () {
        field.removeAttribute('aria-invalid');
        note.textContent = defaultNote;
        note.classList.remove('is-error');
      });
    });
  }
})();
