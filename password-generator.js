// password-generator.js
(function(){
  const symbolsList = [
    '!','"','#','$','%','&',"'",'(',')','*','+',',','-','.','/',':',';','<','=','>','?','@','[','\\',']','^','_','`','{','|','}','~'
  ];

  const symbolsBox = document.getElementById('symbolsBox');
  const symbolsOn = document.getElementById('symbolsOn');
  const symbolsOff = document.getElementById('symbolsOff');

  // 「記号を表示」ボタンを作成して追加（初期は表示、記号欄は非表示）
  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.style.marginBottom = '6px';
  toggleBtn.setAttribute('aria-controls', 'symbolsBox');

  // 「全選択 / 全解除」ボタン
  const selectAllBtn = document.createElement('button');
  selectAllBtn.type = 'button';
  selectAllBtn.style.margin = '0 8px 6px 8px';
  selectAllBtn.setAttribute('aria-controls', 'symbolsBox');
  selectAllBtn.setAttribute('aria-label', '記号を全選択または全解除');

  // 初期状態: 記号欄は非表示、トグルボタンは表示（symbolsOn がデフォルトなら）
  let symbolsVisible = false;
  symbolsBox.style.display = 'none';
  toggleBtn.textContent = '記号を表示';
  toggleBtn.setAttribute('aria-expanded', 'false');
  selectAllBtn.style.display = 'none'; // 非表示

  // ボタンをsymbolsBoxの前に挿入（順序: toggleBtn, selectAllBtn, symbolsBox）
  symbolsBox.parentElement.insertBefore(toggleBtn, symbolsBox);
  symbolsBox.parentElement.insertBefore(selectAllBtn, symbolsBox);

  // updateSelectAllButton（宣言）
  function updateSelectAllButton(){
    const boxes = Array.from(symbolsBox.querySelectorAll('input[type="checkbox"]'));
    if (boxes.length === 0) {
      selectAllBtn.textContent = '全選択';
      selectAllBtn.disabled = true;
      return;
    }
    const actionable = boxes.filter(b => !b.disabled);
    if (actionable.length === 0) {
      selectAllBtn.disabled = true;
      return;
    }
    const anyUnchecked = actionable.some(b => !b.checked);
    selectAllBtn.textContent = anyUnchecked ? '全選択' : '全解除';
    // ボタンが使えるのは「記号表示が有効（symbolsOn.checked）」でかつ記号欄表示中だけにする
    selectAllBtn.disabled = !(symbolsOn.checked && symbolsVisible);
  }

  // updateSymbolsUI: radio に応じて toggle/selectAll/symbolsBox を表示/非表示する
  function updateSymbolsUI(){
    if (symbolsOn.checked) {
      // 記号有効：トグルボタンは常に表示（クリックで symbolsBox の開閉）
      toggleBtn.style.display = 'inline-block';
      // symbolsVisible に応じて symbolsBox と selectAllBtn を表示
      if (symbolsVisible) {
        symbolsBox.style.display = 'grid';
        selectAllBtn.style.display = 'inline-block';
      } else {
        symbolsBox.style.display = 'none';
        selectAllBtn.style.display = 'none';
      }
      // enable/disable selectAll according to state
      updateSelectAllButton();
    } else {
      // 記号無効：トグル・一括ボタン・記号欄すべて非表示
      symbolsVisible = false;
      toggleBtn.style.display = 'none';
      selectAllBtn.style.display = 'none';
      symbolsBox.style.display = 'none';
    }
  }

  // トグル動作（ユーザーが「記号を表示/非表示」を切り替える）
  toggleBtn.addEventListener('click', () => {
    symbolsVisible = !symbolsVisible;
    if (symbolsVisible) {
      symbolsBox.style.display = 'grid';
      selectAllBtn.style.display = 'inline-block';
      toggleBtn.textContent = '記号を非表示';
      toggleBtn.setAttribute('aria-expanded', 'true');
    } else {
      symbolsBox.style.display = 'none';
      selectAllBtn.style.display = 'none';
      toggleBtn.textContent = '記号を表示';
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
    updateSelectAllButton();
  });

  // 記号チェックを生成
  symbolsList.forEach((s, i) => {
    const id = 'sym_' + i;
    const label = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = id;
    cb.value = s;
    cb.checked = true;
    label.appendChild(cb);
    const span = document.createElement('span');
    span.textContent = ' ' + s + ' ';
    label.appendChild(span);
    symbolsBox.appendChild(label);
  });

  // 各チェックボックスに change イベントを付与（ラベル更新用）
  symbolsBox.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      updateSelectAllButton();
    });
  });

  // selectAllBtn のクリックで全選択 / 全解除を切り替え
  selectAllBtn.addEventListener('click', () => {
    const boxes = Array.from(symbolsBox.querySelectorAll('input[type="checkbox"]'));
    const actionable = boxes.filter(b => !b.disabled);
    if (actionable.length === 0) return;
    const anyUnchecked = actionable.some(b => !b.checked);
    actionable.forEach(b => b.checked = anyUnchecked); // true -> 全チェック, false -> 全解除
    updateSelectAllButton();
  });

  function setSymbolsEnabled(enabled){
    const inputs = symbolsBox.querySelectorAll('input');
    inputs.forEach(i => { i.disabled = !enabled; i.parentElement.style.opacity = enabled ? 1 : 0.32; });
    // 表示状態・ラジオ状態を考慮して一括ボタン更新
    updateSelectAllButton();
  }

  // ラジオ変更時は setSymbolsEnabled と UI 更新を行う
  symbolsOn.addEventListener('change', ()=> { setSymbolsEnabled(true); updateSymbolsUI(); });
  symbolsOff.addEventListener('change', ()=> { setSymbolsEnabled(false); updateSymbolsUI(); });

  // 初期設定（HTML 側で symbolsOn がデフォルトならトグルは表示、記号欄は閉じた状態）
  setSymbolsEnabled(symbolsOn.checked);
  updateSymbolsUI();
  updateSelectAllButton();

  const genBtn = document.getElementById('genBtn');
  const output = document.getElementById('output');
  const copyAllBtn = document.getElementById('copyAllBtn');
  const clearBtn = document.getElementById('clearBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  function getSelectedSymbols(){
    if (!symbolsOn.checked) return '';
    const checked = Array.from(symbolsBox.querySelectorAll('input:checked')).map(n=>n.value);
    return checked.join('');
  }

  function getCharCount(){
    const r = document.querySelector('input[name="lenRadio"]:checked').value;
    if (r === 'custom'){
      const v = parseInt(document.getElementById('lenCustom').value,10) || 0;
      return Math.min(128, Math.max(2, v));
    }
    return parseInt(r,10);
  }
  function getCount(){
    const r = document.querySelector('input[name="countRadio"]:checked').value;
    if (r === 'custom'){
      const v = parseInt(document.getElementById('countCustom').value,10) || 0;
      return Math.min(1000, Math.max(1, v));
    }
    return parseInt(r,10);
  }

  function shuffleArray(a){
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
  }

  function pickRandom(str){
    return str.charAt(Math.floor(Math.random()*str.length));
  }

  function generateOne(length, options){
    // options は事前検証済みであることを前提に処理する
    const pools = [];
    // 英字（大文字/小文字）を別々のプールとして追加する（要件に対応）
    if (options.upper) pools.push(options.upperChars);
    if (options.lower) pools.push(options.lowerChars);
    if (options.number) pools.push(options.numberChars);
    if (options.symbols && options.symbolChars.length > 0) pools.push(options.symbolChars);

    const all = pools.join('');
    const ensureEach = options.ensureEach;
    const pw = [];

    if (ensureEach){
      for(const p of pools){
        pw.push(pickRandom(p));
      }
    }

    while(pw.length < length){
      pw.push(pickRandom(all));
    }

    shuffleArray(pw);
    return pw.slice(0,length).join('');
  }

  function generate(){
    try{
      const upper = document.getElementById('upper').checked;
      const lower = document.getElementById('lower').checked;
      const number = document.getElementById('number').checked;
      const symbols = symbolsOn.checked;
      const selectedSymbols = getSelectedSymbols();

      // 記号ありだが選択記号が0 の場合（明確なUIエラー）
      if (symbols && selectedSymbols.length === 0) {
        alert('使用可能な文字がありません。');
        return;
      }

      // options 作成
      const options = {
        upper, lower, number, symbols,
        upperChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowerChars: 'abcdefghijklmnopqrstuvwxyz',
        numberChars: '0123456789',
        symbolChars: selectedSymbols,
        ensureEach: document.getElementById('ensureEach').checked
      };

      // プールの総数・中身を検証
      const pools = [];
      if (options.upper) pools.push(options.upperChars);
      if (options.lower) pools.push(options.lowerChars);
      if (options.number) pools.push(options.numberChars);
      if (options.symbols && options.symbolChars.length > 0) pools.push(options.symbolChars);

      // 「カテゴリが何も選ばれていない」場合
      if (pools.length === 0) {
        alert('英字／数字／記号 のいずれかを選択してください。');
        return;
      }

      // 全プールを結合して実際に使える文字があるか確認
      const all = pools.join('');
      if (all.length === 0) {
        alert('使用可能な文字がありません。');
        return;
      }

      const length = getCharCount();
      const count = getCount();

      // ensureEach のためのカテゴリ数カウント（大文字・小文字は別カテゴリ）
      let poolsCount = 0;
      if (upper) poolsCount++;
      if (lower) poolsCount++;
      if (number) poolsCount++;
      if (symbols && options.symbolChars.length > 0) poolsCount++;

      if (options.ensureEach && length < poolsCount){
        if (!confirm(`選択カテゴリ数 ${poolsCount} に対して文字数 ${length} は小さいです。生成を続けますか？`)) return;
      }

      const results = [];
      for(let i=0;i<count;i++){
        results.push(generateOne(length, options));
      }

      renderResults(results);

    }catch(err){
      // 予期せぬ例外（バグ等）をここでキャッチして表示
      alert(err.message || String(err));
    }
  }

  function renderResults(list){
    output.innerHTML = '';
    const frag = document.createDocumentFragment();
    list.forEach(pw => {
      const row = document.createElement('div');
      row.className = 'pw-row';
      const text = document.createElement('div');
      text.className = 'pw-text';
      text.textContent = pw;
      const btn = document.createElement('button');
      btn.textContent = 'コピー';
      btn.addEventListener('click', ()=>{
        navigator.clipboard.writeText(pw).then(()=>{
          btn.textContent = 'コピー済み';
          setTimeout(()=>btn.textContent='コピー',900);
        }).catch(()=>{ alert('クリップボードにコピーできませんでした。'); });
      });
      row.appendChild(text);
      row.appendChild(btn);
      frag.appendChild(row);
    });
    output.appendChild(frag);
  }

  genBtn.addEventListener('click', generate);
  clearBtn.addEventListener('click', ()=>{ output.innerHTML=''; });

  copyAllBtn.addEventListener('click', ()=>{
    const lines = Array.from(output.querySelectorAll('.pw-text')).map(d=>d.textContent).join('\n');
    if (!lines) { alert('コピーするテキストがありません。'); return; }
    navigator.clipboard.writeText(lines).then(()=>{ alert('全てコピーしました。'); }).catch(()=>{ alert('クリップボードにコピーできませんでした。'); });
  });

  downloadBtn.addEventListener('click', ()=>{
    const lines = Array.from(output.querySelectorAll('.pw-text')).map(d=>d.textContent).join('\n');
    if (!lines) { alert('ダウンロードする内容がありません。'); return;
    }
    const blob = new Blob([lines], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'passwords.txt';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  });

  // len/count custom focus -> select radio
  document.getElementById('lenCustom').addEventListener('focus', ()=>{ document.getElementById('lenCustomRadio').checked = true; });
  document.getElementById('countCustom').addEventListener('focus', ()=>{ document.getElementById('countCustomRadio').checked = true; });

  // 初期表示で自動生成
  requestAnimationFrame(()=>{ generate(); });

})();
