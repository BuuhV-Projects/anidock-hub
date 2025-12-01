import React from 'react';
import { Input, Label, Badge } from '@anidock/shared-ui';
import { CheckCircle2, XCircle } from 'lucide-react';
import { TFunction } from 'i18next';

interface SelectorInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  count?: number;
  required?: boolean;
  t: TFunction;
}

export const SelectorInput: React.FC<SelectorInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  count,
  required,
  t,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor={id}>
          {label} {required && t('editDriver.required')}
        </Label>
        {count !== undefined && (
          <Badge variant={count > 0 ? "default" : "destructive"} className="gap-1">
            {count > 0 ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            {count} {t('createDriver.validation.elementsFound')}
          </Badge>
        )}
      </div>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};
