"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { useAuth } from "@/hooks/use-auth"
import { useCause } from "@/hooks/use-cause"

// Mock categories
const categories = [
    { id: "education", name: "Education" },
    { id: "health", name: "Healthcare" },
    { id: "environment", name: "Environment" },
    { id: "community", name: "Community" },
    { id: "disaster", name: "Disaster Relief" },
    { id: "animals", name: "Animal Welfare" },
]

export default function CreateCauseForm() {
    const { user } = useAuth()
    const { isLoading, createCause } = useCause()
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        goal: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user) {
            return
        }

        await createCause(user.id, formData)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create a New Cause</CardTitle>
                <CardDescription>
                    Fill out the form below to create a new fundraising cause. All causes require approval before going
                    live.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Cause Title</Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="Enter a clear, specific title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Describe your cause, why it matters, and how the funds will be used"
                            rows={5}
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => handleSelectChange("category", value)}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="goal">Funding Goal (₦)</Label>
                        <Input
                            id="goal"
                            name="goal"
                            type="number"
                            placeholder="Enter amount in Naira"
                            value={formData.goal}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? (
                            <>
                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Cause"
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
} 