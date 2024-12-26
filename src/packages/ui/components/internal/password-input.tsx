'use client';
import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';
import { forwardRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../button';
import { Input, InputProps } from '../input';

interface PasswordInputProps extends InputProps {}
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }: PasswordInputProps, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const disabled = props.value === '' || props.value === undefined || props.disabled;
    return (
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          {...props}
          className={cn('hide-password-toggle pr-10', className)}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() =>
            setShowPassword((prev) => {
              return !prev;
            })
          }
          disabled={disabled}
        >
          {showPassword && !disabled ? (
            <Eye className="h-4 w-4 " aria-hidden="true" />
          ) : (
            <EyeOff className="h-4 w-4 " aria-hidden="true" />
          )}
          <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
        </Button>
        <style>{`
					.hide-password-toggle::-ms-reveal,
					.hide-password-toggle::-ms-clear {
						visibility: hidden;
						pointer-events: none;
						display: none;
					}
				`}</style>
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
