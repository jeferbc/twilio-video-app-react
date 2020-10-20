import { Callback } from '../../../types';
import EventEmitter from 'events';
import { isMobile } from '../../../utils';
import Video, { ConnectOptions, LocalTrack, Room } from 'twilio-video';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppState } from '../../../state';
import updateParticipantFailed from '../../../utils/ParticipantStatus/updateParticipantFailed';
import redirectRootPath from '../../../utils/redirectRootPath'

// @ts-ignore
window.TwilioVideo = Video;

export default function useRoom(localTracks: LocalTrack[], onError: Callback, options?: ConnectOptions) {
  const [room, setRoom] = useState<Room>(new EventEmitter() as Room);
  const { roomName, appointmentID, user } = useAppState();
  const [isConnecting, setIsConnecting] = useState(false);
  const localTracksRef = useRef<LocalTrack[]>([]);
  const optionsRef = useRef(options);

  useEffect(() => {
    // It can take a moment for Video.connect to connect to a room. During this time, the user may have enabled or disabled their
    // local audio or video tracks. If this happens, we store the localTracks in this ref, so that they are correctly published
    // once the user is connected to the room.
    localTracksRef.current = localTracks;
  }, [localTracks]);

  useEffect(() => {
    // This allows the connect function to always access the most recent version of the options object. This allows us to
    // reliably use the connect function at any time.
    optionsRef.current = options;
  }, [options]);

  const connect = useCallback(
    token => {
      setIsConnecting(true);
      return Video.connect(token, { ...optionsRef.current, tracks: [] }).then(
        newRoom => {
          setRoom(newRoom);
          const disconnect = () => newRoom.disconnect();

          newRoom.once('disconnected', () => {
            // Reset the room only after all other `disconnected` listeners have been called.
            setTimeout(() => setRoom(new EventEmitter() as Room));
            document.removeEventListener('turbolinks:before-cache', disconnect);

            if (isMobile) {
              window.removeEventListener('pagehide', disconnect);
            }
            // Hard redirect to appointment view
            redirectRootPath();
          });

          // @ts-ignore
          window.twilioRoom = newRoom;

          localTracksRef.current.forEach(track =>
            // Tracks can be supplied as arguments to the Video.connect() function and they will automatically be published.
            // However, tracks must be published manually in order to set the priority on them.
            // All video tracks are published with 'low' priority. This works because the video
            // track that is displayed in the 'MainParticipant' component will have it's priority
            // set to 'high' via track.setPriority()
            newRoom.localParticipant.publishTrack(track, { priority: track.kind === 'video' ? 'low' : 'standard' })
          );

          setIsConnecting(false);
          // turbolinks
          window.addEventListener('turbolinks:before-cache', disconnect)
          // Add a listener to disconnect from the room when a user closes their browser

          if (isMobile) {
            // Add a listener to disconnect from the room when a mobile user closes their browser
            window.addEventListener('pagehide', disconnect);
          }
        },
        error => {
          onError(error);
          updateParticipantFailed(appointmentID, user.participantID, error);
          setIsConnecting(false);
        }
      );
    },
    [onError]
  );

  return { room, isConnecting, connect };
}
