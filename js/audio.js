/**
 * Simple Procedural Audio Manager using Web Audio API
 */
export class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterVolume = null;
        this.motorOsc = null;
        this.heartOsc = null;
        this.lowPassFilter = null;
        this.isMuffled = false;
    }

    init() {
        // Create audio context
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Master Volume
        this.masterVolume = this.ctx.createGain();
        this.masterVolume.gain.value = 0.5;
        
        // Low Pass Filter (for muffled effect inside car)
        this.lowPassFilter = this.ctx.createBiquadFilter();
        this.lowPassFilter.type = 'lowpass';
        this.lowPassFilter.frequency.value = 20000; // Normal start (unfiltered)

        // Chain nodes: Osc -> Filter -> Volume -> Output
        this.lowPassFilter.connect(this.masterVolume);
        this.masterVolume.connect(this.ctx.destination);
    }

    setMuffled(muffled) {
        if (!this.ctx) return;
        this.isMuffled = muffled;
        // Smooth transition
        const targetFreq = muffled ? 400 : 20000;
        this.lowPassFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.5);
    }

    startMotorSound() {
        if (!this.ctx) return;
        // Setup simple drone motor sound
        this.motorOsc = this.ctx.createOscillator();
        this.motorOsc.type = 'triangle';
        this.motorOsc.frequency.value = 60; // low drone
        
        const motorGain = this.ctx.createGain();
        motorGain.gain.value = 0.2;

        this.motorOsc.connect(motorGain);
        motorGain.connect(this.lowPassFilter);
        this.motorOsc.start();
    }

    stopMotorSound() {
        if (this.motorOsc) {
            this.motorOsc.stop();
            this.motorOsc = null;
        }
    }

    startHeartbeat(bpm = 60) {
        if (!this.ctx) return;
        // Interval for heartbeat beats
        const interval = 60000 / bpm;
        this.heartBeatInterval = setInterval(() => {
            this.playBeatSound();
        }, interval);
    }

    stopHeartbeat() {
        if (this.heartBeatInterval) {
            clearInterval(this.heartBeatInterval);
            this.heartBeatInterval = null;
        }
    }

    playBeatSound() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = 80; // Low thump
        
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.lowPassFilter);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    adjustMotorPitch(speed) {
        if (!this.motorOsc) return;
        // Speed up motor with velocity
        const basePitch = 60;
        const targetPitch = basePitch + (speed * 0.5);
        this.motorOsc.frequency.setTargetAtTime(targetPitch, this.ctx.currentTime, 0.1);
    }
}
