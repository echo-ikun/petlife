/* 宠物的一生 · 画画层
   一只由几何形状拼成的小动物，和一张可以带走的一生卡。 */

window.PL = window.PL || {};

PL.PALETTE_ART = {
  orange: { fur: '#D98A45', light: '#F2C58E', dark: '#8A4F24', inner: '#E7A39A', muzzle: '#F8E7D2', eye: '#7C9A3E', collar: '#B8452F' },
  black: { fur: '#343030', light: '#4A4444', dark: '#1D1A1A', inner: '#6E5B57', muzzle: '#E9DCCB', eye: '#8FAE5A', collar: '#C9A227' },
  ragdoll: { fur: '#E7D9C8', light: '#F7EEE2', dark: '#9A8A7C', inner: '#E3B7B4', muzzle: '#FBF4EA', eye: '#7FA9C4', collar: '#8FA9B8' },
  shiba: { fur: '#C9834F', light: '#F2DEC4', dark: '#7A4526', inner: '#E7B6A0', muzzle: '#F8EAD8', eye: '#4A3A2E', collar: '#5F6E52' },
  corgi: { fur: '#D69A54', light: '#F8E7CC', dark: '#8B5A2B', inner: '#E9B6A2', muzzle: '#FBF1DF', eye: '#4A3A2E', collar: '#B8452F' },
  village: { fur: '#C9A15E', light: '#F0DFC0', dark: '#7C5B2E', inner: '#D9B49A', muzzle: '#6B4A36', eye: '#3E3028', collar: '#A53A2C' },
  rabbit: { fur: '#A89B94', light: '#EFE4DC', dark: '#6B5F59', inner: '#E7B7B7', muzzle: '#F7EEE8', eye: '#3E3430', collar: '#D99A9A' },
};

PL._artN = 0;

PL.animalSVG = (id, opts = {}) => {
  const s = PL.SPECIES[id];
  if (!s) return '';
  const a = PL.PALETTE_ART[id] || PL.PALETTE_ART.orange;
  const n = ++PL._artN;
  const uid = `pa${n}`;
  const cls = opts.className || '';
  const grad = `<radialGradient id="fur${uid}" cx="38%" cy="26%" r="85%">
      <stop offset="0" stop-color="${a.light}"/>
      <stop offset="0.62" stop-color="${a.fur}"/>
      <stop offset="1" stop-color="${a.dark}"/>
    </radialGradient>
    <radialGradient id="glow${uid}" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${s.palette.accent}" stop-opacity=".24"/>
      <stop offset="1" stop-color="${s.palette.accent}" stop-opacity="0"/>
    </radialGradient>`;

  const shadow = `<ellipse cx="160" cy="298" rx="90" ry="13" fill="#1E1712" opacity=".16" filter="url(#blur${uid})"/>`;
  const defs = `${grad}<filter id="blur${uid}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>`;

  let inner = '';
  if (id === 'cockatiel') inner = birdSVG(a, uid);
  else if (id === 'hamster') inner = hamsterSVG(a, uid);
  else inner = mammalSVG(id, a, uid);

  return `<svg class="pet-svg ${cls}" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${s.name}">
    <defs>${defs}</defs>
    <ellipse cx="160" cy="180" rx="150" ry="150" fill="url(#glow${uid})"/>
    ${shadow}
    <g class="pet-breathe">${inner}</g>
  </svg>`;
};

