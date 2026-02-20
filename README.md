# 🚀 High-Performance Browser Code Editor

VS Code-Style Keyboard Handling | Undo/Redo | Chord Shortcuts | Dockerized

---

## 📌 Project Overview

This project implements a **high-performance browser-based code editor** built using **React + Vite**.

It demonstrates advanced keyboard event handling similar to modern IDEs like VS Code, including:

- Custom keyboard shortcuts
- Undo/Redo history management
- Chorded shortcuts (Ctrl+K, Ctrl+C)
- Auto indentation
- Comment toggling
- Debounced syntax highlight simulation
- Real-time event logging dashboard
- Cross-platform modifier key support (Ctrl / Cmd)
- Full Docker containerization

---

## 🧠 Core Concepts Implemented

This project focuses heavily on:

- `keydown` event handling
- `input` event tracking
- Modifier key detection
- Preventing default browser behavior
- State stack management
- Debouncing performance-heavy logic
- Cross-platform compatibility
- Test verification through global window functions

---

## 🛠️ Technology Stack

- React
- Vite
- JavaScript (ES6+)
- Docker
- Docker Compose
- HTML5
- CSS3

---

## ⚙️ Setup Instructions (Local Development)

### 1️⃣ Install Dependencies

```bash
npm install
```

### 2️⃣ Run Development Server

```bash
npm run dev
```

Open:

```
http://localhost:5173
```

---

## 🐳 Docker Setup (Mandatory Requirement)

### 1️⃣ Build and Start Container

```bash
docker-compose up --build
```

### 2️⃣ Access Application

```
http://localhost:3000
```

### 3️⃣ Stop Container

```bash
docker-compose down
```

---

## 🧾 Environment Variables

`.env.example`

```
APP_PORT=3000
```

No secrets are stored in the repository.

---

## 🧩 Core Features

---

### ✅ 1. Editor Layout

The application renders:

- Left panel → Code editor
- Right panel → Event debugging dashboard

Required DOM Elements:

| Element          | data-test-id     |
| ---------------- | ---------------- |
| Editor Container | editor-container |
| Editor Input     | editor-input     |
| Event Dashboard  | event-dashboard  |
| Event Log List   | event-log-list   |

---

### ✅ 2. Real-Time Event Logging

The dashboard logs:

- keydown
- keyup
- input
- compositionstart
- compositionupdate
- compositionend

Each log entry contains:

- Event type
- Key value
- Modifier key status

---

### ✅ 3. Save Shortcut (Ctrl+S / Cmd+S)

Behavior:

- Prevents browser save dialog
- Logs: `Action: Save`
- Works on Windows/Linux and macOS

Implementation:

```js
event.preventDefault();
```

---

### ✅ 4. Undo / Redo (State Stack)

Shortcuts:

| Action | Windows      | Mac         |
| ------ | ------------ | ----------- |
| Undo   | Ctrl+Z       | Cmd+Z       |
| Redo   | Ctrl+Shift+Z | Cmd+Shift+Z |

Stack Design:

- `undoStack`
- `redoStack`

State Verification Function:

```js
window.getEditorState();
```

Returns:

```json
{
  "content": "string",
  "historySize": number
}
```

---

### ✅ 5. Tab Indentation

- Tab → adds 2 spaces
- Shift+Tab → removes 2 spaces
- Focus remains inside editor

---

### ✅ 6. Auto Indentation on Enter

Pressing Enter:

- Copies indentation from previous line
- Maintains consistent formatting

---

### ✅ 7. Toggle Comments (Ctrl+/)

Behavior:

- Adds `// ` if not commented
- Removes `// ` if already commented

Works on single or multiple lines.

---

### ✅ 8. Chord Shortcut (Ctrl+K, Ctrl+C)

Behavior:

1. Press Ctrl+K
2. Within 2 seconds press Ctrl+C
3. Logs: `Action: Chord Success`

If:

- Timeout expires
- Wrong key pressed

→ chord resets

---

### ✅ 9. Input Event Handling

All text changes are handled via:

```
input event
```

This includes:

- Typing
- Pasting
- IME composition

Ensures modern browser compatibility.

---

### ✅ 10. Debounced Syntax Highlight Simulation

A simulated expensive function runs after typing.

Debounce interval:

```
150ms
```

Verification Function:

```js
window.getHighlightCallCount();
```

Rapid typing 10 characters within 100ms  
→ highlight runs ONLY once.

---

### ✅ 11. Cross-Platform Modifier Support

Automatically detects OS:

```js
navigator.platform;
```

Handles:

- Ctrl (Windows/Linux)
- Meta / Cmd (Mac)

All shortcuts work on both platforms.

---

### ✅ 12. Accessibility (A11Y)

Editor includes:

```
role="textbox"
aria-multiline="true"
```

Keyboard-only navigation supported.

Tab behavior customized to prevent focus escape.

---

## 🔬 Testing & Verification

Exposed global functions:

```js
window.getEditorState();
window.getHighlightCallCount();
```

Used for automated validation of:

- Content state
- History stack size
- Debounce behavior

---

## ⚡ Performance Considerations

Implemented:

- Debouncing
- Centralized event handling
- Controlled state updates

Future improvements:

- Virtual scrolling
- Token-based syntax highlighting
- Memoized rendering

---

## 🚨 Known Limitations

- Not a full syntax highlighter
- No file system persistence
- No collaborative editing
- No large file virtualization

---

## 🎯 Design Decisions

| Decision                       | Reason                           |
| ------------------------------ | -------------------------------- |
| Used textarea                  | Simpler cursor control           |
| Custom undo stack              | Full control over state          |
| Manual shortcut handling       | Required for verification        |
| Debounced highlight simulation | Performance demonstration        |
| Dockerized environment         | Mandatory evaluation requirement |

---

## 🧪 How to Validate Manually

1. Type in editor → logs appear
2. Press Ctrl+S → no browser dialog
3. Press Ctrl+Z → undo works
4. Press Ctrl+Shift+Z → redo works
5. Press Ctrl+/ → toggle comment
6. Press Tab → indent
7. Press Enter → auto-indent
8. Press Ctrl+K then Ctrl+C → chord success

---

## 🐳 Docker Health Check

Container includes:

```
healthcheck
```

To verify:

```bash
docker ps
```

Status should show:

```
healthy
```

---

## 🏁 Final Notes

This project demonstrates:

- Advanced DOM event handling
- Browser keyboard model understanding
- State management architecture
- Performance optimization patterns
- Production-ready Docker containerization

---

## 👩‍💻 Author

Frontend Development Project  
Advanced Keyboard Event Handling

---
