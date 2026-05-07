import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FilterContentComponent } from '../filter-content/filter-content.component';
import { Job } from '../models/job.model';
import { WaveBtnDirective } from '../directives/wave-btn.directive';

export type AnimPhase = 'idle' | 'blooming' | 'entering' | 'settled';
type FilterMenuKey = 'location' | 'jobType' | 'experienceLevel' | 'companyType';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FilterContentComponent,
    WaveBtnDirective,
  ],
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss'],
})
export class FilterBarComponent implements OnInit, OnDestroy {
  searchQuery = '';
  selectedLocation = '';
  selectedJobType = '';
  selectedExperienceLevel = '';
  selectedCompanyType = '';
  openMenu: FilterMenuKey | null = null;

  animPhase: AnimPhase = 'idle';
  showDetail = false;
  selectedJob: Job | null = null;

  private bloomTimer: ReturnType<typeof setTimeout> | null = null;
  private settleTimer: ReturnType<typeof setTimeout> | null = null;

  readonly jobs: Job[] = [
    {
      id: 1,
      title: 'Senior UX Designer',
      company: 'Figma',
      location: 'San Francisco, CA',
      jobType: 'Hybrid',
      experienceLevel: 'Senior',
      companyType: 'Scale-up',
      salary: '$140K – $170K',
      logo: 'pyramid-icon.png',
      badge: 'hot',
      tags: ['Figma', 'Prototyping', 'User Research'],
    },
    {
      id: 2,
      title: 'Product Designer',
      company: 'Linear',
      location: 'Remote',
      jobType: 'Remote',
      experienceLevel: 'Mid-Level',
      companyType: 'Startup',
      salary: '$110K – $135K',
      logo: 'rounded-icon.png',
      badge: 'new',
      tags: ['Design Systems', 'Interaction', 'Framer'],
    },
    {
      id: 3,
      title: 'Motion Designer',
      company: 'Vercel',
      location: 'New York, NY',
      jobType: 'Remote',
      experienceLevel: 'Mid-Level',
      companyType: 'Scale-up',
      salary: '$105K – $130K',
      logo: 'bubbles-colored.png',
      badge: 'hot',
      tags: ['After Effects', 'Lottie', 'GSAP'],
    },
    {
      id: 4,
      title: 'Frontend Engineer',
      company: 'Stripe',
      location: 'Seattle, WA',
      jobType: 'Hybrid',
      experienceLevel: 'Senior',
      companyType: 'Corporate',
      salary: '$160K – $200K',
      logo: '2logo.png',
      badge: null,
      tags: ['React', 'TypeScript', 'Animation'],
    },
    {
      id: 5,
      title: 'UX Lead',
      company: 'Notion',
      location: 'Austin, TX',
      jobType: 'On Site',
      experienceLevel: 'Lead',
      companyType: 'Scale-up',
      salary: '$150K – $180K',
      logo: 'pyramid-icon.png',
      badge: null,
      tags: ['Leadership', 'UX Strategy', 'Research'],
    },
    {
      id: 6,
      title: 'UI/UX Designer',
      company: 'Pixel Lab',
      location: 'Remote',
      jobType: 'Remote',
      experienceLevel: 'Junior',
      companyType: 'Agency',
      salary: '$65K – $85K',
      logo: 'rounded-icon.png',
      badge: 'new',
      tags: ['UI Design', 'Figma', 'Webflow'],
    },
  ];

  filteredJobs: Job[] = [];
  locations: string[] = [];
  jobTypes: string[] = [];
  experienceLevels: string[] = [];
  companyTypes: string[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.filteredJobs = [...this.jobs];
    this.buildFilterOptions();
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openMenu = null;
  }

  buildFilterOptions(): void {
    this.locations = [...new Set(this.jobs.map((j) => j.location))];
    this.jobTypes = [...new Set(this.jobs.map((j) => j.jobType))];
    this.experienceLevels = [
      ...new Set(this.jobs.map((j) => j.experienceLevel)),
    ];
    this.companyTypes = [...new Set(this.jobs.map((j) => j.companyType))];
  }

  onSearchInput(): void {
    this.triggerAnimation();
  }

  onFilterChange(): void {
    this.triggerAnimation();
  }

  private triggerAnimation(): void {
    this.clearTimers();
    this.animPhase = 'blooming';
    this.bloomTimer = setTimeout(() => {
      this.applyFilters();
      this.animPhase = 'entering';
      const settleDuration = 200 + this.filteredJobs.length * 90;
      this.settleTimer = setTimeout(() => {
        this.animPhase = 'settled';
      }, settleDuration);
    }, 360);
  }

