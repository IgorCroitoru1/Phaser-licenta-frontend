"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/custom-dialog";
import { Button } from "@/components/ui/custom_button";
import { Input } from "@/components/ui/custom-input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import {
    channelCreationSchema,
    type ChannelCreationFormData,
} from "@/lib/validations/channel";
import ChannelService from "@/services/channelService";
import { Channel } from "@/store/useChannelStore";

interface ChannelUpdateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    channel: Channel | null;
    onChannelUpdated?: (updatedChannel: Channel) => void;
    onChannelDeleted?: (deletedChannelId: string) => void;
}

interface MapInfo {
    value: string;
    label: string;
    image?: string;
    description: string;
}

// Function to load available maps from the server
const loadAvailableMaps = async (): Promise<MapInfo[]> => {
    try {
        const response = await fetch("/api/maps");
        if (!response.ok) {
            throw new Error(`Failed to fetch maps: ${response.statusText}`);
        }

        const data = await response.json();
        return data.maps || [];
    } catch (error) {
        console.error("Failed to load maps:", error);
        return [];
    }
};

export function ChannelUpdateDialog({
    open,
    onOpenChange,
    channel,
    onChannelUpdated,
    onChannelDeleted,
}: ChannelUpdateDialogProps) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>(
        {}
    );
    const [selectedMapValue, setSelectedMapValue] = React.useState<string>("");
    const [availableMaps, setAvailableMaps] = React.useState<MapInfo[]>([]);
    const [mapsLoading, setMapsLoading] = React.useState(true);

    // Load available maps when component mounts
    React.useEffect(() => {
        const loadMaps = async () => {
            try {
                setMapsLoading(true);
                const maps = await loadAvailableMaps();
                setAvailableMaps(maps);
            } catch (error) {
                console.error("Failed to load maps:", error);
                // Fallback to empty array
                setAvailableMaps([]);
            } finally {
                setMapsLoading(false);
            }
        };

        loadMaps();
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<ChannelCreationFormData>({
        resolver: zodResolver(channelCreationSchema),
        defaultValues: {
            name: "",
            maxUsers: 10,
            mapName: "",
        },
    });

    // Update form values when channel changes
    React.useEffect(() => {
        if (channel && open) {
            setValue("name", channel.name);
            setValue("maxUsers", channel.maxUsers);
            setValue("mapName", channel.mapName || "");
            setSelectedMapValue(channel.mapName || "");
        }
    }, [channel, open, setValue]);

    // Update form value when selectedMapValue changes
    React.useEffect(() => {
        setValue("mapName", selectedMapValue);
    }, [selectedMapValue, setValue]);

    // Clear form when dialog closes
    React.useEffect(() => {
        if (!open) {
            // Use setTimeout to ensure proper cleanup after dialog animation
            const timer = setTimeout(() => {
                reset();
                setError(null);
                setFieldErrors({});
                setSelectedMapValue("");
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [open, reset]);

    async function onSubmit(data: ChannelCreationFormData) {
        if (!channel) return;

        setIsLoading(true);
        setError(null);
        setFieldErrors({});

        try {
            const updatedChannel = await ChannelService.updateChannel(channel.id, {
                name: data.name,
                maxUsers: data.maxUsers,
                mapName: data.mapName,
            });
              if (updatedChannel) {
                // Reset form and close dialog on success
                reset();
                setError(null);
                setFieldErrors({});
                onOpenChange(false);
                
                // Show success toast
                
                // Notify parent component about the update
                if (onChannelUpdated) {
                    onChannelUpdated(updatedChannel);
                }
            }
        } catch (error: any) {
            if (error?.response?.data?.errors) {
                // Handle validation errors from backend
                setFieldErrors(error.response.data.errors);
                setError(error.response.data.message || "Eroare de validare");
            } else {
                // Handle general errors
                setError(
                    error?.response?.data?.message ||
                        "A apărut o eroare la actualizarea canalului"
                );
            }        } finally {
            setIsLoading(false);
        }
    }

    async function handleDeleteChannel() {
        if (!channel) return;

        // Show confirmation dialog
        const confirmed = window.confirm(
            `Ești sigur că vrei să ștergi canalul "${channel.name}"? Această acțiune nu poate fi anulată.`
        );

        if (!confirmed) return;

        setIsDeleting(true);
        setError(null);

        try {
            await ChannelService.deleteChannel(channel.id);
            
            // Reset form and close dialog on success
            reset();
            setError(null);
            setFieldErrors({});
            onOpenChange(false);
            
            // Show success toast
            toast.success(`Canalul "${channel.name}" a fost șters cu succes!`);
            
            // Notify parent component about the deletion
            if (onChannelDeleted) {
                onChannelDeleted(channel.id);
            }
        } catch (error: any) {
            // Handle delete errors
            setError(
                error?.response?.data?.message ||
                error?.message ||
                "A apărut o eroare la ștergerea canalului"
            );
        } finally {
            setIsDeleting(false);
        }
    }

    if (!channel) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
            <DialogContent
                className="sm:max-w-[425px]"
                onPointerDownOutside={() => onOpenChange(false)}
            >
                <DialogHeader>
                    <DialogTitle>Editează Canal</DialogTitle>
                    <DialogDescription>
                        Modifică setările canalului "{channel.name}". Actualizează câmpurile de mai jos.
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="space-y-2">
                        <Label htmlFor="name">Numele Canalului</Label>
                        <Input
                            id="name"
                            placeholder="Introducă numele canalului"
                            {...register("name")}
                            disabled={isLoading}
                        />
                        {/* Show React Hook Form validation errors */}
                        {errors.name && (
                            <p className="text-sm text-red-600">
                                {errors.name.message}
                            </p>
                        )}
                        {/* Show backend validation errors */}
                        {fieldErrors.name && (
                            <div className="space-y-1">
                                {fieldErrors.name.map((errorMsg, index) => (
                                    <p key={index} className="text-sm text-red-600">
                                        {errorMsg}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="maxUsers">
                            Numărul Maxim de Utilizatori
                        </Label>
                        <Input
                            id="maxUsers"
                            type="number"
                            min="1"
                            max="100"
                            placeholder="10"
                            {...register("maxUsers", { valueAsNumber: true })}
                            disabled={isLoading}
                        />
                        {/* Show React Hook Form validation errors */}
                        {errors.maxUsers && (
                            <p className="text-sm text-red-600">
                                {errors.maxUsers.message}
                            </p>
                        )}
                        {/* Show backend validation errors */}
                        {fieldErrors.maxUsers && (
                            <div className="space-y-1">
                                {fieldErrors.maxUsers.map((errorMsg, index) => (
                                    <p key={index} className="text-sm text-red-600">
                                        {errorMsg}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="mapName">Selectează Harta</Label>
                        <div className="border rounded-md p-4 bg-gray-50 max-h-64 overflow-y-auto">
                            {mapsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    <span className="ml-2 text-sm text-gray-600">
                                        Se încarcă hărțile...
                                    </span>
                                </div>
                            ) : availableMaps.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-sm text-gray-500">
                                        Nu s-au găsit hărți disponibile.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {availableMaps.map((map) => (
                                        <div
                                            key={map.value}
                                            className={`border-2 rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                                                selectedMapValue === map.value
                                                    ? "border-primary bg-primary/5"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                            onClick={() =>
                                                setSelectedMapValue(map.value)
                                            }
                                        >
                                            <div className="aspect-video mb-2 rounded overflow-hidden bg-gray-100 relative">
                                                <img
                                                    src={map.image}
                                                    alt={map.label}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        // Fallback to a placeholder if image fails to load
                                                        e.currentTarget.style.display =
                                                            "none";
                                                        const nextDiv = e
                                                            .currentTarget
                                                            .nextElementSibling as HTMLElement;
                                                        if (nextDiv) {
                                                            nextDiv.style.display = "flex";
                                                        }
                                                    }}
                                                />
                                                <div
                                                    className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 items-center justify-center text-blue-600 text-sm font-medium absolute top-0 left-0"
                                                    style={{ display: "none" }}
                                                >
                                                    {map.label}
                                                </div>
                                                {selectedMapValue ===
                                                    map.value && (
                                                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                                        <svg
                                                            className="w-3 h-3 text-white"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="font-medium text-sm text-gray-900 mb-1">
                                                {map.label}
                                            </h3>
                                            <p className="text-xs text-gray-500 line-clamp-2">
                                                {map.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Show React Hook Form validation errors */}
                        {errors.mapName && (
                            <p className="text-sm text-red-600">
                                {errors.mapName.message}
                            </p>
                        )}
                        {/* Show backend validation errors */}
                        {fieldErrors.mapName && (
                            <div className="space-y-1">
                                {fieldErrors.mapName.map((errorMsg, index) => (
                                    <p key={index} className="text-sm text-red-600">
                                        {errorMsg}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* General error message */}
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                            {error}
                        </div>
                    )}                    <DialogFooter>
                        <div className="flex w-full justify-between">
                            {/* Delete button on the left */}
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDeleteChannel}
                                disabled={isLoading || isDeleting}
                                className="flex items-center gap-2"
                            >
                                <Icons.trash className="h-4 w-4" />
                                {/* {isDeleting ? "Se șterge..." : "Șterge Canal"}                                AuthProvider → AuthInitializer → AuthLoadingGate → WebSocketProvider */}
                            </Button>
                            
                            {/* Cancel and Update buttons on the right */}
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        reset();
                                        setError(null);
                                        setFieldErrors({});
                                        onOpenChange(false);
                                    }}
                                    disabled={isLoading || isDeleting}
                                >
                                    Anulează
                                </Button>
                                <Button type="submit" disabled={isLoading || isDeleting}>
                                    {isLoading ? "Se actualizează..." : "Actualizează Canal"}
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
