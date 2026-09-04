const BASES = {
  2: 'Binario',
  8: 'Octal',
  10: 'Decimal',
  16: 'Hexadecimal'
};

const tabs = document.querySelectorAll('.tab');
const panels = { pair: document.querySelector('#pair-mode'), base: document.querySelector('#base-mode') };

function setMode(mode) {
  tabs.forEach(tab => {
    const active = tab.dataset.mode === mode;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', active);
  });
  Object.entries(panels).forEach(([key, panel]) => panel.classList.toggle('active-panel', key === mode));
}

tabs.forEach(tab => tab.addEventListener('click', () => setMode(tab.dataset.mode)));

function normalize(value) {
  return value.trim().toUpperCase().replace(/^\+/, '');
}

function parseInBase(value, base) {
  const clean = normalize(value);
  if (!clean) throw new Error('Introduce un número.');
  if (clean.startsWith('-')) throw new Error('Esta versión trabaja con números enteros positivos.');

  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const allowed = alphabet.slice(0, base);
  for (const char of clean) {
    if (!allowed.includes(char)) {
      throw new Error(`“${char}” no es válido para la base ${base}.`);
    }
  }

  let result = 0n;
  const b = BigInt(base);
  for (const char of clean) result = result * b + BigInt(alphabet.indexOf(char));
  return result;
}

function formatInBase(value, base) {
  return value.toString(base).toUpperCase();
}

function showError(element, message) {
  element.className = 'result error';
  element.textContent = message;
}

function convertPair() {
  const from = Number(document.querySelector('#from-base').value);
  const to = Number(document.querySelector('#to-base').value);
  const input = document.querySelector('#pair-input').value;
  const result = document.querySelector('#pair-result');

  try {
    const decimal = parseInBase(input, from);
    result.className = 'result success';
    result.textContent = formatInBase(decimal, to);
  } catch (error) {
    showError(result, error.message);
  }
}

document.querySelector('#pair-convert').addEventListener('click', convertPair);
document.querySelector('#pair-input').addEventListener('keydown', event => {
  if (event.key === 'Enter') convertPair();
});

function renderAllResults() {
  const input = document.querySelector('#base-input').value;
  const base = Number(document.querySelector('#input-base').value);
  const container = document.querySelector('#base-results');

  try {
    const decimal = parseInBase(input, base);
    const targets = [10, 2, 8, 16];
    container.innerHTML = targets.map(target => `
      <div class="result-box">
        <div class="result-label">${BASES[target]}</div>
        <div class="result-value">
          <code>${formatInBase(decimal, target)}</code>
          <button class="copy-btn" data-value="${formatInBase(decimal, target)}" aria-label="Copiar ${BASES[target]}">Copiar</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    container.innerHTML = `<div class="result error" style="grid-column:1/-1">${error.message}</div>`;
  }
}

document.querySelector('#base-convert').addEventListener('click', renderAllResults);
document.querySelector('#base-input').addEventListener('keydown', event => {
  if (event.key === 'Enter') renderAllResults();
});

document.querySelector('#base-results').addEventListener('click', async event => {
  const button = event.target.closest('.copy-btn');
  if (!button) return;
  try {
    await navigator.clipboard.writeText(button.dataset.value);
    const original = button.textContent;
    button.textContent = '¡Copiado!';
    setTimeout(() => button.textContent = original, 1000);
  } catch {
    button.textContent = 'No disponible';
  }
});
