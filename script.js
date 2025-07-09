let originalBattleViewer3D;
let originalBattleSequenceManager;
let modifiedBattleViewer3D;
let modifiedBattleSequenceManager;
let options = [];
let currentLanguage = 'en';

const translations = {
    en: {
        pageTitle: "RPG Developer Bakin Battle System Tweaker",
        exportBtn: "Export Code",
        saveBtn: "Save Options",
        loadBtn: "Load Options",
        resetBtn: "Reset to Default",
        paramTitle: "Important Settings Required",
        paramDesc: "Please add the values for the parameters below.",
        paramLabels: {
            playerDec: "Player Decision (Menu)",
            allyTarget: "Ally Target (Healing/Items/Support)",
            enemyTarget: "Enemy Target (Attack/Offense Skills)",
            playerDampening: "Player Stat Dampening",
            enemyDampening: "Enemy Stat Dampening",
            helpQuestion: "How do I obtain the GUID of my Custom Cameras?"
        },
        helpLink: "https://github.com/Meringue-Rouge/bakin-battle-system-snippets/blob/main/Finding%20your%20camera%20GUIDs.md",
        battleSystemVersionLabel: "Tested Battle System Version:",
        bakinVersionLabel: "Current Bakin Version:",
        cautionMessage: "Warning: Tweaks not tested with the latest Bakin version. Use with caution."
    },
    ja: {
        pageTitle: "RPG Developer Bakin バトルシステムツイーカー",
        exportBtn: "コードをエクスポート",
        saveBtn: "オプションを保存",
        loadBtn: "オプションを読み込み",
        resetBtn: "デフォルトにリセット",
        paramTitle: "重要な設定が必要です",
        paramDesc: "以下の値の設定をしてください。",
        paramLabels: {
            playerDec: "プレイヤー決定（メニュー）",
            allyTarget: "味方ターゲット（回復/アイテム/サポート）",
            enemyTarget: "敵ターゲット（攻撃/攻撃スキル）",
            playerDampening: "プレイヤーステータス減衰率",
            enemyDampening: "敵ステータス減衰率",
            helpQuestion: "カスタムカメラのGUIDをどうやって取得しますか？"
        },
        helpLink: "https://github.com/Meringue-Rouge/bakin-battle-system-snippets/blob/main/Finding%20your%20camera%20GUIDs.md",
        battleSystemVersionLabel: "テスト済みバトルシステムバージョン：",
        bakinVersionLabel: "現在のBakinバージョン：",
        cautionMessage: "警告：最新のBakinバージョンでテストされていない調整です。注意して使用してください。"
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
        for (let i = 0; i <= 12; i++) {
            const response = await fetch(`option${i}.json`);
            if (!response.ok) throw new Error(`Failed to load option${i}.json`);
            const option = await response.json();
            options[i] = option;
            option.enabled = false;
            if (!option.parameters) option.parameters = null;
        }
        renderOptions();
        rebuildModifiedCode();
    } catch (error) {
        console.error(error);
        alert('Error loading option files. Ensure all option files (option0.json to option12.json) are in the same directory.');
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
        if ((index === 2 || index === 12) && opt.enabled && opt.parameters) {
            console.log(`Rendering parameters for option ${index}: ${opt.name.en}, parameters: ${JSON.stringify(opt.parameters)}`);
            paramHtml = `<div class="parameters" id="params-${index}"><div><strong>⚠️ ${translations[currentLanguage].paramTitle}</strong></div><div>${translations[currentLanguage].paramDesc}</div>`;
            if (index === 2) {
                paramHtml += `
                    <div class="param-field">
                        <span class="param-label">${translations[currentLanguage].paramLabels.playerDec}:</span>
                        <input type="text" id="param-playerDec-${index}" value="${opt.parameters.playerDec || ''}" placeholder="Enter GUID">
                    </div>
                    <div class="param-field">
                        <span class="param-label">${translations[currentLanguage].paramLabels.allyTarget}:</span>
                        <input type="text" id="param-allyTarget-${index}" value="${opt.parameters.allyTarget || ''}" placeholder="Enter GUID">
                    </div>
                    <div class="param-field">
                        <span class="param-label">${translations[currentLanguage].paramLabels.enemyTarget}:</span>
                        <input type="text" id="param-enemyTarget-${index}" value="${opt.parameters.enemyTarget || ''}" placeholder="Enter GUID">
                    </div>
                    <div class="help-link">
                        <a href="${translations[currentLanguage].helpLink}" target="_blank">❓ ${translations[currentLanguage].paramLabels.helpQuestion}</a>
                    </div>`;
            } else if (index === 12) {
                paramHtml += `
                    <div class="param-field">
                        <span class="param-label">${translations[currentLanguage].paramLabels.playerDampening}:</span>
                        <input type="number" step="0.1" min="0" max="1" id="param-playerDampening-${index}" value="${opt.parameters.playerDampening || '0.8'}">
                    </div>
                    <div class="param-field">
                        <span class="param-label">${translations[currentLanguage].paramLabels.enemyDampening}:</span>
                        <input type="number" step="0.1" min="0" max="1" id="param-enemyDampening-${index}" value="${opt.parameters.enemyDampening || '0.8'}">
                    </div>`;
            }
            paramHtml += `</div>`;
        }
        div.innerHTML = `
            <label><input type="checkbox" id="option-${index}" ${opt.enabled ? 'checked' : ''} ${index === 1 && options[2].enabled ? 'disabled checked' : ''}> 
            ${opt.emoji} ${opt.name[currentLanguage]}</label>
            <div class="description">${opt.description[currentLanguage]}</div>
            ${paramHtml}
        `;
        optionsDiv.appendChild(div);

        if ((index === 2 || index === 12) && opt.enabled && opt.parameters) {
            if (index === 2) {
                const playerDecInput = document.getElementById(`param-playerDec-${index}`);
                const allyTargetInput = document.getElementById(`param-allyTarget-${index}`);
                const enemyTargetInput = document.getElementById(`param-enemyTarget-${index}`);

                playerDecInput?.addEventListener('input', (e) => {
                    opt.parameters.playerDec = e.target.value;
                    rebuildModifiedCode();
                });
                allyTargetInput?.addEventListener('input', (e) => {
                    opt.parameters.allyTarget = e.target.value;
                    rebuildModifiedCode();
                });
                enemyTargetInput?.addEventListener('input', (e) => {
                    opt.parameters.enemyTarget = e.target.value;
                    rebuildModifiedCode();
                });
            } else if (index === 12) {
                const playerDampeningInput = document.getElementById(`param-playerDampening-${index}`);
                const enemyDampeningInput = document.getElementById(`param-enemyDampening-${index}`);

                playerDampeningInput?.addEventListener('input', (e) => {
                    opt.parameters.playerDampening = parseFloat(e.target.value) || 0.8;
                    rebuildModifiedCode();
                });
                enemyDampeningInput?.addEventListener('input', (e) => {
                    opt.parameters.enemyDampening = parseFloat(e.target.value) || 0.8;
                    rebuildModifiedCode();
                });
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
        });

        div.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT' && !div.classList.contains('disabled-option')) {
                checkbox.click();
            }
        });
    });

    // Update version section
    document.getElementById('battle-system-version-label').textContent = translations[currentLanguage].battleSystemVersionLabel;
    document.getElementById('bakin-version-label').textContent = translations[currentLanguage].bakinVersionLabel;
    document.getElementById('caution-message').textContent = translations[currentLanguage].cautionMessage;
    const battleSystemVersion = document.getElementById('battle-system-version').textContent.split(' ')[0];
    const bakinVersion = document.getElementById('bakin-version').textContent.split(' ')[0];
    document.getElementById('version-caution').style.display = battleSystemVersion !== bakinVersion ? 'flex' : 'none';
}

