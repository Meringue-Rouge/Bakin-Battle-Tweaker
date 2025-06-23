let originalBattleViewer3D;
let originalBattleSequenceManager;
let modifiedBattleViewer3D;
let modifiedBattleSequenceManager;
let options = [];
let currentLanguage = 'en';

const translations = {
    en: {
        pageTitle: "RPG Developer Bakin Battle Script Modifier",
        exportBtn: "Export Code",
        saveBtn: "Save Options",
        loadBtn: "Load Options",
        resetBtn: "Reset to Default",
        paramTitle: "Important Settings Required",
        paramDesc: "Please add the GUID for the three camera types.",
        paramLabels: {
            playerDec: "Player Decision (Menu)",
            allyTarget: "Ally Target (Healing/Items/Support)",
            enemyTarget: "Enemy Target (Attack/Offense Skills)"
        },
        helpLink: "How do I obtain the GUID of my Custom Cameras?"
    },
    ja: {
        pageTitle: "RPG Developer Bakin バトルスクリプトモディファイア",
        exportBtn: "コードをエクスポート",
        saveBtn: "オプションを保存",
        loadBtn: "オプションを読み込み",
        resetBtn: "デフォルトにリセット",
        paramTitle: "重要な設定が必要です",
        paramDesc: "3つのカメラタイプのGUIDを追加してください。",
        paramLabels: {
            playerDec: "プレイヤー決定（メニュー）",
            allyTarget: "味方ターゲット（回復/アイテム/サポート）",
            enemyTarget: "敵ターゲット（攻撃/攻撃スキル）"
        },
        helpLink: "カスタムカメラのGUIDをどうやって取得しますか？"
    }
};

// Load original script files
async function loadOriginalFiles() {
    try {
        const response1 = await fetch('BattleViewer3D.cs');
        if (!response1.ok) throw new Error('Failed to load BattleViewer3D.cs');
        originalBattleViewer3D = await response1.text();

        const response2 = await fetch('BattleSequenceManager.cs');
        if (!response2.ok) throw new Error('Failed to load BattleSequenceManager.cs');
        originalBattleSequenceManager = await response2.text();
    } catch (error) {
        console.error(error);
        alert('Error loading original files. Ensure BattleViewer3D.cs and BattleSequenceManager.cs are in the same directory.');
    }
}

// Load option JSON files
async function loadOptionsFiles() {
    try {
        const response0 = await fetch('option0.json');
        if (!response0.ok) throw new Error('Failed to load option0.json');
        const option0 = await response0.json();

        const response1 = await fetch('option1.json');
        if (!response1.ok) throw new Error('Failed to load option1.json');
        const option1 = await response1.json();

        const response2 = await fetch('option2.json');
        if (!response2.ok) throw new Error('Failed to load option2.json');
        const option2 = await response2.json();

        options = [option0, option1, option2];
        options.forEach(opt => {
            opt.enabled = false;
            if (!opt.parameters) opt.parameters = { playerDec: '', allyTarget: '', enemyTarget: '' };
        });
        renderOptions();
        rebuildModifiedCode();
    } catch (error) {
        console.error(error);
        alert('Error loading option files. Ensure option0.json, option1.json, and option2.json are in the same directory.');
    }
}

