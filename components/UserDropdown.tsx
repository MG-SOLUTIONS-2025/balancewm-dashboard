'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LogOut, User as UserIcon, Settings, CreditCard, Keyboard, Github, LifeBuoy, MessageSquare, UserPlus, Users, PlusCircle } from "lucide-react"

import NavItems from '@/components/NavItems'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/lib/actions/auth.actions"

export function UserDropdown({ user }: { user: User }) {
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/sign-in');
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 text-gray-400 hover:text-yellow-500">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src='https://avatars.githubusercontent.com/u/244079107?s=400&u=98a0f3431bdef4b8cca75f4158ac335d28729a03&v=4' />
                        <AvatarFallback className="bg-yellow-500 text-yellow-900 text-sm font-bold">
                            {user.name[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex items-start">
                        <span className="text-base font-medium text-gray-400">
                            {user.name}
                        </span>
                    </div>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56 text-gray-400" align="start">
                <DropdownMenuLabel>
                    <div className="flex relative items-center gap-3 py-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src='https://avatars.githubusercontent.com/u/244079107?s=400&u=98a0f3431bdef4b8cca75f4158ac335d28729a03&v=4' />
                            <AvatarFallback className="bg-yellow-500 text-yellow-900 text-sm font-bold">
                                {user.name[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-base font-medium text-gray-500">
                                {user.name}
                            </span>
                            <span className="text-sm text-gray-500">
                                {user.email}
                            </span>
                        </div>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-gray-600" />

                {/* Account Section */}
                <DropdownMenuGroup>
                    <DropdownMenuItem className="focus:bg-transparent focus:text-yellow-500 transition-colors cursor-pointer">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-transparent focus:text-yellow-500 transition-colors cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Billing</span>
                        <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-transparent focus:text-yellow-500 transition-colors cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-transparent focus:text-yellow-500 transition-colors cursor-pointer">
                        <Keyboard className="mr-2 h-4 w-4" />
                        <span>Keyboard shortcuts</span>
                        <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-gray-600" />

                {/* Team Section */}
                <DropdownMenuGroup>
                    <DropdownMenuItem className="focus:bg-transparent focus:text-yellow-500 transition-colors cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Team</span>
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="focus:bg-transparent focus:text-yellow-500">
                            <UserPlus className="mr-2 h-4 w-4" />
                            <span>Invite users</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent className="text-gray-400">
                                <DropdownMenuItem className="focus:bg-transparent focus:text-yellow-500 cursor-pointer">
                                    <span>Email</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-transparent focus:text-yellow-500 cursor-pointer">
                                    <span>Message</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-gray-600" />
                                <DropdownMenuItem className="focus:bg-transparent focus:text-yellow-500 cursor-pointer">
                                    <span>More...</span>
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuItem className="focus:bg-transparent focus:text-yellow-500 transition-colors cursor-pointer">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        <span>New Team</span>
                        <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-gray-600" />

                {/* Support Section */}
                <DropdownMenuItem className="focus:bg-transparent focus:text-yellow-500 transition-colors cursor-pointer">
                    <Github className="mr-2 h-4 w-4" />
                    <span>GitHub</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-transparent focus:text-yellow-500 transition-colors cursor-pointer">
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    <span>Support</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="opacity-50">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>API</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-gray-600" />

                {/* Logout */}
                <DropdownMenuItem onClick={handleSignOut} className="text-gray-100 font-medium focus:bg-transparent focus:text-yellow-500 transition-colors cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-gray-600 sm:hidden" />
                
                {/* Mobile Navigation */}
                <nav className="sm:hidden">
                    <NavItems />
                </nav>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserDropdown