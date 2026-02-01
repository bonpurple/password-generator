(function () {
  const symbolsList = [
    "!",
    '"',
    "#",
    "$",
    "%",
    "&",
    "'",
    "(",
    ")",
    "*",
    "+",
    ",",
    "-",
    ".",
    "/",
    ":",
    ";",
    "<",
    "=",
    ">",
    "?",
    "@",
    "[",
    "\\",
    "]",
    "^",
    "_",
    "`",
    "{",
    "|",
    "}",
    "~",
  ];

  const symbolsBox = document.getElementById("symbolsBox");
  const symbolsOn = document.getElementById("symbolsOn");
  const symbolsOff = document.getElementById("symbolsOff");
  const symbolsControls = document.getElementById("symbolsControls");

  // モード（チェックボックス / テキスト入力）
  const symbolsModeCheckbox = document.getElementById("symbolsModeCheckbox");
  const symbolsModeText = document.getElementById("symbolsModeText");
  const symbolsTextWrap = document.getElementById("symbolsTextWrap");
  const symbolsTextInput = document.getElementById("symbolsText");
  const symbolsTextInclude = document.getElementById("symbolsTextInclude");
  const symbolsTextExclude = document.getElementById("symbolsTextExclude");

  // 「記号を表示」ボタンを作成して追加（初期は表示、記号欄は非表示）
  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.style.marginBottom = "6px";
  toggleBtn.setAttribute("aria-controls", "symbolsBox");

  // 「全選択 / 全解除」ボタン
  const selectAllBtn = document.createElement("button");
  selectAllBtn.type = "button";
  selectAllBtn.style.margin = "0 8px 6px 8px";
  selectAllBtn.setAttribute("aria-controls", "symbolsBox");
  selectAllBtn.setAttribute("aria-label", "記号を全選択または全解除");

  // 初期状態: 記号欄は非表示、トグルボタンは表示（symbolsOn がデフォルトなら）
  let symbolsVisible = false;
  symbolsBox.style.display = "none";
  toggleBtn.textContent = "記号を表示";
  toggleBtn.setAttribute("aria-expanded", "false");
  selectAllBtn.style.display = "none"; // 非表示

  // ボタンをsymbolsBoxの前に挿入（順序: toggleBtn, selectAllBtn, symbolsBox）
  symbolsBox.parentElement.insertBefore(toggleBtn, symbolsBox);
  symbolsBox.parentElement.insertBefore(selectAllBtn, symbolsBox);

  // 記号チェックを生成
  symbolsList.forEach((s, i) => {
    const id = "sym_" + i;
    const label = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = id;
    cb.value = s;
    cb.checked = true;
    label.appendChild(cb);
    const span = document.createElement("span");
    span.textContent = " " + s + " ";
    label.appendChild(span);
    symbolsBox.appendChild(label);
  });

  // updateSelectAllButton（宣言）
  function updateSelectAllButton() {
    const boxes = Array.from(
      symbolsBox.querySelectorAll('input[type="checkbox"]'),
    );
    if (boxes.length === 0) {
      selectAllBtn.textContent = "全選択";
      selectAllBtn.disabled = true;
      return;
    }
    const actionable = boxes.filter((b) => !b.disabled);
    if (actionable.length === 0) {
      selectAllBtn.disabled = true;
      return;
    }
    const anyUnchecked = actionable.some((b) => !b.checked);
    selectAllBtn.textContent = anyUnchecked ? "全選択" : "全解除";
    // ボタンが使えるのは「記号表示が有効（symbolsOn.checked）」でかつ記号欄表示中だけにする
    selectAllBtn.disabled = !(symbolsOn.checked && symbolsVisible);
  }

  // トグル動作（ユーザーが「記号を表示/非表示」を切り替える）
  toggleBtn.addEventListener("click", () => {
    symbolsVisible = !symbolsVisible;
    if (symbolsVisible) {
      symbolsBox.style.display = "grid";
      selectAllBtn.style.display = "inline-block";
      toggleBtn.textContent = "記号を非表示";
      toggleBtn.setAttribute("aria-expanded", "true");
    } else {
      symbolsBox.style.display = "none";
      selectAllBtn.style.display = "none";
      toggleBtn.textContent = "記号を表示";
      toggleBtn.setAttribute("aria-expanded", "false");
    }
    updateSelectAllButton();
  });

  // 各チェックボックスに change イベント（全選択ボタンの表示更新用）
  symbolsBox.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener("change", () => {
      updateSelectAllButton();
    });
  });

  // selectAllBtn のクリックで全選択 / 全解除を切り替え
  selectAllBtn.addEventListener("click", () => {
    const boxes = Array.from(
      symbolsBox.querySelectorAll('input[type="checkbox"]'),
    );
    const actionable = boxes.filter((b) => !b.disabled);
    if (actionable.length === 0) return;
    const anyUnchecked = actionable.some((b) => !b.checked);
    actionable.forEach((b) => (b.checked = anyUnchecked)); // true -> 全チェック, false -> 全解除
    updateSelectAllButton();
  });

  function setSymbolsEnabled(enabled) {
    const inputs = symbolsBox.querySelectorAll("input");
    inputs.forEach((i) => {
      i.disabled = !enabled;
      i.parentElement.style.opacity = enabled ? 1 : 0.32;
    });
    updateSelectAllButton();
  }

  // モードUI更新（初期：チェックボックス、テキスト欄非表示）
  function updateSymbolsModeUI() {
    // 記号なしなら記号関連UI一式を非表示
    if (symbolsControls) {
      symbolsControls.style.display = symbolsOn.checked ? "block" : "none";
    }
    // 記号なしのときは、以降のモードUI制御は不要（全部隠れるため）
    if (!symbolsOn.checked) return;

    const useText = symbolsModeText && symbolsModeText.checked;

    if (useText) {
      // テキスト入力モード：テキスト欄を表示、チェックボックス群（＋ボタン）を隠す
      if (symbolsTextWrap) symbolsTextWrap.style.display = "block";

      toggleBtn.style.display = "none";
      selectAllBtn.style.display = "none";
      symbolsBox.style.display = "none";
      symbolsVisible = false;
      toggleBtn.textContent = "記号を表示";
      toggleBtn.setAttribute("aria-expanded", "false");
    } else {
      // チェックボックスモード：テキスト欄を隠す、チェックボックスUIは symbolsVisible に従う
      if (symbolsTextWrap) symbolsTextWrap.style.display = "none";
      updateSymbolsUI();
    }
  }

  // updateSymbolsUI: 記号ON/OFFに応じて checkbox UI（トグル/一括/一覧）を表示
  function updateSymbolsUI() {
    // テキスト入力モードなら、チェックボックスUIは常に隠す（モードUIが優先）
    if (symbolsModeText && symbolsModeText.checked) {
      toggleBtn.style.display = "none";
      selectAllBtn.style.display = "none";
      symbolsBox.style.display = "none";
      return;
    }

    if (symbolsOn.checked) {
      toggleBtn.style.display = "inline-block";
      if (symbolsVisible) {
        symbolsBox.style.display = "grid";
        selectAllBtn.style.display = "inline-block";
      } else {
        symbolsBox.style.display = "none";
        selectAllBtn.style.display = "none";
      }
      updateSelectAllButton();
    } else {
      symbolsVisible = false;
      toggleBtn.style.display = "none";
      selectAllBtn.style.display = "none";
      symbolsBox.style.display = "none";
    }
  }

  // ラジオ変更時は setSymbolsEnabled と UI 更新
  symbolsOn.addEventListener("change", () => {
    setSymbolsEnabled(true);
    updateSymbolsModeUI();
  });
  symbolsOff.addEventListener("change", () => {
    setSymbolsEnabled(false);
    updateSymbolsModeUI();
  });

  // モード切替イベント
  if (symbolsModeCheckbox) {
    symbolsModeCheckbox.addEventListener("change", () => {
      updateSymbolsModeUI();
    });
  }
  if (symbolsModeText) {
    symbolsModeText.addEventListener("change", () => {
      updateSymbolsModeUI();
    });
  }

  // 初期設定
  setSymbolsEnabled(symbolsOn.checked);
  updateSymbolsUI();
  updateSelectAllButton();
  updateSymbolsModeUI();

  const genBtn = document.getElementById("genBtn");
  const output = document.getElementById("output");
  const copyAllBtn = document.getElementById("copyAllBtn");
  const clearBtn = document.getElementById("clearBtn");
  const downloadBtn = document.getElementById("downloadBtn");

  // =========================
  // 記号テキスト解析
  // =========================
  function parseSymbolsTextToArray(raw) {
    if (!raw) return [];
    const s = String(raw);

    const isSpaceLike = (ch) =>
      ch === " " ||
      ch === "\t" ||
      ch === "\n" ||
      ch === "\r" ||
      ch === "\u3000"; // 全角スペース
    const isSep = (ch) => isSpaceLike(ch) || ch === "、"; // 読点も区切り

    const wrapPairs = new Map([
      ['"', '"'], // "X"
      ["'", "'"], // 'X'
      ["[", "]"], // [X]
      ["{", "}"], // {X}
      ["｛", "｝"], // ｛X｝
      ["【", "】"], // 【X】
      ["「", "」"], // 「X」
      ["『", "』"], // 『X』
      ["(", ")"], // (X)
    ]);

    // --- 判定1：空白/読点があるなら「通常モード」(区切りを広く解釈) ---
    const hasWhitespaceOrTouten = Array.from(s).some((ch) => isSep(ch));

    // --- 判定2：空白/読点がない場合でも、カンマ区切りっぽいなら「カンマ区切りモード」 ---
    // 例: @,-,: / "@","-",":" / [@],[-],[:] など
    // 各セグメントが「1文字」or「ラップ3文字(open+X+close)」のみで構成されていれば区切り扱いにする
    function looksLikeCommaDelimitedList(str) {
      if (!str.includes(",")) return false;

      const parts = str.split(",");
      // 末尾のカンマなどで空セグメントがある場合は “リスト” とは見なさない（曖昧なので）
      if (parts.some((p) => p.length === 0)) return false;

      return parts.every((p) => {
        if (p.length === 1) return true;
        if (p.length === 3) {
          const open = p[0];
          const close = p[2];
          return wrapPairs.has(open) && wrapPairs.get(open) === close;
        }
        return false;
      });
    }

    // トークン（1文字 or ラップ）を読む
    function readTokenAt(str, idx) {
      const ch = str[idx];

      // ",," は “カンマ記号” として1トークンにする（従来互換）
      if (ch === "," && idx + 1 < str.length && str[idx + 1] === ",") {
        return { value: ",", next: idx + 2 };
      }

      // ラップ (open + X + close) → X
      if (wrapPairs.has(ch) && idx + 2 < str.length) {
        const close = wrapPairs.get(ch);
        if (str[idx + 2] === close) {
          return { value: str[idx + 1], next: idx + 3 };
        }
      }

      // 単体1文字
      return { value: ch, next: idx + 1 };
    }

    function dedupeKeepOrder(arr) {
      const seen = new Set();
      const out = [];
      for (const c of arr) {
        if (!seen.has(c)) {
          seen.add(c);
          out.push(c);
        }
      }
      return out;
    }

    // =========================
    // 通常モード（空白/読点あり）
    // =========================
    if (hasWhitespaceOrTouten) {
      const out = [];
      let i = 0;
      while (i < s.length) {
        const ch = s[i];

        // 空白/読点は区切り
        if (isSep(ch)) {
          i++;
          continue;
        }

        // カンマ：基本は区切り。ただし「単体トークン」（前後が空白/読点/端）なら記号として採用
        if (ch === ",") {
          // ",," はカンマ記号
          if (i + 1 < s.length && s[i + 1] === ",") {
            out.push(",");
            i += 2;
            continue;
          }
          const prev = i === 0 ? "" : s[i - 1];
          const next = i === s.length - 1 ? "" : s[i + 1];
          const prevOk = i === 0 || isSep(prev);
          const nextOk = i === s.length - 1 || isSep(next);
          if (prevOk && nextOk) out.push(",");
          i++;
          continue;
        }

        // それ以外：ラップなら中身、そうでなければ1文字
        const t = readTokenAt(s, i);
        out.push(t.value);
        i = t.next;
      }
      return dedupeKeepOrder(out);
    }

    // =========================
    // 空白/読点なし：カンマ区切りリストっぽいならカンマを区切りにする
    // =========================
    if (looksLikeCommaDelimitedList(s)) {
      const out = [];
      for (const part of s.split(",")) {
        // part は 1文字 or 3文字ラップ確定
        if (part.length === 1) {
          out.push(part);
        } else {
          // open+X+close
          out.push(part[1]);
        }
      }
      return dedupeKeepOrder(out);
    }

    // =========================
    // 空白/読点なし：クォート/括弧の「連続ラップ列」ならそのまま解釈
    // =========================
    {
      const out = [];
      let i = 0;
      let ok = true;

      while (i < s.length) {
        const ch = s[i];

        // ここでは「区切り」は存在しない前提
        // ラップ or ",,"(カンマ記号) or 単体文字、いずれも許可するが
        // “ラップ列” として成立するかの判定に使う
        if (ch === "," && i + 1 < s.length && s[i + 1] === ",") {
          // ",," は 1トークンとしてOK
          out.push(",");
          i += 2;
          continue;
        }

        if (
          wrapPairs.has(ch) &&
          i + 2 < s.length &&
          s[i + 2] === wrapPairs.get(ch)
        ) {
          out.push(s[i + 1]);
          i += 3;
          continue;
        }

        ok = false;
        break;
      }

      if (ok && out.length > 0) {
        return dedupeKeepOrder(out);
      }
    }

    // =========================
    // それ以外：最優先の「区切りなし」扱い（compactモード）
    // 例：@-:'"[{,]}
    // → 1文字ずつ全部採用（カンマも literal）
    // =========================
    return dedupeKeepOrder(Array.from(s));
  }

  function getSelectedSymbolsFromCheckbox() {
    if (!symbolsOn.checked) return "";
    const checked = Array.from(
      symbolsBox.querySelectorAll("input:checked"),
    ).map((n) => n.value);
    return checked.join("");
  }

  function getSelectedSymbolsFromText() {
    if (!symbolsOn.checked) return "";

    const raw = symbolsTextInput ? symbolsTextInput.value : "";
    const arr = parseSymbolsTextToArray(raw);

    // symbolsList に存在する記号だけ許可（安全に既存セットに寄せる）
    const allowed = new Set(symbolsList);

    const includeMode = symbolsTextInclude ? symbolsTextInclude.checked : true;

    if (includeMode) {
      // 入力されたもののうち、許可されたもののみ採用
      const included = arr.filter((c) => allowed.has(c));
      return included.join("");
    } else {
      // 除外：symbolsList から入力分を引く
      const excludeSet = new Set(arr);
      const remained = symbolsList.filter((c) => !excludeSet.has(c));
      return remained.join("");
    }
  }

  function getSelectedSymbols() {
    // モード判定
    const useText = symbolsModeText && symbolsModeText.checked;
    return useText
      ? getSelectedSymbolsFromText()
      : getSelectedSymbolsFromCheckbox();
  }

  function getCharCount() {
    const r = document.querySelector('input[name="lenRadio"]:checked').value;
    if (r === "custom") {
      const v = parseInt(document.getElementById("lenCustom").value, 10) || 0;
      return Math.min(128, Math.max(2, v));
    }
    return parseInt(r, 10);
  }
  function getCount() {
    const r = document.querySelector('input[name="countRadio"]:checked').value;
    if (r === "custom") {
      const v = parseInt(document.getElementById("countCustom").value, 10) || 0;
      return Math.min(1000, Math.max(1, v));
    }
    return parseInt(r, 10);
  }

  function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }

  function pickRandom(str) {
    return str.charAt(Math.floor(Math.random() * str.length));
  }

  function generateOne(length, options) {
    const pools = [];
    if (options.upper) pools.push(options.upperChars);
    if (options.lower) pools.push(options.lowerChars);
    if (options.number) pools.push(options.numberChars);
    if (options.symbols && options.symbolChars.length > 0)
      pools.push(options.symbolChars);

    const all = pools.join("");
    const ensureEach = options.ensureEach;
    const pw = [];

    if (ensureEach) {
      for (const p of pools) {
        pw.push(pickRandom(p));
      }
    }

    while (pw.length < length) {
      pw.push(pickRandom(all));
    }

    shuffleArray(pw);
    return pw.slice(0, length).join("");
  }

  function generate() {
    try {
      const upper = document.getElementById("upper").checked;
      const lower = document.getElementById("lower").checked;
      const number = document.getElementById("number").checked;
      const symbols = symbolsOn.checked;

      const selectedSymbols = getSelectedSymbols();

      // 記号ありだが選択記号が0 の場合（明確なUIエラー）
      if (symbols && selectedSymbols.length === 0) {
        alert("使用可能な記号がありません。");
        return;
      }

      const options = {
        upper,
        lower,
        number,
        symbols,
        upperChars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        lowerChars: "abcdefghijklmnopqrstuvwxyz",
        numberChars: "0123456789",
        symbolChars: selectedSymbols,
        ensureEach: document.getElementById("ensureEach").checked,
      };

      // プールの総数・中身を検証
      const pools = [];
      if (options.upper) pools.push(options.upperChars);
      if (options.lower) pools.push(options.lowerChars);
      if (options.number) pools.push(options.numberChars);
      if (options.symbols && options.symbolChars.length > 0)
        pools.push(options.symbolChars);

      if (pools.length === 0) {
        alert("英字／数字／記号 のいずれかを選択してください。");
        return;
      }

      const all = pools.join("");
      if (all.length === 0) {
        alert("使用可能な文字がありません。");
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

      if (options.ensureEach && length < poolsCount) {
        if (
          !confirm(
            `選択カテゴリ数 ${poolsCount} に対して文字数 ${length} は小さいです。生成を続けますか？`,
          )
        )
          return;
      }

      const results = [];
      for (let i = 0; i < count; i++) {
        results.push(generateOne(length, options));
      }

      renderResults(results);
    } catch (err) {
      alert(err.message || String(err));
    }
  }

  function renderResults(list) {
    output.innerHTML = "";
    const frag = document.createDocumentFragment();
    list.forEach((pw) => {
      const row = document.createElement("div");
      row.className = "pw-row";
      const text = document.createElement("div");
      text.className = "pw-text";
      text.textContent = pw;
      const btn = document.createElement("button");
      btn.textContent = "コピー";
      btn.addEventListener("click", () => {
        navigator.clipboard
          .writeText(pw)
          .then(() => {
            btn.textContent = "コピー済み";
            setTimeout(() => (btn.textContent = "コピー"), 900);
          })
          .catch(() => {
            alert("クリップボードにコピーできませんでした。");
          });
      });
      row.appendChild(text);
      row.appendChild(btn);
      frag.appendChild(row);
    });
    output.appendChild(frag);
  }

  genBtn.addEventListener("click", generate);
  clearBtn.addEventListener("click", () => {
    output.innerHTML = "";
  });

  copyAllBtn.addEventListener("click", () => {
    const lines = Array.from(output.querySelectorAll(".pw-text"))
      .map((d) => d.textContent)
      .join("\n");
    if (!lines) {
      alert("コピーするテキストがありません。");
      return;
    }
    navigator.clipboard
      .writeText(lines)
      .then(() => {
        alert("全てコピーしました。");
      })
      .catch(() => {
        alert("クリップボードにコピーできませんでした。");
      });
  });

  downloadBtn.addEventListener("click", () => {
    const lines = Array.from(output.querySelectorAll(".pw-text"))
      .map((d) => d.textContent)
      .join("\n");
    if (!lines) {
      alert("ダウンロードする内容がありません。");
      return;
    }
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "passwords.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // len/count custom focus -> select radio
  document.getElementById("lenCustom").addEventListener("focus", () => {
    document.getElementById("lenCustomRadio").checked = true;
  });
  document.getElementById("countCustom").addEventListener("focus", () => {
    document.getElementById("countCustomRadio").checked = true;
  });

  // テキスト入力欄を触ったら即再生成したいなら（好みで有効化）
  // if (symbolsTextInput) symbolsTextInput.addEventListener("input", () => generate());

  // 初期表示で自動生成
  requestAnimationFrame(() => {
    generate();
  });
})();
