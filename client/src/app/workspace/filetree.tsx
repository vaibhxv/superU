'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';

interface FileTreeProps {
  tree: Record<string, any>;
  onSelectFile: (fileKey: string) => void;
  selectedFile: string | null;
}

const TreeNode: React.FC<{
  name: string;
  depth: number;
  isLeaf: boolean;
  isSelected: boolean;
  children?: React.ReactNode;
  onSelect: () => void;
}> = ({ name, depth, isLeaf, isSelected, children, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = (e: React.MouseEvent) => {
    if (!isLeaf) {
      e.stopPropagation();
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div>
      <div 
        className={`
          flex items-center 
          cursor-pointer 
          hover:bg-gray-100 
          transition-colors 
          duration-200 
          ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
          pl-${depth * 4}
        `}
        onClick={onSelect}
      >
        {!isLeaf ? (
          <div 
            onClick={toggleExpand} 
            className="mr-1 flex items-center justify-center"
          >
            {isExpanded ? (
              <ChevronDown 
                className="text-gray-500 flex-shrink-0" 
                size={16} 
              />
            ) : (
              <ChevronRight 
                className="text-gray-500 flex-shrink-0" 
                size={16} 
              />
            )}
          </div>
        ) : (
          <div className="w-4 mr-1"></div> // Spacer for alignment
        )}
        
        {isLeaf ? (
          <File 
            className={`
              mr-2 
              ${isSelected ? 'text-blue-500' : 'text-gray-500'}
            `} 
            size={16} 
          />
        ) : (
          <Folder 
            className={`
              mr-2 
              ${isSelected ? 'text-blue-500' : 'text-gray-400'}
            `} 
            size={16} 
          />
        )}
        
        <span 
          className={`
            text-sm 
            ${isSelected ? 'font-semibold text-blue-700' : 'text-gray-700'}
          `}
        >
          {name}
        </span>
      </div>

      {!isLeaf && isExpanded && children && (
        <div className="pl-4 border-l border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

const renderTree = (
  node: Record<string, any>, 
  depth = 0, 
  onSelectFile: (fileKey: string) => void,
  selectedFile: string | null
) => {
  return Object.entries(node).map(([key, value], index) => {
    const uniqueKey = `${depth}-${key}-${index}`;

    // Nested object (directory)
    if (typeof value === 'object' && value !== null) {
      return (
        <TreeNode
          key={uniqueKey}
          name={key}
          depth={depth}
          isLeaf={false}
          isSelected={false}
          onSelect={() => {}}
        >
          {renderTree(value, depth + 1, onSelectFile, selectedFile)}
        </TreeNode>
      );
    }
    
    // Leaf node (file)
    return (
      <TreeNode
        key={`file-${uniqueKey}`}
        name={key}
        depth={depth}
        isLeaf={true}
        isSelected={selectedFile === value}
        onSelect={() => onSelectFile(value)}
      />
    );
  });
};

export const FileTree: React.FC<FileTreeProps> = ({ 
  tree, 
  onSelectFile, 
  selectedFile 
}) => {
  return (
    <div className="p-2 h-full overflow-y-auto bg-white border-r">
      <div className="flex items-center mb-3 pl-2">
        <Folder className="mr-2 text-gray-500" size={20} />
        <h3 className="text-lg font-semibold text-gray-700">
          Website Structure
        </h3>
      </div>

      {Object.keys(tree).length > 0 ? (
        <div className="space-y-1">
          {renderTree(tree, 0, onSelectFile, selectedFile)}
        </div>
      ) : (
        <div className="text-center text-gray-500 italic p-4">
          No websites scraped yet
        </div>
      )}
    </div>
  );
};