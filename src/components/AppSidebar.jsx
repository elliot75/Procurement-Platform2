import React, { useState } from 'react';
import {
    Home,
    BarChart3,
    Users,
    Building2,
    CreditCard,
    Settings,
    ChevronLeft,
    ChevronRight,
    ShoppingBag,
    FileCheck,
    Briefcase
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Link, useLocation } from 'react-router-dom';

export function AppSidebar({ collapsed, setCollapsed, userRole }) {
    const location = useLocation();

    // Mapping based on original logic + new icons
    const getNavItems = () => {
        const items = [
            {
                title: "Dashboard",
                url: "/dashboard",
                icon: Home,
            }
        ];

        if (userRole === 'Operator' || userRole === 'Admin') {
            items.push(
                {
                    title: "Create Project",
                    url: "/operator/create",
                    icon: Briefcase,
                },
                {
                    title: "My Projects",
                    url: "/operator/list",
                    icon: BarChart3,
                },
                {
                    title: "My Opening Hall",
                    url: "/operator/opening",
                    icon: FileCheck,
                }
            );
        }

        if (userRole === 'Supplier' || userRole === 'Admin') {
            items.push({
                title: "Bidding Invites",
                url: "/supplier/invites",
                icon: ShoppingBag,
            });
        }

        if (userRole === 'Auditor' || userRole === 'Admin') {
            items.push({
                title: "Opening Hall",
                url: "/auditor/opening",
                icon: FileCheck,
            });
        }

        if (userRole === 'Admin') {
            items.push({
                title: "User Management",
                url: "/admin/users",
                icon: Users,
            });
        }

        return items;
    };

    const navItems = getNavItems();

    return (
        <aside
            className={cn(
                "relative flex h-screen flex-col border-r bg-background transition-all duration-300",
                collapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex h-14 items-center justify-center border-b px-4">
                <div className="size-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                    P
                </div>
                {!collapsed && <span className="ml-2 font-bold text-lg">PBP</span>}
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="grid gap-1 px-2">
                    {navItems.map((item, index) => {
                        const isActive = location.pathname === item.url;
                        return (
                            <Link
                                key={index}
                                to={item.url}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                                    isActive ? "bg-muted text-foreground" : "text-muted-foreground",
                                    collapsed && "justify-center" // Center icon if collapsed
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {!collapsed && <span>{item.title}</span>}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="border-t p-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-full"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>
        </aside>
    );
}
