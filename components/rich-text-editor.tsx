"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Quote,
  Minus,
  Maximize2,
  Minimize2,
  Music,
  Upload,
  Eye,
  X,
} from "lucide-react";
import { Select } from "@/components/ui/select";
import toast from "react-hot-toast";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder = "Write your content here..." }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [isEmpty, setIsEmpty] = useState(true);
  const [mode, setMode] = useState<"visual" | "text">("visual");
  const [textValue, setTextValue] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [blockFormat, setBlockFormat] = useState("paragraph");
  const [fontSize, setFontSize] = useState("16px");
  const [showPreview, setShowPreview] = useState(false);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    unorderedList: false,
    orderedList: false,
    blockquote: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    link: false,
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (mode === "visual") {
      if (editorRef.current && editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
        const text = editorRef.current.textContent || "";
        setIsEmpty(text.trim() === "" || value === "" || value === "<br>" || value === "<p><br></p>");
      }
    } else {
      // Convert HTML to plain text for text mode
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = value || "";
      const plainText = tempDiv.textContent || tempDiv.innerText || "";
      setTextValue(plainText);
    }
  }, [value, mode]);

  // Check active formats helper
  const checkActiveFormats = useCallback(() => {
    try {
      const selection = window.getSelection();
      let hasLink = false;
      let hasBlockquote = false;

      if (selection && selection.rangeCount > 0 && editorRef.current) {
        const range = selection.getRangeAt(0);
        
        // Check if selection is collapsed (cursor position)
        if (range.collapsed) {
          // For collapsed selection, check the parent node
          const container = range.commonAncestorContainer;
          const parent = container.nodeType === 1 
            ? container as HTMLElement
            : (container.parentElement as HTMLElement);
          
          if (parent) {
            const linkElement = parent.closest("a");
            hasLink = !!linkElement;
            
            const blockquote = parent.closest("blockquote");
            hasBlockquote = !!blockquote;
          }
        } else {
          // For non-collapsed selection, check if any part is in a link
          const startContainer = range.startContainer;
          const endContainer = range.endContainer;
          
          const startParent = startContainer.nodeType === 1 
            ? startContainer as HTMLElement
            : (startContainer.parentElement as HTMLElement);
          const endParent = endContainer.nodeType === 1 
            ? endContainer as HTMLElement
            : (endContainer.parentElement as HTMLElement);
          
          if (startParent) {
            const startLink = startParent.closest("a");
            if (startLink) hasLink = true;
            
            const startBlockquote = startParent.closest("blockquote");
            if (startBlockquote) hasBlockquote = true;
          }
          
          if (endParent) {
            const endLink = endParent.closest("a");
            if (endLink) hasLink = true;
            
            const endBlockquote = endParent.closest("blockquote");
            if (endBlockquote) hasBlockquote = true;
          }
          
          // Also check if the entire range is within a single link
          const commonAncestor = range.commonAncestorContainer;
          const ancestorParent = commonAncestor.nodeType === 1 
            ? commonAncestor as HTMLElement
            : (commonAncestor.parentElement as HTMLElement);
          
          if (ancestorParent) {
            const ancestorLink = ancestorParent.closest("a");
            if (ancestorLink) hasLink = true;
            
            const ancestorBlockquote = ancestorParent.closest("blockquote");
            if (ancestorBlockquote) hasBlockquote = true;
          }
        }
      }

      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        unorderedList: document.queryCommandState("insertUnorderedList"),
        orderedList: document.queryCommandState("insertOrderedList"),
        blockquote: hasBlockquote,
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
        link: hasLink,
      });
    } catch (e) {
      // Ignore errors
    }
  }, []);

  // Setup event listeners for visual mode
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || mode !== "visual") return;

    const handleFocus = () => {
      if (editor.textContent === "" && editor.innerHTML === "") {
        editor.innerHTML = "";
      }
    };

    const handleBlur = () => {
      if (editor.textContent === "" || editor.innerHTML === "" || editor.innerHTML === "<br>" || editor.innerHTML === "<p><br></p>") {
        editor.innerHTML = "";
      }
    };

    // Handle image clicks for alt text editing
    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG") {
        e.preventDefault();
        const img = target as HTMLImageElement;
        const currentAlt = img.alt || "";
        const newAlt = prompt("Edit image alt text (for accessibility):", currentAlt);
        if (newAlt !== null) {
          img.alt = newAlt;
          handleInput();
        }
      }
    };

    editor.addEventListener("click", handleImageClick);

    const handleSelectionChange = () => {
      if (!editorRef.current) return;
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const blockElement = container.nodeType === 1 
          ? container as HTMLElement
          : (container.parentElement as HTMLElement);
        
        if (blockElement) {
          let tagName = blockElement.tagName?.toLowerCase();
          // If it's a text node, get the parent block element
          if (!tagName || !['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'blockquote'].includes(tagName)) {
            let parent = blockElement.parentElement;
            while (parent && parent !== editor) {
              tagName = parent.tagName?.toLowerCase();
              if (tagName && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'blockquote'].includes(tagName)) {
                break;
              }
              parent = parent.parentElement;
            }
          }
          
          if (tagName === "blockquote") {
            setBlockFormat("blockquote");
          } else if (tagName && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre'].includes(tagName)) {
            setBlockFormat(tagName);
          } else {
            setBlockFormat("paragraph");
          }
        }
      }
      
      // Check active formats
      checkActiveFormats();
    };

    editor.addEventListener("focus", handleFocus);
    editor.addEventListener("blur", handleBlur);
    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      editor.removeEventListener("focus", handleFocus);
      editor.removeEventListener("blur", handleBlur);
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [mode, checkActiveFormats]);

  const saveToHistory = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(html);
    historyIndexRef.current = historyRef.current.length - 1;
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
      historyIndexRef.current--;
    }
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    saveToHistory();
    const html = editorRef.current.innerHTML;
    const text = editorRef.current.textContent || "";
    setIsEmpty(text.trim() === "" || html === "" || html === "<br>" || html === "<p><br></p>");
    onChange(html);
    
    // Update active formats after input
    setTimeout(() => {
      checkActiveFormats();
    }, 10);
  };

  const execCommand = (command: string, value: string | null = null) => {
    if (!editorRef.current) return;
    
    // Ensure editor is focused before executing command
    editorRef.current.focus();
    
    // For list commands, ensure we have a selection or create one
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      // Create a range at the end of the editor
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    
    try {
      const success = document.execCommand(command, false, value || undefined);
      if (!success) {
        console.warn(`Command ${command} failed`);
      }
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
    }
    
    editorRef.current.focus();
    handleInput();
    
    // Update active formats after command
    // Use longer timeout for link commands to ensure DOM is updated
    const timeout = command === "createLink" || command === "unlink" ? 100 : 10;
    setTimeout(() => {
      checkActiveFormats();
    }, timeout);
  };

  const changeFontSize = (size: string) => {
    if (!editorRef.current) return;
    
    setFontSize(size);
    editorRef.current.focus();
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }
    
    const range = selection.getRangeAt(0);
    
    try {
      // If there's a text selection, wrap it in a span with font size
      if (!range.collapsed) {
        // Extract the selected content
        const contents = range.extractContents();
        
        // Create a span with the font size
        const span = document.createElement("span");
        span.style.fontSize = size;
        span.appendChild(contents);
        
        // Insert the span
        range.insertNode(span);
        
        // Update selection to be inside the span
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        // No selection - check if we're in a block element or need to create a span
        let container = range.commonAncestorContainer;
        if (container.nodeType === 3) { // Text node
          container = container.parentNode as HTMLElement;
        }
        
        const element = container as HTMLElement;
        
        // If it's a block element, apply fontSize directly
        if (element && element !== editorRef.current) {
          const tagName = element.tagName;
          if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'BLOCKQUOTE', 'LI'].includes(tagName)) {
            element.style.fontSize = size;
          } else {
            // For inline elements, wrap in span
            const span = document.createElement("span");
            span.style.fontSize = size;
            span.innerHTML = "\u200B"; // Zero-width space
            range.insertNode(span);
            
            // Move cursor after the span
            range.setStartAfter(span);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        } else {
          // Create a span at cursor position
          const span = document.createElement("span");
          span.style.fontSize = size;
          span.innerHTML = "\u200B"; // Zero-width space
          range.insertNode(span);
          
          // Move cursor after the span
          range.setStartAfter(span);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    } catch (err) {
      console.error("Error changing font size:", err);
    }
    
    editorRef.current.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url && url.trim()) {
      if (!editorRef.current) return;
      
      editorRef.current.focus();
      const selection = window.getSelection();
      
      // If no selection, use the current word or create a link placeholder
      if (!selection || selection.rangeCount === 0 || selection.toString().trim() === "") {
        // Create a text node for the link
        const linkText = prompt("Enter link text:", url) || url;
        const range = selection?.getRangeAt(0) || document.createRange();
        
        // Insert the link
        const link = document.createElement("a");
        link.href = url.trim();
        link.textContent = linkText;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        
        if (range.collapsed) {
          range.insertNode(link);
        } else {
          range.deleteContents();
          range.insertNode(link);
        }
        
        // Move cursor after the link
        range.setStartAfter(link);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
      } else {
        // Use execCommand for selected text
        execCommand("createLink", url.trim());
      }
      
      handleInput();
      
      // Update active formats after link insertion with multiple attempts
      setTimeout(() => {
        checkActiveFormats();
      }, 50);
      setTimeout(() => {
        checkActiveFormats();
      }, 150);
    }
  };

  const removeLink = () => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    const selection = window.getSelection();
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      // Check if selection is inside a link
      const container = range.commonAncestorContainer;
      const parent = container.nodeType === 1 
        ? container as HTMLElement
        : (container.parentElement as HTMLElement);
      
      if (parent) {
        const linkElement = parent.closest("a");
        
        if (linkElement) {
          // If we're inside a link, unwrap it
          const parentOfLink = linkElement.parentNode;
          if (parentOfLink) {
            // Move all children of link before the link
            while (linkElement.firstChild) {
              parentOfLink.insertBefore(linkElement.firstChild, linkElement);
            }
            // Remove the link element
            parentOfLink.removeChild(linkElement);
            
            // Normalize the parent to merge text nodes
            parentOfLink.normalize();
            
            handleInput();
            
            // Update active formats
            setTimeout(() => {
              checkActiveFormats();
            }, 50);
            return;
          }
        }
      }
    }
    
    // Fallback to execCommand
    execCommand("unlink");
    
    // Update active formats after unlink
    setTimeout(() => {
      checkActiveFormats();
    }, 50);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size too large. Maximum size is 5MB.");
      return;
    }

    try {
      toast.loading("Uploading image...");
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "cover"); // Use cover type for blog images

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Prompt for alt text
      const altText = prompt("Enter image alt text (for accessibility):", file.name.replace(/\.[^/.]+$/, "")) || "";

      // Insert image into editor
      if (data.url && editorRef.current) {
        const img = document.createElement("img");
        img.src = data.url;
        img.alt = altText || file.name.replace(/\.[^/.]+$/, "");
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.className = "rounded-lg";
        img.setAttribute("data-editable", "true"); // Mark as editable for alt text

        // Add click handler to edit alt text
        img.addEventListener("click", (e) => {
          e.preventDefault();
          const currentAlt = img.alt || "";
          const newAlt = prompt("Edit image alt text:", currentAlt);
          if (newAlt !== null) {
            img.alt = newAlt;
            handleInput();
          }
        });

        // Add title attribute for better UX
        img.title = "Click to edit alt text";

        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.insertNode(img);
          
          // Move cursor after image
          range.setStartAfter(img);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          // No selection, append to end
          editorRef.current.appendChild(img);
        }

        handleInput();
        toast.dismiss();
        toast.success("Image uploaded successfully!");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.dismiss();
      toast.error(error.message || "Failed to upload image");
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const insertImage = () => {
    // Trigger file input click
    fileInputRef.current?.click();
  };

  const insertReadMore = () => {
    if (!editorRef.current) return;
    
    const readMore = document.createElement("hr");
    readMore.className = "read-more-separator";
    readMore.setAttribute("data-read-more", "true");
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.insertNode(readMore);
      range.setStartAfter(readMore);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // Insert at end if no selection
      editorRef.current.appendChild(readMore);
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    
    handleInput();
  };

  const handleBlockFormatChange = (format: string) => {
    if (!editorRef.current) return;
    
    setBlockFormat(format);
    editorRef.current.focus();
    
    if (format === "paragraph") {
      execCommand("formatBlock", "p");
    } else if (format === "pre") {
      execCommand("formatBlock", "pre");
    } else if (format === "blockquote") {
      execCommand("formatBlock", "blockquote");
    } else {
      // For headings, use formatBlock with the heading tag
      execCommand("formatBlock", format);
    }
    
    // Update block format after change
    setTimeout(() => {
      checkActiveFormats();
    }, 100);
  };

  const handleModeChange = (newMode: "visual" | "text") => {
    if (newMode === "text") {
      // Convert HTML to text - strip HTML tags but preserve line breaks
      if (editorRef.current) {
        const html = editorRef.current.innerHTML || value;
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        // Convert block elements to line breaks
        const blockElements = tempDiv.querySelectorAll("p, div, h1, h2, h3, h4, h5, h6, li");
        blockElements.forEach((el) => {
          const br = document.createElement("br");
          el.parentNode?.insertBefore(br, el);
        });
        const plainText = tempDiv.textContent || tempDiv.innerText || "";
        setTextValue(plainText);
      } else {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = value || "";
        const plainText = tempDiv.textContent || tempDiv.innerText || "";
        setTextValue(plainText);
      }
    } else {
      // Convert text to HTML (preserve line breaks)
      const html = textValue
        .split("\n")
        .map((line) => line.trim() ? `<p>${line}</p>` : "<p><br></p>")
        .join("");
      onChange(html);
      if (editorRef.current) {
        editorRef.current.innerHTML = html;
        // Update empty state
        setIsEmpty(textValue.trim() === "");
      }
    }
    setMode(newMode);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`border-2 rounded-lg overflow-hidden bg-background ${isFullscreen ? "fixed inset-4 z-50 shadow-2xl" : ""}`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2">
        {/* Add Media Button */}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={insertImage}
            className="h-8 gap-2 text-sm"
          >
            <div className="flex items-center gap-1">
              <Upload className="h-4 w-4" />
              <ImageIcon className="h-3 w-3" />
            </div>
            <span>Add Media</span>
          </Button>
        </div>

        {/* Visual/Text Tabs */}
        <div className="flex items-center gap-1 border rounded-md p-0.5 bg-background">
          <button
            type="button"
            onClick={() => handleModeChange("visual")}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              mode === "visual"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("text")}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              mode === "text"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Text
          </button>
        </div>
      </div>

      {mode === "visual" ? (
        <>
          {/* Formatting Toolbar */}
          <div className="flex flex-wrap items-center gap-1 p-2 pb-4 border-b bg-muted/20">
            {/* Block Format Dropdown */}
            <Select
              value={blockFormat}
              onChange={(e) => handleBlockFormatChange(e.target.value)}
              className="h-8 w-32 text-sm"
            >
              <option value="paragraph">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
              <option value="h5">Heading 5</option>
              <option value="h6">Heading 6</option>
              <option value="blockquote">Quote</option>
              <option value="pre">Preformatted</option>
            </Select>

            <div className="h-6 w-px bg-border mx-1" />

            {/* Font Size Dropdown */}
            <Select
              value={fontSize}
              onChange={(e) => changeFontSize(e.target.value)}
              className="h-8 w-20 text-sm"
              title="Font Size"
            >
              <option value="10px">10px</option>
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
              <option value="28px">28px</option>
              <option value="32px">32px</option>
              <option value="36px">36px</option>
              <option value="48px">48px</option>
            </Select>

            <div className="h-6 w-px bg-border mx-1" />

            {/* Text Formatting */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => execCommand("bold")}
              className={`h-8 w-8 p-0 ${activeFormats.bold ? "bg-primary/20 text-primary" : ""}`}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => execCommand("italic")}
              className={`h-8 w-8 p-0 ${activeFormats.italic ? "bg-primary/20 text-primary" : ""}`}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>

            <div className="h-6 w-px bg-border mx-1" />

            {/* Lists */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                execCommand("insertUnorderedList");
              }}
              className={`h-8 w-8 p-0 ${activeFormats.unorderedList ? "bg-primary/20 text-primary" : ""}`}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                execCommand("insertOrderedList");
              }}
              className={`h-8 w-8 p-0 ${activeFormats.orderedList ? "bg-primary/20 text-primary" : ""}`}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>

            <div className="h-6 w-px bg-border mx-1" />

            {/* Blockquote */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => execCommand("formatBlock", "blockquote")}
              className={`h-8 w-8 p-0 ${activeFormats.blockquote ? "bg-primary/20 text-primary" : ""}`}
              title="Blockquote"
            >
              <Quote className="h-4 w-4" />
            </Button>

            <div className="h-6 w-px bg-border mx-1" />

            {/* Alignment */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => execCommand("justifyLeft")}
              className={`h-8 w-8 p-0 ${activeFormats.justifyLeft ? "bg-primary/20 text-primary" : ""}`}
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => execCommand("justifyCenter")}
              className={`h-8 w-8 p-0 ${activeFormats.justifyCenter ? "bg-primary/20 text-primary" : ""}`}
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => execCommand("justifyRight")}
              className={`h-8 w-8 p-0 ${activeFormats.justifyRight ? "bg-primary/20 text-primary" : ""}`}
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </Button>

            <div className="h-6 w-px bg-border mx-1" />

            {/* Link */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={insertLink}
              className={`h-8 w-8 p-0 ${activeFormats.link ? "bg-primary/20 text-primary" : ""}`}
              title="Insert Link"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeLink}
              className={`h-8 w-8 p-0 ${activeFormats.link ? "bg-primary/20 text-primary" : ""}`}
              title="Unlink"
            >
              <Unlink className="h-4 w-4" />
            </Button>

            <div className="h-6 w-px bg-border mx-1" />

            {/* Read More */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={insertReadMore}
              className="h-8 w-8 p-0"
              title="Insert Read More"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <div className="flex-1" />

            {/* Preview Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(true)}
              className="h-8 gap-1.5 px-2 text-sm"
              title="Preview"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </Button>

            {/* Fullscreen Toggle */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 w-8 p-0"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Editor */}
          <div className="relative">
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              onClick={checkActiveFormats}
              onKeyUp={checkActiveFormats}
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData("text/plain");
                document.execCommand("insertText", false, text);
                handleInput();
              }}
              className="min-h-[300px] sm:min-h-[400px] md:min-h-[500px] p-4 focus:outline-none text-foreground bg-background prose prose-sm dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2 prose-headings:text-foreground
                prose-p:my-2 prose-p:leading-relaxed prose-p:text-foreground
                prose-ul:my-2 prose-ol:my-2 prose-ul:text-foreground prose-ol:text-foreground
                prose-li:my-1 prose-li:text-foreground
                [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2 [&_ul]:space-y-1 [&_ul]:text-foreground
                [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2 [&_ol]:space-y-1 [&_ol]:text-foreground
                [&_li]:ml-2 [&_li]:text-foreground [&_li]:list-item
                prose-a:text-primary prose-a:underline
                prose-strong:font-bold prose-strong:text-foreground
                prose-em:italic prose-em:text-foreground
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-foreground
                prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-foreground
                prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded prose-pre:overflow-x-auto prose-pre:text-foreground
                prose-img:rounded-lg prose-img:max-w-full
                [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4 [&_h1]:text-foreground
                [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-3 [&_h2]:text-foreground
                [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-foreground
                [&_h4]:text-lg [&_h4]:font-bold [&_h4]:mt-3 [&_h4]:mb-2 [&_h4]:text-foreground
                [&_h5]:text-base [&_h5]:font-bold [&_h5]:mt-3 [&_h5]:mb-2 [&_h5]:text-foreground
                [&_h6]:text-sm [&_h6]:font-bold [&_h6]:mt-2 [&_h6]:mb-2 [&_h6]:text-foreground
                [&_p]:text-base [&_p]:leading-relaxed [&_p]:my-2 [&_p]:text-foreground
                [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-foreground [&_blockquote]:my-4"
              style={{ whiteSpace: "pre-wrap" }}
            />
            {isEmpty && (
              <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none text-sm sm:text-base">
                {placeholder}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Text Mode */
        <textarea
          value={textValue}
          onChange={(e) => {
            setTextValue(e.target.value);
            // Convert text to HTML preserving line breaks
            const html = e.target.value
              .split("\n")
              .map((line) => line.trim() ? `<p>${line}</p>` : "<p><br></p>")
              .join("");
            onChange(html);
          }}
          className="w-full min-h-[300px] sm:min-h-[400px] md:min-h-[500px] p-4 font-mono text-sm text-foreground bg-background border-0 focus:outline-none resize-none"
          placeholder={placeholder}
        />
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full h-full max-w-4xl max-h-[90vh] bg-background rounded-lg shadow-2xl flex flex-col m-4">
            {/* Preview Header */}
            <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/30">
              <h2 className="text-lg font-semibold">Article Preview</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <article className="max-w-3xl mx-auto prose prose-sm sm:prose-base dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:text-foreground
                prose-h1:text-4xl prose-h1:mt-12 prose-h1:mb-6 prose-h1:pb-3 prose-h1:border-b-2 prose-h1:border-primary/20
                prose-h2:text-2xl sm:prose-h2:text-3xl lg:prose-h2:text-4xl prose-h2:mt-10 prose-h2:mb-5 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-h4:text-xl prose-h4:mt-6 prose-h4:mb-3
                prose-p:text-base prose-p:leading-[1.8] prose-p:mb-6 prose-p:text-foreground
                prose-ul:space-y-3 prose-ul:list-disc prose-ul:ml-6 prose-ul:text-foreground
                prose-ol:space-y-3 prose-ol:list-decimal prose-ol:ml-6 prose-ol:text-foreground
                prose-li:text-foreground
                prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-a:transition-all
                prose-strong:text-foreground prose-strong:font-bold
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-foreground prose-blockquote:my-4
                prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-foreground
                prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded prose-pre:overflow-x-auto prose-pre:text-foreground
                prose-img:rounded-lg prose-img:max-w-full prose-img:my-6
                [&_hr]:my-10 [&_hr]:border-border">
                <div dangerouslySetInnerHTML={{ __html: value || "" }} />
              </article>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
