"use client"

import { Button } from "@/components/ui/button"
import { Share2, MessageSquare, Instagram, Twitter, Linkedin } from "lucide-react"
import { FaWhatsapp, FaInstagram, FaTwitter, FaLinkedin, FaXing } from "react-icons/fa"
import { useToast } from "@/components/ui/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { saveCauseShare } from "@/actions/cause-actions"


interface ShareModalProps {
    url: string
    title: string
    causeId: string
}

export function ShareModal({ url, title, causeId }: ShareModalProps) {
    const { toast } = useToast()

    const handleCopyLink = () => {
        navigator.clipboard.writeText(url)
        toast({
            title: "Link copied!",
            description: "The link has been copied to your clipboard.",
        })
    }

    const handleShare = async (platform: string) => {
        let shareUrl = ""
        const encodedUrl = encodeURIComponent(url)
        const encodedTitle = encodeURIComponent(title)

        switch (platform) {
            case "whatsapp":
                shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
                break
            case "twitter":
                shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
                break
            case "linkedin":
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
                break
            case "instagram":
                // Instagram doesn't support direct sharing via URL
                toast({
                    title: "Instagram sharing",
                    description: "Please copy the link and share it on Instagram.",
                })
                return
        }

        try {
            await saveCauseShare(causeId)
            window.open(shareUrl, "_blank")
        } catch (error) {
            console.error("Error saving share:", error)
            toast({
                title: "Error",
                description: "Failed to save share. Please try again.",
                variant: "destructive",
            })
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share this cause</DialogTitle>
                    <DialogDescription>
                        Share this cause with your network
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center gap-6 py-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShare("whatsapp")}
                        className="h-12 w-12 rounded-full bg-[#25D366] hover:bg-[#25D366]/90"
                    >
                        <FaWhatsapp className="h-6 w-6 text-white" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShare("instagram")}
                        className="h-12 w-12 rounded-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] hover:opacity-90"
                    >
                        <FaInstagram className="h-6 w-6 text-white" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShare("twitter")}
                        className="h-12 w-12 rounded-full bg-black hover:bg-black/90"
                    >
                        <FaTwitter className="h-6 w-6 text-white" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShare("linkedin")}
                        className="h-12 w-12 rounded-full bg-[#0077B5] hover:bg-[#0077B5]/90"
                    >
                        <FaLinkedin className="h-6 w-6 text-white" />
                    </Button>
                </div>
                <div className="flex items-center space-x-2">
                    <Input
                        value={url}
                        readOnly
                        className="flex-1"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                        className="shrink-0"
                    >
                        <Share2 className="h-4 w-4 mr-2" />
                        Copy
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
} 