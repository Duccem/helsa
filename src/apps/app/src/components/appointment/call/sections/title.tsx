'use client';
import { useSession } from '@/src/components/auth/session-provider';
import { Primitives } from '@helsa/ddd/types/primitives';
import { Appointment } from '@helsa/engine/appointment/domain/appointment';
import { UserRoleValue } from '@helsa/engine/user/domain/user-role';
import { Avatar, AvatarFallback, AvatarImage } from '@helsa/ui/components/avatar';
import { UserIcon } from 'lucide-react';

type Props = {
  appointment: Primitives<Appointment>;
};
const Title = ({ appointment }: Props) => {
  const { user } = useSession();
  return (
    <div>
      <h1 className="text-3xl font-bold">Consulta con</h1>
      <div className="flex flex-start items-center gap-2">
        <Avatar className="h-8 w-8 rounded-full">
          <AvatarImage
            src={
              user?.role.is(UserRoleValue.PATIENT) ? appointment.doctor?.user?.image : appointment.patient?.user?.image
            }
            alt={user.name.value}
            className="object-contain"
          />
          <AvatarFallback className="rounded-lg">
            <UserIcon className="size-4" />
          </AvatarFallback>
        </Avatar>
        <p className="text-lg capitalize">
          {user?.role.is(UserRoleValue.PATIENT)
            ? `Dr. ${appointment.doctor?.user?.name}`
            : appointment.patient?.user?.name!}
        </p>
      </div>
    </div>
  );
};

export default Title;
