'use client';
import { useAssistantStore } from '@/src/store/assistant-store';
import { Dialog, DialogContent, DialogTitle } from '@helsa/ui/components/dialog';
import { useHotkeys } from 'react-hotkeys-hook';
import Assistant from '.';
const ModalAssistant = () => {
  const { isOpen, setOpen } = useAssistantStore();
  useHotkeys('ctrl+i', (evt) => {
    evt.preventDefault();
    setOpen();
  });
  return (
    <Dialog open={isOpen} onOpenChange={setOpen as any}>
      <DialogContent className="overflow-hidden p-0 max-w-full w-full h-full md:max-w-[60%] md:h-[600px] m-0 select-text focus-visible:outline-none focus-visible:ring-0">
        <DialogTitle className="hidden"></DialogTitle>
        <Assistant />
      </DialogContent>
    </Dialog>
  );
};

export default ModalAssistant;
