import { AppointmentTypes } from '@/src/components/dashboard/doctor/appointment-types';
import PatientsTable from '@/src/components/dashboard/doctor/patients-table';
import { Revenue } from '@/src/components/dashboard/doctor/revenue';
import { UpcomingAppointments } from '@/src/components/dashboard/doctor/upcoming-appointments';
import { Card, CardContent, CardHeader, CardTitle } from '@helsa/ui/components/card';
import { DateRangePicker } from '@helsa/ui/components/date-range-picker';
import { Calendar, DollarSign, Stethoscope, Users } from 'lucide-react';

const Page = () => {
  return (
    <div className="md:pl-9 w-full h-full">
      <div className="h-full flex justify-between items-center max-sm:flex-col mb-3">
        <div className="flex justify-start flex-col w-full h-full pt-5 pr-9 gap-5">
          <div className="w-full flex justify-between items-center gap-4">
            <p className="text-lg font-semibold">Welcome Back, Dr José Véliz</p>
            <DateRangePicker />
          </div>

          <div className="w-full flex-col gap-2 flex">
            <p className="text-lg font-semibold mb-5">Indicadores</p>
            <div className="flex justify-between items-center gap-4">
              <Card className="rounded-none w-1/4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ganancia total</CardTitle>
                  <DollarSign />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$3000,00</div>
                  <p className="text-xs text-muted-foreground">+20.1% del mes pasado</p>
                </CardContent>
              </Card>
              <Card className="rounded-none w-1/4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Promedio de pacients</CardTitle>
                  <Users />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">46</div>
                  <p className="text-xs text-muted-foreground">-16.4% del mes pasado</p>
                </CardContent>
              </Card>
              <Card className="rounded-none w-1/4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Promedio de edad</CardTitle>
                  <Calendar />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">33</div>
                  <p className="text-xs text-muted-foreground">Por debajo de los 40</p>
                </CardContent>
              </Card>
              <Card className="rounded-none w-1/4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tipos de consulta</CardTitle>
                  <Stethoscope />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Revision</div>
                  <p className="text-xs text-muted-foreground">Pacientes</p>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="w-full grid grid-cols-2 max-sm:grid-cols-1 gap-4 mb-5">
            <AppointmentTypes />
            <Revenue />
          </div>
          <PatientsTable />
        </div>
        <div className="max-sm:w-full border-l px-3 h-full justify-center">
          <UpcomingAppointments />
        </div>
      </div>
    </div>
  );
};

export default Page;
