const defaultProgress = {
  homeIntroDone:false,
  findCarbonDone:false,
  classifyDone:false,
  quizDone:false,
  checklistDone:false,
  quizScore:0,
  foundCount:0
};

function getProgress(){
  const raw = localStorage.getItem('carbonProgress');
  return raw ? {...defaultProgress, ...JSON.parse(raw)} : {...defaultProgress};
}

function saveProgress(p){
  localStorage.setItem('carbonProgress', JSON.stringify(p));
}

function setActiveNav(){
  const page = document.body.dataset.page;
  document.querySelectorAll('.nav-links a').forEach(a=>{
    const href = a.getAttribute('href');
    if((page === 'index' && href === 'index.html') || href.includes(page)) {
      a.classList.add('active');
    }
  });
}

function toggleMenu(){
  document.getElementById('navLinks').classList.toggle('open');
}

function homeQuestion(choice){
  const box = document.getElementById('homeFeedback');
  if(!box) return;

  const p = getProgress();
  p.homeIntroDone = true;
  saveProgress(p);

  if(choice === 'b'){
    box.className = 'feedback ok show';
    box.innerHTML = '答對了！咖啡廳雖然不是大型工廠，但從原料取得、物流配送、設備用電到外帶包裝，都會累積碳排。這也是店家需要開始理解減碳的原因。';
  }else{
    box.className = 'feedback bad show';
    box.innerHTML = '這個答案不太正確。其實咖啡廳的日常營運就包含很多碳排來源，例如冷藏設備、照明、配送、包材與原料。';
  }

  updateGlobalProgress();
}

const carbonInfo = {
  machine:'咖啡機：沖煮與蒸汽加熱都會用電，是門市中很核心的耗能設備之一。',
  fridge:'冰箱／冷藏設備：需要長時間運轉，若設備老舊或開關頻繁，耗能會更高。',
  cups:'外帶杯與包材：一次性用品看起來小，但在大量銷售下會累積可觀的碳排。',
  light:'照明：長時間營業的店家若照明配置不佳，也會增加不必要的能耗。',
  delivery:'原料配送：原料從供應商送到店裡，物流與運輸距離都會影響碳排。',
  commute:'員工通勤：員工每天上下班的交通方式，例如開車、騎車或搭乘大眾運輸，也屬於容易被忽略的間接碳排。'
};

function initFindGame(){
  const items = document.querySelectorAll('.game-item');
  if(!items.length) return;

  const progress = getProgress();
  let found = new Set();

  const countEl = document.getElementById('foundCount');
  const infoEl = document.getElementById('findInfo');
  const barEl = document.getElementById('findProgress');

  function render(){
    countEl.textContent = found.size;
    const pct = (found.size / 6) * 100;
    barEl.style.width = pct + '%';
    progress.foundCount = found.size;

    if(found.size >= 6){
      progress.findCarbonDone = true;
      saveProgress(progress);
      infoEl.innerHTML = '恭喜完成第一關！你已經找出店內主要碳排熱點，也注意到像員工通勤這樣的間接碳排來源，接下來可以進一步學習如何分類與改善。';
      updateGlobalProgress();
    }else{
      saveProgress(progress);
    }
  }

  items.forEach(item=>{
    item.addEventListener('click', ()=>{
      const id = item.dataset.id;

      if(found.has(id)){
        infoEl.innerHTML = '你已經找到這個碳排來源了，可以繼續找下一個。';
        return;
      }

      found.add(id);
      item.classList.add('found');
      infoEl.innerHTML = carbonInfo[id];
      render();
    });
  });

  render();
}

function resetFindGame(){
  const items = document.querySelectorAll('.game-item');
  items.forEach(i=>i.classList.remove('found'));

  const p = getProgress();
  p.findCarbonDone = false;
  p.foundCount = 0;
  saveProgress(p);

  const countEl = document.getElementById('foundCount');
  const progressEl = document.getElementById('findProgress');
  const infoEl = document.getElementById('findInfo');

  if(countEl) countEl.textContent = '0';
  if(progressEl) progressEl.style.width = '0%';
  if(infoEl) infoEl.innerHTML = '請先點選場景中的物件，找出主要碳排來源。';

  initFindGame();
}

let dragged = null;

function initDragDrop(){
  const draggables = document.querySelectorAll('.draggable');
  const zones = document.querySelectorAll('.dropzone');
  if(!draggables.length) return;

  draggables.forEach(item=>{
    item.addEventListener('dragstart', ()=>{
      dragged = item;
    });
  });

  zones.forEach(zone=>{
    zone.addEventListener('dragover', e=>{
      e.preventDefault();
      zone.classList.add('over');
    });

    zone.addEventListener('dragleave', ()=>{
      zone.classList.remove('over');
    });

    zone.addEventListener('drop', e=>{
      e.preventDefault();
      zone.classList.remove('over');
      if(dragged) zone.appendChild(dragged);
    });
  });
}

