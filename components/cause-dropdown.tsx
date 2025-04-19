'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Edit, Eye, MoreHorizontal, Trash } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteCause } from "@/actions"

interface CauseDropdownProps {
    causeId: string
}

export function CauseDropdown({ causeId }: CauseDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-1 h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href={`/causes/${causeId}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Cause
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/dashboard/causes/${causeId}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Cause
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => deleteCause(causeId)} className="text-destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Cause
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
} 