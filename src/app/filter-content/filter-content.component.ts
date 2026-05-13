import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Job } from '../models/job.model';
import { WaveBtnDirective } from '../directives/wave-btn.directive';

@Component({
  selector: 'app-filter-content',
  standalone: true,
  imports: [CommonModule, WaveBtnDirective],
  templateUrl: './filter-content.component.html',
  styleUrls: ['./filter-content.component.scss'],
})
export class FilterContentComponent implements OnInit, OnChanges {
  @Input() job: Job | null = null;

  constructor(
    private router: Router,
    private el: ElementRef,
  ) {}

  ngOnInit(): void {
    if (!this.job) {
      this.job = history.state?.job ?? null;
    }
    if (!this.job) {
      this.router.navigate(['/']);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['job'] && !changes['job'].firstChange) {
      // Job changed - replay animations by forcing a reflow
      setTimeout(() => this.replayAnimations(), 0);
    }
  }

  private replayAnimations(): void {
    const hostEl = this.el.nativeElement as HTMLElement;
    // Remove animation to reset state
    hostEl.style.animation = 'none';
    // Trigger reflow
    void hostEl.offsetWidth;
    // Re-apply animation
    hostEl.style.animation = '';
  }
}
