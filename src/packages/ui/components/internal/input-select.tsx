'use client';
import { useEffect, useState } from 'react';
import { Input } from '../input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';

type Props = {
  options: string[];
  onChange: (value: any) => void;
};

export function InputSelect({ onChange, options }: Props) {
  const [value, setValue] = useState('');
  const [other, setOther] = useState('');

  useEffect(() => {
    onChange(`${value}-${other}`);
  }, [value, other]);

  return (
    <div className="space-y-2">
      <div className="flex ">
        <Input
          className="-me-px rounded-none shadow-none focus-visible:z-10 flex-1 focus-visible:outline-none focus-visible:ring-0"
          placeholder=""
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Select onValueChange={(v) => setOther(v)} value={other} defaultValue={options[0]}>
          <SelectTrigger className="outline-none rounded-none shadow-none focus-visible:z-10 w-fit gap-2">
            <SelectValue className=""></SelectValue>
          </SelectTrigger>
          <SelectContent className="rounded-none">
            {options.map((option, index) => (
              <SelectItem key={index} value={option} className="rounded-none">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
