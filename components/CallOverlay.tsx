import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Colors } from '../constants/theme';
import { CallManager, CallStatus } from '../lib/callManager';
import { Avatar } from './Avatar';


interface CallOverlayProps {
  user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  me: {
    id: string;
  };
  onClose: () => void;
  /** If provided, this is an incoming call offer that we need to answer */
  incomingOffer?: any;
}

export const CallOverlay = ({ user, me, onClose, incomingOffer }: CallOverlayProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const [status, setStatus] = useState<CallStatus>(incomingOffer ? 'ringing' : 'calling');
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [remoteStream, setRemoteStream] = useState<any>(null);


  const callManagerRef = useRef<CallManager | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // FIXED: Using any here to prevent the 'number' vs 'Timeout' type mismatch error
  const timerRef = useRef<any>(null);

  // Pulsing animation for the avatar ring when calling/ringing
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );

    if (status === 'calling' || status === 'ringing') {
      pulse.start();
    } else {
      pulse.stop();
      pulseAnim.setValue(1);
    }
    return () => pulse.stop();
  }, [status, pulseAnim]);

  // Duration timer when call is active
  useEffect(() => {
    if (status === 'active') {
      timerRef.current = setInterval(() => {
        setDuration((prev: number) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Initialize call
  useEffect(() => {
    if (!me?.id || !user?.id) return;

    const manager = new CallManager(me.id, user.id);
    callManagerRef.current = manager;

    manager.onStatusChange = (s: CallStatus) => {
      setStatus(s);
      if (s === 'ended') {
        setTimeout(() => onClose(), 1000);
      }
    };

    manager.onRemoteStream = (stream: any) => {
      setRemoteStream(stream);
    };


    if (incomingOffer) {
      // Waiting for manual acceptance
    } else {
      manager.startCall();
    }

    return () => {
      manager.cleanup();
    };
  }, [me?.id, user?.id, incomingOffer, onClose]);

  const handleHangUp = () => {
    callManagerRef.current?.hangUp();
    onClose();
  };

  const handleMute = () => {
    setIsMuted((prev: boolean) => {
      const nextMuted = !prev;
      callManagerRef.current?.setMuted(nextMuted);
      return nextMuted;
    });
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // FIXED: Explicitly typing the map to solve the indexing error
  const statusLabels: Record<CallStatus, string> = {
    calling: 'Calling...',
    ringing: 'Incoming Call',
    active: formatDuration(duration),
    ended: 'Call Ended',
    idle: '',
  };

  const statusLabel = statusLabels[status];

  return (
    <View style={styles.overlay}>
      <View style={[styles.blurFallback, {
        backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.92)' : 'rgba(255,255,255,0.92)'
      }]}>

        {/* Avatar with pulse ring */}
        <View style={styles.avatarSection}>
          <Animated.View style={[styles.pulseRing, {
            borderColor: colors.accent + '44',
            transform: [{ scale: pulseAnim }]
          }]} />
          <Animated.View style={[styles.pulseRing2, {
            borderColor: colors.accent + '22',
            transform: [{ scale: Animated.multiply(pulseAnim, 1.15) }]
          }]} />
          <Avatar size={110} uri={user.avatar_url} />
        </View>

        <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
        <Text style={[styles.statusLabel, {
          color: status === 'active' ? colors.accent : colors.textSecondary
        }]}>{statusLabel}</Text>

        {remoteStream ? (
          <RTCView
            streamURL={remoteStream.toURL?.()}
            style={styles.remoteAudioView}
            objectFit="cover"
            mirror={false}
          />
        ) : null}

        {/* Control Buttons */}
        <View style={styles.controls}>

          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: isMuted ? colors.accent : colors.surface }]}
            onPress={handleMute}
          >
            <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={26} color={isMuted ? 'white' : colors.text} />
            <Text style={[styles.controlLabel, { color: isMuted ? 'white' : colors.textSecondary }]}>
              {isMuted ? 'Unmute' : 'Mute'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.endBtn}
            onPress={handleHangUp}
          >
            <Ionicons name="call" size={30} color="white" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="volume-high" size={26} color={colors.text} />
            <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>Speaker</Text>
          </TouchableOpacity>
        </View>

        {status === 'ringing' && (
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => callManagerRef.current?.answerCall(incomingOffer)}
          >
            <Ionicons name="call" size={30} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 2000,
  },
  blurFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  avatarSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    width: 180,
    height: 180,
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
  },
  pulseRing2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 60,
    letterSpacing: 0.5,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  controlBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  controlLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  endBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtn: {
    marginTop: 32,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },

  remoteAudioView: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
});
