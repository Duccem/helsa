"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/modules/shared/presentation/components/ui/avatar";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/modules/shared/presentation/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/modules/shared/presentation/components/ui/sidebar";
import { authClient } from "@/modules/auth/infrastructure/auth-client";
import { BadgeCheck, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const Header = () => {
  return (
    <header className="w-full h-16  flex items-center justify-between ">
      <SidebarTrigger className="" />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserButton />
      </div>
    </header>
  );
};

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  return (
    <Button size={"icon"} variant={"outline"} onClick={toggleTheme} className="cursor-pointer">
      <Moon className="hidden dark:block" />
      <Sun className="dark:hidden" />
    </Button>
  );
};

const UserButton = () => {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const logOut = async () => {
    await authClient.signOut();
    router.replace("/sign-in" as any);
  };

  if (isPending || !session) {
    return (
      <Button
        size="icon"
        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-none"
      >
        <Avatar className="h-7 w-7">
          <AvatarFallback className="rounded-none bg-transparent">CN</AvatarFallback>
        </Avatar>
      </Button>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size="icon" variant={"outline"} className={"overflow-hidden cursor-pointer"}>
            <Avatar className="h-7 w-7 border-none rounded-md after:border-none">
              <AvatarImage src={session?.user.image ?? ""} alt={session?.user.name} className="object-contain" />
              <AvatarFallback className="rounded-md">
                {session?.user.name.split(" ").map((c) => c.at(0)?.toUpperCase())}
              </AvatarFallback>
            </Avatar>
          </Button>
        }
      ></DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 "
        side={"bottom"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-none">
                <AvatarImage src={session?.user.image ?? ""} alt={session?.user.name} className="object-contain" />
                <AvatarFallback className="">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{session?.user.name}</span>
                <span className="truncate text-xs">{session?.user.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link href={"/profile" as any} className="flex items-center w-full gap-2">
              <BadgeCheck />
              Account
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logOut}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

