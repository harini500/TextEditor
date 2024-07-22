document.addEventListener('DOMContentLoaded', () => {
    const fontFamilySelect = document.getElementById('font-family');
    const fontWeightSelect = document.getElementById('font-weight');
    const italicToggle = document.getElementById('italic-toggle');
    const editor = document.getElementById('editor');
    const googleFontsLink = document.getElementById('google-fonts');

    const saveButton = document.getElementById('save-btn');
    const resetButton = document.getElementById('reset-btn');

    let fontData = {};

    async function fetchFontData() {
        try {
            const response = await fetch('fonts.json');
            fontData = await response.json();
            populateFontFamilies();
        } catch (error) {
            console.error('Error fetching font data:', error);
        }
    }

    function populateFontFamilies() {
        fontFamilySelect.innerHTML = '';
        for (const font in fontData) {
            const option = document.createElement('option');
            option.value = font;
            option.textContent = font;
            fontFamilySelect.appendChild(option);
        }
        if (fontFamilySelect.value) {
            populateFontWeights();
            updateFont();
        }
    }

    function populateFontWeights() {
        const selectedFont = fontFamilySelect.value;
        fontWeightSelect.innerHTML = '';

        if (fontData[selectedFont]) {
            for (const variant in fontData[selectedFont]) {
                const option = document.createElement('option');
                option.value = variant;
                option.textContent = variant;
                fontWeightSelect.appendChild(option);
            }
            if (fontWeightSelect.value) {
                updateFont();
            }
        } else {
            console.error('Selected font does not have data or variants.');
        }
    }

    function updateFont() {
        const selectedFont = fontFamilySelect.value;
        const selectedWeight = fontWeightSelect.value;
        const isItalic = italicToggle.checked;
        let fontUrl = '';

        if (fontData[selectedFont]) {
            if (isItalic && fontData[selectedFont][`${selectedWeight}italic`]) {
                fontUrl = fontData[selectedFont][`${selectedWeight}italic`];
            } else if (fontData[selectedFont][selectedWeight]) {
                fontUrl = fontData[selectedFont][selectedWeight];
            }

            if (fontUrl) {
                const fontFace = new FontFace(selectedFont, `url(${fontUrl})`);
                fontFace.load().then((loadedFont) => {
                    document.fonts.add(loadedFont);
                    editor.style.fontFamily = selectedFont;
                    editor.style.fontWeight = selectedWeight.replace('italic', '');
                    editor.style.fontStyle = isItalic ? 'italic' : 'normal';
                }).catch(error => {
                    console.error('Error loading font:', error);
                });
            } else {
                editor.style.fontFamily = selectedFont;
                editor.style.fontWeight = selectedWeight.replace('italic', '');
                editor.style.fontStyle = isItalic ? 'italic' : 'normal';
            }
        }
    }

    function autoSaveState() {
        const state = {
            content: editor.value,
            fontFamily: fontFamilySelect.value,
            fontWeight: fontWeightSelect.value,
            isItalic: italicToggle.checked
        };
        localStorage.setItem('editorState', JSON.stringify(state));
    }

    function saveState() {
        autoSaveState();  
    }

    function loadState() {
        const state = JSON.parse(localStorage.getItem('editorState'));
        if (state) {
            editor.value = state.content;
            fontFamilySelect.value = state.fontFamily;
            populateFontWeights();
            fontWeightSelect.value = state.fontWeight;
            italicToggle.checked = state.isItalic;
            updateFont();
        }
    }

    function resetState() {
        localStorage.removeItem('editorState');
        editor.value = '';
        fontFamilySelect.value = '';
        fontWeightSelect.innerHTML = '';
        italicToggle.checked = false;
        editor.style.fontFamily = '';
        editor.style.fontWeight = '';
        editor.style.fontStyle = '';
    }

    fontFamilySelect.addEventListener('change', () => {
        populateFontWeights();
        updateFont();
    });

    fontWeightSelect.addEventListener('change', updateFont);
    italicToggle.addEventListener('change', updateFont);
    editor.addEventListener('input', autoSaveState);

    saveButton.addEventListener('click', saveState);
    resetButton.addEventListener('click', resetState);

    fetchFontData().then(loadState);  
});
