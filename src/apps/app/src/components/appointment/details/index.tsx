import { Primitives } from '@helsa/ddd/types/primitives';
import { Appointment } from '@helsa/engine/appointment/domain/appointment';
import { AppointmentType } from '@helsa/engine/appointment/domain/appointment-type';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@helsa/ui/components/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@helsa/ui/components/avatar';
import { Badge } from '@helsa/ui/components/badge';
import { Button } from '@helsa/ui/components/button';
import { CopyInput } from '@helsa/ui/components/internal/copy-input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@helsa/ui/components/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@helsa/ui/components/tabs';
import { Textarea } from '@helsa/ui/components/textarea';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, ExternalLink, FileText, MapPin, Paperclip, Shapes, Stethoscope, StickyNote } from 'lucide-react';
import Link from 'next/link';
import { StateColumn } from '../table/columns';
import Cancel from './actions/cancel';
import Confirm from './actions/confirm';
import Enter from './actions/enter';
import Pay from './actions/pay';
import ReSchedule from './actions/re-schedule';
import Indications from './indications';

type Props = {
  setOpen: (open: boolean) => void;
  isOpen: boolean;
  data?: Primitives<Appointment>;
  types?: Primitives<AppointmentType>[];
};

const AppointmentDetailsSheet = ({ data, isOpen, setOpen, types }: Props) => {
  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="sm:w-1/3 sm:max-w-full p-4 bg-transparent border-none focus-visible:outline-none ">
        <div className="bg-background p-6 border border-sidebar h-full overflow-y-auto no-scroll space-y-5 rounded-xl">
          <SheetHeader className="flex flex-row justify-between items-center gap-4">
            <div className="flex flex-row justify-start items-center gap-4">
              <Avatar className="bg-secondary">
                <AvatarImage className="object-contain" src={data?.doctor?.user?.image} />
                <AvatarFallback>{data?.doctor?.user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-xl flex justify-start items-center">
                  {data?.doctor?.user?.name}{' '}
                  <Link href={`/book?id=${data?.doctor?.id}`} target="_blank">
                    <ExternalLink className="size-4 ml-3" />
                  </Link>{' '}
                </SheetTitle>
                <p className="text-xs text-muted-foreground">
                  {format(data?.date ?? new Date(), 'PPPp', { locale: es })}
                </p>
              </div>
            </div>
            <StateColumn state={data?.status ?? 'SCHEDULED'} />
          </SheetHeader>
          <div className="flex justify-start w-full items-center gap-3 border-b  pb-5 mt-7">
            {data?.status !== 'CANCELLED' && (
              <>
                <ReSchedule status={data?.status ?? ''} />
                <Confirm status={data?.status ?? ''} />
                <Enter id={data?.id ?? ''} status={data?.status ?? ''} />
                <Pay id={data?.id ?? ''} status={data?.status ?? ''} />
                <Cancel status={data?.status ?? ''} />
              </>
            )}
          </div>

          <Tabs defaultValue="general">
            <TabsList className="flex justify-start items-center gap-1 bg-transparent rounded-none">
              <TabsTrigger className="data-[state=active]:bg-secondary rounded-none" value="general">
                General
              </TabsTrigger>
              <TabsTrigger className="data-[state=active]:bg-secondary rounded-none" value="indications">
                Indicaciones
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <div className="space-y-3 px-1 border-b py-3">
                <p className="text-sm text-muted-foreground">{data?.motive ?? ''}</p>
                <div className="flex justify-start items-center gap-2">
                  {data?.symptoms?.map((symptom) => (
                    <Badge key={symptom.id} variant={'outline'}>
                      {symptom.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-3 px-1 border-b py-3">
                <div className="flex justify-between items-center gap">
                  <div className="flex items-center gap-2 text-sm font-light text-muted-foreground">
                    <Shapes className="size-4" />
                    Tipo de consulta
                  </div>
                  <div className="flex justify-start items-center gap-3">
                    <div className="size-3" style={{ backgroundColor: data?.type?.color }}></div>
                    <span className="">{data?.type?.name}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center gap">
                  <div className="flex items-center gap-2 text-sm font-light text-muted-foreground">
                    <Clock className="size-4" />
                    Hora
                  </div>
                  <span className="">{format(data?.date ?? new Date(), 'p')}</span>
                </div>
                <div className="flex justify-between items-center gap">
                  <div className="flex items-center gap-2 text-sm font-light text-muted-foreground">
                    <Stethoscope className="size-4" />
                    Especialidad
                  </div>
                  <span className="">{data?.doctor?.specialty?.name}</span>
                </div>
                <CopyInput value="https://helsa.com/appointment/call" />
                <Link href={'https://maps.google.com'} target="_blank" className="w-full">
                  <Button className="h-9 w-full mt-3 gap-2" variant={'outline'}>
                    Calle la sardina, Pampatar, Nueva Esparta
                    <MapPin className="size-4" />
                  </Button>
                </Link>
              </div>
              <Accordion type="multiple" defaultValue={['attachments']} className="w-full px-1">
                <AccordionItem value="attachments">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex justify-start items-center gap-2">
                      Archivos y adjuntos <Paperclip className="size-4" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-3">
                    <div className="flex justify-start items-center gap-2 text-muted-foreground">
                      <FileText className="size-4" />
                      <span>Archivo adjunto</span>
                      <span>130 KBs</span>
                    </div>
                    <div className="flex justify-start items-center gap-2 text-muted-foreground">
                      <FileText className="size-4" />
                      <span>Análisis de sangre</span>
                      <span>130 KBs</span>
                    </div>
                    <div className="flex justify-start items-center gap-2 text-muted-foreground">
                      <FileText className="size-4" />
                      <span>Archivo adjunto</span>
                      <span>130 KBs</span>
                    </div>
                    <Button className="w-full gap-3 h-9" variant={'secondary'}>
                      Adjuntar archivo <Paperclip className="size-4" />
                    </Button>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="notes">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex justify-start items-center gap-2">
                      Notas <StickyNote className="size-4" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-3">
                    <div className="flex justify-start items-center gap-2 text-muted-foreground">
                      <StickyNote className="size-4" />
                      <span>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</span>
                    </div>
                    <div className="flex justify-start items-center gap-2 text-muted-foreground">
                      <StickyNote className="size-4" />
                      <span>Temporibus molestias quibusdam accusantium magni numquam saepe!</span>
                    </div>
                    <Textarea
                      className="mt-2 rounded-none resize-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      placeholder="Escribe cualquier comentario"
                    ></Textarea>
                    <Button className="w-full gap-3 h-9" variant={'secondary'}>
                      Agregar nota <StickyNote className="size-4" />
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
            <TabsContent value="indications">
              <Indications data={data!} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AppointmentDetailsSheet;
