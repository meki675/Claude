(function xArticleHeadingBookmarkletV6() {
  // ===== 設定 =====
  // 行頭の「#」の数 → 変換後のブロック種別。
  //   'header-one' = 見出し / 'header-two' = 小見出し / 'unstyled' = 本文（#だけ消す）
  //   ここに無い数（例: ####）は変換せずそのまま残す。
  const HASH_RULES = {
    1: 'header-one',
    2: 'header-two',
    3: 'unstyled',
  };
  // true: 空の行（本文で中身が空白だけの行）を削除して上に詰める。
  const REMOVE_EMPTY_LINES = true;
  // =================

  const LABELS = { 'header-one': '見出し', 'header-two': '小見出し', unstyled: '本文' };

  try {
    if (!/(^|\.)x\.com$|(^|\.)twitter\.com$/i.test(location.hostname)) {
      throw new Error('Xの記事作成画面を開いてから実行してください。');
    }
    const selector = "[data-contents='true'] [contenteditable='true'],[contenteditable='true'][role='textbox'],[contenteditable='true'].public-DraftEditor-content,[contenteditable='true']";
    const editor = [...document.querySelectorAll(selector)].find((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 200 && rect.height > 80;
    });
    if (!editor) throw new Error('本文欄が見つかりません。本文を一度クリックして再実行してください。');
    const fiberKey = Object.keys(editor).find(
      (key) => key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$')
    );
    if (!fiberKey) throw new Error('診断E1：編集データが見つかりません。');
    let fiber = editor[fiberKey];
    let draftNode = null;
    for (let depth = 0; depth < 80 && fiber; depth += 1, fiber = fiber.return) {
      const node = fiber.stateNode;
      if (node?.props?.editorState && typeof node.props.onChange === 'function') {
        draftNode = node;
        break;
      }
    }
    if (!draftNode) throw new Error('診断E2：Xの編集状態が見つかりません。');

    const state = draftNode.props.editorState;
    const content = state.getCurrentContent();
    const counts = {};
    let removed = 0;

    let blockMap = content.getBlockMap().map((block) => {
      const text = block.getText();
      const match = text.match(/^(#+)[ \t]*(\S.*)$/);
      if (!match) return block;
      const type = HASH_RULES[match[1].length];
      if (!type) return block;
      const prefixLength = text.length - match[2].length;
      counts[type] = (counts[type] || 0) + 1;
      return block.merge({
        type,
        text: match[2],
        characterList: block.getCharacterList().slice(prefixLength),
      });
    });

    if (REMOVE_EMPTY_LINES) {
      const before = blockMap.size;
      // 画像などの埋め込み(atomic)は残し、本文の空行だけ消す
      const filtered = blockMap.filter(
        (block) => block.getType() !== 'unstyled' || block.getText().trim() !== ''
      );
      if (filtered.size > 0) {
        removed = before - filtered.size;
        blockMap = filtered;
      }
    }

    const converted = Object.values(counts).reduce((sum, n) => sum + n, 0);
    if (!converted && !removed) throw new Error('変換する「#」の行も空の行も見つかりません。');

    const EditorState = state.constructor;
    const SelectionState = state.getSelection().constructor;
    const selection = SelectionState.createEmpty(blockMap.last().getKey());
    const nextContent = content
      .set('blockMap', blockMap)
      .set('selectionBefore', selection)
      .set('selectionAfter', selection);
    let nextState = EditorState.push(state, nextContent, 'change-block-type');
    if (typeof EditorState.moveSelectionToEnd === 'function') {
      nextState = EditorState.moveSelectionToEnd(nextState);
    }
    draftNode.props.onChange(nextState);

    const lines = Object.keys(counts).map((type) => `${LABELS[type] || type}：${counts[type]}か所`);
    if (removed) lines.push(`空の行を削除：${removed}行`);
    alert(`X見出し変換 v6\n${lines.join('\n')}`);
  } catch (error) {
    alert(`X見出し変換 v6\n${error?.message || error}`);
  }
})();
