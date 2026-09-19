/* Editable contact links for the public menu.
   Server persistence uses the existing Apps Script API when it exposes
   getContacts/saveContacts; localStorage is a safe fallback for preview. */
(() => {
  'use strict';
  const API_URL = 'https://script.google.com/macros/s/AKfycbyhkM0waTpgWBu4dM5nt2Xj-GH0FkDPu1ra6EB-iZuWxfhKr74F2l2a2GjeGlKUORb3/exec';
  const KEY = 'menu007_contacts';
  const defaults = {
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
    whatsapp: 'https://wa.me/',
  };
  let contacts = { ...defaults };
  let adminOpen = false;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (v) => String(v || '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[c]));
  const validUrl = (v) => /^(https?:\/\/|tel:)/i.test(String(v || '').trim());

  function render() {
    let strip = $('#contactStrip');
    if (!strip) {
      strip = document.createElement('section'); strip.id = 'contactStrip'; strip.className = 'contact-strip';
      const hero = $('.hero'); hero?.insertAdjacentElement('afterend', strip);
    }
    strip.innerHTML = `<div class="contact-strip__title">تواصل معانا</div>
      <a class="contact-link contact-link--instagram" href="${esc(contacts.instagram)}" target="_blank" rel="noopener"><span class="contact-link__icon">◎</span>Instagram</a>
      <a class="contact-link contact-link--facebook" href="${esc(contacts.facebook)}" target="_blank" rel="noopener"><span class="contact-link__icon">f</span>Facebook</a>
      <a class="contact-link contact-link--whatsapp" href="${esc(contacts.whatsapp)}" target="_blank" rel="noopener"><span class="contact-link__icon">◔</span>WhatsApp</a>`;
  }

  async function readRemote() {
    try {
      const r = await fetch(`${API_URL}?action=getContacts&_=${Date.now()}`); const data = await r.json();
      if (data.ok && data.contacts) contacts = { ...contacts, ...data.contacts };
    } catch (_) {}
    try { contacts = { ...contacts, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (_) {}
    render();
  }

  function openEditor() {
    if (adminOpen) return; adminOpen = true;
    const box = document.createElement('section'); box.id = 'contactAdmin'; box.className = 'contact-admin';
    box.innerHTML = `<h3>تعديل روابط التواصل</h3>
      <label>Instagram<input id="contactInstagram" value="${esc(contacts.instagram)}"></label>
      <label>Facebook<input id="contactFacebook" value="${esc(contacts.facebook)}"></label>
      <label>WhatsApp<input id="contactWhatsapp" value="${esc(contacts.whatsapp)}"></label>
      <div class="contact-admin__actions"><button class="contact-admin__save" id="saveContacts">حفظ البيانات</button><button class="contact-admin__close" id="closeContacts">إغلاق</button></div>`;
    const hero = $('.hero'); hero?.insertAdjacentElement('afterend', box);
    $('#closeContacts').onclick = () => { box.remove(); adminOpen = false; };
    $('#saveContacts').onclick = async () => {
      const next = { instagram: $('#contactInstagram').value.trim(), facebook: $('#contactFacebook').value.trim(), whatsapp: $('#contactWhatsapp').value.trim() };
      if (!Object.values(next).every(validUrl)) return alert('اكتب روابط صحيحة تبدأ بـ https://');
      contacts = next; localStorage.setItem(KEY, JSON.stringify(contacts)); render();
      try { await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'saveContacts', contacts }) }); } catch (_) {}
      box.remove(); adminOpen = false; alert('تم حفظ روابط التواصل');
    };
  }

  window.addEventListener('load', () => {
    readRemote();
    const admin = $('#adminBtn');
    admin?.addEventListener('dblclick', openEditor);
  });
})();
