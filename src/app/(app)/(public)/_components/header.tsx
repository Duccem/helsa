"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/modules/shared/presentation/components/ui/button";
import { ArrowRight, Menu, Moon, Sun } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/modules/shared/presentation/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/modules/shared/presentation/components/ui/sheet";
import { useTheme } from "next-themes";
import { authClient } from "@/modules/auth/infrastructure/auth-client";

const NAV_ITEMS: Array<{ href: string; label: string }> = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#for-doctors", label: "For professionals" },
  { href: "#for-clinics", label: "For clinics" },
  { href: "/blog", label: "Blog" },
];

export default function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const { data } = authClient.useSession();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={` top-0 z-40 w-full   transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
        isScrolled ? "sticky bg-background/70 backdrop-blur-md" : "absolute bg-transparent"
      }`}
    >
      <div className="flex h-16 items-center justify-between px-6 sm:px-12 py-12">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6 ">
          <Link href={"/" as any} aria-label="Helsa home" className="flex items-center gap-2">
            {/* Logo uses a subtle dark background so the white mark is visible on light theme */}
            <img src="/images/helsa-logo-complete-black.png" alt="Helsa" className=" h-4 md:h-8 dark:hidden" />
            <img src="/images/helsa-logo-complete-white.png" alt="Helsa" className=" h-4 md:h-8 dark:block hidden" />
          </Link>

          <div className="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                {NAV_ITEMS.map(({ href, label }) => (
                  <NavigationMenuItem key={href} className="rounded-2xl">
                    <NavigationMenuLink
                      render={
                        <Link
                          href={href as any}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {label}
                        </Link>
                      }
                      className="rounded-2xl"
                    />
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* Right: CTA + Mobile menu */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <Button
            type="button"
            size="icon"
            className="rounded-full relative"
            aria-label="Toggle theme"
            title="Toggle theme"
            onClick={toggleTheme}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          {data ? (
            <Link href={"/home" as any}>
              <Button size="lg" className="rounded-3xl group cursor-pointer">
                Dashboard
                <span className="inline-flex w-0 ml-0 overflow-hidden transition-all duration-200 group-hover:w-4 group-hover:ml-1">
                  <ArrowRight className="opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
                </span>
              </Button>
            </Link>
          ) : (
            <Link href={"/#cta" as any}>
              <Button size="lg" className="rounded-3xl group cursor-pointer">
                Try it free
                <span className="inline-flex w-0 ml-0 overflow-hidden transition-all duration-200 group-hover:w-4 group-hover:ml-1">
                  <ArrowRight className="opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
                </span>
              </Button>
            </Link>
          )}

          {/* Mobile Sheet Trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger
                render={
                  <Button className="rounded-full" size="icon" aria-label="Open menu">
                    <Menu />
                  </Button>
                }
              />
              <SheetContent side="left" className="p-0">
                <SheetHeader className="p-4">
                  <SheetTitle>
                    <Link href={"/" as any} aria-label="Helsa home" className="inline-flex items-center gap-2">
                      <img
                        src="/images/helsa-logo-complete-black.png"
                        alt="Helsa"
                        className=" h-4 md:h-8 dark:hidden"
                      />
                      <img
                        src="/images/helsa-logo-complete-white.png"
                        alt="Helsa"
                        className=" h-4 md:h-8 dark:block hidden"
                      />
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-1 px-2 py-2">
                  {NAV_ITEMS.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href as any}
                      className="rounded-md px-3 py-2 text-base text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {label}
                    </Link>
                  ))}
                  <div className="px-1 py-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={toggleTheme}
                    >
                      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 " />
                      <span>Toggle theme</span>
                    </Button>
                  </div>
                </nav>

                <SheetFooter className="p-4">
                  <Link href={"/app" as any}>
                    <Button className="w-full rounded-3xl group">
                      Try it free
                      <span className="inline-flex w-0 ml-0 overflow-hidden transition-all duration-200 group-hover:w-4 group-hover:ml-1">
                        <ArrowRight className="opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
                      </span>
                    </Button>
                  </Link>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

