import { Platform } from 'react-native';
import { supabase } from './supabase';

let PeerConnection: any;
let SessionDescription: any;
let IceCandidate: any;
let mediaDevices: any;

if (Platform.OS === 'web') {
  if (typeof window !== 'undefined') {
    PeerConnection = window.RTCPeerConnection;
    SessionDescription = window.RTCSessionDescription;
    IceCandidate = window.RTCIceCandidate;
    mediaDevices = navigator.mediaDevices;
  }
} else {
  const webrtc = require('react-native-webrtc');
  PeerConnection = webrtc.RTCPeerConnection;
  SessionDescription = webrtc.RTCSessionDescription;
  IceCandidate = webrtc.RTCIceCandidate;
  mediaDevices = webrtc.mediaDevices;
}

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export type CallStatus = 'idle' | 'calling' | 'ringing' | 'active' | 'ended';

export class CallManager {
  private pc: any = null;
  private localStream: any = null;
  private signalingChannel: any = null;
  private myId: string;
  private peerId: string;
  private pendingCandidates: any[] = [];
  private remoteDescriptionSet = false;

  public onStatusChange: ((status: CallStatus) => void) | null = null;
  public onRemoteStream: ((stream: any) => void) | null = null;

  constructor(myId: string, peerId: string) {
    this.myId = myId;
    this.peerId = peerId;
  }

  /** Initiate an outgoing call */
  public async startCall(): Promise<void> {
    this.onStatusChange?.('calling');

    // Important: set up signaling before we send the offer so the callee can respond
    // and so we can receive answer/ice promptly.
    this.setupSignaling();

    await this.setupPeerConnection();

    const offer = await this.pc.createOffer({ offerToReceiveAudio: true });
    await this.pc.setLocalDescription(offer);

    // Signal the peer that they have an incoming call
    this.sendSignal('call-offer', offer);
  }


  /** Answer an incoming call */
  public async answerCall(offerData: any): Promise<void> {
    this.onStatusChange?.('active');
    // Ensure we can receive ICE and the remote description is set after signaling starts.
    this.setupSignaling();
    await this.setupPeerConnection();

    await this.setRemoteDescriptionAndFlush(offerData);

    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    this.sendSignal('call-answer', answer);
  }

  /** Hang up */
  public hangUp(): void {
    this.sendSignal('call-hangup', {});
    this.cleanup();
    this.onStatusChange?.('ended');
  }

  /** Mute/unmute local mic */
  public setMuted(muted: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track: any) => {
        track.enabled = !muted;
      });
    }
  }

  /** Listen for an incoming call from a peer */
  public listenForIncoming(onIncoming: (offerData: any) => void): void {
    this.setupIncomingOfferListener(onIncoming);
  }



  private async setupPeerConnection(): Promise<void> {
    // Get microphone access
    try {
      // In some RN/Expo environments the first getUserMedia can fail due to missing
      // permissions / device enumeration. We surface the error and avoid silent failures.
      this.localStream = await mediaDevices.getUserMedia({ audio: true, video: false });
    } catch (e) {
      console.error('[CallManager] getUserMedia failed:', e);
      this.onStatusChange?.('ended');
      throw e;
    }


    this.pc = new PeerConnection(configuration);
    const pcAny: any = this.pc;

    // Add local audio tracks to the peer connection
    this.localStream.getTracks().forEach((track: any) => {
      pcAny.addTrack(track, this.localStream);
    });

    // When we receive the remote audio stream
    pcAny.ontrack = (event: any) => {
      const remoteStream = event.streams?.[0];
      if (remoteStream) {
        this.onRemoteStream?.(remoteStream);
      }
    };

    pcAny.onicecandidate = (event: any) => {
      if (event.candidate) {
        this.sendSignal('call-ice', event.candidate);
      }
    };

    pcAny.onconnectionstatechange = () => {
      if (!this.pc) return;
      const state = this.pc.connectionState;
      if (state === 'connected') {
        this.onStatusChange?.('active');
      } else if (state === 'disconnected' || state === 'failed') {
        this.cleanup();
        this.onStatusChange?.('ended');
      }
    };
  }

  private async setRemoteDescriptionAndFlush(desc: any): Promise<void> {
    await this.pc.setRemoteDescription(new SessionDescription(desc));
    this.remoteDescriptionSet = true;
    for (const candidate of this.pendingCandidates) {
      try {
        await this.pc.addIceCandidate(new IceCandidate(candidate));
      } catch {}
    }
    this.pendingCandidates = [];
  }


  // Expose signaling setup so callers can listen for incoming offers.
  // Ensures call-offer is handled by the same signaling channel.
  private setupIncomingOfferListener(onIncoming: (offerData: any) => void): void {
    const channelName = `call_${[this.myId, this.peerId].sort().join('_')}`;
    this.signalingChannel = supabase.channel(channelName);

    this.signalingChannel
      .on('broadcast', { event: 'call-signal' }, ({ payload }: any) => {
        if (payload.target !== this.myId) return;
        if (payload.type === 'call-offer') {
          this.onStatusChange?.('ringing');
          onIncoming(payload.data);
        }
      })
      .subscribe();
  }


  private setupSignaling(): void {
    const channelName = `call_${[this.myId, this.peerId].sort().join('_')}`;
    this.signalingChannel = supabase.channel(channelName);

    this.signalingChannel
      .on('broadcast', { event: 'call-signal' }, async ({ payload }: any) => {
        if (payload.target !== this.myId) return;

        switch (payload.type) {
          case 'call-answer':
            console.log('[CallManager] recv call-answer');
            await this.setRemoteDescriptionAndFlush(payload.data);
            break;
          case 'call-ice':
            // ICE may arrive before remote description.
            if (this.remoteDescriptionSet) {
              try { await this.pc?.addIceCandidate(new IceCandidate(payload.data)); } catch {}
            } else {
              this.pendingCandidates.push(payload.data);
            }
            break;
          case 'call-hangup':
            this.cleanup();
            this.onStatusChange?.('ended');
            break;
        }
      })
      .subscribe();
  }




  private sendSignal(type: string, data: any): void {
    this.signalingChannel?.send({
      type: 'broadcast',
      event: 'call-signal',
      payload: { target: this.peerId, sender: this.myId, type, data },
    });
  }

  public cleanup(): void {
    this.localStream?.getTracks().forEach((t: any) => t.stop());
    this.pc?.close();
    if (this.signalingChannel) supabase.removeChannel(this.signalingChannel);
    this.localStream = null;
    this.pc = null;
    this.signalingChannel = null;
    this.pendingCandidates = [];
    this.remoteDescriptionSet = false;
  }
}