function mammalSVG(id, a, uid) {
  const isCorgi = id === 'corgi';
  const isRabbit = id === 'rabbit';
  const isVillage = id === 'village';
  const isRagdoll = id === 'ragdoll';
  const bodyY = isCorgi ? 238 : isRabbit ? 236 : 230;
  const bodyRX = isCorgi ? 76 : isRabbit ? 70 : 70;
  const bodyRY = isCorgi ? 54 : isRabbit ? 62 : 66;
  const headY = isCorgi ? 158 : isRabbit ? 152 : 148;
  const headR = isCorgi ? 55 : 58;
  const legY = isCorgi ? 270 : 262;
  const legH = isCorgi ? 28 : 40;
  const eyeY = isCorgi ? 154 : isRabbit ? 148 : 145;
  const eyeX = 22;
  const eyeRX = isRabbit ? 8 : 9;
  const eyeRY = isRabbit ? 11 : 10;

  let ears = '';
  let tail = '';
  let markings = '';
  let muzzle = `<ellipse cx="160" cy="${headY + 26}" rx="${isCorgi ? 34 : 31}" ry="${isRabbit ? 19 : 23}" fill="${a.muzzle}" opacity=".94"/>`;
  let nose = `<path d="M153 ${headY + 18} L167 ${headY + 18} L160 ${headY + 26} Z" fill="#3A2A26"/>`;
  let mouth = `<path d="M160 ${headY + 26} Q160 ${headY + 33} 151 ${headY + 33} M160 ${headY + 26} Q160 ${headY + 33} 169 ${headY + 33}" fill="none" stroke="#4A342C" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>`;
  let collar = '';
  let extra = '';

  if (id === 'orange' || id === 'black' || id === 'ragdoll') {
    ears = `<path d="M108 116 L94 62 L148 96 Z" fill="url(#fur${uid})"/><path d="M212 116 L226 62 L172 96 Z" fill="url(#fur${uid})"/>
      <path d="M107 106 L99 76 L135 97 Z" fill="${a.inner}" opacity=".85"/><path d="M213 106 L221 76 L185 97 Z" fill="${a.inner}" opacity=".85"/>`;
    tail = `<path class="pet-tail" d="M212 250 C258 258 272 214 248 190" fill="none" stroke="${a.dark}" stroke-width="26" stroke-linecap="round"/>
      <circle cx="248" cy="190" r="13" fill="${a.light}" opacity=".85"/>`;
    collar = `<path d="M113 198 Q160 220 207 198" stroke="${a.collar}" stroke-width="9" fill="none"/><circle cx="160" cy="218" r="7" fill="#D8B45A" stroke="#8A6A2A" stroke-width="2"/>`;
    if (id === 'orange') {
      markings = `<path d="M138 102 q7 11 0 20 M160 96 v22 M182 102 q-7 11 0 20" stroke="${a.dark}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".55"/>
        <path d="M118 176 Q132 166 146 176" stroke="${a.dark}" stroke-width="2" fill="none" opacity=".25"/>`;
      tail += `<path d="M212 250 C258 258 272 214 248 190" fill="none" stroke="${a.light}" stroke-width="26" stroke-linecap="round" stroke-dasharray="5 17" opacity=".5"/>`;
      extra = `<ellipse cx="160" cy="243" rx="34" ry="42" fill="${a.muzzle}" opacity=".35"/>`;
    }
    if (id === 'black') {
      markings = `<path d="M160 96 a14 14 0 1 0 9 25 a12 12 0 1 1 -9 -25" fill="#D8B45A" opacity=".9"/>
        <ellipse cx="160" cy="240" rx="30" ry="36" fill="#E9DCCB" opacity=".22"/>`;
    }
    if (id === 'ragdoll') {
      markings = `<ellipse cx="160" cy="${headY + 2}" rx="50" ry="42" fill="${a.dark}" opacity=".18"/>
        <path d="M116 214 Q122 238 112 258 M204 214 Q198 238 208 258" stroke="${a.light}" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/>`;
      tail = `<path class="pet-tail" d="M210 250 C258 262 278 220 252 194" fill="none" stroke="${a.dark}" stroke-width="30" stroke-linecap="round"/>
        <path d="M210 250 C258 262 278 220 252 194" fill="none" stroke="${a.light}" stroke-width="14" stroke-linecap="round" opacity=".55"/>`;
    }
  } else if (id === 'shiba') {
    ears = `<path d="M110 120 L98 68 L152 100 Z" fill="url(#fur${uid})"/><path d="M210 120 L222 68 L168 100 Z" fill="url(#fur${uid})"/>
      <path d="M110 110 L103 82 L138 100 Z" fill="${a.inner}" opacity=".9"/><path d="M210 110 L217 82 L182 100 Z" fill="${a.inner}" opacity=".9"/>`;
    tail = `<path class="pet-tail" d="M216 238 C262 236 272 188 238 178 C218 172 208 190 222 200" fill="none" stroke="${a.fur}" stroke-width="28" stroke-linecap="round"/>
      <path d="M216 238 C262 236 272 188 238 178" fill="none" stroke="${a.light}" stroke-width="28" stroke-linecap="round" opacity=".22"/>`;
    markings = `<ellipse cx="132" cy="${headY + 26}" rx="23" ry="17" fill="${a.light}" opacity=".85"/><ellipse cx="188" cy="${headY + 26}" rx="23" ry="17" fill="${a.light}" opacity=".85"/>`;
    collar = `<path d="M114 198 Q160 218 206 198" stroke="${a.collar}" stroke-width="9" fill="none"/><circle cx="160" cy="216" r="7" fill="#D8B45A" stroke="#8A6A2A" stroke-width="2"/>`;
    extra = `<path d="M143 168 Q160 176 177 168" stroke="${a.dark}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".5"/>`;
  } else if (id === 'corgi') {
    ears = `<path d="M104 126 L80 48 L156 94 Z" fill="url(#fur${uid})"/><path d="M216 126 L240 48 L164 94 Z" fill="url(#fur${uid})"/>
      <path d="M106 116 L88 62 L144 96 Z" fill="${a.inner}" opacity=".9"/><path d="M214 116 L232 62 L176 96 Z" fill="${a.inner}" opacity=".9"/>`;
    tail = `<ellipse cx="226" cy="252" rx="20" ry="15" fill="${a.fur}"/><ellipse cx="232" cy="248" rx="10" ry="7" fill="${a.light}" opacity=".8"/>`;
    markings = `<path d="M160 94 C146 124 146 156 160 184 C174 156 174 124 160 94 Z" fill="${a.muzzle}" opacity=".96"/>
      <ellipse cx="160" cy="250" rx="40" ry="38" fill="${a.muzzle}" opacity=".55"/>`;
    collar = `<path d="M114 202 Q160 222 206 202" stroke="${a.collar}" stroke-width="9" fill="none"/><circle cx="160" cy="220" r="7" fill="#D8B45A" stroke="#8A6A2A" stroke-width="2"/>`;
    extra = `<path d="M148 176 Q160 186 172 176" stroke="${a.dark}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".55"/>`;
  } else if (id === 'village') {
    ears = `<path d="M112 104 C82 100 70 140 84 172 C106 180 122 152 122 118 Z" fill="url(#fur${uid})"/><path d="M208 104 C238 100 250 140 236 172 C214 180 198 152 198 118 Z" fill="url(#fur${uid})"/>
      <path d="M112 116 C92 116 84 142 94 158 C108 162 114 144 114 124 Z" fill="${a.inner}" opacity=".55"/><path d="M208 116 C228 116 236 142 226 158 C212 162 206 144 206 124 Z" fill="${a.inner}" opacity=".55"/>`;
    tail = `<path class="pet-tail" d="M214 248 C254 254 266 222 244 202" fill="none" stroke="${a.dark}" stroke-width="24" stroke-linecap="round"/>
      <path d="M214 248 C254 254 266 222 244 202" fill="none" stroke="${a.light}" stroke-width="10" stroke-linecap="round" opacity=".4"/>`;
    muzzle = `<ellipse cx="160" cy="${headY + 24}" rx="33" ry="24" fill="${a.muzzle}" opacity=".95"/>`;
    nose = `<path d="M153 ${headY + 16} L167 ${headY + 16} L160 ${headY + 24} Z" fill="#2E211B"/>`;
    collar = `<path d="M113 198 Q160 218 207 198" stroke="${a.collar}" stroke-width="10" fill="none"/><circle cx="160" cy="217" r="8" fill="#D8B45A" stroke="#8A6A2A" stroke-width="2"/>`;
    extra = `<path d="M150 ${headY + 33} q10 8 20 0" stroke="#C96A5A" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>`;
  } else if (id === 'rabbit') {
    ears = `<path d="M112 112 C80 132 76 210 104 224 C126 220 132 160 126 120 Z" fill="url(#fur${uid})"/><path d="M208 112 C240 132 244 210 216 224 C194 220 188 160 194 120 Z" fill="url(#fur${uid})"/>
      <path d="M112 126 C92 146 90 198 106 210 C116 206 120 160 118 130 Z" fill="${a.inner}" opacity=".8"/><path d="M208 126 C228 146 230 198 214 210 C204 206 200 160 202 130 Z" fill="${a.inner}" opacity=".8"/>`;
    tail = `<circle cx="230" cy="254" r="18" fill="${a.light}"/><circle cx="230" cy="254" r="11" fill="#FBF4EA" opacity=".8"/>`;
    muzzle = `<ellipse cx="160" cy="${headY + 24}" rx="24" ry="17" fill="${a.muzzle}" opacity=".85"/>`;
    nose = `<path d="M154 ${headY + 18} L166 ${headY + 18} L160 ${headY + 24} Z" fill="#D98A8A"/>`;
    mouth = `<path d="M160 ${headY + 24} v5 M160 ${headY + 29} q-7 6 -13 0 M160 ${headY + 29} q7 6 13 0" fill="none" stroke="#7A5A52" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>`;
    collar = `<path d="M116 198 Q160 216 204 198" stroke="${a.collar}" stroke-width="7" fill="none" opacity=".9"/>`;
  }

  const eyeFill = id === 'black' ? '#8FAE5A' : id === 'ragdoll' ? '#7FA9C4' : a.eye;
  const pupil = `<ellipse cx="0" cy="1" rx="${eyeRX * 0.42}" ry="${eyeRY * 0.72}" fill="#1F1A17"/>`;
  const eyes = `<g class="pet-eyes">
    <ellipse cx="${160 - eyeX}" cy="${eyeY}" rx="${eyeRX}" ry="${eyeRY}" fill="${eyeFill}"/>
    <ellipse cx="${160 + eyeX}" cy="${eyeY}" rx="${eyeRX}" ry="${eyeRY}" fill="${eyeFill}"/>
    <g transform="translate(${160 - eyeX} ${eyeY})">${pupil}</g>
    <g transform="translate(${160 + eyeX} ${eyeY})">${pupil}</g>
    <circle cx="${160 - eyeX - 3}" cy="${eyeY - 4}" r="2.7" fill="#FFFDF7" opacity=".9"/>
    <circle cx="${160 + eyeX - 3}" cy="${eyeY - 4}" r="2.7" fill="#FFFDF7" opacity=".9"/>
  </g>`;

  const whiskers = id === 'rabbit' || id === 'orange' || id === 'black' || id === 'ragdoll'
    ? `<g stroke="${a.muzzle}" stroke-width="1.6" opacity=".85" stroke-linecap="round">
        <path d="M130 ${headY + 24} L104 ${headY + 20} M130 ${headY + 28} L106 ${headY + 30}"/>
        <path d="M190 ${headY + 24} L216 ${headY + 20} M190 ${headY + 28} L214 ${headY + 30}"/>
      </g>` : '';

  const cheeks = `<ellipse cx="${160 - 40}" cy="${headY + 26}" rx="12" ry="8" fill="${a.inner}" opacity=".22"/><ellipse cx="${160 + 40}" cy="${headY + 26}" rx="12" ry="8" fill="${a.inner}" opacity=".22"/>`;

  return `
    ${tail}
    <ellipse cx="160" cy="${bodyY}" rx="${bodyRX}" ry="${bodyRY}" fill="url(#fur${uid})"/>
    ${extra}
    <ellipse cx="160" cy="${bodyY + 18}" rx="${bodyRX * 0.52}" ry="${bodyRY * 0.62}" fill="${a.muzzle}" opacity="${isRabbit || isCorgi ? '.22' : '.16'}"/>
    <rect x="${160 - 44}" y="${legY}" width="30" height="${legH}" rx="15" fill="${a.fur}"/>
    <rect x="${160 + 14}" y="${legY}" width="30" height="${legH}" rx="15" fill="${a.fur}"/>
    <ellipse cx="${160 - 29}" cy="${legY + legH - 2}" rx="19" ry="10" fill="${a.light}"/>
    <ellipse cx="${160 + 29}" cy="${legY + legH - 2}" rx="19" ry="10" fill="${a.light}"/>
    ${ears}
    <circle cx="160" cy="${headY}" r="${headR}" fill="url(#fur${uid})"/>
    ${markings}
    ${cheeks}
    ${eyes}
    ${muzzle}
    ${nose}
    ${mouth}
    ${whiskers}
    ${collar}
    <path d="M${160 - headR + 12} ${headY - 22} Q${160 - headR - 2} ${headY - 40} ${160 - headR + 16} ${headY - 46}" fill="none" stroke="${a.light}" stroke-width="3" opacity=".35" stroke-linecap="round"/>
  `;
}

