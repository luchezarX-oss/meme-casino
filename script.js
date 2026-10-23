const config = [
  { icon: '🍒', weight: 2500, type: 'normal', pay: 150 },
  { icon: '🍋', weight: 2500, type: 'normal', pay: 150 },
  { icon: '🍇', weight: 1500, type: 'normal', pay: 300 },
  { icon: '🔔', weight: 1000, type: 'normal', pay: 500 },
  { icon: '🍉', weight: 1000, type: 'normal', pay: 300 },
  { icon: '🍌', weight: 800, type: 'normal', pay: 400 },
  { icon: '🤡', weight: 500, type: 'clown', pay: 0 },
  { icon: '7️⃣', weight: 200, type: 'normal', pay: 1000 },
  { icon: '💣', weight: 100, type: 'bomb' },
  { icon: '⭐', weight: 50, type: 'normal', pay: 5000 },
  { icon: '💎', weight: 10, type: 'normal', pay: 10000 },
  { icon: '🚀', weight: 5, type: 'normal', pay: 20000 },
  { icon: 'x2', weight: 60, type: 'mult', val: 2 },
  { icon: 'x3', weight: 30, type: 'mult', val: 3 },
  { icon: 'x4', weight: 10, type: 'mult', val: 4 },
  { icon: 'x5', weight: 5, type: 'mult', val: 5 }
];

let score = parseFloat(localStorage.getItem('casino_score'));
if (isNaN(score)) score = 1500;

let bankBal = parseFloat(localStorage.getItem('bank_score'));
if (isNaN(bankBal)) bankBal = 100;

let inputStr = "";
let isBankToCasino = true;

const bet = 100;
const btn = document.getElementById('spin');
const scoreText = document.getElementById('score');
const coinBtn = document.getElementById('get-coin');
const resetBtn = document.getElementById('reset');
const walletBtn = document.getElementById('wallet');
const gameView = document.getElementById('game-view');
const bankView = document.getElementById('bank-view');
const backBtn = document.getElementById('back');
const slots = [
  document.getElementById('s1'),
  document.getElementById('s2'),
  document.getElementById('s3'),
  document.getElementById('s4'),
  document.getElementById('s5')
];

const bankText = document.getElementById('bank-bal');
const casinoText = document.getElementById('casino-bal');
const inputAmount = document.getElementById('input-amount');
const swapBtn = document.getElementById('swap');
const transferBtn = document.getElementById('transfer');
const quickBtns = document.querySelectorAll('.quick[data-add]');
const quickMax = document.getElementById('quick-max');

let bombEnd = 0;
let bombInt = null;
let bombTo = null;
let coinEnd = parseInt(localStorage.getItem('coinEnd')) || 0;
let coinInt = null;

function update() {
  scoreText.innerText = score.toLocaleString('ru-RU');
  localStorage.setItem('casino_score', score);
}

function resetBtnState() {
  btn.innerText = 'Крутить (-100)';
  btn.style.background = '#FFDD2D';
  btn.style.color = '#000';
}

function stopBomb() {
  clearInterval(bombInt);
  clearTimeout(bombTo);
  bombInt = null;
  bombTo = null;
  bombEnd = 0;
  localStorage.removeItem('bombEnd');
  resetBtnState();
}

function explode() {
  score = 0;
  update();
  stopBomb();
  alert('💥 БУМ! Бомба взорвалась, баланс обнулен. Ты бомж!');
}

function tick() {
  let left = bombEnd - Date.now();
  if (left <= 0) {
    explode();
    return;
  }
  btn.innerText = 'ТИКАЕТ: ' + (left / 1000).toFixed(1) + 'с';
}

function startBomb() {
  clearInterval(bombInt);
  clearTimeout(bombTo);
  btn.style.background = '#ff4444';
  btn.style.color = '#fff';
  tick();
  bombInt = setInterval(tick, 100);
  bombTo = setTimeout(explode, bombEnd - Date.now());
}

function tickCoin() {
  let left = coinEnd - Date.now();
  if (left <= 0) {
    clearInterval(coinInt);
    coinInt = null;
    coinEnd = 0;
    localStorage.removeItem('coinEnd');
    coinBtn.innerText = '🪙';
    coinBtn.disabled = false;
    return;
  }
  let m = Math.floor(left / 60000);
  let s = Math.floor((left % 60000) / 1000);
  coinBtn.innerText = m + ':' + s.toString().padStart(2, '0');
  coinBtn.disabled = true;
}

function getPool() {
  let dynamic = JSON.parse(JSON.stringify(config));
  if (score > 5000) {
    dynamic.find(i => i.icon === 'x2').weight = Math.floor(dynamic.find(i => i.icon === 'x2').weight / 2);
    dynamic.find(i => i.icon === 'x3').weight = Math.floor(dynamic.find(i => i.icon === 'x3').weight / 2);
    dynamic.find(i => i.icon === 'x4').weight = Math.floor(dynamic.find(i => i.icon === 'x4').weight / 2);
    dynamic.find(i => i.icon === 'x5').weight = Math.floor(dynamic.find(i => i.icon === 'x5').weight / 2);
    dynamic.find(i => i.icon === '🤡').weight *= 3;
    dynamic.find(i => i.icon === '💣').weight *= 3;
  } else if (score < 500) {
    dynamic.find(i => i.icon === 'x2').weight *= 3;
    dynamic.find(i => i.icon === 'x3').weight *= 2;
    dynamic.find(i => i.icon === '🤡').weight = Math.floor(dynamic.find(i => i.icon === '🤡').weight / 2);
  }
  const p = [];
  dynamic.forEach(item => {
    for (let i = 0; i < item.weight; i++) p.push(item);
  });
  return p;
}

