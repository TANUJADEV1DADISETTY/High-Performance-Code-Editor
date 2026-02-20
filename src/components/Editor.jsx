import React, { useRef, useEffect, useState } from 'react';

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

const Editor = ({ onLog }) => {
    const editorRef = useRef(null);

    // State refs to avoid stale closures in event listeners
    // contenteditable makes React state management tricky if better not controlled.
    // We use refs for internal logic.
    const undoStack = useRef([]);
    const redoStack = useRef([]);
    const isComposing = useRef(false);
    const highlightCallCount = useRef(0);

    // Chord state
    const chordState = useRef({
        waiting: false,
        startTime: 0
    });

    // Expensive task
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const runLikelyExpensiveTask = React.useMemo(() => debounce(() => {
        highlightCallCount.current++;
        console.log('Syntax highlighting executed');
    }, 200), []);

    // Helper: Save State
    const saveState = (content) => {
        const stack = undoStack.current;
        if (stack.length > 0 && stack[stack.length - 1] === content) {
            return;
        }
        stack.push(content);
        redoStack.current = [];
    };

    // Helper: Undo
    const performUndo = () => {
        const uStack = undoStack.current;
        const rStack = redoStack.current;
        const editor = editorRef.current;

        if (uStack.length <= 1) return;

        const current = uStack.pop();
        rStack.push(current);

        const previous = uStack[uStack.length - 1];
        editor.innerText = previous;
        moveCursorToEnd(editor);
    };

    // Helper: Redo
    const performRedo = () => {
        const rStack = redoStack.current;
        const uStack = undoStack.current;
        const editor = editorRef.current;

        if (rStack.length === 0) return;

        const next = rStack.pop();
        uStack.push(next);
        editor.innerText = next;
        moveCursorToEnd(editor);
    };

    const moveCursorToEnd = (el) => {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    };

    // Exposed Verification
    useEffect(() => {
        window.getEditorState = () => ({
            content: editorRef.current?.innerText || '',
            historySize: undoStack.current.length
        });
        window.getHighlightCallCount = () => highlightCallCount.current;

        // Initial save
        if (editorRef.current) {
            saveState(editorRef.current.innerText);
        }
    }, []);


    // --- Event Handlers ---

    const handleInput = (e) => {
        if (isComposing.current) return;
        saveState(e.target.innerText);
        onLog('input', e.nativeEvent.data || '', e.nativeEvent.inputType);
        runLikelyExpensiveTask();
    };

    const handleCompositionStart = (e) => {
        isComposing.current = true;
        onLog('compositionstart', e.data, '');
    };

    const handleCompositionUpdate = (e) => {
        onLog('compositionupdate', e.data, '');
    };

    const handleCompositionEnd = (e) => {
        isComposing.current = false;
        onLog('compositionend', e.data, '');
        saveState(e.target.innerText);
    };

    const handleKeyDown = (e) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const isCtrl = isMac ? e.metaKey : e.ctrlKey;
        const key = e.key.toLowerCase();

        const modifiers = [];
        if (e.ctrlKey) modifiers.push('Ctrl');
        if (e.metaKey) modifiers.push('Meta');
        if (e.shiftKey) modifiers.push('Shift');
        if (e.altKey) modifiers.push('Alt');

        onLog('keydown', e.key, e.code, modifiers);

        // 1. Save
        if (isCtrl && key === 's') {
            e.preventDefault();
            onLog('Action: Save', '', '');
            return;
        }

        // 2. Undo
        if (isCtrl && key === 'z' && !e.shiftKey) {
            e.preventDefault();
            performUndo();
            return;
        }

        // 3. Redo (Ctrl+Shift+Z OR Ctrl+Y)
        if ((isCtrl && key === 'z' && e.shiftKey) || (isCtrl && key === 'y')) {
            e.preventDefault();
            performRedo();
            return;
        }

        // 4. Tab / Shift+Tab
        if (e.key === 'Tab') {
            e.preventDefault();
            if (e.shiftKey) {
                handleOutdent();
            } else {
                handleIndent();
            }
            return;
        }

        // 5. Enter
        if (e.key === 'Enter') {
            e.preventDefault();
            handleEnter();
            return;
        }

        // 6. Comment
        if (isCtrl && key === '/') {
            e.preventDefault();
            toggleComment();
            return;
        }

        // 7. Chord
        if (isCtrl && key === 'k') {
            chordState.current.waiting = true;
            chordState.current.startTime = Date.now();
            return;
        }

        if (chordState.current.waiting) {
            if (Date.now() - chordState.current.startTime < 2000) {
                if (isCtrl && key === 'c') {
                    e.preventDefault();
                    onLog('Action: Chord Success', '', '');
                    chordState.current.waiting = false;
                    return;
                }
            } else {
                chordState.current.waiting = false;
            }

            if (key !== 'k' && key !== 'control' && key !== 'meta') {
                chordState.current.waiting = false;
            }
        }
    };

    /* --- Text Manipulation Actions --- */

    const insertTextAtCursor = (text) => {
        // Attempt to use execCommand for better undo/redo integration (native) 
        // and rendering (handling trailing newlines in pre-wrap)
        const success = document.execCommand('insertText', false, text);

        // Fallback if execCommand is not supported/fails
        if (!success) {
            const sel = window.getSelection();
            if (sel.rangeCount) {
                const range = sel.getRangeAt(0);
                range.deleteContents();
                const textNode = document.createTextNode(text);
                range.insertNode(textNode);
                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    };

    const handleIndent = () => {
        insertTextAtCursor('  ');
        saveState(editorRef.current.innerText);
    };

    const handleOutdent = () => {
        // Match logic from previous implementation
        const sel = window.getSelection();
        if (!sel.rangeCount) return;

        const currentRange = sel.getRangeAt(0).cloneRange();
        // Experimental: modify selection to check line start
        // Note: modify() is not standard but works in Chrome/Firefox which usually powers these environments.
        try {
            sel.modify('extend', 'backward', 'lineboundary');
            const lineStartRange = sel.getRangeAt(0);
            const lineContent = lineStartRange.toString();

            // Return to original
            sel.removeAllRanges();
            sel.addRange(currentRange);

            if (lineContent.startsWith('  ') || lineContent.startsWith('\t')) {
                // Delete logic: move to start of line, delete 2 chars
                sel.modify('move', 'backward', 'lineboundary');
                sel.modify('extend', 'forward', 'character');
                sel.modify('extend', 'forward', 'character');
                if (sel.toString() === '  ') {
                    document.execCommand('delete');
                }
            }
        } catch (e) {
            console.error("Outdent failed", e);
        }
        saveState(editorRef.current.innerText);
    };

    const handleEnter = () => {
        const sel = window.getSelection();
        if (!sel.rangeCount) return;

        try {
            const currentRange = sel.getRangeAt(0).cloneRange();
            sel.modify('extend', 'backward', 'lineboundary');
            const textToCursor = sel.toString();
            sel.removeAllRanges();
            sel.addRange(currentRange);

            const match = textToCursor.match(/^(\s*)/);
            const indentation = match ? match[1] : '';

            insertTextAtCursor('\n' + indentation);
        } catch (e) {
            insertTextAtCursor('\n');
        }
        saveState(editorRef.current.innerText);
    };

    const toggleComment = () => {
        const sel = window.getSelection();
        if (!sel.rangeCount) return;

        try {
            sel.modify('move', 'backward', 'lineboundary');
            sel.modify('extend', 'forward', 'lineboundary');
            const lineText = sel.toString();

            if (lineText.trim().startsWith('// ')) {
                document.execCommand('insertText', false, lineText.replace('// ', ''));
            } else {
                document.execCommand('insertText', false, '// ' + lineText);
            }
        } catch (e) { }
        saveState(editorRef.current.innerText);
    };

    return (
        <div
            id="editor"
            contentEditable="true"
            className="editor-input"
            data-test-id="editor-input"
            spellCheck="false"
            ref={editorRef}
            onInput={handleInput}
            onCompositionStart={handleCompositionStart}
            onCompositionUpdate={handleCompositionUpdate}
            onCompositionEnd={handleCompositionEnd}
            onKeyDown={handleKeyDown}
        ></div>
    );
};

export default Editor;