  private applyFilters(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredJobs = this.jobs.filter((job) => {
      const matchSearch = q
        ? job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q)
        : true;
      const matchLocation = this.selectedLocation
        ? job.location === this.selectedLocation
        : true;
      const matchType = this.selectedJobType
        ? job.jobType === this.selectedJobType
        : true;
      const matchLevel = this.selectedExperienceLevel
        ? job.experienceLevel === this.selectedExperienceLevel
        : true;
      const matchCompany = this.selectedCompanyType
        ? job.companyType === this.selectedCompanyType
        : true;
      return (
        matchSearch && matchLocation && matchType && matchLevel && matchCompany
      );
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedLocation = '';
    this.selectedJobType = '';
    this.selectedExperienceLevel = '';
    this.selectedCompanyType = '';
    this.openMenu = null;
    this.triggerAnimation();
  }

  toggleMenu(menu: FilterMenuKey, event: MouseEvent): void {
    event.stopPropagation();
    this.openMenu = this.openMenu === menu ? null : menu;
  }

  closeMenu(event?: MouseEvent): void {
    event?.stopPropagation();
    this.openMenu = null;
  }

  selectFilter(menu: FilterMenuKey, value: string, event: MouseEvent): void {
    event.stopPropagation();

    switch (menu) {
      case 'location':
        this.selectedLocation = value;
        break;
      case 'jobType':
        this.selectedJobType = value;
        break;
      case 'experienceLevel':
        this.selectedExperienceLevel = value;
        break;
      case 'companyType':
        this.selectedCompanyType = value;
        break;
    }

    this.openMenu = null;
    this.onFilterChange();
  }

  isMenuOpen(menu: FilterMenuKey): boolean {
    return this.openMenu === menu;
  }

  getFilterValue(menu: FilterMenuKey): string {
    switch (menu) {
      case 'location':
        return this.selectedLocation;
      case 'jobType':
        return this.selectedJobType;
      case 'experienceLevel':
        return this.selectedExperienceLevel;
      case 'companyType':
        return this.selectedCompanyType;
    }
  }

  hasFilterValue(menu: FilterMenuKey): boolean {
    return !!this.getFilterValue(menu);
  }

  onMenuOptionHover(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const option = target?.closest('.menu-option') as HTMLElement | null;
    if (!option) {
      return;
    }

    const rect = option.getBoundingClientRect();
    if (!rect.width) {
      return;
    }

    const origin = ((event.clientX - rect.left) / rect.width) * 100;
    const clamped = Math.min(100, Math.max(0, origin));
    option.style.setProperty('--origin-x', `${clamped}%`);
  }

  onCardClick(job: Job): void {
    this.selectedJob = job;
    this.showDetail = true;
  }

  onCardClickMobile(job: Job): void {
    this.router.navigate(['/filter-content', job.id], { state: { job } });
  }

  /** 3D magnetic tilt — desktop only, skipped during phase transitions. */
  onCardMouseMove(e: MouseEvent): void {
    if (this.animPhase === 'blooming' || this.animPhase === 'entering') return;
    const card = e.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    card.style.transition = 'none';
    card.style.transform = `perspective(900px) rotateY(${dx * 8}deg) rotateX(${-dy * 6}deg) translateZ(8px)`;
    card.style.setProperty(
      '--gx',
      `${((e.clientX - rect.left) / rect.width) * 100}%`,
    );
    card.style.setProperty(
      '--gy',
      `${((e.clientY - rect.top) / rect.height) * 100}%`,
    );
    card.style.setProperty('--glow-opacity', '1');
  }

  onCardMouseLeave(e: MouseEvent): void {
    const card = e.currentTarget as HTMLElement;
    card.style.transition =
      'transform 0.5s var(--ease-spring), box-shadow var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)';
    card.style.transform = '';
    card.style.setProperty('--glow-opacity', '0');
  }

  get activeFilterCount(): number {
    return [
      this.selectedLocation,
      this.selectedJobType,
      this.selectedExperienceLevel,
      this.selectedCompanyType,
    ].filter(Boolean).length;
  }

  private clearTimers(): void {
    if (this.bloomTimer) clearTimeout(this.bloomTimer);
    if (this.settleTimer) clearTimeout(this.settleTimer);
  }
}