function birdSVG(a, uid) {
  const yellow = '#E8C76A';
  const yellowLight = '#F6E4B2';
  const grey = '#9A948C';
  const greyDark = '#6E6862';
  const orange = '#D98255';
  return `
    <path d="M146 246 L134 306 L160 294 L186 306 L174 246 Z" fill="${greyDark}"/>
    <path d="M152 250 L146 300 L160 292 L174 300 L168 250 Z" fill="${grey}" opacity=".7"/>
    <ellipse cx="160" cy="222" rx="48" ry="60" fill="url(#fur${uid})"/>
    <ellipse cx="160" cy="232" rx="30" ry="40" fill="${yellowLight}" opacity=".7"/>
    <path d="M122 198 C106 222 112 268 146 282 C136 250 136 218 148 194 Z" fill="${grey}"/>
    <path d="M198 198 C214 222 208 268 174 282 C184 250 184 218 172 194 Z" fill="${grey}"/>
    <path d="M124 202 C112 224 118 258 142 270" fill="none" stroke="${greyDark}" stroke-width="2" opacity=".5"/>
    <path d="M196 202 C208 224 202 258 178 270" fill="none" stroke="${greyDark}" stroke-width="2" opacity=".5"/>
    <g class="pet-breathe-head">
      <circle cx="160" cy="132" r="43" fill="${yellow}"/>
      <path d="M146 98 C140 72 148 54 160 76 C164 52 178 56 176 84 C186 74 194 84 184 102" fill="${yellowLight}"/>
      <path d="M150 96 C146 78 152 68 158 82 M164 82 C168 62 176 66 175 86" fill="none" stroke="#C9A24B" stroke-width="2" opacity=".55" stroke-linecap="round"/>
      <circle cx="132" cy="146" r="9" fill="${orange}" opacity=".75"/>
      <circle cx="188" cy="146" r="9" fill="${orange}" opacity=".75"/>
      <g class="pet-eyes">
        <ellipse cx="144" cy="130" rx="7" ry="8" fill="#2E2926"/>
        <ellipse cx="176" cy="130" rx="7" ry="8" fill="#2E2926"/>
        <circle cx="142" cy="127" r="2.4" fill="#FFFDF7"/>
        <circle cx="174" cy="127" r="2.4" fill="#FFFDF7"/>
      </g>
      <path d="M160 144 L174 151 L160 160 Z" fill="#8A6A55"/>
      <path d="M160 144 L166 151 L160 154 Z" fill="#6E5242"/>
      <path d="M148 164 Q160 172 172 164" fill="none" stroke="#B08A5A" stroke-width="2" stroke-linecap="round" opacity=".8"/>
    </g>
    <path d="M142 280 L138 292 M150 280 L150 294 M178 280 L178 294 M186 280 L190 292" stroke="#8A6A55" stroke-width="4" stroke-linecap="round"/>
    <path d="M118 210 C112 236 120 258 136 266" fill="none" stroke="${a.light}" stroke-width="5" opacity=".35" stroke-linecap="round"/>
  `;
}

