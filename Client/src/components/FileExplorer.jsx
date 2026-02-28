import React, { useState, useRef, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Trash2,
  Edit3,
  FilePlus,
  FolderPlus,
} from "lucide-react";
import toast from "react-hot-toast";

const FileExplorer = ({ socketRef, roomId, onFileSelect }) => {
  const [files, setFiles] = useState({
    id: "root",
    name: "root",
    type: "folder",
    children: [
      {
        id: "file-1",
        name: "index.js",
        type: "file",
        content: "// Start coding here",
      },
    ],
  });

  const [expandedFolders, setExpandedFolders] = useState(new Set(["root"]));
  const [selectedFile, setSelectedFile] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;
    socket.on("file_structure_update", (updatedFiles) =>
      setFiles(updatedFiles),
    );
    return () => socket?.off("file_structure_update");
  }, [socketRef]);

  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renaming]);

  const emitFileUpdate = (updatedFiles) => {
    if (socketRef?.current) {
      socketRef.current.emit("file_structure_change", {
        roomId,
        files: updatedFiles,
      });
    }
  };

  const toggleFolderExpand = (folderId) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      newSet.has(folderId) ? newSet.delete(folderId) : newSet.add(folderId);
      return newSet;
    });
  };

  const generateId = () =>
    `${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;

  const findNodeById = (node, id) => {
    if (node.id === id) return node;
    if (node.children) {
      for (let child of node.children) {
        const found = findNodeById(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  const updateNodeById = (node, id, update) => {
    if (node.id === id) return { ...node, ...update };
    if (node.children)
      return {
        ...node,
        children: node.children.map((child) =>
          updateNodeById(child, id, update),
        ),
      };
    return node;
  };

  const addChildToFolder = (node, folderId, newChild) => {
    if (node.id === folderId)
      return { ...node, children: [...(node.children || []), newChild] };
    if (node.children)
      return {
        ...node,
        children: node.children.map((child) =>
          addChildToFolder(child, folderId, newChild),
        ),
      };
    return node;
  };

  const deleteNodeById = (node, id) => {
    if (node.children) {
      return {
        ...node,
        children: node.children
          .filter((child) => child.id !== id)
          .map((child) => deleteNodeById(child, id)),
      };
    }
    return node;
  };

  // ✅ NEW: Universal Create Function (Works from Buttons & Right-Click)
  const handleCreateNew = (type, targetFolderId = "root") => {
    const name = prompt(`Enter new ${type} name:`);
    if (!name || name.trim() === "") return;

    const newItem = {
      id: generateId(),
      name: name.trim(),
      type,
      ...(type === "folder" ? { children: [] } : { content: "" }),
    };

    const updated = addChildToFolder(files, targetFolderId, newItem);
    setFiles(updated);
    emitFileUpdate(updated);
    setExpandedFolders((prev) => new Set(prev).add(targetFolderId)); // Auto-expand folder
    toast.success(`${type === "file" ? "File" : "Folder"} "${name}" created`);
    setContextMenu(null);
  };

  const renameNode = (nodeId, newName) => {
    if (newName.trim() === "") {
      toast.error("Name cannot be empty");
      return;
    }
    const updated = updateNodeById(files, nodeId, { name: newName });
    setFiles(updated);
    emitFileUpdate(updated);
    setRenaming(null);
  };

  const deleteNode = (nodeId) => {
    const node = findNodeById(files, nodeId);
    if (!node) return;
    const updated = deleteNodeById(files, nodeId);
    setFiles(updated);
    emitFileUpdate(updated);
    toast.success(`"${node.name}" deleted`);
    if (selectedFile === nodeId) {
      setSelectedFile(null);
      onFileSelect?.(null);
    }
  };

  const handleRightClick = (e, node) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id, node });
  };

  const handleSelectFile = (node) => {
    if (node.type === "file") {
      setSelectedFile(node.id);
      onFileSelect?.(node);
    } else {
      toggleFolderExpand(node.id);
    }
  };

  const TreeNode = ({ node, level = 0 }) => {
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = selectedFile === node.id;
    const isRenaming = renaming === node.id;

    if (node.id === "root" && level === 0) {
      return (
        <div>
          {node.children?.map((child) => (
            <TreeNode key={child.id} node={child} level={level} />
          ))}
        </div>
      );
    }

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-1 px-2 py-1.5 cursor-pointer rounded transition-colors ${
            isSelected
              ? "bg-blue-600/30 text-blue-300"
              : "hover:bg-gray-700/50 text-gray-300"
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => handleSelectFile(node)}
          onContextMenu={(e) => handleRightClick(e, node)}
        >
          {node.type === "folder" && (
            <button
              className="p-0 hover:bg-gray-600/30 rounded"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolderExpand(node.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          {node.type === "file" && <div className="w-4" />}

          {node.type === "folder" ? (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 text-yellow-400" />
            ) : (
              <Folder className="w-4 h-4 text-yellow-400" />
            )
          ) : (
            <File className="w-4 h-4 text-blue-400" />
          )}

          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              defaultValue={node.name}
              className="flex-1 px-1 py-0 bg-gray-900 text-white border border-blue-500 rounded text-xs"
              onChange={(e) => e.stopPropagation()}
              onBlur={(e) => renameNode(node.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") renameNode(node.id, e.target.value);
                else if (e.key === "Escape") setRenaming(null);
              }}
            />
          ) : (
            <span className="flex-1 text-sm truncate">{node.name}</span>
          )}
        </div>
        {node.type === "folder" && isExpanded && node.children && (
          <div>
            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#151B28] select-none">
      {/* ✅ VS Code Style Header with Creation Buttons */}
      <div className="p-3 border-b border-gray-700/50 flex justify-between items-center bg-black/20">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
          Explorer
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleCreateNew("file")}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-all"
            title="New File"
          >
            <FilePlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleCreateNew("folder")}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-all"
            title="New Folder"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        <TreeNode node={files} />
      </div>

      {contextMenu && (
        <div
          className="fixed bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 min-w-[150px] overflow-hidden"
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
        >
          {contextMenu.node.type === "folder" && (
            <>
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-blue-600 flex items-center gap-2"
                onClick={() => handleCreateNew("file", contextMenu.nodeId)}
              >
                <FilePlus className="w-4 h-4" /> New File
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-blue-600 flex items-center gap-2"
                onClick={() => handleCreateNew("folder", contextMenu.nodeId)}
              >
                <FolderPlus className="w-4 h-4" /> New Folder
              </button>
              <div className="border-t border-gray-700 my-1"></div>
            </>
          )}
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-yellow-600 flex items-center gap-2"
            onClick={() => {
              setRenaming(contextMenu.nodeId);
              setContextMenu(null);
            }}
          >
            <Edit3 className="w-4 h-4" /> Rename
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-red-600 flex items-center gap-2"
            onClick={() => {
              if (window.confirm(`Delete "${contextMenu.node.name}"?`))
                deleteNode(contextMenu.nodeId);
              setContextMenu(null);
            }}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}

      {contextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setContextMenu(null)}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu(null);
          }}
        />
      )}
    </div>
  );
};

export default FileExplorer;
