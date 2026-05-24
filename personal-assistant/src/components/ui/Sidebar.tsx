"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { Mic, MessageSquare, Mail, Calendar, Users, Settings, LogIn, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/",         icon: Mic,           label: "Voice"    },
  { href: "/chat",    icon: MessageSquare, label: "Chat"     },
  { href: "/email",   icon: Mail,          label: "Email"    },
  { href: "/calendar",icon: Calendar,      label: "Calendar" },
  { href: "/crm",     icon: Users,         label: "CRM"      },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <aside className="w-16 md:w-56 flex flex-col bg-white border-r border-warm-100 flex-shrink-0 h-full">
      <div className="px-3 py-5 md:px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-coral-500 flex items-center justify-center flex-shrink-0">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <span className="hidden md:block font-semibold text-warm-900 text-sm">Assistant</span>
        </div>
      </div>
      <nav className="flex-1 px-2 md:px-3 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={cn("flex items-center gap-3 px-2 py-2.5 rounded-xl text-sm font-medium transition-colors",
                active ? "bg-coral-50 text-coral-600" : "text-warm-600 hover:bg-warm-50 hover:text-warm-900")}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="hidden md:block">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-2 md:px-3 py-3 border-t border-warm-100 space-y-0.5">
        <Link href="/settings"
          className={cn("flex items-center gap-3 px-2 py-2.5 rounded-xl text-sm font-medium transition-colors",
            pathname === "/settings" ? "bg-coral-50 text-coral-600" : "text-warm-600 hover:bg-warm-50 hover:text-warm-900")}>
          <Settings className="w-5 h-5 flex-shrink-0" />
          <span className="hidden md:block">Settings</span>
        </Link>
        {status === "authenticated" ? (
          <div className="flex items-center gap-3 px-2 py-2.5">
            <div className="w-5 h-5 rounded-full bg-coral-200 flex items-center justify-center flex-shrink-0">
              <User className="w-3 h-3 text-coral-700" />
            </div>
            <div className="hidden md:flex flex-col min-w-0 flex-1">
              <span className="text-xs font-medium text-warm-800 truncate">{session.user?.name ?? session.user?.email}</span>
              <button onClick={() => signOut()} className="text-xs text-warm-400 hover:text-coral-500 flex items-center gap-1 mt-0.5">
                <LogOut className="w-3 h-3" />Sign out
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => signIn("google")}
            className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl text-sm font-medium text-warm-600 hover:bg-warm-50 hover:text-warm-900 transition-colors">
            <LogIn className="w-5 h-5 flex-shrink-0" />
            <span className="hidden md:block">Connect Google</span>
          </button>
        )}
      </div>
    </aside>
  );
}