function checkClassification(){
  const zones = document.querySelectorAll('.dropzone');
  const fb = document.getElementById('classificationFeedback');
  let total = 0;
  let correct = 0;

  zones.forEach(zone=>{
    zone.querySelectorAll('.draggable').forEach(item=>{
      total += 1;
      if(item.dataset.type === zone.dataset.zone){
        correct += 1;
      }
    });
  });

  fb.classList.add('show');
  const p = getProgress();

  if(correct === total && total > 0){
    fb.className = 'feedback ok show';
    fb.innerHTML = '全對！你已經掌握原料、運輸、製作、銷售四種分類邏輯，完成第二關。';
    p.classifyDone = true;
  }else{
    fb.className = 'feedback bad show';
    fb.innerHTML = `你目前答對 ${correct} / ${total}。小提醒：咖啡豆採購屬於原料、配送車屬於運輸、咖啡機與冷氣屬於製作、外帶杯屬於銷售。`;
    p.classifyDone = false;
  }

  saveProgress(p);
  updateGlobalProgress();
}

function resetClassification(){
  location.reload();
}

const quizData = [
  {
    q:'情境 1：店裡想更換外帶杯策略，哪一個做法通常更有助於減碳？',
    options:[
      {text:'維持大量一次性包材使用，讓流程最方便', ok:false, reason:'方便不代表較減碳，大量一次性包材會增加耗材與廢棄量。'},
      {text:'鼓勵自備杯，並逐步減少不必要的包材', ok:true, reason:'這通常能有效降低一次性用品帶來的碳排與浪費。'},
      {text:'多加一層外包裝，讓杯子看起來更精緻', ok:false, reason:'多一層包裝通常代表更多耗材。'}
    ]
  },
  {
    q:'情境 2：如果要改善原料配送的碳排，哪一個方向較合理？',
    options:[
      {text:'增加小量多次配送，讓庫存更好看', ok:false, reason:'配送次數增加通常會提高物流相關碳排。'},
      {text:'規劃更有效率的補貨頻率，減少不必要配送', ok:true, reason:'更穩定的配送安排通常有助於降低運輸造成的碳排。'},
      {text:'不考慮距離，只看最低單價', ok:false, reason:'只看單價可能忽略運輸距離與隱藏成本。'}
    ]
  },
  {
    q:'情境 3：以下哪個比較符合門市減碳方向？',
    options:[
      {text:'冷氣與照明整天維持最高運轉，不做調整', ok:false, reason:'長時間高負載運轉會增加耗能。'},
      {text:'定期檢查設備效率，離峰時調整不必要的用電', ok:true, reason:'這是很實際的節能作法，也有助於減碳。'},
      {text:'設備老舊也先不管，只要還能用就好', ok:false, reason:'老舊設備可能效率較差，長期下來更耗電。'}
    ]
  }
];

let quizIndex = 0;
let quizScore = 0;

function initQuiz(){
  const qBox = document.getElementById('quizQuestion');
  if(!qBox) return;
  quizIndex = 0;
  quizScore = 0;
  renderQuiz();
}

function renderQuiz(){
  const qBox = document.getElementById('quizQuestion');
  const optBox = document.getElementById('quizOptions');
  const fb = document.getElementById('quizFeedback');
  const scoreEl = document.getElementById('quizScore');
  const item = quizData[quizIndex];

  fb.className = 'feedback';

  if(!item){
    qBox.innerHTML = '<h3>測驗完成！</h3>';
    optBox.innerHTML = '';

    const p = getProgress();
    p.quizDone = true;
    p.quizScore = quizScore;
    saveProgress(p);

    scoreEl.textContent = quizScore;
    fb.className = 'feedback ok show';
    fb.innerHTML = quizScore >= 2
      ? `總分 ${quizScore} / ${quizData.length}。你已具備基礎減碳決策能力，已完成第三關。`
      : `總分 ${quizScore} / ${quizData.length}。你已經建立初步概念，建議再回頭看看前面的內容，會更穩。`;

    updateGlobalProgress();
    return;
  }

  qBox.innerHTML = `<h3>${item.q}</h3>`;
  scoreEl.textContent = quizScore;
  optBox.innerHTML = '';

  item.options.forEach(opt=>{
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = opt.text;
    btn.onclick = ()=> {
      if(opt.ok) quizScore += 1;

      fb.className = 'feedback ' + (opt.ok ? 'ok show' : 'bad show');
      fb.innerHTML = (opt.ok ? '答對了！' : '這題可以再想一下。') + opt.reason;
      scoreEl.textContent = quizScore;

      setTimeout(()=>{
        quizIndex += 1;
        renderQuiz();
      }, 1200);
    };
    optBox.appendChild(btn);
  });
}

