"use client";

import { useCallback, useEffect, useState } from "react";
import { useSocket } from "@/context/WebSocketContext";
import {
    ChannelJoinResponse,
    ChannelUserJoinResponse,
    ChannelUserLeftResponse,
    LiveKitTokenResponse,
    SOCKET_EVENTS,
} from "@/types/websocket.types";
import { ChannelUserDto } from "@/dtos/ChannelUserDto";

export interface UseRoomManagerOptions {
    autoRequestToken?: boolean; // Automatically request LiveKit token after joining
    onChannelJoined?: (response: ChannelJoinResponse) => void;
    onUserJoined?: (response: ChannelUserJoinResponse) => void;
    onUserLeft?: (response: ChannelUserLeftResponse) => void;
    onChannelLeft?: (channelId: string) => void;
    onTokenReceived?: (response: LiveKitTokenResponse) => void;
    onError?: (error: string) => void;
}

export interface UseRoomManagerReturn {
    // State
    currentChannel: string | null;
    // channelToken: { token: string; channelId: string } | null;
    isConnected: boolean;
    loading: boolean;
    error: string | null;

    // Current channel helpers
    isInAnyChannel: boolean;

    // Actions
    joinChannel: (
        channelId?: string,
        metadata?: any
    ) => Promise<ChannelJoinResponse>;
    leaveChannel: (channelId?: string) => Promise<void>;
    leaveCurrentChannel: () => Promise<void>;
    switchChannel: (channelId?: string) => Promise<ChannelJoinResponse>;
    requestToken: (channelId: string) => Promise<LiveKitTokenResponse>;
    getChannelLiveKitToken: () => { token: string; channelId: string } | null;
   
    isInChannel: (channelId: string) => boolean;
    hasToken: () => boolean;
    clearError: () => void;
    // Bulk actions
    // joinChannelWithToken: (channelId: string) => Promise<{
    //     channelResponse: ChannelJoinResponse;
    //     tokenResponse: LiveKitTokenResponse;
    // }>;
}

