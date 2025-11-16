"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { toast } from "sonner";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { user, role, profileData, isLoading, isAdmin } = useAuth();

  // Get redirect param from current URL if present
  const redirectUrl = searchParams.get("redirect");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSigningOut(true);

    try {
      const result = await signOut();

      if (result?.error) {
        console.error("Sign out error:", result.error);
        toast.error("Failed to sign out");
      } else {
        toast.success("Signed out successfully");
        setDropdownOpen(false);
        setIsOpen(false); // ✅ Close mobile sheet
        router.push("/");
      }
    } catch (error) {
      console.error("Unexpected sign out error:", error);
      toast.error("An unexpected error occurred");
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
                <DropdownMenu
                  open={dropdownOpen}
                  onOpenChange={setDropdownOpen}
                >
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
                      onClick={() => {
                        router.push("/profile");
                        setDropdownOpen(false);
                      }}
                      disabled={isSigningOut}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        router.push("/settings");
                        setDropdownOpen(false);
                      }}
                      disabled={isSigningOut}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {/* ✅ Prevent dropdown close on sign out */}
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault(); // ✅ Prevent dropdown from closing
                      }}
                      disabled={isSigningOut}
                    >
                      <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="flex items-center w-full"
                      >
                        {isSigningOut ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <LogOut className="mr-2 h-4 w-4" />
                        )}
                        <span>
                          {isSigningOut ? "Signing out..." : "Sign out"}
                        </span>
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() =>
                    router.push(
                      `/auth/login${
                        redirectUrl
                          ? `?redirect=${encodeURIComponent(redirectUrl)}`
                          : ""
                      }`
                    )
                  }
                >
                  Sign in
                </Button>
                <Button
                  onClick={() =>
                    router.push(
                      `/auth/sign-up${
                        redirectUrl
                          ? `?redirect=${encodeURIComponent(redirectUrl)}`
                          : ""
                      }`
                    )
                  }
                >
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
              <SheetContent
                side="right"
                className="w-[300px] sm:w-[400px] flex flex-col p-0"
              >
                {/* ✅ Header with improved spacing */}
                <div className="flex items-center gap-3 px-6 py-5 border-b">
                  <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-xl">SahyadriPrep</span>
                </div>

                {/* ✅ Scrollable content area */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  {/* ✅ User Info - Mobile with better spacing */}
                  {user ? (
                    <div
                      onClick={() => (window.location.href = "/profile")}
                      className="flex items-start gap-4 rounded-xl border bg-muted/50 p-4 mb-6 cursor-pointer hover:bg-muted/70 transition"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={profileData?.avatar_url}
                          alt={profileData?.full_name || "User"}
                        />
                        <AvatarFallback className="text-base">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {profileData?.full_name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {user.email}
                        </p>
                        {role && (
                          <p className="text-xs text-muted-foreground capitalize mt-2 px-2 py-1 bg-background rounded-md inline-block">
                            {role.replace("_", " ")}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 mb-6">
                      <Button
                        onClick={() => {
                          router.push(
                            `/auth/login${
                              redirectUrl
                                ? `?redirect=${encodeURIComponent(redirectUrl)}`
                                : ""
                            }`
                          );
                          setIsOpen(false);
                        }}
                        variant="outline"
                        className="w-full h-11"
                      >
                        Sign in
                      </Button>
                      <Button
                        onClick={() => {
                          router.push(
                            `/auth/sign-up${
                              redirectUrl
                                ? `?redirect=${encodeURIComponent(redirectUrl)}`
                                : ""
                            }`
                          );
                          setIsOpen(false);
                        }}
                        className="w-full h-11"
                      >
                        Sign up
                      </Button>
                    </div>
                  )}

                  {/* ✅ Navigation Section Header */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
                      Navigation
                    </p>
                  </div>

                  {/* ✅ Navigation - Mobile with better spacing */}
                  <div className="flex flex-col gap-1.5 mb-6">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.href}
                          variant={isActive(item.href) ? "default" : "ghost"}
                          className="justify-start gap-3 h-12 px-4 text-base"
                          onClick={() => {
                            router.push(item.href);
                            setIsOpen(false);
                          }}
                          disabled={isSigningOut}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="flex-1 text-left">{item.name}</span>
                        </Button>
                      );
                    })}
                  </div>

                  {/* ✅ User Actions - Mobile */}
                  {user && (
                    <>
                      <div className="border-t my-6" />

                      {/* ✅ Account Section Header */}
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
                          Account
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Button
                          variant="ghost"
                          className="justify-start gap-3 h-12 px-4 text-base"
                          onClick={() => {
                            router.push("/profile");
                            setIsOpen(false);
                          }}
                          disabled={isSigningOut}
                        >
                          <User className="h-5 w-5" />
                          <span className="flex-1 text-left">Profile</span>
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start gap-3 h-12 px-4 text-base"
                          onClick={() => {
                            router.push("/settings");
                            setIsOpen(false);
                          }}
                          disabled={isSigningOut}
                        >
                          <Settings className="h-5 w-5" />
                          <span className="flex-1 text-left">Settings</span>
                        </Button>

                        {/* ✅ Sign Out with better styling */}
                        <div className="mt-2">
                          <Button
                            variant="ghost"
                            className="justify-start gap-3 h-12 px-4 text-base w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                          >
                            {isSigningOut ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <LogOut className="h-5 w-5" />
                            )}
                            <span className="flex-1 text-left">
                              {isSigningOut ? "Signing out..." : "Sign out"}
                            </span>
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* ✅ Footer with app version (optional) */}
                <div className="border-t px-6 py-4">
                  <p className="text-xs text-center text-muted-foreground">
                    SahyadriPrep v1.0
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
