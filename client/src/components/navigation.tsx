import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Zap, Search, List, Map, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: BarChart3 },
    { href: "/ball-finder", label: "Find Best Ball", icon: Search },
    { href: "/arsenal", label: "My Arsenal", icon: List },
    { href: "/oil-patterns", label: "Oil Patterns", icon: Map },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className="bg-bowling-blue text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Zap className="h-8 w-8 text-amber-accent" />
            <Link href="/">
              <h1 className="text-2xl font-bold cursor-pointer">RollRite</h1>
            </Link>
            <span className="text-sm opacity-75 hidden sm:block">
              Professional Bowling Analytics
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      isActive(item.href)
                        ? "text-amber-accent bg-blue-800"
                        : "hover:text-amber-accent hover:bg-blue-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                </Link>
              );
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-bowling-blue text-white border-blue-800">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <button
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center space-x-3 w-full px-3 py-3 rounded-md transition-colors ${
                            isActive(item.href)
                              ? "text-amber-accent bg-blue-800"
                              : "hover:text-amber-accent hover:bg-blue-800"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </button>
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
