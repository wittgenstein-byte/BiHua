export class StrokeAnimatorController {
  constructor(writerInstance) {
    this.writer = writerInstance;
    this.isPlaying = false;
    this.currentStrokeIndex = 0;
    this.totalStrokes = 0;
    this.speed = 1.0;
    this.highlightRadicals = true;

    if (this.writer) {
      this.writer.getCharacterData().then(data => {
        if (data) {
          this.totalStrokes = data.strokes.length;
        }
      }).catch(err => console.error(err));
    }
  }

  async animateCharacter(onComplete) {
    if (!this.writer) return;
    this.isPlaying = true;
    try {
      await this.writer.animateCharacter({
        onComplete: () => {
          this.isPlaying = false;
          if (onComplete) onComplete();
        }
      });
    } catch (err) {
      this.isPlaying = false;
    }
  }

  pause() {
    if (!this.writer) return;
    this.writer.pauseAnimation();
    this.isPlaying = false;
  }

  async stepForward() {
    if (!this.writer || this.currentStrokeIndex >= this.totalStrokes) return;
    this.pause();
    this.currentStrokeIndex++;
    await this.writer.animateStroke(this.currentStrokeIndex - 1);
  }

  stepBackward() {
    if (!this.writer || this.currentStrokeIndex <= 0) return;
    this.pause();
    this.currentStrokeIndex--;
    this.writer.showCharacter();
  }

  reset() {
    if (!this.writer) return;
    this.pause();
    this.currentStrokeIndex = 0;
    this.writer.hideCharacter();
  }

  setSpeed(newSpeed) {
    this.speed = newSpeed;
    if (this.writer) {
      this.writer.updateOptions({
        strokeAnimationSpeed: newSpeed
      });
    }
  }

  toggleRadicalHighlight(enable) {
    this.highlightRadicals = enable;
    if (this.writer) {
      // HanziWriter handles radical color automatically if set in options
      this.writer.updateOptions({
        radicalColor: enable ? '#f43f5e' : '#0f172a'
      });
    }
  }
}
