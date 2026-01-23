import type { Messages } from '../types';

export const en: Messages = {
  // ============================================================================
  // COMMON
  // ============================================================================
  common: {
    appName: 'Sequences',
    loading: 'Loading...',
    error: 'Error',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Log out',
    login: 'Log in',
    signUp: 'Sign up',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    confirm: 'Confirm',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    or: 'or',
    and: 'and',
    all: 'All',
    none: 'None',
    select: 'Select',
    upload: 'Upload',
    download: 'Download',
    refresh: 'Refresh',
    reset: 'Reset',
    clear: 'Clear',
    filter: 'Filter',
    sort: 'Sort',
    view: 'View',
    more: 'More',
    less: 'Less',
    showMore: 'Show more',
    showLess: 'Show less',
    seeAll: 'See all',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This week',
    thisMonth: 'This month',
    thisYear: 'This year',
  },

  // ============================================================================
  // AUTH
  // ============================================================================
  auth: {
    welcome: 'Welcome to Sequences',
    welcomeBack: 'Welcome back',
    signInWith: 'Sign in with {provider}',
    continueWith: 'Continue with {provider}',
    orContinueWith: 'Or continue with',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    forgotPassword: 'Forgot password?',
    resetPassword: 'Reset password',
    termsAgree: 'By continuing, you agree to our Terms of Service and Privacy Policy.',
    emailPlaceholder: 'Enter your email',
    passwordPlaceholder: 'Enter your password',
    verifyEmail: 'Verify your email',
    verifyEmailSent: 'We sent a verification link to your email',
    resendEmail: 'Resend email',
  },

  // ============================================================================
  // NAVIGATION
  // ============================================================================
  nav: {
    home: 'Home',
    storyboard: 'Storyboard',
    create: 'Create',
    messages: 'Messages',
    people: 'People',
    peopleTree: 'People Tree',
    memories: 'Memories',
    notifications: 'Notifications',
    admin: 'Admin Panel',
  },

  // ============================================================================
  // SEQUENCE
  // ============================================================================
  sequence: {
    title: 'Sequence',
    newSequence: 'New Sequence',
    editSequence: 'Edit Sequence',
    deleteSequence: 'Delete Sequence',
    deleteConfirm: 'Are you sure you want to delete this sequence?',
    eventDate: 'Event Date',
    summary: 'Summary',
    emotion: 'Emotion',
    trigger: 'Trigger',
    thought: 'Thought',
    behavior: 'Behavior',
    notes: 'Notes',
    addNote: 'Add Note',
    polarity: 'Polarity',
    intensity: 'Intensity',
    impact: 'Impact',
    isPublic: 'Public',
    makePublic: 'Make Public',
    makePrivate: 'Make Private',
    coreMemory: 'Core Memory',
    markAsCoreMemory: 'Mark as Core Memory',
    linkedPeople: 'People Involved',
    addPeople: 'Add People',
  },

  // ============================================================================
  // EMOTIONS
  // ============================================================================
  emotions: {
    joy: 'Joy',
    trust: 'Trust',
    fear: 'Fear',
    surprise: 'Surprise',
    sadness: 'Sadness',
    disgust: 'Disgust',
    anger: 'Anger',
    anticipation: 'Anticipation',
  },

  // ============================================================================
  // TRIGGERS
  // ============================================================================
  triggers: {
    lifeEvent: 'Life Event',
    socialInteraction: 'Social Interaction',
    achievement: 'Achievement',
    setback: 'Setback',
    financialStatus: 'Financial Status',
    newExperience: 'New Experience',
    rumorNews: 'Rumor/News',
    chanceCoincidence: 'Chance/Coincidence',
    responsibility: 'Responsibility',
    health: 'Health',
  },

  // ============================================================================
  // STORYBOARD
  // ============================================================================
  storyboard: {
    title: 'Your Storyboard',
    empty: 'Your storyboard is empty',
    emptyDescription: 'Start your journey by creating your first sequence',
    dragHint: 'Drag sequences to reorder your story',
    timeline: 'Timeline',
    grid: 'Grid',
    list: 'List',
    canvas: 'Canvas',
    horizontal: 'Horizontal',
    vertical: 'Vertical',
    free: 'Free Layout',
    filterByEmotion: 'Filter by Emotion',
    filterByTrigger: 'Filter by Trigger',
    filterByPerson: 'Filter by Person',
    filterByDate: 'Filter by Date',
    sortBy: 'Sort by',
    newest: 'Newest',
    oldest: 'Oldest',
    mostPositive: 'Most Positive',
    mostNegative: 'Most Negative',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    resetView: 'Reset View',
  },

  // ============================================================================
  // PEOPLE
  // ============================================================================
  people: {
    title: 'People I Know',
    addPerson: 'Add Person',
    editPerson: 'Edit Person',
    deletePerson: 'Delete Person',
    name: 'Name',
    relationship: 'Relationship',
    notes: 'Notes',
    birthday: 'Birthday',
    linkedSequences: 'Linked Sequences',
    isAppUser: 'App User',
    inviteToApp: 'Invite to App',
    sendInvitation: 'Send Invitation',
    invitationSent: 'Invitation sent!',
    tree: 'People Tree',
    treeDescription: 'Visualize your relationships',
    relationships: {
      family: 'Family',
      friend: 'Friend',
      colleague: 'Colleague',
      acquaintance: 'Acquaintance',
      partner: 'Partner',
      parent: 'Parent',
      child: 'Child',
      sibling: 'Sibling',
      spouse: 'Spouse',
      grandparent: 'Grandparent',
      grandchild: 'Grandchild',
      uncle: 'Uncle/Aunt',
      cousin: 'Cousin',
      other: 'Other',
    },
  },

  // ============================================================================
  // MEMORIES
  // ============================================================================
  memories: {
    title: 'Memories',
    newMemory: 'New Memory',
    editMemory: 'Edit Memory',
    deleteMemory: 'Delete Memory',
    description: 'Group your sequences into meaningful memories',
    coverImage: 'Cover Image',
    dateRange: 'Date Range',
    sequences: 'Sequences in this memory',
    addSequences: 'Add Sequences',
    empty: 'No memories yet',
    emptyDescription: 'Create memories by grouping related sequences together',
  },

  // ============================================================================
  // MESSAGES
  // ============================================================================
  messages: {
    title: 'Messages',
    newMessage: 'New Message',
    noMessages: 'No messages yet',
    noMessagesDescription: 'Start a conversation with someone',
    typePlaceholder: 'Type a message...',
    typeMessage: 'Type a message...',
    send: 'Send',
    markAsRead: 'Mark as read',
    deleteMessage: 'Delete message',
    searchConversations: 'Search conversations...',
    selectConversation: 'Select a conversation to start messaging',
  },

  // ============================================================================
  // DASHBOARD
  // ============================================================================
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome back, {name}!',
    subtitle: 'Here\'s your emotional journey overview',
    totalSequences: 'Total Sequences',
    emotionTrend: 'Emotion Trend',
    thoughtTrend: 'Thought Trend',
    behaviorTrend: 'Behavior Trend',
    recentSequences: 'Recent Sequences',
    viewAll: 'View All',
    noSequences: 'No sequences yet',
    createFirst: 'Create Your First Sequence',
    emotionDistribution: 'Emotion Distribution',
    noDataYet: 'Create sequences to see your emotion distribution',
    quickActions: 'Quick Actions',
    newSequence: 'New Sequence',
    managePeople: 'Manage People',
    viewStoryboard: 'View Storyboard',
  },

  // ============================================================================
  // SETTINGS
  // ============================================================================
  settings: {
    title: 'Settings',
    appearance: 'Appearance',
    theme: 'Theme',
    language: 'Language',
    notifications: 'Notifications',
    emailNotifications: 'Email Notifications',
    pushNotifications: 'Push Notifications',
    privacy: 'Privacy',
    publicProfile: 'Public Profile',
    showInSearch: 'Show in People Search',
    account: 'Account',
    deleteAccount: 'Delete Account',
    deleteAccountConfirm: 'Are you sure? This action cannot be undone.',
    exportData: 'Export Data',
    storyboard: 'Storyboard',
    defaultView: 'Default View',
    defaultLayout: 'Default Layout',
  },

  // ============================================================================
  // ADMIN
  // ============================================================================
  admin: {
    title: 'Admin Panel',
    dashboard: 'Dashboard',
    users: 'Users',
    content: 'Content',
    analytics: 'Analytics',
    systemSettings: 'System Settings',
    quotes: 'Quotes',
    contentBlocks: 'Content Blocks',
    auditLog: 'Audit Log',
    
    branding: 'Branding',
    appName: 'App Name',
    appDescription: 'App Description',
    logoLight: 'Logo (Light Mode)',
    logoDark: 'Logo (Dark Mode)',
    faviconLight: 'Favicon (Light Mode)',
    faviconDark: 'Favicon (Dark Mode)',
    
    colors: 'Colors',
    primaryColor: 'Primary Color',
    accentColor: 'Accent Color',
    
    typography: 'Typography',
    fontHeading: 'Heading Font',
    fontBody: 'Body Font',
    
    defaults: 'Defaults',
    defaultTheme: 'Default Theme',
    defaultLocale: 'Default Language',
    
    features: 'Features',
    maintenanceMode: 'Maintenance Mode',
    registrationEnabled: 'Registration Enabled',
    inviteOnlyMode: 'Invite Only Mode',
    quotesEnabled: 'Quotes Enabled',
    splashQuotes: 'Splash Screen Quotes',
    dailyQuoteNotif: 'Daily Quote Notifications',
    
    limits: 'Limits',
    maxSequencesPerUser: 'Max Sequences per User',
    maxPeoplePerUser: 'Max People per User',
    maxMemoriesPerUser: 'Max Memories per User',
    unlimitedHint: '0 = Unlimited',
    
    stats: 'Statistics',
    totalUsers: 'Total Users',
    totalSequences: 'Total Sequences',
    totalMemories: 'Total Memories',
    activeToday: 'Active Today',
  },

  // ============================================================================
  // ONBOARDING
  // ============================================================================
  onboarding: {
    welcome: 'Welcome to Sequences',
    welcomeDescription: 'Your personal journey tracker for emotions, thoughts, and behaviors',
    
    step1Title: 'Choose Your Username',
    step1Description: 'Pick a unique username that others can use to find you',
    usernamePlaceholder: 'Enter username',
    usernameAvailable: 'Username is available',
    usernameTaken: 'Username is already taken',
    
    step2Title: 'Tell Us About Yourself',
    step2Description: 'This helps personalize your experience',
    birthdayLabel: 'Your Birthday',
    
    step3Title: 'Your First Memory',
    step3Description: 'Start your journey with a core memory - a significant moment in your life',
    skipForNow: 'Skip for now',
    
    step4Title: 'Invite Your Circle',
    step4Description: 'Connect with people who matter to you',
    inviteLater: 'I\'ll do this later',
    
    complete: 'Complete Setup',
    letsGo: "Let's Go!",
  },

  // ============================================================================
  // ERRORS
  // ============================================================================
  errors: {
    generic: 'Something went wrong',
    notFound: 'Not found',
    unauthorized: 'Please sign in',
    forbidden: 'Access denied',
    validation: 'Please check your input',
    network: 'Network error',
    serverError: 'Server error',
    tryAgain: 'Please try again',
  },

  // ============================================================================
  // QUOTES
  // ============================================================================
  quotes: {
    title: 'Wisdom',
    dailyQuote: 'Quote of the Day',
    category: 'Category',
    source: 'Source',
    continue: 'Continue',
    refresh: 'New Quote',
    noQuotes: 'No quotes available',
    categories: {
      psychology: 'Psychology',
      philosophy: 'Philosophy',
      sociology: 'Sociology',
    },
  },

  // ============================================================================
  // CBT ANALYSIS
  // ============================================================================
  cbt: {
    analysisTitle: 'CBT Analysis',
    emotionScore: 'Emotion Score',
    thoughtScore: 'Thought Score',
    behaviorScore: 'Behavior Score',
    overallScore: 'Overall Score',
    patterns: 'Emotional Patterns',
    dominantEmotion: 'Dominant Emotion',
    commonTrigger: 'Most Common Trigger',
    totalSequences: 'Total Sequences',
    highIntensity: 'High Intensity Events',
    insights: 'CBT Insights',
    positivePattern: 'Your recent sequences show predominantly positive emotional and behavioral patterns.',
    challengingPeriod: 'Your sequences indicate a challenging emotional period.',
    thoughtEmotionGap: 'Your thoughts tend to be more negative than your emotions.',
    behavioralResilience: 'Your behaviors show positive adaptation despite challenging thoughts.',
    highIntensityPatterns: 'Many of your sequences show high emotional intensity.',
    improvingTrend: 'Your recent sequences show an improving emotional trend.',
    decliningTrend: 'Your recent sequences show a declining emotional trend.',
    balancedPattern: 'Your emotional, thought, and behavioral patterns are relatively balanced.',
  },

  // ============================================================================
  // PROFILE
  // ============================================================================
  profile: {
    title: 'Profile',
    editProfile: 'Edit Profile',
    bio: 'Bio',
    bioPlaceholder: 'Tell us about yourself...',
    followers: 'Followers',
    following: 'Following',
    sequences: 'Sequences',
    memories: 'Memories',
    publicSequences: 'Public Sequences',
    noPublicSequences: 'No public sequences yet',
    follow: 'Follow',
    unfollow: 'Unfollow',
    joinedDate: 'Joined {date}',
  },
};