// Render options UI
function renderOptions() {
    console.log('Rendering options');
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    console.log('Cleared options div');

    options.forEach((opt, index) => {
        console.log(`Rendering option ${index}: ${opt.name.en}, enabled: ${opt.enabled}`);
        const div = document.createElement('div');
        div.className = `option ${opt.enabled && index === 1 && options[2].enabled ? 'disabled-option' : ''}`;
        let paramHtml = '';
        if (index === 2 && opt.enabled && opt.parameters) {
            console.log(`Rendering parameters for option 2: ${opt.name.en}, parameters: ${JSON.stringify(opt.parameters)}`);
            paramHtml = `
                <div class="parameters" id="params-2">
                    <div><strong>⚠️ ${translations[currentLanguage].paramTitle}</strong></div>
                    <div>${translations[currentLanguage].paramDesc}</div>
                    <div class="param-field">
                        <span class="param-label">${translations[currentLanguage].paramLabels.playerDec}:</span>
                        <input type="text" id="param-playerDec-2" value="${opt.parameters.playerDec || ''}" placeholder="Enter GUID">
                    </div>
                    <div class="param-field">
                        <span class="param-label">${translations[currentLanguage].paramLabels.allyTarget}:</span>
                        <input type="text" id="param-allyTarget-2" value="${opt.parameters.allyTarget || ''}" placeholder="Enter GUID">
                    </div>
                    <div class="param-field">
                        <span class="param-label">${translations[currentLanguage].paramLabels.enemyTarget}:</span>
                        <input type="text" id="param-enemyTarget-2" value="${opt.parameters.enemyTarget || ''}" placeholder="Enter GUID">
                    </div>
                    <div class="help-link">
                        <a href="https://github.com/Meringue-Rouge/bakin-battle-system-snippets/blob/main/Finding%20your%20camera%20GUIDs.md" target="_blank">❓ ${translations[currentLanguage].helpLink}</a>
                    </div>
                </div>
            `;
        }
        div.innerHTML = `
            <label><input type="checkbox" id="option-${index}" ${opt.enabled ? 'checked' : ''} ${index === 1 && options[2].enabled ? 'disabled checked' : ''}> 
            ${opt.emoji} ${opt.name[currentLanguage]}</label>
            <div class="description">${opt.description[currentLanguage]}</div>
            ${paramHtml}
        `;
        optionsDiv.appendChild(div);

        if (index === 2 && opt.enabled && opt.parameters) {
            const playerDecInput = document.getElementById('param-playerDec-2');
            const allyTargetInput = document.getElementById('param-allyTarget-2');
            const enemyTargetInput = document.getElementById('param-enemyTarget-2');

            if (playerDecInput) {
                console.log('Found playerDec input');
                playerDecInput.addEventListener('input', (e) => {
                    opt.parameters.playerDec = e.target.value;
                    rebuildModifiedCode();
                });
            } else {
                console.error('PlayerDec input not found');
            }
            if (allyTargetInput) {
                console.log('Found allyTarget input');
                allyTargetInput.addEventListener('input', (e) => {
                    opt.parameters.allyTarget = e.target.value;
                    rebuildModifiedCode();
                });
            } else {
                console.error('AllyTarget input not found');
            }
            if (enemyTargetInput) {
                console.log('Found enemyTarget input');
                enemyTargetInput.addEventListener('input', (e) => {
                    opt.parameters.enemyTarget = e.target.value;
                    rebuildModifiedCode();
                });
            } else {
                console.error('EnemyTarget input not found');
            }

            const paramsDiv = document.getElementById('params-2');
            if (paramsDiv) {
                console.log(`Params div found for option 2, computed display: ${getComputedStyle(paramsDiv).display}`);
            } else {
                console.error('Params div not found for option 2');
            }
        }

        const checkbox = document.getElementById(`option-${index}`);
        checkbox.addEventListener('change', (e) => {
            options[index].enabled = e.target.checked;
            if (index === 2 && e.target.checked) {
                options[1].enabled = false;
            }
            renderOptions();
            rebuildModifiedCode();
            console.log(`Checkbox changed for option ${index}, enabled: ${options[index].enabled}`);
            const paramsDiv = document.getElementById('params-2');
            if (index === 2) {
                if (paramsDiv) {
                    console.log(`Params div found after render, computed display: ${getComputedStyle(paramsDiv).display}`);
                } else {
                    console.error('Params div not found after render');
                }
            }
        });

        // Allow clicking anywhere on the option to toggle the checkbox
        div.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT' && !div.classList.contains('disabled-option')) {
                checkbox.click();
            }
        });
    });
}

