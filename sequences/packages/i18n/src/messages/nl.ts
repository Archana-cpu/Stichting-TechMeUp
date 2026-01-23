import type { Messages } from '../types';

export const nl: Messages = {
  // ============================================================================
  // COMMON
  // ============================================================================
  common: {
    appName: 'Sequences',
    loading: 'Laden...',
    error: 'Fout',
    save: 'Opslaan',
    cancel: 'Annuleren',
    delete: 'Verwijderen',
    edit: 'Bewerken',
    create: 'Aanmaken',
    search: 'Zoeken',
    settings: 'Instellingen',
    profile: 'Profiel',
    logout: 'Uitloggen',
    login: 'Inloggen',
    signUp: 'Registreren',
    back: 'Terug',
    next: 'Volgende',
    submit: 'Verzenden',
    confirm: 'Bevestigen',
    close: 'Sluiten',
    yes: 'Ja',
    no: 'Nee',
    or: 'of',
    and: 'en',
    all: 'Alle',
    none: 'Geen',
    select: 'Selecteren',
    upload: 'Uploaden',
    download: 'Downloaden',
    refresh: 'Vernieuwen',
    reset: 'Resetten',
    clear: 'Wissen',
    filter: 'Filteren',
    sort: 'Sorteren',
    view: 'Bekijken',
    more: 'Meer',
    less: 'Minder',
    showMore: 'Meer tonen',
    showLess: 'Minder tonen',
    seeAll: 'Alles bekijken',
    today: 'Vandaag',
    yesterday: 'Gisteren',
    tomorrow: 'Morgen',
    thisWeek: 'Deze week',
    thisMonth: 'Deze maand',
    thisYear: 'Dit jaar',
  },

  // ============================================================================
  // AUTH
  // ============================================================================
  auth: {
    welcome: 'Welkom bij Sequences',
    welcomeBack: 'Welkom terug',
    signInWith: 'Inloggen met {provider}',
    continueWith: 'Doorgaan met {provider}',
    orContinueWith: 'Of ga verder met',
    noAccount: 'Nog geen account?',
    hasAccount: 'Heeft u al een account?',
    forgotPassword: 'Wachtwoord vergeten?',
    resetPassword: 'Wachtwoord resetten',
    termsAgree: 'Door verder te gaan, gaat u akkoord met onze Servicevoorwaarden en Privacybeleid.',
    emailPlaceholder: 'Voer uw e-mail in',
    passwordPlaceholder: 'Voer uw wachtwoord in',
    verifyEmail: 'Verifieer uw e-mail',
    verifyEmailSent: 'We hebben een verificatielink naar uw e-mail gestuurd',
    resendEmail: 'E-mail opnieuw versturen',
  },

  // ============================================================================
  // NAVIGATION
  // ============================================================================
  nav: {
    home: 'Home',
    storyboard: 'Storyboard',
    create: 'Aanmaken',
    messages: 'Berichten',
    people: 'Mensen',
    peopleTree: 'Relatieboom',
    memories: 'Herinneringen',
    notifications: 'Meldingen',
    admin: 'Beheerder',
  },

  // ============================================================================
  // SEQUENCE
  // ============================================================================
  sequence: {
    title: 'Sequentie',
    newSequence: 'Nieuwe Sequentie',
    editSequence: 'Sequentie Bewerken',
    deleteSequence: 'Sequentie Verwijderen',
    deleteConfirm: 'Weet u zeker dat u deze sequentie wilt verwijderen?',
    eventDate: 'Gebeurtenisdatum',
    summary: 'Samenvatting',
    emotion: 'Emotie',
    trigger: 'Trigger',
    thought: 'Gedachte',
    behavior: 'Gedrag',
    notes: 'Notities',
    addNote: 'Notitie Toevoegen',
    polarity: 'Polariteit',
    intensity: 'Intensiteit',
    impact: 'Impact',
    isPublic: 'Openbaar',
    makePublic: 'Openbaar Maken',
    makePrivate: 'Privé Maken',
    coreMemory: 'Kernherinnering',
    markAsCoreMemory: 'Markeren als Kernherinnering',
    linkedPeople: 'Betrokken Personen',
    addPeople: 'Personen Toevoegen',
  },

  // ============================================================================
  // EMOTIONS
  // ============================================================================
  emotions: {
    joy: 'Vreugde',
    trust: 'Vertrouwen',
    fear: 'Angst',
    surprise: 'Verrassing',
    sadness: 'Verdriet',
    disgust: 'Walging',
    anger: 'Woede',
    anticipation: 'Verwachting',
  },

  // ============================================================================
  // TRIGGERS
  // ============================================================================
  triggers: {
    lifeEvent: 'Levensgebeurtenis',
    socialInteraction: 'Sociale Interactie',
    achievement: 'Prestatie',
    setback: 'Tegenslag',
    financialStatus: 'Financiële Status',
    newExperience: 'Nieuwe Ervaring',
    rumorNews: 'Gerucht/Nieuws',
    chanceCoincidence: 'Toeval',
    responsibility: 'Verantwoordelijkheid',
    health: 'Gezondheid',
  },

  // ============================================================================
  // STORYBOARD
  // ============================================================================
  storyboard: {
    title: 'Uw Storyboard',
    empty: 'Uw storyboard is leeg',
    emptyDescription: 'Begin uw reis door uw eerste sequentie aan te maken',
    dragHint: 'Sleep sequenties om uw verhaal te herschikken',
    timeline: 'Tijdlijn',
    grid: 'Raster',
    list: 'Lijst',
    canvas: 'Canvas',
    horizontal: 'Horizontaal',
    vertical: 'Verticaal',
    free: 'Vrije Indeling',
    filterByEmotion: 'Filter op Emotie',
    filterByTrigger: 'Filter op Trigger',
    filterByPerson: 'Filter op Persoon',
    filterByDate: 'Filter op Datum',
    sortBy: 'Sorteren op',
    newest: 'Nieuwste',
    oldest: 'Oudste',
    mostPositive: 'Meest Positief',
    mostNegative: 'Meest Negatief',
    zoomIn: 'Inzoomen',
    zoomOut: 'Uitzoomen',
    resetView: 'Weergave Resetten',
  },

  // ============================================================================
  // PEOPLE
  // ============================================================================
  people: {
    title: 'Mensen die ik Ken',
    addPerson: 'Persoon Toevoegen',
    editPerson: 'Persoon Bewerken',
    deletePerson: 'Persoon Verwijderen',
    name: 'Naam',
    relationship: 'Relatie',
    notes: 'Notities',
    birthday: 'Verjaardag',
    linkedSequences: 'Gekoppelde Sequenties',
    isAppUser: 'App Gebruiker',
    inviteToApp: 'Uitnodigen voor App',
    sendInvitation: 'Uitnodiging Versturen',
    invitationSent: 'Uitnodiging verstuurd!',
    tree: 'Relatieboom',
    treeDescription: 'Visualiseer uw relaties',
    relationships: {
      family: 'Familie',
      friend: 'Vriend',
      colleague: 'Collega',
      acquaintance: 'Kennis',
      partner: 'Partner',
      parent: 'Ouder',
      child: 'Kind',
      sibling: 'Broer/Zus',
      spouse: 'Echtgenoot',
      grandparent: 'Grootouder',
      grandchild: 'Kleinkind',
      uncle: 'Oom/Tante',
      cousin: 'Neef/Nicht',
      other: 'Anders',
    },
  },

  // ============================================================================
  // MEMORIES
  // ============================================================================
  memories: {
    title: 'Herinneringen',
    newMemory: 'Nieuwe Herinnering',
    editMemory: 'Herinnering Bewerken',
    deleteMemory: 'Herinnering Verwijderen',
    description: 'Groepeer uw sequenties in betekenisvolle herinneringen',
    coverImage: 'Omslagafbeelding',
    dateRange: 'Datumbereik',
    sequences: 'Sequenties in deze herinnering',
    addSequences: 'Sequenties Toevoegen',
    empty: 'Nog geen herinneringen',
    emptyDescription: 'Maak herinneringen door gerelateerde sequenties te groeperen',
  },

  // ============================================================================
  // MESSAGES
  // ============================================================================
  messages: {
    title: 'Berichten',
    newMessage: 'Nieuw Bericht',
    noMessages: 'Nog geen berichten',
    noMessagesDescription: 'Start een gesprek met iemand',
    typePlaceholder: 'Typ een bericht...',
    typeMessage: 'Typ een bericht...',
    send: 'Versturen',
    markAsRead: 'Markeren als gelezen',
    deleteMessage: 'Bericht verwijderen',
    searchConversations: 'Gesprekken zoeken...',
    selectConversation: 'Selecteer een gesprek om te beginnen',
  },

  // ============================================================================
  // DASHBOARD
  // ============================================================================
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welkom terug, {name}!',
    subtitle: 'Hier is uw emotionele reis overzicht',
    totalSequences: 'Totaal Sequenties',
    emotionTrend: 'Emotie Trend',
    thoughtTrend: 'Gedachte Trend',
    behaviorTrend: 'Gedrag Trend',
    recentSequences: 'Recente Sequenties',
    viewAll: 'Alles Bekijken',
    noSequences: 'Nog geen sequenties',
    createFirst: 'Maak Uw Eerste Sequentie',
    emotionDistribution: 'Emotie Verdeling',
    noDataYet: 'Maak sequenties om uw emotie verdeling te zien',
    quickActions: 'Snelle Acties',
    newSequence: 'Nieuwe Sequentie',
    managePeople: 'Mensen Beheren',
    viewStoryboard: 'Storyboard Bekijken',
  },

  // ============================================================================
  // SETTINGS
  // ============================================================================
  settings: {
    title: 'Instellingen',
    appearance: 'Weergave',
    theme: 'Thema',
    language: 'Taal',
    notifications: 'Meldingen',
    emailNotifications: 'E-mailmeldingen',
    pushNotifications: 'Pushmeldingen',
    privacy: 'Privacy',
    publicProfile: 'Openbaar Profiel',
    showInSearch: 'Tonen in Zoekresultaten',
    account: 'Account',
    deleteAccount: 'Account Verwijderen',
    deleteAccountConfirm: 'Weet u het zeker? Deze actie kan niet ongedaan worden gemaakt.',
    exportData: 'Gegevens Exporteren',
    storyboard: 'Storyboard',
    defaultView: 'Standaard Weergave',
    defaultLayout: 'Standaard Indeling',
  },

  // ============================================================================
  // ADMIN
  // ============================================================================
  admin: {
    title: 'Beheerderspaneel',
    dashboard: 'Dashboard',
    users: 'Gebruikers',
    content: 'Inhoud',
    analytics: 'Statistieken',
    systemSettings: 'Systeeminstellingen',
    quotes: 'Citaten',
    contentBlocks: 'Inhoudsblokken',
    auditLog: 'Auditlog',
    
    branding: 'Huisstijl',
    appName: 'App Naam',
    appDescription: 'App Beschrijving',
    logoLight: 'Logo (Lichte Modus)',
    logoDark: 'Logo (Donkere Modus)',
    faviconLight: 'Favicon (Lichte Modus)',
    faviconDark: 'Favicon (Donkere Modus)',
    
    colors: 'Kleuren',
    primaryColor: 'Primaire Kleur',
    accentColor: 'Accentkleur',
    
    typography: 'Typografie',
    fontHeading: 'Kop Lettertype',
    fontBody: 'Tekst Lettertype',
    
    defaults: 'Standaardwaarden',
    defaultTheme: 'Standaard Thema',
    defaultLocale: 'Standaard Taal',
    
    features: 'Functies',
    maintenanceMode: 'Onderhoudsmodus',
    registrationEnabled: 'Registratie Ingeschakeld',
    inviteOnlyMode: 'Alleen op Uitnodiging',
    quotesEnabled: 'Citaten Ingeschakeld',
    splashQuotes: 'Opstartscherm Citaten',
    dailyQuoteNotif: 'Dagelijks Citaat Melding',
    
    limits: 'Limieten',
    maxSequencesPerUser: 'Max Sequenties per Gebruiker',
    maxPeoplePerUser: 'Max Personen per Gebruiker',
    maxMemoriesPerUser: 'Max Herinneringen per Gebruiker',
    unlimitedHint: '0 = Onbeperkt',
    
    stats: 'Statistieken',
    totalUsers: 'Totaal Gebruikers',
    totalSequences: 'Totaal Sequenties',
    totalMemories: 'Totaal Herinneringen',
    activeToday: 'Vandaag Actief',
  },

  // ============================================================================
  // ONBOARDING
  // ============================================================================
  onboarding: {
    welcome: 'Welkom bij Sequences',
    welcomeDescription: 'Uw persoonlijke tracker voor emoties, gedachten en gedrag',
    
    step1Title: 'Kies Uw Gebruikersnaam',
    step1Description: 'Kies een unieke gebruikersnaam waarmee anderen u kunnen vinden',
    usernamePlaceholder: 'Voer gebruikersnaam in',
    usernameAvailable: 'Gebruikersnaam is beschikbaar',
    usernameTaken: 'Gebruikersnaam is al bezet',
    
    step2Title: 'Vertel Ons Over Uzelf',
    step2Description: 'Dit helpt uw ervaring te personaliseren',
    birthdayLabel: 'Uw Verjaardag',
    
    step3Title: 'Uw Eerste Herinnering',
    step3Description: 'Begin uw reis met een kernherinnering - een betekenisvol moment in uw leven',
    skipForNow: 'Nu overslaan',
    
    step4Title: 'Nodig Uw Kring Uit',
    step4Description: 'Verbind met mensen die belangrijk voor u zijn',
    inviteLater: 'Dit doe ik later',
    
    complete: 'Setup Voltooien',
    letsGo: 'Laten we Beginnen!',
  },

  // ============================================================================
  // ERRORS
  // ============================================================================
  errors: {
    generic: 'Er is iets misgegaan',
    notFound: 'Niet gevonden',
    unauthorized: 'Log alstublieft in',
    forbidden: 'Toegang geweigerd',
    validation: 'Controleer uw invoer',
    network: 'Netwerkfout',
    serverError: 'Serverfout',
    tryAgain: 'Probeer het opnieuw',
  },

  // ============================================================================
  // QUOTES
  // ============================================================================
  quotes: {
    title: 'Wijsheid',
    dailyQuote: 'Citaat van de Dag',
    category: 'Categorie',
    source: 'Bron',
    continue: 'Doorgaan',
    refresh: 'Nieuw Citaat',
    noQuotes: 'Geen citaten beschikbaar',
    categories: {
      psychology: 'Psychologie',
      philosophy: 'Filosofie',
      sociology: 'Sociologie',
    },
  },

  // ============================================================================
  // CBT ANALYSIS
  // ============================================================================
  cbt: {
    analysisTitle: 'CGT Analyse',
    emotionScore: 'Emotie Score',
    thoughtScore: 'Gedachte Score',
    behaviorScore: 'Gedrag Score',
    overallScore: 'Totale Score',
    patterns: 'Emotionele Patronen',
    dominantEmotion: 'Dominante Emotie',
    commonTrigger: 'Meest Voorkomende Trigger',
    totalSequences: 'Totaal Sequenties',
    highIntensity: 'Hoog Intensiteit Gebeurtenissen',
    insights: 'CGT Inzichten',
    positivePattern: 'Uw recente sequenties tonen overwegend positieve emotionele en gedragspatronen.',
    challengingPeriod: 'Uw sequenties wijzen op een uitdagende emotionele periode.',
    thoughtEmotionGap: 'Uw gedachten zijn meestal negatiever dan uw emoties.',
    behavioralResilience: 'Uw gedrag toont positieve aanpassing ondanks uitdagende gedachten.',
    highIntensityPatterns: 'Veel van uw sequenties tonen hoge emotionele intensiteit.',
    improvingTrend: 'Uw recente sequenties tonen een verbeterende emotionele trend.',
    decliningTrend: 'Uw recente sequenties tonen een dalende emotionele trend.',
    balancedPattern: 'Uw emotionele, gedachte- en gedragspatronen zijn relatief in balans.',
  },

  // ============================================================================
  // PROFILE
  // ============================================================================
  profile: {
    title: 'Profiel',
    editProfile: 'Profiel Bewerken',
    bio: 'Bio',
    bioPlaceholder: 'Vertel ons over uzelf...',
    followers: 'Volgers',
    following: 'Volgend',
    sequences: 'Sequenties',
    memories: 'Herinneringen',
    publicSequences: 'Openbare Sequenties',
    noPublicSequences: 'Nog geen openbare sequenties',
    follow: 'Volgen',
    unfollow: 'Ontvolgen',
    joinedDate: 'Lid sinds {date}',
  },
};
