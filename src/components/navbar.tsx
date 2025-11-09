"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  GraduationCap,
  Menu,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  FileText,
  Video,
  Building2,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { signOut } from "@/actions/auth.actions";

// Navigation items for different user states
const publicNavigationItems = [
  {
    name: "Home",
    href: "/",
    icon: GraduationCap,
  },
];

const authenticatedNavigationItems = [
  {
    name: "Home",
    href: "/",
    icon: GraduationCap,
  },
  {
    name: "Student Documents",
    href: "/interview-experiences",
    icon: FileText,
    description: "Experiences shared by placed students",
  },
  {
    name: "Interview Sessions",
    href: "/interview-experiences/youtube",
    icon: Video,
    description: "Recorded by placement cell",
  },
  {
    name: "Companies",
    href: "/companies",
    icon: Building2,
  },
];

const adminNavigationItems = [
  {
    name: "Home",
    href: "/",
    icon: GraduationCap,
  },
  {
    name: "Admin Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Student Documents",
    href: "/interview-experiences",
    icon: FileText,
    description: "Experiences shared by placed students",
  },
  {
    name: "Interview Sessions",
    href: "/interview-experiences/youtube",
    icon: Video,
    description: "Recorded by placement cell",
  },
  {
    name: "Companies",
    href: "/companies",
    icon: Building2,
  },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { user, role, profileData, isLoading, isAdmin } = useAuth();

  // ✅ Fix hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Debug logging
  useEffect(() => {
    console.log("🔍 Navbar Debug:", {
      isLoading,
      hasUser: !!user,
      role,
      profileData,
      mounted,
    });
  }, [isLoading, user, role, profileData, mounted]);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      const result = await signOut();

      if (result?.error) {
        console.error("Sign out error:", result.error);
      } else {
        // ✅ Refresh to update navbar, then redirect
        router.refresh();
        router.push("/");
      }
    } catch (error) {
      console.error("Unexpected sign out error:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const isActive = (href: string) => pathname === href;

  const navigationItems = isAdmin
    ? adminNavigationItems
    : user
    ? authenticatedNavigationItems
    : publicNavigationItems;

  const getUserInitials = () => {
    if (!profileData?.full_name) return "U";
    const names = profileData.full_name.split(" ");
    return names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  };

  // ✅ Show loading state only on initial mount
  if (!mounted || isLoading) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6" />
              <span className="font-bold text-lg">SahyadriPrep</span>
            </div>
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:inline">
              SahyadriPrep
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center gap-2">
            {/* Authenticated User - Desktop */}
            {user ? (
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full"
                      disabled={isSigningOut}
                    >
                      <Avatar>
                        <AvatarImage
                          src={profileData?.avatar_url}
                          alt={profileData?.full_name || "User"}
                        />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {profileData?.full_name || "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        {role && (
                          <p className="text-xs text-muted-foreground capitalize mt-1">
                            Role: {role.replace("_", " ")}
                          </p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => router.push("/profile")}
                      disabled={isSigningOut}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/settings")}
                      disabled={isSigningOut}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                    >
                      {isSigningOut ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="mr-2 h-4 w-4" />
                      )}
                      <span>
                        {isSigningOut ? "Signing out..." : "Sign out"}
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/auth/login")}
                >
                  Sign in
                </Button>
                <Button onClick={() => router.push("/auth/sign-up")}>
                  Sign up
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" disabled={isSigningOut}>
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex items-center gap-2 mb-8">
                  <GraduationCap className="h-6 w-6" />
                  <span className="font-bold text-lg">SahyadriPrep</span>
                </div>

                <div className="mt-8 flex flex-col gap-4">
                  {/* User Info - Mobile */}
                  {user ? (
                    <div className="flex items-center gap-3 rounded-lg border p-4">
                      <Avatar>
                        <AvatarImage
                          src={profileData?.avatar_url}
                          alt={profileData?.full_name || "User"}
                        />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1">
                        <p className="text-sm font-medium">
                          {profileData?.full_name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                        {role && (
                          <p className="text-xs text-muted-foreground capitalize mt-1">
                            {role.replace("_", " ")}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => {
                          router.push("/auth/login");
                          setIsOpen(false);
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Sign in
                      </Button>
                      <Button
                        onClick={() => {
                          router.push("/auth/sign-up");
                          setIsOpen(false);
                        }}
                        className="w-full"
                      >
                        Sign up
                      </Button>
                    </div>
                  )}

                  {/* Navigation - Mobile */}
                  <div className="flex flex-col gap-2 mt-4">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.href}
                          variant={isActive(item.href) ? "default" : "ghost"}
                          className="justify-start gap-2"
                          onClick={() => {
                            router.push(item.href);
                            setIsOpen(false);
                          }}
                          disabled={isSigningOut}
                        >
                          <Icon className="h-4 w-4" />
                          {item.name}
                        </Button>
                      );
                    })}
                  </div>

                  {/* User Actions - Mobile */}
                  {user && (
                    <>
                      <div className="border-t my-4" />
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          className="justify-start gap-2"
                          onClick={() => {
                            router.push("/profile");
                            setIsOpen(false);
                          }}
                          disabled={isSigningOut}
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start gap-2"
                          onClick={() => {
                            router.push("/settings");
                            setIsOpen(false);
                          }}
                          disabled={isSigningOut}
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start gap-2 text-destructive"
                          onClick={handleSignOut}
                          disabled={isSigningOut}
                        >
                          {isSigningOut ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <LogOut className="h-4 w-4" />
                          )}
                          {isSigningOut ? "Signing out..." : "Sign out"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
