"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/dynamicInput/input"
import { DialogFooter } from "@/components/ui/dialog"
import { ImagePlus, Loader2 } from "lucide-react"
import { UserService } from "@/service/UserService";

interface ImageUploadProps {
    currentImage: string
}

export default function ImageUpload({ currentImage }: ImageUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>(currentImage)
    const [isLoading, setIsLoading] = useState(false)

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("uploaded_file", selectedFile); // Исправлено на "uploaded_file"

            const userId = localStorage.getItem("userId");
            const response = await fetch(
                `/api/users/upload-image?user_id=${userId}`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error("Ошибка загрузки изображения");
            }

            window.location.reload();
        } catch (error) {
            console.error("Ошибка:", error);
            // Дополнительная обработка ошибок
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="space-y-4">
            <div className="flex items-center justify-center">
                <div className="relative w-40 h-40 rounded-full overflow-hidden">
                    <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                </div>
            </div>
            <div className="grid w-full items-center gap-4">
                <Input
                    id="picture"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="cursor-pointer text-gray-400 file:text-white file:bg-gray-700
                   file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4
                   file:cursor-pointer file:hover:bg-gray-600"
                />
            </div>
            <DialogFooter>
                <Button type="submit" onClick={handleUpload} disabled={!selectedFile || isLoading} className="w-full">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Загрузка...
                        </>
                    ) : (
                        <>
                            <ImagePlus className="mr-2 h-4 w-4" />
                            Загрузить новое фото
                        </>
                    )}
                </Button>
            </DialogFooter>
        </div>
    )
}

