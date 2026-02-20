import React, { useEffect, useRef } from 'react';

function Dashboard({ logs }) {
    const listRef = useRef(null);

    useEffect(() => {
        if (listRef.current) {
            // Use scrollTo for explicit container scrolling
            listRef.current.scrollTo({
                top: listRef.current.scrollHeight,
                behavior: 'auto'
            });
        }
    }, [logs]);

    return (
        <div id="event-log" data-test-id="event-log-list" ref={listRef}>
            {logs.map((log) => {
                const modifierString = log.modifiers.length > 0 ? `[${log.modifiers.join('+')}] ` : '';
                let content;
                let style = {};

                if (log.type.startsWith("Action:")) {
                    content = log.type;
                    style = { color: '#ce9178' };
                } else {
                    content = `${log.type}: ${modifierString}${log.key} (${log.code})`;
                }

                return (
                    <div
                        key={log.id}
                        className="log-entry"
                        data-test-id="event-log-entry"
                        style={style}
                    >
                        {content}
                    </div>
                );
            })}
        </div>
    );
}

export default Dashboard;
