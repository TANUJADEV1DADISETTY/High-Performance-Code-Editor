import React, { useState, useCallback } from 'react';
import Editor from './components/Editor';
import Dashboard from './components/Dashboard';

function App() {
    const [logs, setLogs] = useState([]);

    const handleLog = useCallback((type, key, code, modifiers = []) => {
        setLogs(prev => {
            // Limit log size if needed, but requirements don't say so.
            // We accumulate logs.
            const newLog = {
                id: Date.now() + Math.random(),
                type,
                key,
                code,
                modifiers
            };
            return [...prev, newLog];
        });
    }, []);

    return (
        <div id="app">
            <div className="pane" data-test-id="editor-container">
                <h2>Editor</h2>
                <Editor onLog={handleLog} />
            </div>
            <div className="pane sidebar" data-test-id="event-dashboard">
                <h2>Event Dashboard</h2>
                <Dashboard logs={logs} />
            </div>
        </div>
    );
}

export default App;
