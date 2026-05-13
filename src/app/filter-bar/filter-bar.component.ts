import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FilterContentComponent } from '../filter-content/filter-content.component';
import { Job } from '../models/job.model';
import { WaveBtnDirective } from '../directives/wave-btn.directive';

export type AnimPhase = 'idle' | 'blooming' | 'entering' | 'settled';
type FilterMenuKey = 'location' | 'jobType' | 'experienceLevel' | 'companyType';
type MenuVisualState = 'closed' | 'opening' | 'open' | 'closing';

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
  private static readonly MENU_OPEN_MS = 220;
  private static readonly MENU_CLOSE_MS = 180;

  menuStates: Record<FilterMenuKey, MenuVisualState> = {
    location: 'closed',
    jobType: 'closed',
    experienceLevel: 'closed',
    companyType: 'closed',
  };

  animPhase: AnimPhase = 'idle';
  showDetail = false;
  selectedJob: Job | null = null;
  detailReplayKey = 0;

  private bloomTimer: ReturnType<typeof setTimeout> | null = null;
  private settleTimer: ReturnType<typeof setTimeout> | null = null;
  private menuTimers: Partial<
    Record<FilterMenuKey, ReturnType<typeof setTimeout>>
  > = {};

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
      description:
        "Join our design platform team to create the future of collaborative design. You'll lead design initiatives for Figma's core features, driving innovation in real-time collaboration and design systems. This is a high-impact role working with world-class designers and engineers.",
      responsibilities: [
        'Lead design and prototyping for new collaborative features',
        'Conduct extensive user research and competitive analysis',
        'Drive design system evolution and component architecture',
        'Mentor junior designers and establish design standards',
      ],
      recruiterName: 'Sarah Chen',
      recruiterRole: 'Design Hiring Manager',
      postedAgo: '2h ago',
      companyDescription:
        'Figma is the leading collaborative design platform, trusted by millions of designers worldwide. Known for exceptional design culture, rapid innovation, and solving complex problems at scale.',
      companyMeta: {
        type: 'Scale-up',
        size: '200 – 500 employees',
        location: 'San Francisco, CA',
        schedule: 'Mon – Fri',
      },
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
      description:
        "Help us reimagine issue tracking for modern engineering teams. You'll work directly with founders to shape the product experience, iterate rapidly based on user feedback, and build features used by thousands of developers daily.",
      responsibilities: [
        'Design intuitive workflows for engineering collaboration',
        'Prototype interactions using Framer and modern tools',
        'Conduct user interviews and validation testing',
        'Establish and maintain a cohesive design language',
      ],
      recruiterName: 'Alex Rodriguez',
      recruiterRole: 'People Operations Lead',
      postedAgo: '1h ago',
      companyDescription:
        'Linear is building the fastest issue tracking tool for software teams. A fast-growing startup with exceptional founders and a focus on developer experience, backed by top-tier VCs.',
      companyMeta: {
        type: 'Startup',
        size: '50 – 100 employees',
        location: 'Remote',
        schedule: 'Flexible',
      },
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
      description:
        "Create stunning motion design and micro-interactions for Vercel's products. You'll collaborate with our product and engineering teams to deliver delightful animations that enhance user experience across web and mobile platforms.",
      responsibilities: [
        'Design and animate micro-interactions in Figma and After Effects',
        'Implement animations with code using GSAP and Lottie',
        'Optimize motion performance for web and mobile',
        'Establish motion design guidelines and best practices',
      ],
      recruiterName: 'Jamie Wu',
      recruiterRole: 'Creative Recruiter',
      postedAgo: '4h ago',
      companyDescription:
        "Vercel is the platform for frontend developers and teams. We're revolutionizing how developers build, deploy, and scale web applications with exceptional tooling and infrastructure.",
      companyMeta: {
        type: 'Scale-up',
        size: '150 – 300 employees',
        location: 'New York, NY',
        schedule: 'Mon – Fri',
      },
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
      description:
        "Build payment infrastructure that powers billions of transactions globally. You'll work on Stripe's dashboard and developer tools, crafting performant, delightful interfaces for our platform.",
      responsibilities: [
        'Develop and maintain high-performance React components',
        'Optimize bundle size and performance metrics',
        'Collaborate with design on payment flows and experiences',
        'Lead technical architecture discussions for new features',
      ],
      recruiterName: 'Marcus Thompson',
      recruiterRole: 'Engineering Manager',
      postedAgo: '6h ago',
      companyDescription:
        'Stripe is the leading platform for online payments and financial infrastructure. A market leader known for technical excellence, thoughtful design, and a strong engineering culture.',
      companyMeta: {
        type: 'Corporate',
        size: '1000+ employees',
        location: 'Seattle, WA',
        schedule: 'Mon – Fri',
      },
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
      description:
        "Lead the design vision for Notion's core product. You'll manage a team of designers, drive strategic initiatives, and shape how millions of users organize their work and ideas daily.",
      responsibilities: [
        'Lead and mentor a growing design team',
        'Define UX strategy and design principles for the platform',
        'Partner with product leadership on roadmap and vision',
        'Advocate for user research and data-driven design decisions',
      ],
      recruiterName: 'Elena Vasquez',
      recruiterRole: 'Head of Recruiting',
      postedAgo: '3h ago',
      companyDescription:
        'Notion is the all-in-one workspace for your notes, tasks, databases, and wikis. A category-defining company with ambitious product goals and a vibrant community of power users.',
      companyMeta: {
        type: 'Scale-up',
        size: '500 – 1000 employees',
        location: 'Austin, TX',
        schedule: 'Mon – Fri',
      },
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
      description:
        "Join our creative agency and design beautiful digital experiences for our diverse client base. You'll work on web design, mobile apps, and interactive experiences, gaining exposure to different industries and design challenges.",
      responsibilities: [
        'Design user interfaces and user experiences in Figma',
        'Create responsive web designs and prototypes',
        'Collaborate with developers and project managers',
        'Implement designs using HTML, CSS, and Webflow',
      ],
      recruiterName: 'David Park',
      recruiterRole: 'Creative Director',
      postedAgo: '1h ago',
      companyDescription:
        'Pixel Lab is a boutique design agency specializing in digital product design. Known for creative excellence, collaborative culture, and opportunities for junior designers to grow.',
      companyMeta: {
        type: 'Agency',
        size: '20 – 50 employees',
        location: 'Remote',
        schedule: 'Flexible',
      },
    },
  ];

  filteredJobs: Job[] = [];
  displayedJobs: Job[] = [];
  matchedJobIds = new Set<number>();
  private shuffleOffsetById = new Map<number, number>();
  locations: string[] = [];
  jobTypes: string[] = [];
  experienceLevels: string[] = [];
  companyTypes: string[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.filteredJobs = [...this.jobs];
    this.displayedJobs = [...this.jobs];
    this.matchedJobIds = new Set(this.jobs.map((job) => job.id));
    this.buildFilterOptions();
  }

  ngOnDestroy(): void {
    this.clearTimers();
    this.clearMenuTimers();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeAllMenus();
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
    const previousOrder = this.displayedJobs;
    this.filteredJobs = this.jobs.filter((job) => this.matchesFilters(job));
    this.matchedJobIds = new Set(this.filteredJobs.map((job) => job.id));

    const matching = this.jobs.filter((job) => this.matchedJobIds.has(job.id));
    const nonMatching = this.jobs.filter(
      (job) => !this.matchedJobIds.has(job.id),
    );
    const nextOrder = [...matching, ...nonMatching];

    this.shuffleOffsetById = this.buildShuffleOffsets(previousOrder, nextOrder);
    this.displayedJobs = nextOrder;
  }

  private matchesFilters(job: Job): boolean {
    const q = this.searchQuery.toLowerCase();
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
  }

  isJobMatch(job: Job): boolean {
    return this.matchedJobIds.has(job.id);
  }

  getShuffleOffset(job: Job): number {
    return this.shuffleOffsetById.get(job.id) ?? 28;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedLocation = '';
    this.selectedJobType = '';
    this.selectedExperienceLevel = '';
    this.selectedCompanyType = '';
    this.closeAllMenus();
    this.triggerAnimation();
  }

  toggleMenu(menu: FilterMenuKey, event: MouseEvent): void {
    event.stopPropagation();

    if (this.isMenuOpen(menu)) {
      this.closeMenuByKey(menu);
      return;
    }

    this.closeAllMenus(menu);
    this.openMenuByKey(menu);
  }

  closeMenu(event?: MouseEvent): void {
    event?.stopPropagation();
    this.closeAllMenus();
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

    this.closeMenuByKey(menu);
    this.onFilterChange();
  }

  isMenuOpen(menu: FilterMenuKey): boolean {
    return (
      this.menuStates[menu] === 'open' || this.menuStates[menu] === 'opening'
    );
  }

  isMenuClosing(menu: FilterMenuKey): boolean {
    return this.menuStates[menu] === 'closing';
  }

  isMenuVisible(menu: FilterMenuKey): boolean {
    return this.menuStates[menu] !== 'closed';
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
    this.detailReplayKey++; // Trigger animation replay on card switch
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

  private openMenuByKey(menu: FilterMenuKey): void {
    this.clearMenuTimer(menu);
    this.menuStates[menu] = 'opening';
    this.menuTimers[menu] = setTimeout(() => {
      this.menuStates[menu] = 'open';
      delete this.menuTimers[menu];
    }, FilterBarComponent.MENU_OPEN_MS);
  }

  private closeMenuByKey(menu: FilterMenuKey): void {
    if (this.menuStates[menu] === 'closed') {
      return;
    }

    this.clearMenuTimer(menu);
    this.menuStates[menu] = 'closing';
    this.menuTimers[menu] = setTimeout(() => {
      this.menuStates[menu] = 'closed';
      delete this.menuTimers[menu];
    }, FilterBarComponent.MENU_CLOSE_MS);
  }

  private closeAllMenus(except?: FilterMenuKey): void {
    const keys: FilterMenuKey[] = [
      'location',
      'jobType',
      'experienceLevel',
      'companyType',
    ];

    for (const key of keys) {
      if (except && key === except) {
        continue;
      }
      this.closeMenuByKey(key);
    }
  }

  private clearMenuTimer(menu: FilterMenuKey): void {
    const timer = this.menuTimers[menu];
    if (timer) {
      clearTimeout(timer);
      delete this.menuTimers[menu];
    }
  }

  private clearMenuTimers(): void {
    const keys: FilterMenuKey[] = [
      'location',
      'jobType',
      'experienceLevel',
      'companyType',
    ];

    for (const key of keys) {
      this.clearMenuTimer(key);
    }
  }

  private buildShuffleOffsets(
    previousOrder: Job[],
    nextOrder: Job[],
  ): Map<number, number> {
    const previousIndex = new Map<number, number>();
    previousOrder.forEach((job, index) => previousIndex.set(job.id, index));

    const offsetById = new Map<number, number>();
    const promotedStepPx = 86;
    const demotedStepPx = 42;

    nextOrder.forEach((job, nextIndex) => {
      const prevIndex = previousIndex.get(job.id) ?? nextIndex;
      const indexShift = prevIndex - nextIndex;

      if (indexShift > 0) {
        // Promoted matching cards start lower and glide upward into place.
        offsetById.set(job.id, 28 + indexShift * promotedStepPx);
        return;
      }

      if (indexShift < 0) {
        offsetById.set(job.id, 18 + Math.abs(indexShift) * demotedStepPx);
        return;
      }

      offsetById.set(job.id, 28);
    });

    return offsetById;
  }
}
