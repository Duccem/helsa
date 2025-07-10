import { Button } from '@helsa/ui/components/button';
import { cn } from '@helsa/ui/lib/utils';
import { useClickAway } from '@uidotdev/usehooks';
import { Sidebar } from 'lucide-react';
import { SidebarItems } from './sidebar-items';
import { Toolbar } from './toolbar';

type Props = {
  isExpanded: boolean;
  chatId?: string;
  setExpanded: (value: boolean) => void;
  onSelect: (id: string) => void;
  onNewChat: () => void;
};

export function SidebarList({ isExpanded, chatId, setExpanded, onSelect, onNewChat }: Props) {
  const ref = useClickAway(() => {
    setExpanded(false);
  });

  return (
    <div className="relative">
      <div
        ref={ref as any}
        className={cn(
          'w-[220px] h-screen md:h-[600px] bg-sidebar absolute -left-[220px] top-0 bottom-[1px] duration-200 ease-out transition-all border-border border-r-[1px] z-20 invisible',
          isExpanded && 'visible translate-x-full',
        )}
      >
        <div className="px-4 py-3 flex justify-between items-center border-border border-b-[1px]">
          <Button variant="outline" size="icon" className="size-8  p-0" onClick={() => setExpanded(false)}>
            <Sidebar width={18} />
          </Button>
        </div>
        <SidebarItems onSelect={onSelect} chatId={chatId} />
        <Toolbar onNewChat={onNewChat} />
      </div>
    </div>
  );
}
