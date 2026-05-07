import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[waveBtn]',
  standalone: true,
})
export class WaveBtnDirective {
  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('mouseenter', ['$event'])
  onEnter(e: MouseEvent): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const fromRight = (e.clientX - rect.left) / rect.width > 0.5;
    this.play(fromRight ? 'rtl' : 'ltr');
  }

  @HostListener('mouseleave', ['$event'])
  onLeave(e: MouseEvent): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const exitRight = (e.clientX - rect.left) / rect.width > 0.5;
    this.play(exitRight ? 'ltr' : 'rtl');
  }

  private play(dir: 'ltr' | 'rtl'): void {
    const el = this.el.nativeElement;
    el.classList.remove('wave-ltr', 'wave-rtl');
    void el.offsetWidth; // force reflow to restart animation
    el.classList.add(`wave-${dir}`);
  }
}
