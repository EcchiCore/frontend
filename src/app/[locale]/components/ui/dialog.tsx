import React, { ReactNode, MouseEvent } from 'react';

interface BaseDialogProps {
  children: ReactNode;
  className?: string;
}

interface DialogCloseProps {
  className?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  children?: ReactNode;
  asChild?: boolean;
}

interface DialogProps extends BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Dialog: React.FC<DialogProps> = ({
                                                open,
                                                onOpenChange,
                                                children,

                                              }) => {
  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  );
};

export const DialogContent: React.FC<BaseDialogProps> = ({
                                                           children,
                                                           className = "",
                                                         }) => (
  <div
    className={`bg-gray-800 text-gray-100 border-gray-700 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative ${className}`}
    onClick={(e) => e.stopPropagation()}
  >
    {children}
  </div>
);

export const DialogHeader: React.FC<BaseDialogProps> = ({
                                                          children,
                                                          className = "",
                                                        }) => <div className={`mb-4 ${className}`}>{children}</div>;

export const DialogTitle: React.FC<BaseDialogProps> = ({
                                                         children,
                                                         className = "",
                                                       }) => <h2 className={`text-2xl font-bold text-gray-100 ${className}`}>{children}</h2>;

export const DialogClose: React.FC<DialogCloseProps> = ({
                                                          className = '',
                                                          onClick,
                                                          children,
                                                          asChild,
                                                        }) => {
  // If asChild is true and children is a valid React element, clone it with merged props
  if (asChild && React.isValidElement<{ className?: string; onClick?: (event: MouseEvent<HTMLElement>) => void; 'aria-label'?: string }>(children)) {
    return React.cloneElement(children, {
      ...children.props,
      onClick: (event: MouseEvent<HTMLElement>) => {
        // Call the child's onClick if it exists
        if (children.props.onClick) {
          children.props.onClick(event);
        }
        // Call the passed onClick if it exists
        if (onClick) {
          onClick(event);
        }
      },
      className: `${children.props.className || ''} ${className}`.trim(),
      'aria-label': children.props['aria-label'] || 'Close dialog',
    });
  }

  // Default rendering as a button with gray theme
  return (
    <button
      className={`text-gray-300 hover:text-gray-100 hover:bg-gray-700 rounded p-1 ${className}`}
      onClick={onClick}
      aria-label="Close dialog"
    >
      {children || '×'}
    </button>
  );
};