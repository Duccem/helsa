import { generateUserToken } from '@/src/actions/appointment/generate-user-token';
import { getAppointment } from '@/src/actions/appointment/get-appointment';
import { getPathologies } from '@/src/actions/diagnostic/get-pathologies';
import { getCurrentUser } from '@/src/actions/user/get-current-user';
import Actions from '@/src/components/appointment/call/actions';
import Details from '@/src/components/appointment/call/details';
import DetailsDoctor from '@/src/components/appointment/call/details-doctor';
import { VideoCall } from '@/src/components/call';
import CallCHat from '@/src/components/call-chat';
import { UserRoleValue } from '@helsa/engine/user/domain/user-role';

const Page = async ({ params }: { params: { id: string } }) => {
  const [response, tokenResponse, user, pathologies] = await Promise.all([
    getAppointment({ appointmentId: params.id }),
    generateUserToken(),
    getCurrentUser(),
    getPathologies(),
  ]);
  const appointment = response?.data!;

  return (
    <div className="w-full h-full flex flex-col justify-between px-5" defaultValue="chat" suppressHydrationWarning>
      <div className="w-full grid grid-cols-2 gap-3 max-md:grid-cols-1">
        <div>
          <h1 className="text-3xl font-bold">Consulta con</h1>
          <p className="text-lg capitalize">
            {user?.data?.role === UserRoleValue.PATIENT
              ? `Dr. ${appointment.doctor?.user?.name}`
              : appointment.patient?.user?.name!}
          </p>
        </div>
        <div className="p-0 bg-transparent items-center justify-end  hover:bg-transparent flex h-full gap-3">
          {user?.data?.role === UserRoleValue.PATIENT && <DetailsDoctor data={appointment} />}
          {user?.data?.role === UserRoleValue.DOCTOR && <Details data={appointment} />}
          {user?.data?.role === UserRoleValue.DOCTOR && (
            <Actions data={appointment} pathologies={pathologies?.data ?? []} />
          )}
        </div>
      </div>
      <div className="w-full h-full box-border grid grid-cols-8 max-md:grid-cols-1 py-5  gap-4">
        <div className="flex flex-col gap-2 col-span-6 h-full box-border max-md:col-span-1">
          <div className=" h-full flex-col flex gap-2 border">
            <VideoCall id={params.id} token={tokenResponse?.data ?? ''} user={user?.data!} />
          </div>
        </div>
        <div className="col-span-2 mt-0 h-full border box-border flex-col justify-end flex gap-2 max-md:col-span-1">
          <CallCHat id={params.id} user={user?.data!} />
        </div>
      </div>
    </div>
  );
};

export default Page;
