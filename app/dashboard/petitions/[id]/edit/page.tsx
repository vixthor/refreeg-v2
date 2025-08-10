import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { hasBankDetails } from "@/actions/profile-actions"
import { getPetition } from "@/actions/petition-actions"
import EditPetitionForm from "./edit-petition-form"

export default async function EditPetitionPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/signin")
    }
    const myParams = await params
    const hasBankInfo = await hasBankDetails(user.id)
    const petition = await getPetition(myParams.id)

    if (!petition) {
        redirect("/dashboard/petitions")
    }

    // Check if the user owns this petition
    if (petition.user_id !== user.id) {
        redirect("/dashboard/petitions")
    }

    return (
        <div className="md:container py-10">
            <div className="md:mx-auto max-w-2xl">
                {!hasBankInfo || hasBankInfo ? (
                    <div className="text-center space-y-4">
                        <h1 className="text-2xl font-bold">Bank Details Required</h1>
                        <p className="text-muted-foreground">
                            Please add your bank details in the settings to edit your petition. This is required to receive signatures.
                        </p>
                        <a
                            href="/dashboard/settings?tab=bank"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                            Add Bank Details
                        </a>
                    </div>
                ) : (
                    <EditPetitionForm petition={petition} />
                )}
            </div>
        </div>
    )
} 