function hamsterSVG(a, uid) {
  return `
    <ellipse cx="160" cy="236" rx="70" ry="54" fill="url(#fur${uid})"/>
    <ellipse cx="160" cy="252" rx="42" ry="32" fill="${a.muzzle}" opacity=".8"/>
    <circle cx="120" cy="142" r="18" fill="${a.fur}"/><circle cx="200" cy="142" r="18" fill="${a.fur}"/>
    <circle cx="120" cy="142" r="11" fill="${a.inner}" opacity=".8"/><circle cx="200" cy="142" r="11" fill="${a.inner}" opacity=".8"/>
    <circle cx="160" cy="178" r="50" fill="url(#fur${uid})"/>
    <ellipse cx="118" cy="198" rx="20" ry="17" fill="${a.muzzle}" opacity=".55"/>
    <ellipse cx="202" cy="198" rx="20" ry="17" fill="${a.muzzle}" opacity=".55"/>
    <g class="pet-eyes">
      <ellipse cx="140" cy="176" rx="7" ry="8" fill="#2C2622"/>
      <ellipse cx="180" cy="176" rx="7" ry="8" fill="#2C2622"/>
      <circle cx="138" cy="173" r="2.4" fill="#FFFDF7"/><circle cx="178" cy="173" r="2.4" fill="#FFFDF7"/>
    </g>
    <path d="M155 190 L165 190 L160 196 Z" fill="#C97A7A"/>
    <path d="M160 196 Q160 202 152 202 M160 196 Q160 202 168 202" fill="none" stroke="#6B4A3A" stroke-width="1.8" stroke-linecap="round" opacity=".75"/>
    <g stroke="${a.muzzle}" stroke-width="1.3" opacity=".8" stroke-linecap="round">
      <path d="M136 194 L116 190 M136 199 L116 202 M184 194 L204 190 M184 199 L204 202"/>
    </g>
    <ellipse cx="146" cy="260" rx="13" ry="9" fill="${a.light}"/><ellipse cx="174" cy="260" rx="13" ry="9" fill="${a.light}"/>
    <ellipse cx="160" cy="260" rx="9" ry="12" fill="#4A3A2A" transform="rotate(18 160 260)"/>
    <ellipse cx="160" cy="258" rx="3" ry="6" fill="#E8D6A8" opacity=".8"/>
    <ellipse cx="134" cy="286" rx="17" ry="9" fill="${a.light}"/><ellipse cx="186" cy="286" rx="17" ry="9" fill="${a.light}"/>
    <circle cx="230" cy="254" r="8" fill="${a.light}"/>
    <path d="M120 160 Q126 148 136 152" fill="none" stroke="${a.light}" stroke-width="3" opacity=".5" stroke-linecap="round"/>
  `;
}

