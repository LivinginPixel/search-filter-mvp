import { Component, Input, OnInit } from '@angular/core';
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
export class FilterContentComponent implements OnInit {
  @Input() job: Job | null = null;

  readonly responsibilities = [
    'Design and prototype user interfaces for web and mobile products.',
    'Collaborate with engineers and PMs to define and refine UX strategy.',
    'Conduct user research, usability tests, and iterate based on feedback.',
    'Build and maintain a scalable, consistent design system.',
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (!this.job) {
      this.job = history.state?.job ?? null;
    }
    if (!this.job) {
      this.router.navigate(['/']);
    }
  }
}