// Insert code after a line or replace a function
function insertAfterLine(code, afterLine, insertCode, emoji, optionName, isFunctionReplacement = false) {
    if (isFunctionReplacement) {
        // Match the function signature, allowing for whitespace and newlines before the opening brace
        const regex = new RegExp(`(${afterLine.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*\\([^)]*\\))\\s*\\{`);
        const match = code.match(regex);
        if (!match) {
            console.error(`Function signature not found for ${optionName}`);
            return code;
        }

        const startIndex = match.index + match[0].length;
        let braceCount = 1;
        let endIndex = startIndex;

        while (braceCount > 0 && endIndex < code.length) {
            if (code[endIndex] === '{') braceCount++;
            else if (code[endIndex] === '}') braceCount--;
            endIndex++;
        }

        if (braceCount !== 0) {
            console.error(`Failed to find closing brace for function for ${optionName}`);
            return code;
        }

        const indent = code.match(/^\s*/)[0] || '';
        const commentedCode = `${indent}// ${emoji} - START - ${optionName}\n${insertCode}\n${indent}// ${emoji} - END - ${optionName}`;
        return code.substring(0, match.index) + commentedCode + code.substring(endIndex);
    } else {
        const lines = code.split('\n');
        const newLines = [];
        let inSwitchCase = false;
        let switchCaseName = '';
        let foundSwitch = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            newLines.push(lines[i]);

            if (line.startsWith('case BattleCommandType.')) {
                inSwitchCase = true;
                switchCaseName = line.match(/case BattleCommandType\.(\w+)/)[1];
                foundSwitch = true;
            } else if (line === 'break;' && inSwitchCase) {
                inSwitchCase = false;
                switchCaseName = '';
            }

            if (line.includes('restoreCamera') && foundSwitch && optionName.includes(switchCaseName)) {
                const indent = lines[i].match(/^\s*/)[0];
                newLines[i] = `${indent}// ${emoji} - ${optionName}: Disabled restoreCamera\n${indent}// ${lines[i].trim()}`;
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
                if (index === 2) {
                    // Handle option 2 (camera GUIDs)
                    code = code.replace(/\/\* PLAYER DEC \*\//g, opt.parameters.playerDec || '5f73a3bc-830a-404b-afa1-87a2f4eaf2f0')
                              .replace(/\/\* ALLY TARGET \*\//g, opt.parameters.allyTarget || '6ff8c4a2-a1f1-4d4e-86d9-5078e0d2cff6')
                              .replace(/\/\* ENEMY TARGET \*\//g, opt.parameters.enemyTarget || '01ab9f24-6b93-4440-9b5a-4f91e0f556b8');
                } else if (index === 12) {
                    // Handle option 12 (dampening rates)
                    code = code.replace(/\/\* PLAYER DAMPENING \*\//g, `${opt.parameters.playerDampening || 0.8}f`)
                              .replace(/\/\* ENEMY DAMPENING \*\//g, `${opt.parameters.enemyDampening || 0.8}f`);
                }
            }
            if (opt.file === "BattleViewer3D") {
                modifiedBattleViewer3D = insertAfterLine(modifiedBattleViewer3D, opt.insertAfter, code, opt.emoji, opt.name.en, opt.isFunctionReplacement);
            } else if (opt.file === "BattleSequenceManager") {
                modifiedBattleSequenceManager = insertAfterLine(modifiedBattleSequenceManager, opt.insertAfter, code, opt.emoji, opt.name.en, opt.isFunctionReplacement);
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
        link.download = "modified_code.zip";
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
    alert(translations[currentLanguage].saveBtn === 'Save Options' ? 'Options saved successfully!' : 'オプションが保存されました！');
}

// Load options state
function loadOptions() {
    const state = JSON.parse(localStorage.getItem('optionsState'));
    if (state) {
        state.forEach((optState, index) => {
            options[index].enabled = optState.enabled;
            if (optState.parameters) options[index].parameters = optState.parameters;
        });
        renderOptions();
        rebuildModifiedCode();
        alert(translations[currentLanguage].loadBtn === 'Load Options' ? 'Options loaded successfully!' : 'オプションが読みされました！');
    } else {
        alert(translations[currentLanguage].loadBtn === 'Load Options' ? 'No saved options found!' : '保存されたオプションが見つかりません！');
    }
}

// Reset to default
function resetToDefault() {
    options.forEach((opt, index) => {
        opt.enabled = false;
        if (opt.parameters) {
            if (index === 2) {
                opt.parameters = { playerDec: '', allyTarget: '', enemyTarget: '' };
            } else if (index === 12) {
                opt.parameters = { playerDampening: 0.8, enemyDampening: 0.8 };
            }
        }
        document.getElementById(`option-${index}`)?.removeAttribute('checked');
    });
    renderOptions();
    rebuildModifiedCode();
    alert(translations[currentLanguage].resetBtn === 'Reset to Default' ? 'Options reset to default!' : 'オプションがデフォルトにリセットされました！');
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

// Initialize
window.onload = async () => {
    await loadOriginalFiles();
    await loadOptionsFiles();
};