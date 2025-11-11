// components/text-editor.tsx
'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  Smile,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface TextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const EMOJIS = ['😀', '😂', '😍', '😊', '🤔', '🎉', '❤️', '🔥', '⭐', '📚', '🚀', '💡', '👍', '👎', '🙏'];

export function TextEditor({ 
  value = '', 
  onChange, 
  placeholder = 'Start typing your content here...',
  className = ''
}: TextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Save selection when editor loses focus
  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
      return selection.getRangeAt(0);
    }
    return null;
  }, []);

  // Restore selection
  const restoreSelection = useCallback((savedRange: Range | null) => {
    if (savedRange && editorRef.current) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(savedRange);
    }
  }, []);

  const executeCommand = useCallback((command: string, value: string = '') => {
    // Save current selection
    const savedRange = saveSelection();
    
    // Focus editor and execute command
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    
    // Restore selection
    if (savedRange) {
      restoreSelection(savedRange);
    }
    
    updateContent();
  }, [saveSelection, restoreSelection]);

  const updateContent = useCallback(() => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    
    // Save selection before paste
    const savedRange = saveSelection();
    
    document.execCommand('insertText', false, text);
    
    // Restore and adjust selection
    if (savedRange) {
      restoreSelection(savedRange);
    }
    
    updateContent();
  }, [saveSelection, restoreSelection, updateContent]);

  const handleInput = useCallback(() => {
    updateContent();
  }, [updateContent]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Only set initial content once on mount
  useEffect(() => {
    if (editorRef.current && !isFocused && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || placeholder;
    }
  }, [value, placeholder, isFocused]);

  const insertLink = useCallback(() => {
    const selection = window.getSelection();
    if (!selection?.toString().trim()) {
      alert('Please select text to create a link');
      return;
    }

    if (linkUrl) {
      executeCommand('createLink', linkUrl);
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  }, [linkUrl, executeCommand]);

  const insertEmoji = useCallback((emoji: string) => {
    executeCommand('insertText', emoji);
  }, [executeCommand]);

  const isCommandActive = useCallback((command: string) => {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  }, []);

  // Clear placeholder on first focus
  const handleFirstFocus = useCallback(() => {
    if (editorRef.current?.innerHTML === placeholder) {
      editorRef.current.innerHTML = '';
    }
  }, [placeholder]);

  const toolbarButtons = [
    {
      command: 'bold',
      icon: Bold,
      title: 'Bold',
      active: isCommandActive('bold')
    },
    {
      command: 'italic',
      icon: Italic,
      title: 'Italic',
      active: isCommandActive('italic')
    },
    {
      command: 'underline',
      icon: Underline,
      title: 'Underline',
      active: isCommandActive('underline')
    },
  ];

  const alignmentButtons = [
    { command: 'justifyLeft', icon: AlignLeft, title: 'Align Left' },
    { command: 'justifyCenter', icon: AlignCenter, title: 'Align Center' },
    { command: 'justifyRight', icon: AlignRight, title: 'Align Right' },
    { command: 'justifyFull', icon: AlignJustify, title: 'Justify' },
  ];

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-white border-b p-2 flex flex-wrap items-center gap-1">
        {/* Text Formatting */}
        <div className="flex items-center border-r pr-2 mr-2">
          {toolbarButtons.map(({ command, icon: Icon, title, active }) => (
            <Button
              key={command}
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => executeCommand(command)}
              className={`h-8 w-8 p-0 ${active ? 'bg-gray-200' : ''}`}
              title={title}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        {/* Lists */}
        <div className="flex items-center border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className="h-8 w-8 p-0"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className="h-8 w-8 p-0"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        {/* Alignment */}
        <div className="flex items-center border-r pr-2 mr-2">
          {alignmentButtons.map(({ command, icon: Icon, title }) => (
            <Button
              key={command}
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => executeCommand(command)}
              className="h-8 w-8 p-0"
              title={title}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        {/* Link Dialog */}
        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="h-8 w-8 p-0"
              title="Insert Link"
            >
              <Link className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Insert Link</DialogTitle>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <Input
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && insertLink()}
              />
              <Button onClick={insertLink} type="button">
                Insert
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Emoji Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="h-8 w-8 p-0"
              title="Insert Emoji"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="grid grid-cols-6 gap-1">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="flex items-center justify-center h-8 w-8 rounded hover:bg-gray-100 transition-colors"
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[300px] p-4 outline-none prose max-w-none bg-[#F5F5F5]"
        onPaste={handlePaste}
        onInput={handleInput}
        onFocus={() => {
          handleFirstFocus();
          handleFocus();
        }}
        onBlur={handleBlur}
        suppressContentEditableWarning={true}
        style={{ 
          fontFamily: 'inherit',
          lineHeight: '1.6'
        }}
      />
    </div>
  );
}