/* ---------------- 小图标 ---------------- */

PL.ICONS = {
  heart: '<path d="M12 20.2s-7.2-4.5-7.2-9.6A4.3 4.3 0 0 1 12 7.1a4.3 4.3 0 0 1 7.2 3.5c0 5.1-7.2 9.6-7.2 9.6Z"/>',
  paw: '<circle cx="7" cy="9" r="2"/><circle cx="12" cy="7" r="2"/><circle cx="17" cy="9" r="2"/><path d="M12 12c-2.6 0-4.8 2.1-4.8 4.3 0 1.6 1.3 2.5 2.9 2.1 1.3-.3 2.6-.3 3.8 0 1.6.4 2.9-.5 2.9-2.1C16.8 14.1 14.6 12 12 12Z"/>',
  star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.4l6.1-.9L12 3Z"/>',
  leaf: '<path d="M20 4C11 4 5 8 5 14c0 3 2 5 5 5 6 0 10-6 10-15Z"/><path d="M5 20c2-5 5-8 10-10"/>',
  moon: '<path d="M20 15.2A8.3 8.3 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  rain: '<path d="M7 16a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 9a3.5 3.5 0 0 1 .4 7H7Z"/><path d="M8 19v2M12 18v3M16 19v2"/>',
  cloud: '<path d="M7 17a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 10a3.5 3.5 0 0 1 .4 7H7Z"/>',
  window: '<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M12 4v16M4 12h16"/>',
  door: '<path d="M5 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17"/><path d="M3 21h18"/><circle cx="13.8" cy="12" r=".8"/>',
  eye: '<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.6"/>',
  sound: '<path d="M4 9h3l4-3v12l-4-3H4V9Z"/><path d="M15 8.5a5 5 0 0 1 0 7M18 6a8 8 0 0 1 0 12"/>',
  tooth: '<path d="M8 4c-2 0-3 1.6-3 3.4 0 2.3 1 3.4 1.3 5.8.2 1.8.5 6.8 2.2 6.8 1.4 0 1.2-4 3.5-4s2.1 4 3.5 4c1.7 0 2-5 2.2-6.8.3-2.4 1.3-3.5 1.3-5.8C19 5.6 18 4 16 4c-1.6 0-2.3 1-4 1s-2.4-1-4-1Z"/>',
  toy: '<circle cx="12" cy="14" r="5"/><path d="M8.5 9.5 6 6M15.5 9.5 18 6M9 14h.01M15 14h.01"/><path d="M7 19c-2 0-3-1-3-3"/>',
  box: '<path d="M3 8h18v11H3z"/><path d="M3 8l3-4h12l3 4M12 4v15"/>',
  mirror: '<ellipse cx="12" cy="10" rx="6" ry="7"/><path d="M12 17v4M8 21h8"/>',
  fire: '<path d="M12 21c4 0 6-2.6 6-6 0-4-3-6-4-9-1 3-3 3.5-3 6-1-1-1.5-2-1.5-3C7.5 11 6 13 6 15c0 3.4 2 6 6 6Z"/>',
  candle: '<path d="M9 10h6v11H9z"/><path d="M12 10c-2-2-1-4 0-6 1 2 2 4 0 6Z"/><path d="M8 21h8"/>',
  book: '<path d="M4 5c3-1 5-1 8 1 3-2 5-2 8-1v14c-3-1-5-1-8 1-3-2-5-2-8-1V5Z"/><path d="M12 6v14"/>',
  arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  refresh: '<path d="M20 6v5h-5M4 18v-5h5"/><path d="M18.5 11a7 7 0 0 0-12-4L4 11M5.5 13a7 7 0 0 0 12 4l2.5-4"/>',
  home: '<path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
  sparkle: '<path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10C7.4 11.4 11.4 7.4 12 2Z"/>',
};