function checkActionChecklistQuiz(){
  const correctAnswers = ['a', 'c', 'e', 'g'];
  const answerText = {
    a: '定期檢查冷藏設備與冷氣效率，避免不必要耗電',
    b: '為了方便流程，大量增加一次性包材使用',
    c: '鼓勵顧客自備杯，並提供簡單優惠',
    d: '增加小量多次配送，讓補貨更頻繁',
    e: '重新規劃原料採購與配送頻率，減少不必要運輸',
    f: '尖峰與離峰時段都讓設備維持最高運轉，不做調整',
    g: '在店內向顧客傳達減碳作法與品牌永續理念',
    h: '設備老舊也沒關係，只要還能用就先不管'
  };

  const explanation = {
    a: '正確。提升設備效率、避免浪費用電，是很實際的減碳方法。',
    b: '錯誤。一次性包材越多，通常代表更多資源消耗與碳排。',
    c: '正確。鼓勵自備杯可以減少一次性用品使用。',
    d: '錯誤。增加配送次數通常會提高運輸相關碳排。',
    e: '正確。優化採購與配送頻率，有助於降低物流碳排。',
    f: '錯誤。不分時段讓設備高運轉，容易造成不必要能耗。',
    g: '正確。對顧客傳達永續理念，有助於建立品牌與推動行動。',
    h: '錯誤。老舊設備可能效率差，長期下來反而更耗能。'
  };

  const checked = Array.from(document.querySelectorAll('#actionChecklistQuiz input:checked')).map(item => item.value);
  const resultBox = document.getElementById('actionChecklistResult');
  const p = getProgress();

  let score = 0;
  let resultHtml = '<strong>作答結果</strong><br><br>';

  Object.keys(answerText).forEach(key => {
    const isChecked = checked.includes(key);
    const isCorrect = correctAnswers.includes(key);

    if (isChecked && isCorrect) {
      score++;
      resultHtml += `✅ ${answerText[key]}<br>${explanation[key]}<br><br>`;
    } else if (isChecked && !isCorrect) {
      resultHtml += `❌ ${answerText[key]}<br>${explanation[key]}<br><br>`;
    } else if (!isChecked && isCorrect) {
      resultHtml += `⚠️ 你漏選了：${answerText[key]}<br>${explanation[key]}<br><br>`;
    }
  });

  resultHtml += `<strong>你的得分：${score} / ${correctAnswers.length}</strong><br><br>`;

  if(score === correctAnswers.length){
    resultHtml += '太好了！你已經能正確判斷哪些行動真正有助於咖啡廳減碳，完成第 5 單元。';
    p.checklistDone = true;
  }else if(score >= 2){
    resultHtml += '你已經掌握大部分概念了，再回頭看看錯誤選項，會更完整。';
    p.checklistDone = true;
  }else{
    resultHtml += '目前還有一些觀念需要再釐清，建議回頭複習前面的內容，再重新作答。';
    p.checklistDone = false;
  }

  resultBox.innerHTML = resultHtml;
  saveProgress(p);
  updateGlobalProgress();
}

function resetActionChecklistQuiz(){
  document.querySelectorAll('#actionChecklistQuiz input').forEach(item => {
    item.checked = false;
  });

  const resultBox = document.getElementById('actionChecklistResult');
  if(resultBox){
    resultBox.innerHTML = '請先勾選你認為正確的減碳行動，再按下「檢查答案」。';
  }

  const p = getProgress();
  p.checklistDone = false;
  saveProgress(p);
  updateGlobalProgress();
}

function updateGlobalProgress(){
  const p = getProgress();
  const keys = ['homeIntroDone','findCarbonDone','classifyDone','quizDone','checklistDone'];
  const done = keys.filter(k=>p[k]).length;
  const pct = Math.round(done / keys.length * 100);

  const globalBar = document.getElementById('globalProgress');
  const globalText = document.getElementById('globalProgressText');

  if(globalBar) globalBar.style.width = pct + '%';
  if(globalText){
    globalText.textContent = `目前完成 ${done} / ${keys.length} 個重點學習任務，進度 ${pct}%。互動測驗分數：${p.quizScore || 0} 分。`;
  }
}

function initReveal(){
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('show');
      }
    });
  }, {threshold:.12});

  els.forEach(el=>io.observe(el));
}

document.addEventListener('DOMContentLoaded', ()=>{
  setActiveNav();
  initReveal();
  initFindGame();
  initDragDrop();
  initQuiz();
  updateGlobalProgress();
});