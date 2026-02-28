# FileExplorer Feature Documentation

## Overview

The FileExplorer is a VS Code-like file and folder management system integrated into CollabCode. It allows users to organize code files into a hierarchical folder structure and manage them collaboratively in real-time.

## Features

### 1. **File and Folder Management**

- **Create Files**: Right-click on any folder and select "New File"
- **Create Folders**: Right-click on any folder and select "New Folder"
- **Rename**: Right-click on any file/folder and select "Rename"
- **Delete**: Right-click on any file/folder and select "Delete"

### 2. **Navigation**

- **Expand/Collapse Folders**: Click the chevron icon to toggle folder expansion
- **File Selection**: Click on any file to open it in the editor
- **Visual Indicators**:
  - 📂 Yellow folder icons for folders
  - 📄 Blue file icons for files
  - Highlight on selection showing the currently active file

### 3. **Real-time Synchronization**

- All file structure changes are synced across connected users via WebSocket
- File content is locally cached when editing
- Each file maintains its own content state

### 4. **Code Editor Integration**

- Selected file displays in a tab header above the editor
- Shows file name and type indicator
- Seamless switching between multiple files
- Local content caching for fast file switching

## File Structure

The FileExplorer uses a tree-based data structure:

```javascript
{
  id: "unique-id",
  name: "file-or-folder-name",
  type: "file" | "folder",
  content: "file content (for files only)",
  children: [...] // array of child nodes (for folders only)
}
```

## Usage Guide

### Creating a New File

1. Right-click on a folder in the FileExplorer
2. Select "New File"
3. Enter the file name in the prompt
4. The file is immediately created and available

### Creating a New Folder

1. Right-click on a folder
2. Select "New Folder"
3. Enter the folder name
4. The folder is created with an expandable structure

### Renaming Files/Folders

1. Right-click on the item
2. Select "Rename"
3. Edit the name in the inline input field
4. Press Enter to confirm or Escape to cancel

### Deleting Files/Folders

1. Right-click on the item
2. Select "Delete"
3. Confirm the deletion
4. The item and all its contents are removed

### Opening Files

- Simply click on a file to open it in the editor
- The file name appears in the tab header
- Content is cached and persists while you work

## Component Architecture

### FileExplorer.jsx

The main component responsible for:

- Rendering the file tree with TreeNode recursive component
- Managing folder expansion state
- Handling context menu actions
- Emitting socket events for real-time sync
- Managing rename, create, and delete operations

**Key State Variables:**

- `files`: Root node of the file tree
- `expandedFolders`: Set of expanded folder IDs
- `selectedFile`: Currently selected file
- `renaming`: ID of file currently being renamed
- `contextMenu`: Position and node of context menu

### CodeEditor.jsx

Enhanced to:

- Accept `selectedFile` prop
- Display file tab header with file name
- Cache file content locally
- Load/switch between files seamlessly

### EditorPage.jsx

Updated layout:

- Left sidebar: Room info and connected users (existing)
- Middle: FileExplorer (new)
- Right: CodeEditor + AIAssistant

## Socket Events

The FileExplorer communicates with the server using:

- `file_structure_change`: Emit when files/folders change
- `file_structure_update`: Listen for updates from other users

## Default File Structure

On initialization, the FileExplorer comes with:

```
root/
├── index.js
└── src/
    └── utils.js
```

You can modify or delete these and create your own structure.

## Best Practices

1. **Keep folder names short**: Avoid very long folder names for better UI
2. **Use clear naming**: Use descriptive file and folder names
3. **Organize by type**: Group similar files into folders
4. **Regular cleanup**: Remove unused files and folders
5. **Follow conventions**: Consider using naming conventions (camelCase, snake_case, etc.)

## Limitations & Future Enhancements

**Current Limitations:**

- File content is stored in memory (not persisted to database)
- No file drag-and-drop support yet
- No file search/filter functionality
- No file preview feature

**Future Enhancements:**

- Persistent file storage in database
- Drag-and-drop file organization
- File search and filtering
- File type detection and syntax highlighting preview
- Export/download project as ZIP
- Import files and folders
- File templates/scaffolding

## Troubleshooting

**Issue**: Files not syncing across users

- **Solution**: Check WebSocket connection and ensure `socketRef` is properly initialized

**Issue**: File content lost after switching files

- **Solution**: File content is cached locally; check browser console for errors

**Issue**: Context menu not appearing

- **Solution**: Ensure right-click works in your browser; check CSS z-index settings

## Code Examples

### Accessing Selected File Information

```javascript
const selectedFile = {
  id: "file-123",
  name: "utils.js",
  type: "file",
  content: "// code here",
};

console.log(selectedFile.name); // "utils.js"
```

### Emitting File Changes to Server

```javascript
socketRef.current.emit("file_structure_change", {
  roomId: "room-id",
  files: updatedFileTree,
});
```

## API Reference

### FileExplorer Props

- `socketRef`: Reference to Socket.io connection
- `roomId`: Current room ID for syncing
- `onFileSelect`: Callback when a file is selected

### FileExplorer State Management

- `toggleFolderExpand(folderId)`: Toggle folder expansion
- `createNewFile()`: Create new file in selected folder
- `createNewFolder()`: Create new folder
- `renameNode(nodeId, newName)`: Rename file/folder
- `deleteNode(nodeId)`: Delete file/folder
