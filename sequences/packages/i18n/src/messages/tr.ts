import type { Messages } from '../types';

export const tr: Messages = {
  // ============================================================================
  // COMMON
  // ============================================================================
  common: {
    appName: 'Sequences',
    loading: 'Yükleniyor...',
    error: 'Hata',
    save: 'Kaydet',
    cancel: 'İptal',
    delete: 'Sil',
    edit: 'Düzenle',
    create: 'Oluştur',
    search: 'Ara',
    settings: 'Ayarlar',
    profile: 'Profil',
    logout: 'Çıkış Yap',
    login: 'Giriş Yap',
    signUp: 'Kayıt Ol',
    back: 'Geri',
    next: 'İleri',
    submit: 'Gönder',
    confirm: 'Onayla',
    close: 'Kapat',
    yes: 'Evet',
    no: 'Hayır',
    or: 'veya',
    and: 've',
    all: 'Tümü',
    none: 'Hiçbiri',
    select: 'Seç',
    upload: 'Yükle',
    download: 'İndir',
    refresh: 'Yenile',
    reset: 'Sıfırla',
    clear: 'Temizle',
    filter: 'Filtrele',
    sort: 'Sırala',
    view: 'Görüntüle',
    more: 'Daha fazla',
    less: 'Daha az',
    showMore: 'Daha fazla göster',
    showLess: 'Daha az göster',
    seeAll: 'Tümünü gör',
    today: 'Bugün',
    yesterday: 'Dün',
    tomorrow: 'Yarın',
    thisWeek: 'Bu hafta',
    thisMonth: 'Bu ay',
    thisYear: 'Bu yıl',
  },

  // ============================================================================
  // AUTH
  // ============================================================================
  auth: {
    welcome: "Sequences'a Hoş Geldiniz",
    welcomeBack: 'Tekrar hoş geldiniz',
    signInWith: '{provider} ile giriş yap',
    continueWith: '{provider} ile devam et',
    orContinueWith: 'Veya şununla devam et',
    noAccount: 'Hesabınız yok mu?',
    hasAccount: 'Zaten hesabınız var mı?',
    forgotPassword: 'Şifremi unuttum',
    resetPassword: 'Şifreyi sıfırla',
    termsAgree: 'Devam ederek Kullanım Koşullarını ve Gizlilik Politikasını kabul etmiş olursunuz.',
    emailPlaceholder: 'E-posta adresinizi girin',
    passwordPlaceholder: 'Şifrenizi girin',
    verifyEmail: 'E-postanızı doğrulayın',
    verifyEmailSent: 'E-postanıza doğrulama bağlantısı gönderdik',
    resendEmail: 'E-postayı tekrar gönder',
  },

  // ============================================================================
  // NAVIGATION
  // ============================================================================
  nav: {
    home: 'Ana Sayfa',
    storyboard: 'Storyboard',
    create: 'Oluştur',
    messages: 'Mesajlar',
    people: 'Kişiler',
    peopleTree: 'Çevre Ağacı',
    memories: 'Anılar',
    notifications: 'Bildirimler',
    admin: 'Yönetim Paneli',
  },

  // ============================================================================
  // SEQUENCE
  // ============================================================================
  sequence: {
    title: 'Sekans',
    newSequence: 'Yeni Sekans',
    editSequence: 'Sekansı Düzenle',
    deleteSequence: 'Sekansı Sil',
    deleteConfirm: 'Bu sekansı silmek istediğinizden emin misiniz?',
    eventDate: 'Olay Tarihi',
    summary: 'Özet',
    emotion: 'Duygu',
    trigger: 'Tetikleyici',
    thought: 'Düşünce',
    behavior: 'Davranış',
    notes: 'Notlar',
    addNote: 'Not Ekle',
    polarity: 'Polarite',
    intensity: 'Yoğunluk',
    impact: 'Etki',
    isPublic: 'Herkese Açık',
    makePublic: 'Herkese Açık Yap',
    makePrivate: 'Gizli Yap',
    coreMemory: 'Önemli Anı',
    markAsCoreMemory: 'Önemli Anı Olarak İşaretle',
    linkedPeople: 'İlgili Kişiler',
    addPeople: 'Kişi Ekle',
  },

  // ============================================================================
  // EMOTIONS
  // ============================================================================
  emotions: {
    joy: 'Sevinç',
    trust: 'Güven',
    fear: 'Korku',
    surprise: 'Şaşkınlık',
    sadness: 'Üzüntü',
    disgust: 'Tiksinme',
    anger: 'Öfke',
    anticipation: 'Beklenti',
  },

  // ============================================================================
  // TRIGGERS
  // ============================================================================
  triggers: {
    lifeEvent: 'Yaşam Olayı',
    socialInteraction: 'Sosyal Etkileşim',
    achievement: 'Başarı',
    setback: 'Aksilik',
    financialStatus: 'Mali Durum',
    newExperience: 'Yeni Deneyim',
    rumorNews: 'Söylenti/Haber',
    chanceCoincidence: 'Şans/Tesadüf',
    responsibility: 'Sorumluluk',
    health: 'Sağlık',
  },

  // ============================================================================
  // STORYBOARD
  // ============================================================================
  storyboard: {
    title: 'Storyboard',
    empty: 'Storyboard boş',
    emptyDescription: 'İlk sekansınızı oluşturarak yolculuğunuza başlayın',
    dragHint: 'Hikayenizi yeniden sıralamak için sekansları sürükleyin',
    timeline: 'Zaman Çizelgesi',
    grid: 'Izgara',
    list: 'Liste',
    canvas: 'Tuval',
    horizontal: 'Yatay',
    vertical: 'Dikey',
    free: 'Serbest Yerleşim',
    filterByEmotion: 'Duyguya Göre',
    filterByTrigger: 'Tetikleyiciye Göre',
    filterByPerson: 'Kişiye Göre',
    filterByDate: 'Tarihe Göre',
    sortBy: 'Sırala',
    newest: 'En Yeni',
    oldest: 'En Eski',
    mostPositive: 'En Pozitif',
    mostNegative: 'En Negatif',
    zoomIn: 'Yakınlaştır',
    zoomOut: 'Uzaklaştır',
    resetView: 'Görünümü Sıfırla',
  },

  // ============================================================================
  // PEOPLE
  // ============================================================================
  people: {
    title: 'Tanıdıklarım',
    addPerson: 'Kişi Ekle',
    editPerson: 'Kişiyi Düzenle',
    deletePerson: 'Kişiyi Sil',
    name: 'İsim',
    relationship: 'İlişki',
    notes: 'Notlar',
    birthday: 'Doğum Günü',
    linkedSequences: 'Bağlı Sekanslar',
    isAppUser: 'Uygulama Kullanıcısı',
    inviteToApp: 'Uygulamaya Davet Et',
    sendInvitation: 'Davet Gönder',
    invitationSent: 'Davet gönderildi!',
    tree: 'Çevre Ağacı',
    treeDescription: 'İlişkilerinizi görselleştirin',
    relationships: {
      family: 'Aile',
      friend: 'Arkadaş',
      colleague: 'İş Arkadaşı',
      acquaintance: 'Tanıdık',
      partner: 'Partner',
      parent: 'Ebeveyn',
      child: 'Çocuk',
      sibling: 'Kardeş',
      spouse: 'Eş',
      grandparent: 'Büyükanne/Büyükbaba',
      grandchild: 'Torun',
      uncle: 'Amca/Hala/Dayı/Teyze',
      cousin: 'Kuzen',
      other: 'Diğer',
    },
  },

  // ============================================================================
  // MEMORIES
  // ============================================================================
  memories: {
    title: 'Anılar',
    newMemory: 'Yeni Anı',
    editMemory: 'Anıyı Düzenle',
    deleteMemory: 'Anıyı Sil',
    description: 'Sekanslarınızı anlamlı anılar halinde gruplandırın',
    coverImage: 'Kapak Resmi',
    dateRange: 'Tarih Aralığı',
    sequences: 'Bu anıdaki sekanslar',
    addSequences: 'Sekans Ekle',
    empty: 'Henüz anı yok',
    emptyDescription: 'İlgili sekansları bir araya getirerek anılar oluşturun',
  },

  // ============================================================================
  // MESSAGES
  // ============================================================================
  messages: {
    title: 'Mesajlar',
    newMessage: 'Yeni Mesaj',
    noMessages: 'Henüz mesaj yok',
    noMessagesDescription: 'Biriyle sohbet başlatın',
    typePlaceholder: 'Bir mesaj yazın...',
    typeMessage: 'Bir mesaj yazın...',
    send: 'Gönder',
    markAsRead: 'Okundu olarak işaretle',
    deleteMessage: 'Mesajı sil',
    searchConversations: 'Sohbet ara...',
    selectConversation: 'Mesajlaşmak için bir sohbet seçin',
  },

  // ============================================================================
  // DASHBOARD
  // ============================================================================
  dashboard: {
    title: 'Gösterge Paneli',
    welcome: 'Hoş geldin, {name}!',
    subtitle: 'İşte duygusal yolculuk özetin',
    totalSequences: 'Toplam Sekans',
    emotionTrend: 'Duygu Trendi',
    thoughtTrend: 'Düşünce Trendi',
    behaviorTrend: 'Davranış Trendi',
    recentSequences: 'Son Sekanslar',
    viewAll: 'Tümünü Gör',
    noSequences: 'Henüz sekans yok',
    createFirst: 'İlk Sekansını Oluştur',
    emotionDistribution: 'Duygu Dağılımı',
    noDataYet: 'Duygu dağılımını görmek için sekans oluşturun',
    quickActions: 'Hızlı İşlemler',
    newSequence: 'Yeni Sekans',
    managePeople: 'Kişileri Yönet',
    viewStoryboard: 'Storyboard\'u Gör',
  },

  // ============================================================================
  // SETTINGS
  // ============================================================================
  settings: {
    title: 'Ayarlar',
    appearance: 'Görünüm',
    theme: 'Tema',
    language: 'Dil',
    notifications: 'Bildirimler',
    emailNotifications: 'E-posta Bildirimleri',
    pushNotifications: 'Anlık Bildirimler',
    privacy: 'Gizlilik',
    publicProfile: 'Herkese Açık Profil',
    showInSearch: 'Kişi Aramasında Görün',
    account: 'Hesap',
    deleteAccount: 'Hesabı Sil',
    deleteAccountConfirm: 'Emin misiniz? Bu işlem geri alınamaz.',
    exportData: 'Verileri Dışa Aktar',
    storyboard: 'Storyboard',
    defaultView: 'Varsayılan Görünüm',
    defaultLayout: 'Varsayılan Yerleşim',
  },

  // ============================================================================
  // ADMIN
  // ============================================================================
  admin: {
    title: 'Yönetim Paneli',
    dashboard: 'Gösterge Paneli',
    users: 'Kullanıcılar',
    content: 'İçerik',
    analytics: 'Analitik',
    systemSettings: 'Sistem Ayarları',
    quotes: 'Alıntılar',
    contentBlocks: 'İçerik Blokları',
    auditLog: 'Denetim Kaydı',
    
    branding: 'Marka',
    appName: 'Uygulama Adı',
    appDescription: 'Uygulama Açıklaması',
    logoLight: 'Logo (Açık Mod)',
    logoDark: 'Logo (Koyu Mod)',
    faviconLight: 'Favicon (Açık Mod)',
    faviconDark: 'Favicon (Koyu Mod)',
    
    colors: 'Renkler',
    primaryColor: 'Ana Renk',
    accentColor: 'Vurgu Rengi',
    
    typography: 'Tipografi',
    fontHeading: 'Başlık Fontu',
    fontBody: 'Metin Fontu',
    
    defaults: 'Varsayılanlar',
    defaultTheme: 'Varsayılan Tema',
    defaultLocale: 'Varsayılan Dil',
    
    features: 'Özellikler',
    maintenanceMode: 'Bakım Modu',
    registrationEnabled: 'Kayıt Açık',
    inviteOnlyMode: 'Sadece Davetli',
    quotesEnabled: 'Alıntılar Aktif',
    splashQuotes: 'Açılış Ekranı Alıntıları',
    dailyQuoteNotif: 'Günlük Alıntı Bildirimi',
    
    limits: 'Limitler',
    maxSequencesPerUser: 'Kullanıcı Başına Maks Sekans',
    maxPeoplePerUser: 'Kullanıcı Başına Maks Kişi',
    maxMemoriesPerUser: 'Kullanıcı Başına Maks Anı',
    unlimitedHint: '0 = Sınırsız',
    
    stats: 'İstatistikler',
    totalUsers: 'Toplam Kullanıcı',
    totalSequences: 'Toplam Sekans',
    totalMemories: 'Toplam Anı',
    activeToday: 'Bugün Aktif',
  },

  // ============================================================================
  // ONBOARDING
  // ============================================================================
  onboarding: {
    welcome: "Sequences'a Hoş Geldiniz",
    welcomeDescription: 'Duygu, düşünce ve davranışlarınızı takip edin',
    
    step1Title: 'Kullanıcı Adınızı Seçin',
    step1Description: 'Diğerlerinin sizi bulabileceği benzersiz bir kullanıcı adı seçin',
    usernamePlaceholder: 'Kullanıcı adı girin',
    usernameAvailable: 'Kullanıcı adı müsait',
    usernameTaken: 'Kullanıcı adı zaten alınmış',
    
    step2Title: 'Kendinizden Bahsedin',
    step2Description: 'Deneyiminizi kişiselleştirmemize yardımcı olur',
    birthdayLabel: 'Doğum Gününüz',
    
    step3Title: 'İlk Anınız',
    step3Description: 'Hayatınızdaki önemli bir anla yolculuğunuza başlayın',
    skipForNow: 'Şimdilik geç',
    
    step4Title: 'Çevrenizi Davet Edin',
    step4Description: 'Sizin için önemli kişilerle bağlantı kurun',
    inviteLater: 'Bunu sonra yapacağım',
    
    complete: 'Kurulumu Tamamla',
    letsGo: 'Haydi Başlayalım!',
  },

  // ============================================================================
  // ERRORS
  // ============================================================================
  errors: {
    generic: 'Bir şeyler yanlış gitti',
    notFound: 'Bulunamadı',
    unauthorized: 'Lütfen giriş yapın',
    forbidden: 'Erişim reddedildi',
    validation: 'Lütfen girişlerinizi kontrol edin',
    network: 'Ağ hatası',
    serverError: 'Sunucu hatası',
    tryAgain: 'Lütfen tekrar deneyin',
  },

  // ============================================================================
  // QUOTES
  // ============================================================================
  quotes: {
    title: 'Bilgelik',
    dailyQuote: 'Günün Sözü',
    category: 'Kategori',
    source: 'Kaynak',
    continue: 'Devam Et',
    refresh: 'Yeni Söz',
    noQuotes: 'Alıntı bulunamadı',
    categories: {
      psychology: 'Psikoloji',
      philosophy: 'Felsefe',
      sociology: 'Sosyoloji',
    },
  },

  // ============================================================================
  // CBT ANALYSIS
  // ============================================================================
  cbt: {
    analysisTitle: 'BDT Analizi',
    emotionScore: 'Duygu Skoru',
    thoughtScore: 'Düşünce Skoru',
    behaviorScore: 'Davranış Skoru',
    overallScore: 'Genel Skor',
    patterns: 'Duygusal Kalıplar',
    dominantEmotion: 'Baskın Duygu',
    commonTrigger: 'En Yaygın Tetikleyici',
    totalSequences: 'Toplam Sekans',
    highIntensity: 'Yüksek Yoğunluklu Olaylar',
    insights: 'BDT İçgörüleri',
    positivePattern: 'Son sekanslarınız ağırlıklı olarak pozitif duygusal ve davranışsal kalıplar gösteriyor.',
    challengingPeriod: 'Sekanslarınız zorlu bir duygusal dönem geçirdiğinizi gösteriyor.',
    thoughtEmotionGap: 'Düşünceleriniz duygularınızdan daha negatif olma eğiliminde.',
    behavioralResilience: 'Zorlu düşüncelere rağmen davranışlarınız pozitif adaptasyon gösteriyor.',
    highIntensityPatterns: 'Sekanslarınızın çoğu yüksek duygusal yoğunluk gösteriyor.',
    improvingTrend: 'Son sekanslarınız iyileşen bir duygusal eğilim gösteriyor.',
    decliningTrend: 'Son sekanslarınız düşüş gösteren bir duygusal eğilim gösteriyor.',
    balancedPattern: 'Duygusal, düşünsel ve davranışsal kalıplarınız görece dengeli.',
  },

  // ============================================================================
  // PROFILE
  // ============================================================================
  profile: {
    title: 'Profil',
    editProfile: 'Profili Düzenle',
    bio: 'Hakkında',
    bioPlaceholder: 'Kendinizden bahsedin...',
    followers: 'Takipçi',
    following: 'Takip',
    sequences: 'Sekans',
    memories: 'Anı',
    publicSequences: 'Herkese Açık Sekanslar',
    noPublicSequences: 'Henüz herkese açık sekans yok',
    follow: 'Takip Et',
    unfollow: 'Takibi Bırak',
    joinedDate: '{date} tarihinde katıldı',
  },
};