export const useRoomManager = (
    options: UseRoomManagerOptions = {}
): UseRoomManagerReturn => {
    const {
        autoRequestToken = false,
        onChannelJoined,
        onChannelLeft,
        onTokenReceived,
        onError,
        onUserJoined,
        onUserLeft,
    } = options;

    const {
        isConnected,
        currentChannel,
        channelLiveKitToken,
        joinChannel: socketJoinChannel,
        leaveChannel: socketLeaveChannel,
        requestLiveKitToken,
        getChannelLiveKitToken,
        on,
        off,
    } = useSocket();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null); // Event binding with cleanup
    useEffect(() => {
        if (!isConnected || !on || !off) return;

        // Define event handlers
        const handleUserJoined = (data: ChannelUserJoinResponse) => {
            console.log("👋 User joined channel:", data);
            // Convert ChannelUserDto to ChannelUserJoinResponse format for callback

            onUserJoined?.(data);
        };

        const handleUserLeft = (data: ChannelUserLeftResponse) => {
            console.log("👋 User left channel:", data);

            onUserLeft?.(data);
        };

      
        // Bind events using SOCKET_EVENTS constants
        on(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
        on(SOCKET_EVENTS.USER_LEFT, handleUserLeft);

        // Cleanup function
        return () => {
            off(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
            off(SOCKET_EVENTS.USER_LEFT, handleUserLeft);
        };
    }, [isConnected, on, off, onUserJoined, onUserLeft, currentChannel]);

    // Additional cleanup on channel leave or connection close
    useEffect(() => {
        if (!currentChannel || !isConnected) {
            // Clear any channel-specific state when leaving a channel or disconnecting
            setError(null);
        }
    }, [currentChannel, isConnected]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const handleError = useCallback(
        (err: unknown) => {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred";
            setError(errorMessage);
            onError?.(errorMessage);
        },
        [onError]
    );

    // Channel management functions
    const joinChannel = useCallback(
        async (channelId?: string): Promise<ChannelJoinResponse> => {
            if (!channelId) {
                throw new Error("Channel ID is required");
            }

            setLoading(true);
            setError(null);

            try {
                // Single-channel policy is now enforced at the WebSocket context level
                const response = await socketJoinChannel(channelId);
                onChannelJoined?.(response);

                // Auto-request token if enabled and not already provided
                if (autoRequestToken && !response.liveKitToken) {
                    try {
                        const livekitResponse = await requestToken(channelId);
                        response.liveKitToken = livekitResponse.token;
                    } catch (tokenError) {
                        console.warn(
                            "Failed to auto-request token:",
                            tokenError
                        );
                        // Don't fail the channel join if token request fails
                    }
                }

                return response;
            } catch (err) {
                handleError(err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [socketJoinChannel, autoRequestToken, onChannelJoined, handleError]
    );

    const leaveChannel = useCallback(
        async (channelId?: string): Promise<void> => {
            setLoading(true);
            setError(null);

            try {
                await socketLeaveChannel(channelId);
                const leftChannelId = channelId || currentChannel;
                if (leftChannelId) {
                    onChannelLeft?.(leftChannelId);
                }
            } catch (err) {
                handleError(err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [socketLeaveChannel, currentChannel, onChannelLeft, handleError]
    );

    const requestToken = useCallback(
        async (channelId: string): Promise<LiveKitTokenResponse> => {
            setLoading(true);
            setError(null);

            try {
                const response = await requestLiveKitToken(channelId);
                onTokenReceived?.(response);
                return response;
            } catch (err) {
                handleError(err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [requestLiveKitToken, onTokenReceived, handleError]
    );

    // Helper functions
    const isInChannel = useCallback(
        (channelId: string): boolean => {
            return currentChannel === channelId;
        },
        [currentChannel]
    );

    const hasToken = useCallback((): boolean => {
        return channelLiveKitToken !== null;
    }, [channelLiveKitToken]);

    const isInAnyChannel = !!currentChannel;

    const leaveCurrentChannel = useCallback(async (): Promise<void> => {
        if (!currentChannel) {
            return;
        }
        await leaveChannel(currentChannel);
    }, [currentChannel, leaveChannel]);

   

    const switchChannel = useCallback(
        async (
            channelId?: string,
            metadata?: any
        ): Promise<ChannelJoinResponse> => {
            if (!channelId) {
                throw new Error("Channel ID is required");
            }

            // Leave current channel first, then join new one
            // The WebSocket context already handles this automatically
            return await joinChannel(channelId);
        },
        [joinChannel]
    );

    // Bulk action: join channel and request token atomically
    // const joinChannelWithToken = useCallback(
    //     async (
    //         channelId: string,
    //         identity?: string,
    //         metadata?: any
    //     ): Promise<{
    //         channelResponse: ChannelJoinResponse;
    //         tokenResponse: LiveKitTokenResponse;
    //     }> => {
    //         setLoading(true);
    //         setError(null);

    //         try {
    //             const channelResponse = await joinChannel(channelId);

    //             // Request token if not provided in join response
    //             let tokenResponse: LiveKitTokenResponse;
    //             if (channelResponse.livekitToken) {
    //                 tokenResponse = {
    //                     channelId,
    //                     token: channelResponse.livekitToken,
    //                 };
    //             } else {
    //                 tokenResponse = await requestToken(channelId);
    //             }

    //             return { channelResponse, tokenResponse };
    //         } catch (err) {
    //             handleError(err);
    //             throw err;
    //         } finally {
    //             setLoading(false);
    //         }
    //     },
    //     [joinChannel, requestToken, handleError]
    // );

    // Cleanup on connection close or component unmount
    useEffect(() => {
        return () => {
            // Clear any pending state when hook is unmounted
            setLoading(false);
            setError(null);
        };
    }, []);

    return {
        // State
        currentChannel,
        // channelToken,
        isConnected,
        loading,
        error,

        // Current channel helpers
        isInAnyChannel,

        // Actions
        joinChannel,
        leaveChannel,
        leaveCurrentChannel,
        switchChannel,
        requestToken,
        getChannelLiveKitToken,
        isInChannel,
        hasToken,
        clearError,
        // joinChannelWithToken,
    };
};
