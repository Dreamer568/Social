import { Platform } from 'react-native';
import { supabase } from './supabase';

let PeerConnection: any;
let SessionDescription: any;
let IceCandidate: any;

if (Platform.OS === 'web') {
  if (typeof window !== 'undefined') {
    PeerConnection = (window as any).RTCPeerConnection || (window as any).webkitRTCPeerConnection;
    SessionDescription = (window as any).RTCSessionDescription;
    IceCandidate = (window as any).RTCIceCandidate;
  }
} else {
  const webrtc = require('react-native-webrtc');
  PeerConnection = webrtc.RTCPeerConnection;
  SessionDescription = webrtc.RTCSessionDescription;
  IceCandidate = webrtc.RTCIceCandidate;
}


const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export class WebRTCManager {
  private pc: any = null;
  private dataChannel: any = null;
  private signalingChannel: any = null;
  private myId: string;
  private peerId: string;
  private onMessageCallback: ((message: string) => void) | null = null;
  private onStatusChangeCallback: ((status: 'connecting' | 'connected' | 'disconnected') => void) | null = null;
  // Buffer for ICE candidates that arrive before remote description is set
  private pendingCandidates: any[] = [];
  private remoteDescriptionSet = false;

  constructor(myId: string, peerId: string) {
    this.myId = myId;
    this.peerId = peerId;
  }

  public setCallbacks(
    onMessage: (message: string) => void,
    onStatusChange: (status: 'connecting' | 'connected' | 'disconnected') => void
  ) {
    this.onMessageCallback = onMessage;
    this.onStatusChangeCallback = onStatusChange;
  }

  public async connect(isInitiator: boolean = true) {
    this.updateStatus('connecting');
    this.setupSignaling();
    
    this.pc = new PeerConnection(configuration);
    const pcAny: any = this.pc;

    pcAny.onicecandidate = (event: any) => {
      if (event.candidate) {
        this.sendSignal('ice-candidate', event.candidate);
      }
    };

    pcAny.onconnectionstatechange = () => {
      if (this.pc) {
        if (this.pc.connectionState === 'connected') {
          this.updateStatus('connected');
        } else if (this.pc.connectionState === 'disconnected' || this.pc.connectionState === 'failed') {
          this.updateStatus('disconnected');
        }
      }
    };

    if (!this.pc) return;

    if (isInitiator) {
      this.dataChannel = pcAny.createDataChannel('chat');
      this.setupDataChannel(this.dataChannel);
      const offer = await this.pc.createOffer({});
      await this.pc.setLocalDescription(offer);
      this.sendSignal('offer', offer);
    } else {
      pcAny.ondatachannel = (event: any) => {
        this.dataChannel = event.channel;
        this.setupDataChannel(this.dataChannel);
      };
    }
  }

  private async setRemoteDescriptionAndFlush(desc: any) {
    await this.pc.setRemoteDescription(new SessionDescription(desc));
    this.remoteDescriptionSet = true;
    // Flush any buffered ICE candidates
    for (const candidate of this.pendingCandidates) {
      try {
        await this.pc.addIceCandidate(new IceCandidate(candidate));
      } catch (e) {
        console.warn('Failed to add buffered ICE candidate:', e);
      }
    }
    this.pendingCandidates = [];
  }

  private setupDataChannel(channel: any) {
    channel.onmessage = (event: any) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(event.data);
      }
    };
    channel.onopen = () => { this.updateStatus('connected'); };
    channel.onclose = () => { this.updateStatus('disconnected'); };
  }

  private setupSignaling() {
    const channelName = [this.myId, this.peerId].sort().join('-');
    
    this.signalingChannel = supabase.channel(`webrtc-${channelName}`);
    
    this.signalingChannel
      .on('broadcast', { event: 'signal' }, async ({ payload }: any) => {
        if (payload.target !== this.myId) return;
        if (!this.pc) return;

        switch (payload.type) {
          case 'offer':
            await this.setRemoteDescriptionAndFlush(payload.data);
            const answer = await this.pc.createAnswer();
            await this.pc.setLocalDescription(answer);
            this.sendSignal('answer', answer);
            break;
          case 'answer':
            await this.setRemoteDescriptionAndFlush(payload.data);
            break;
          case 'ice-candidate':
            if (this.remoteDescriptionSet) {
              try {
                await this.pc.addIceCandidate(new IceCandidate(payload.data));
              } catch (e) {
                console.warn('ICE candidate error:', e);
              }
            } else {
              // Buffer it until remote description is ready
              this.pendingCandidates.push(payload.data);
            }
            break;
        }
      })
      .subscribe();
  }

  private sendSignal(type: 'offer' | 'answer' | 'ice-candidate', data: any) {
    if (this.signalingChannel) {
      this.signalingChannel.send({
        type: 'broadcast',
        event: 'signal',
        payload: {
          target: this.peerId,
          sender: this.myId,
          type,
          data
        }
      });
    }
  }

  public sendMessage(text: string): boolean {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(text);
      return true; // Sent via P2P
    }
    return false; // Failed, fallback needed
  }

  private updateStatus(status: 'connecting' | 'connected' | 'disconnected') {
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status);
    }
  }

  public disconnect() {
    if (this.dataChannel) this.dataChannel.close();
    if (this.pc) this.pc.close();
    if (this.signalingChannel) supabase.removeChannel(this.signalingChannel);
    this.updateStatus('disconnected');
  }
}