function renderBank() {
  bankText.innerText = bankBal.toLocaleString('ru-RU');
  casinoText.innerText = score.toLocaleString('ru-RU');
  inputAmount.innerText = inputStr === "" ? "0" : parseFloat(inputStr).toLocaleString('ru-RU');
}

walletBtn.addEventListener('click', () => {
  gameView.classList.add('hidden');
  bankView.classList.remove('hidden');
  inputStr = "";
  renderBank();
});

backBtn.addEventListener('click', () => {
  bankView.classList.add('hidden');
  gameView.classList.remove('hidden');
  score = parseFloat(localStorage.getItem('casino_score')) || 1500;
  update();
});

coinBtn.addEventListener('click', () => {
  if (coinEnd > Date.now()) return;
  score += 500;
  update();
  coinEnd = Date.now() + 5 * 60 * 1000;
  localStorage.setItem('coinEnd', coinEnd);
  tickCoin();
  coinInt = setInterval(tickCoin, 1000);
});

resetBtn.addEventListener('click', () => {
  let isSure = confirm('⚠️ ВНИМАНИЕ! Это удалит ВЕСЬ твой прогресс: баланс в казино, деньги в банке и кулдаун монетки. Ты точно хочешь начать всё заново?');
  if (isSure) {
    localStorage.clear();
    location.reload();
  }
});

document.querySelectorAll('.num').forEach(b => {
  b.addEventListener('click', (e) => {
    let val = e.target.getAttribute('data-val');
    if (val === null) return;
    if (inputStr.length >= 9) return;
    if (inputStr === "0" && val !== "00") inputStr = val;
    else inputStr += val;
    renderBank();
  });
});

document.getElementById('clear').addEventListener('click', () => {
  inputStr = "";
  renderBank();
});

quickBtns.forEach(b => {
  b.addEventListener('click', () => {
    let add = parseInt(b.getAttribute('data-add'));
    let cur = parseInt(inputStr) || 0;
    inputStr = (cur + add).toString();
    renderBank();
  });
});

quickMax.addEventListener('click', () => {
  inputStr = isBankToCasino ? bankBal.toString() : score.toString();
  renderBank();
});

swapBtn.addEventListener('click', () => {
  isBankToCasino = !isBankToCasino;
  swapBtn.innerText = isBankToCasino ? "↓" : "↑";
});

function transfer() {
  let amt = parseFloat(inputStr);
  if (isNaN(amt) || amt <= 0) {
    alert('Введите сумму');
    return;
  }
  if (isBankToCasino) {
    if (amt > bankBal) {
      alert('Недостаточно средств в банке!');
      return;
    }
    bankBal -= amt;
    score += amt;
  } else {
    if (amt > score) {
      alert('Недостаточно средств в казино!');
      return;
    }
    score -= amt;
    bankBal += amt;
  }
  localStorage.setItem('casino_score', score);
  localStorage.setItem('bank_score', bankBal);
  inputStr = "";
  renderBank();
  update();
}

transferBtn.addEventListener('click', transfer);

window.addEventListener('keydown', (e) => {
  if (bankView.classList.contains('hidden')) return;
  if (e.key >= '0' && e.key <= '9') {
    if (inputStr.length < 9) {
      if (inputStr === "0") inputStr = e.key;
      else inputStr += e.key;
    }
  } else if (e.key === 'Backspace') {
    inputStr = inputStr.slice(0, -1);
  } else if (e.key === 'Enter') {
    transfer();
  } else if (e.key === 'Escape') {
    inputStr = "";
  }
  renderBank();
});

let savedBomb = parseInt(localStorage.getItem('bombEnd'));
if (savedBomb) {
  bombEnd = savedBomb;
  if (bombEnd > Date.now()) startBomb();
  else explode();
}

if (coinEnd > Date.now()) {
  tickCoin();
  coinInt = setInterval(tickCoin, 1000);
}

update();

btn.addEventListener('click', () => {
  if (bombInt) stopBomb();
  if (score < bet) {
    alert('Вы банкрот! Денег нет.');
    return;
  }
  
  score -= bet;
  let res = [];
  let mult = 1;
  let hasMult = false;
  let hasBomb = false;
  let pool = getPool();

  slots.forEach(s => {
    let pick = pool[Math.floor(Math.random() * pool.length)];
    s.innerText = pick.icon;
    res.push(pick);
    if (pick.type === 'mult') {
      mult *= pick.val;
      hasMult = true;
    }
    if (pick.type === 'bomb') {
      hasBomb = true;
    }
  });

  let clowns = res.filter(r => r.type === 'clown').length;

  if (hasBomb) {
    bombEnd = Date.now() + 5000;
    localStorage.setItem('bombEnd', bombEnd);
    startBomb();
  } else if (clowns >= 2) {
    if (clowns === 2) { score *= 0.7; alert('🤡 2 клоуна украли 30% твоих денег!'); }
    else if (clowns === 3) { score *= 0.3; alert('🤡 3 клоуна украли 70% твоих денег!'); }
    else if (clowns === 4) { score *= 0.1; alert('🤡 4 клоуна украли 90% твоих денег!'); }
    else if (clowns === 5) { score = 0; alert('🤡 5 клоунов забрали всё! Ты банкрот!'); }
  } else if (hasMult) {
    score *= mult;
  } else {
    let counts = {};
    res.forEach(item => {
      if (item.type === 'normal') counts[item.icon] = (counts[item.icon] || 0) + 1;
    });
    
    for (let key in counts) {
      let count = counts[key];
      let sym = config.find(c => c.icon === key);
      if (count === 3) score += sym.pay;
      if (count === 4) score += sym.pay * 2;
      if (count === 5) score += sym.pay * 3;
    }
  }
  update();
});