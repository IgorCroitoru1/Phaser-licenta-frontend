import { ChatIcon, ChatToggle, ControlBarProps, DisconnectButton, GearIcon, LeaveIcon, MediaDeviceMenu, StartMediaButton, TrackToggle, useLocalParticipantPermissions, useMaybeLayoutContext, usePersistentUserChoices } from "@livekit/components-react";
import { Track } from "livekit-client";
import React from "react";
import { supportsScreenSharing } from '@livekit/components-core';

export function ControlBar({
    variation,
    controls,
    saveUserChoices = true,
    onDeviceError,
    ...props
  }: ControlBarProps) {
    const [isChatOpen, setIsChatOpen] = React.useState(false);
    const layoutContext = useMaybeLayoutContext();
    React.useEffect(() => {
      if (layoutContext?.widget.state?.showChat !== undefined) {
        setIsChatOpen(layoutContext?.widget.state?.showChat);
      }
    }, [layoutContext?.widget.state?.showChat]);
    const isTooLittleSpace = useMediaQuery(`(max-width: ${isChatOpen ? 1000 : 760}px)`);
  
    const defaultVariation = isTooLittleSpace ? 'minimal' : 'verbose';
    variation ??= defaultVariation;
  
    const visibleControls = { leave: true, ...controls };
  
    const localPermissions = useLocalParticipantPermissions();
  
    if (!localPermissions) {
      visibleControls.camera = false;
      visibleControls.chat = false;
      visibleControls.microphone = false;
      visibleControls.screenShare = false;
    } else {
      visibleControls.camera ??= localPermissions.canPublish;
      visibleControls.microphone ??= localPermissions.canPublish;
      visibleControls.screenShare ??= localPermissions.canPublish;
      visibleControls.chat ??= localPermissions.canPublishData && controls?.chat;
    }
  
    const showIcon = React.useMemo(
      () => variation === 'minimal' || variation === 'verbose',
      [variation],
    );
    // const showText = React.useMemo(
    //   () => variation === 'textOnly' || variation === 'verbose',
    //   [variation],
    // );
    const showText = false;
    const browserSupportsScreenSharing = supportsScreenSharing();
  
    const [isScreenShareEnabled, setIsScreenShareEnabled] = React.useState(false);
  
    const onScreenShareChange = React.useCallback(
      (enabled: boolean) => {
        setIsScreenShareEnabled(enabled);
      },
      [setIsScreenShareEnabled],
    );
  
    //const htmlProps = mergeProps({ className: 'lk-control-bar' }, props);
  
    const {
      saveAudioInputEnabled,
      saveVideoInputEnabled,
      saveAudioInputDeviceId,
      saveVideoInputDeviceId,
    } = usePersistentUserChoices({ preventSave: !saveUserChoices });
  
    const microphoneOnChange = React.useCallback(
      (enabled: boolean, isUserInitiated: boolean) =>
        isUserInitiated ? saveAudioInputEnabled(enabled) : null,
      [saveAudioInputEnabled],
    );
  
    const cameraOnChange = React.useCallback(
      (enabled: boolean, isUserInitiated: boolean) =>
        isUserInitiated ? saveVideoInputEnabled(enabled) : null,
      [saveVideoInputEnabled],
    );
  
    return (
      <div {...props}>
        {visibleControls.microphone && (
          <div className="lk-button-group">
            <TrackToggle
              source={Track.Source.Microphone}
              showIcon={showIcon}
              onChange={microphoneOnChange}
              onDeviceError={(error) => onDeviceError?.({ source: Track.Source.Microphone, error })}
            >
              {showText && 'Microphone'}
            </TrackToggle>
            <div className="lk-button-group-menu">
              <MediaDeviceMenu
                kind="audioinput"
                onActiveDeviceChange={(_kind, deviceId) =>
                  saveAudioInputDeviceId(deviceId ?? 'default')
                }
              />
            </div>
          </div>
        )}
        {visibleControls.camera && (
          <div className="lk-button-group">
            <TrackToggle
              source={Track.Source.Camera}
              showIcon={showIcon}
              onChange={cameraOnChange}
              onDeviceError={(error) => onDeviceError?.({ source: Track.Source.Camera, error })}
            >
              {showText && 'Camera'}
            </TrackToggle>
            <div className="lk-button-group-menu">
              <MediaDeviceMenu
                kind="videoinput"
                onActiveDeviceChange={(_kind, deviceId) =>
                  saveVideoInputDeviceId(deviceId ?? 'default')
                }
              />
            </div>
          </div>
        )}
        {/* {visibleControls.screenShare && browserSupportsScreenSharing && (
          <TrackToggle
            source={Track.Source.ScreenShare}
            captureOptions={{ audio: true, selfBrowserSurface: 'include' }}
            showIcon={showIcon}
            onChange={onScreenShareChange}
            onDeviceError={(error) => onDeviceError?.({ source: Track.Source.ScreenShare, error })}
          >
            {showText && (isScreenShareEnabled ? 'Stop screen share' : 'Share screen')}
          </TrackToggle>
        )} */}
        {visibleControls.chat && (
          <ChatToggle>
            {showIcon && <ChatIcon />}
            {showText && 'Chat'}
          </ChatToggle>
        )}
        {/* {visibleControls.settings && (
          <SettingsMenuToggle>
            {showIcon && <GearIcon />}
            {showText && 'Settings'}
          </SettingsMenuToggle>
        )} */}
        {/* {visibleControls.leave && (
          <DisconnectButton>
            {showIcon && <LeaveIcon />}
            {showText && 'Leave'}
          </DisconnectButton>
        )} */}
        <StartMediaButton />
      </div>
    );
  }


export function useMediaQuery(query: string): boolean {
  const getMatches = (query: string): boolean => {
    // Prevents SSR issues
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = React.useState<boolean>(getMatches(query));

  function handleChange() {
    setMatches(getMatches(query));
  }

  React.useEffect(() => {
    const matchMedia = window.matchMedia(query);

    // Triggered at the first client-side load and if query changes
    handleChange();

    // Listen matchMedia
    if (matchMedia.addListener) {
      matchMedia.addListener(handleChange);
    } else {
      matchMedia.addEventListener('change', handleChange);
    }

    return () => {
      if (matchMedia.removeListener) {
        matchMedia.removeListener(handleChange);
      } else {
        matchMedia.removeEventListener('change', handleChange);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return matches;
}