PL.icon = (name, cls = '') => {
  const p = PL.ICONS[name] || PL.ICONS.sparkle;
  return `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
};

PL.portraitPath = (speciesId) => `assets/art/species_${speciesId}.jpg`;

/* ---------------- 一生卡 ---------------- */

PL.drawShareCard = async (canvas, record) => {
  const W = 1080;
  const H = 1440;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch (e) {}
  }

  const paper = '#F6EFE2';
  const ink = '#26231F';
  const soft = '#6E6255';
  const red = '#B8452F';
  const gold = '#B08A4A';
  const he = (PL.HOMES[record.homeId] || {}).human?.pronoun || '他';

  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, H);

  // 纸张纹理
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = i % 3 === 0 ? 'rgba(80,58,38,.035)' : 'rgba(255,255,255,.05)';
    ctx.fillRect(Math.random() * W, Math.random() * H, 1.4, 1.4);
  }

  // 边框
  ctx.strokeStyle = 'rgba(38,35,31,.18)';
  ctx.lineWidth = 2;
  ctx.strokeRect(44, 44, W - 88, H - 88);

  // 顶部
  ctx.fillStyle = ink;
  ctx.font = '600 34px "Songti SC", "STSong", "Noto Serif CJK SC", serif';
  ctx.textAlign = 'left';
  ctx.fillText('宠物的一生', 90, 120);
  ctx.fillStyle = soft;
  ctx.font = '400 15px "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'left';
  try { ctx.letterSpacing = '5px'; } catch (e) {}
  ctx.fillText('A PET’S LIFE', 92, 150);
  try { ctx.letterSpacing = '0px'; } catch (e) {}

  // 印章
  ctx.save();
  ctx.translate(905, 80);
  ctx.rotate(-0.03);
  ctx.fillStyle = red;
  ctx.beginPath();
  ctx.roundRect(0, 0, 88, 88, 8);
  ctx.fill();
  ctx.fillStyle = '#F8F0E2';
  ctx.font = '600 32px "Songti SC", "STSong", serif';
  ctx.textAlign = 'center';
  ctx.fillText('一', 44, 38);
  ctx.fillText('生', 44, 73);
  ctx.restore();

  // 肖像
  const cx = W / 2;
  const cy = 420;
  const r = 196;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx + 8, cy + 10, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(38,35,31,.10)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#EADCC7';
  ctx.fill();
  ctx.clip();
  const img = await loadImage(PL.portraitPath(record.speciesId));
  if (img) {
    const scale = Math.max((r * 2) / img.width, (r * 2) / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  } else {
    ctx.fillStyle = PL.SPECIES[record.speciesId].palette.primary;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(38,35,31,.7)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // 结局名
  ctx.textAlign = 'center';
  ctx.fillStyle = red;
  ctx.font = '500 24px "Songti SC", "STSong", serif';
  try { ctx.letterSpacing = '6px'; } catch (e) {}
  ctx.fillText(record.endingTitle, cx, 668);
  try { ctx.letterSpacing = '0px'; } catch (e) {}

  // 名字
  ctx.fillStyle = ink;
  const nameSize = record.name.length > 5 ? 72 : 96;
  ctx.font = `600 ${nameSize}px "Songti SC", "STSong", "Noto Serif CJK SC", serif`;
  ctx.fillText(record.name, cx, 782);

  ctx.fillStyle = soft;
  ctx.font = '400 27px "Songti SC", "STSong", serif';
  ctx.fillText(`${record.speciesName} · ${record.birthYear} — ${record.endYear} · ${record.ageLabel}`, cx, 830);

  // 主句
  ctx.fillStyle = ink;
  ctx.font = '400 27px "Songti SC", "STSong", serif';
  wrapText(ctx, record.shareLine, cx, 880, 820, 40, 2);

  // 四维
  const stats = [
    ['健康', record.stats.health, '#7C9A6A'],
    ['亲密', record.stats.bond, red],
    ['好奇', record.stats.curiosity, '#B08A4A'],
    ['自在', record.stats.freedom, '#6D8A7A'],
  ];
  const sx = 150;
  const sy = 960;
  const colW = 390;
  stats.forEach(([label, value, color], i) => {
    const x = sx + (i % 2) * colW;
    const y = sy + Math.floor(i / 2) * 70;
    ctx.textAlign = 'left';
    ctx.fillStyle = soft;
    ctx.font = '400 22px "PingFang SC", "Hiragino Sans GB", sans-serif';
    ctx.fillText(label, x, y);
    ctx.fillStyle = 'rgba(38,35,31,.10)';
    ctx.beginPath();
    ctx.roundRect(x + 62, y - 16, 270, 14, 7);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x + 62, y - 16, Math.max(8, 270 * (value / 100)), 14, 7);
    ctx.fill();
    ctx.fillStyle = soft;
    ctx.font = '500 19px "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(String(value), x + 350, y);
  });

  // 关键词
  ctx.textAlign = 'center';
  const kw = record.keywords.slice(0, 3);
  const kwY = 1095;
  const kwW = 150;
  const totalW = kw.length * kwW + (kw.length - 1) * 16;
  kw.forEach((k, i) => {
    const x = cx - totalW / 2 + i * (kwW + 16);
    ctx.fillStyle = 'rgba(38,35,31,.05)';
    ctx.strokeStyle = 'rgba(38,35,31,.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, kwY - 32, kwW, 46, 23);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = ink;
    ctx.font = '400 22px "Songti SC", "STSong", serif';
    ctx.fillText(k, x + kwW / 2, kwY);
  });

  // 记忆
  const mems = record.memories.slice(0, 3);
  mems.forEach((m, i) => {
    const y = 1175 + i * 52;
    ctx.textAlign = 'left';
    ctx.fillStyle = red;
    ctx.beginPath();
    ctx.arc(170, y - 8, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ink;
    ctx.font = '500 23px "Songti SC", "STSong", serif';
    const memTitle = PL.pronounize(m.title, he);
    const memLine = PL.pronounize(m.line, he);
    const titleW = ctx.measureText(memTitle).width;
    ctx.fillText(memTitle, 195, y);
    ctx.fillStyle = soft;
    ctx.font = '400 21px "Songti SC", "STSong", serif';
    const line = fitText(ctx, `— ${memLine}`, 915 - (195 + titleW + 14));
    ctx.fillText(line, 195 + titleW + 14, y);
  });

  // 墓志铭
  ctx.textAlign = 'center';
  ctx.fillStyle = ink;
  ctx.font = 'italic 400 27px "Songti SC", "STSong", serif';
  wrapText(ctx, record.lastWords || record.epitaph, cx, 1330, 820, 40, 2);

  // 底部
  ctx.fillStyle = soft;
  ctx.font = '400 16px "Helvetica Neue", Arial, sans-serif';
  try { ctx.letterSpacing = '2px'; } catch (e) {}
  ctx.fillText('一爪一生 · PAWPRINT', cx, 1392);
  try { ctx.letterSpacing = '0px'; } catch (e) {}

  return canvas;
};

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function fitText(ctx, text, maxWidth) {
  if (maxWidth <= 0) return '';
  if (ctx.measureText(text).width <= maxWidth) return text;
  let out = String(text);
  while (out.length > 1 && ctx.measureText(out + '…').width > maxWidth) out = out.slice(0, -1);
  return out + '…';
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 2) {
  const chars = String(text || '').split('');
  let line = '';
  let lines = [];
  for (const ch of chars) {
    if (ch === '\n') {
      lines.push(line);
      line = '';
      continue;
    }
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = ch;
      if (lines.length >= maxLines) break;
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return lines.length;
}

PL.downloadCanvas = (canvas, filename) => {
  const a = document.createElement('a');
  a.download = filename;
  a.href = canvas.toDataURL('image/png');
  a.click();
};
