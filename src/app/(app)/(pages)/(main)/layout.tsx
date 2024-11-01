import { SidebarProvider } from '@/libs/shadcn-ui/components/sidebar';
import { getCurrentUser } from '@/modules/user/presentation/actions/get-current-user';
import { currentUser } from '@clerk/nextjs/server';
import SideBar from '../../components/shared/side-bar/side-bar';
import TopBar from '../../components/shared/top-bar/top-bar';

const Layout = async ({ children }) => {
  const { role } = await getCurrentUser();
  const user = await currentUser()
  return (
    <div className="flex justify-start items-start w-full">
      <SidebarProvider>
        <SideBar role={role as string}/>
        <div className="flex flex-col items-start w-full">
          <TopBar />
          {children}
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
