import React from "react";

interface TextAreaProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    rows?: number;
    maxLength?: number;
    disabled?: boolean;
    className?: string;
  }
  
  const TextArea: React.FC<TextAreaProps> = ({ 
    value, 
    onChange, 
    placeholder = 'Write something...', 
    rows = 4,
    maxLength,
    disabled = false,
    className = ''
  }) => {
    const characterCount = value.length;
  
    return (
      <div className="w-full">
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          className={`w-full p-3 bg-gray-700 text-white rounded-lg 
            border border-gray-600 focus:border-green-500 focus:ring-1 
            focus:ring-green-500 outline-none resize-none
            placeholder-gray-400 disabled:opacity-50 
            disabled:cursor-not-allowed ${className}`}
        />
        {maxLength && (
          <div className="text-right text-sm text-gray-400 mt-1">
            {characterCount}/{maxLength}
          </div>
        )}
      </div>
    );
  };
  
  export default TextArea;