// Insert code after a line or replace a function
function insertAfterLine(code, afterLine, insertCode, emoji, optionName, isFunctionReplacement = false) {
    if (isFunctionReplacement) {
        // Match the Update function signature and its entire body by counting braces
        const regex = /internal\s+override\s+void\s+Update\s*\(\s*List<BattlePlayerData>\s+playerData\s*,\s*List<BattleEnemyData>\s+enemyMonsterData\s*\)\s*\{/;
        const match = code.match(regex);
        if (!match) {
            console.error(`Update function signature not found for ${optionName}`);
            return code;
        }

        const startIndex = match.index + match[0].length;
        let braceCount = 1;
        let endIndex = startIndex;

        // Count braces to find the closing brace of the function
        while (braceCount > 0 && endIndex < code.length) {
            if (code[endIndex] === '{') braceCount++;
            else if (code[endIndex] === '}') braceCount--;
            endIndex++;
        }

        if (braceCount !== 0) {
            console.error(`Failed to find closing brace for Update function for ${optionName}`);
            return code;
        }

        const matchedFunction = code.substring(match.index, endIndex);
        console.log(`Replacing Update function for ${optionName}, matched length: ${matchedFunction.length}, excerpt: ${matchedFunction.slice(0, 100)}...`);

        const indent = code.match(/^\s*/)[0] || '';
        const commentedCode = `${indent}// ${emoji} - START - ${optionName}\n${insertCode}\n${indent}// ${emoji} - END - ${optionName}`;
        return code.substring(0, match.index) + commentedCode + code.substring(endIndex);
    } else {
        const lines = code.split('\n');
        const newLines = [];
        for (let i = 0; i < lines.length; i++) {
            newLines.push(lines[i]);
            if (lines[i].includes(afterLine)) {
                const indent = lines[i].match(/^\s*/)[0];
                newLines.push(`${indent}// ${emoji} - START - ${optionName}`);
                const insertLines = insertCode.split('\n').map(l => `${indent}${l}`);
                newLines.push(...insertLines);
                newLines.push(`${indent}// ${emoji} - END - ${optionName}`);
            }
        }
        return newLines.join('\n');
    }
}

// Rebuild modified code based on enabled options
function rebuildModifiedCode() {
    console.log('Rebuilding modified code');
    modifiedBattleViewer3D = originalBattleViewer3D;
    modifiedBattleSequenceManager = originalBattleSequenceManager;
    options.forEach((opt, index) => {
        if (opt.enabled) {
            let code = opt.code;
            if (opt.parameters) {
                code = code.replace("/* PLAYER DEC */", opt.parameters.playerDec || "5f73a3bc-830a-404b-afa1-87a2f4eaf2f0")
                          .replace("/* ALLY TARGET */", opt.parameters.allyTarget || "6ff4c3a2-a5f1-4d46-86d9-5078d0d2cff6")
                          .replace("/* ENEMY TARGET */", opt.parameters.enemyTarget || "01ab9724-6b93-4440-b55a-2f91def556b8");
            }
            if (opt.file === "BattleViewer3D") {
                modifiedBattleViewer3D = insertAfterLine(modifiedBattleViewer3D, opt.insertAfter, code, opt.emoji, opt.name.en, opt.isFunctionReplacement);
            } else if (opt.file === "BattleSequenceManager") {
                modifiedBattleSequenceManager = insertAfterLine(modifiedBattleSequenceManager, opt.insertAfter, code, opt.emoji, opt.name.en);
            }
        }
    });
    console.log('Modified code rebuilt');
}

// Export modified files as a zip
function exportCode() {
    const zip = new JSZip();
    zip.file("BattleViewer3D.cs", modifiedBattleViewer3D);
    zip.file("BattleSequenceManager.cs", modifiedBattleSequenceManager);
    zip.generateAsync({ type: "blob" }).then(content => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "modified_battle_scripts.zip";
        link.click();
    });
}

// Save options state to local storage
function saveOptions() {
    const state = options.map(opt => ({
        enabled: opt.enabled,
        parameters: opt.parameters || null
    }));
    localStorage.setItem('optionsState', JSON.stringify(state));
    alert(currentLanguage === 'en' ? 'Options saved!' : 'オプションが保存されました！');
}

// Load options state from local storage
function loadOptions() {
    const state = JSON.parse(localStorage.getItem('optionsState'));
    if (state) {
        state.forEach((optState, index) => {
            options[index].enabled = optState.enabled;
            if (optState.parameters) {
                options[index].parameters = optState.parameters;
            }
        });
        renderOptions();
        rebuildModifiedCode();
        alert(currentLanguage === 'en' ? 'Options loaded!' : 'オプションが読み込まれました！');
    } else {
        alert(currentLanguage === 'en' ? 'No saved options found.' : '保存されたオプションが見つかりません。');
    }
}

// Reset options to default (all off)
function resetToDefault() {
    options.forEach((opt, index) => {
        opt.enabled = false;
        if (opt.parameters) {
            opt.parameters = { playerDec: '', allyTarget: '', enemyTarget: '' };
        }
        document.getElementById(`option-${index}`)?.removeAttribute('checked');
    });
    renderOptions();
    rebuildModifiedCode();
    alert(currentLanguage === 'en' ? 'Options reset to default.' : 'オプションがデフォルトにリセットされました。');
}

// Switch language
function switchLanguage() {
    currentLanguage = document.getElementById('language-switcher').value;
    document.getElementById('page-title').textContent = translations[currentLanguage].pageTitle;
    document.getElementById('export-btn').textContent = translations[currentLanguage].exportBtn;
    document.getElementById('save-btn').textContent = translations[currentLanguage].saveBtn;
    document.getElementById('load-btn').textContent = translations[currentLanguage].loadBtn;
    document.getElementById('reset-btn').textContent = translations[currentLanguage].resetBtn;
    renderOptions();
}

// Initialize on page load
window.onload = async () => {
    await loadOriginalFiles();
    await loadOptionsFiles();
};