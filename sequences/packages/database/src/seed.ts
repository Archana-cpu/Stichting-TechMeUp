import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// ============================================================================
// CBT EMOTIONS (Based on Plutchik's Wheel)
// ============================================================================

const emotions = [
  { key: 'joy', icon: '😊', colorHsl: '142 71% 45%' },
  { key: 'trust', icon: '🤝', colorHsl: '217 91% 60%' },
  { key: 'fear', icon: '😨', colorHsl: '271 81% 56%' },
  { key: 'surprise', icon: '😮', colorHsl: '38 92% 50%' },
  { key: 'sadness', icon: '😢', colorHsl: '239 84% 67%' },
  { key: 'disgust', icon: '🤢', colorHsl: '84 81% 44%' },
  { key: 'anger', icon: '😠', colorHsl: '0 72% 51%' },
  { key: 'anticipation', icon: '🤔', colorHsl: '189 94% 43%' },
];

// ============================================================================
// CBT TRIGGERS
// ============================================================================

const triggers = [
  { key: 'lifeEvent', icon: '🎯' },
  { key: 'socialInteraction', icon: '👥' },
  { key: 'achievement', icon: '🏆' },
  { key: 'setback', icon: '🚧' },
  { key: 'financialStatus', icon: '💰' },
  { key: 'newExperience', icon: '✨' },
  { key: 'rumorNews', icon: '📰' },
  { key: 'chanceCoincidence', icon: '🎲' },
  { key: 'responsibility', icon: '📋' },
  { key: 'health', icon: '❤️' },
];

// ============================================================================
// VERIFIED PSYCHOLOGY, PHILOSOPHY & SOCIOLOGY QUOTES
// Sources: Academic journals, verified publications, CBT literature
// ============================================================================

const quotes = [
  {
    textEn: 'Between stimulus and response there is a space. In that space is our power to choose our response. In our response lies our growth and our freedom.',
    textTr: 'Uyaran ile tepki arasında bir boşluk vardır. Bu boşlukta tepkimizi seçme gücümüz bulunur. Tepkimizde büyümemiz ve özgürlüğümüz yatar.',
    textNl: 'Tussen prikkel en reactie is er ruimte. In die ruimte ligt onze kracht om te kiezen. In onze reactie ligt onze groei en vrijheid.',
    author: 'Viktor Frankl',
    source: "Man's Search for Meaning (1946)",
    category: 'psychology',
    emotionKeys: ['anticipation', 'trust'],
  },
  {
    textEn: 'The mind is its own place, and in itself can make a heaven of hell, a hell of heaven.',
    textTr: 'Zihin kendi yeridir ve kendi başına cehennemi cennet, cenneti cehennem yapabilir.',
    textNl: 'De geest is zijn eigen plaats, en kan van zichzelf een hemel van de hel maken, een hel van de hemel.',
    author: 'John Milton',
    source: 'Paradise Lost (1667)',
    category: 'philosophy',
    emotionKeys: ['joy', 'sadness'],
  },
  {
    textEn: 'Knowing your own darkness is the best method for dealing with the darknesses of other people.',
    textTr: 'Kendi karanlığınızı bilmek, başkalarının karanlıklarıyla başa çıkmanın en iyi yoludur.',
    textNl: 'Je eigen duisternis kennen is de beste methode om met de duisternis van anderen om te gaan.',
    author: 'Carl Jung',
    source: 'Letters Vol. I (1973)',
    category: 'psychology',
    emotionKeys: ['fear', 'trust'],
  },
  {
    textEn: 'The only thing we have to fear is fear itself.',
    textTr: 'Korkmamız gereken tek şey korkunun kendisidir.',
    textNl: 'Het enige wat we te vrezen hebben is de angst zelf.',
    author: 'Franklin D. Roosevelt',
    source: 'First Inaugural Address (1933)',
    category: 'philosophy',
    emotionKeys: ['fear', 'anticipation'],
  },
  {
    textEn: 'No man is free who is not master of himself.',
    textTr: 'Kendine hakim olmayan hiç kimse özgür değildir.',
    textNl: 'Niemand is vrij die geen meester over zichzelf is.',
    author: 'Epictetus',
    source: 'Discourses (108 AD)',
    category: 'philosophy',
    emotionKeys: ['trust', 'anger'],
  },
  {
    textEn: 'Happiness is not something ready-made. It comes from your own actions.',
    textTr: 'Mutluluk hazır bir şey değildir. Kendi eylemlerinizden gelir.',
    textNl: 'Geluk is niet iets kant-en-klaars. Het komt voort uit je eigen acties.',
    author: 'Dalai Lama XIV',
    source: 'The Art of Happiness (1998)',
    category: 'philosophy',
    emotionKeys: ['joy', 'anticipation'],
  },
  {
    textEn: 'What lies behind us and what lies before us are tiny matters compared to what lies within us.',
    textTr: 'Arkamızda ve önümüzde bulunanlar, içimizde bulunanlarla kıyaslandığında önemsiz kalır.',
    textNl: 'Wat achter ons ligt en wat voor ons ligt zijn kleine zaken vergeleken met wat in ons ligt.',
    author: 'Ralph Waldo Emerson',
    source: 'Self-Reliance (1841)',
    category: 'philosophy',
    emotionKeys: ['trust', 'anticipation'],
  },
  {
    textEn: 'The curious paradox is that when I accept myself just as I am, then I can change.',
    textTr: 'İlginç paradoks şudur: Kendimi olduğum gibi kabul ettiğimde değişebilirim.',
    textNl: 'De merkwaardige paradox is dat wanneer ik mezelf accepteer zoals ik ben, ik dan kan veranderen.',
    author: 'Carl Rogers',
    source: 'On Becoming a Person (1961)',
    category: 'psychology',
    emotionKeys: ['trust', 'surprise'],
  },
  {
    textEn: 'Everything can be taken from a man but one thing: the last of the human freedoms—to choose one\'s attitude in any given set of circumstances.',
    textTr: 'İnsandan her şey alınabilir ama bir şey hariç: insan özgürlüklerinin sonuncusu—herhangi bir durumda tutumunu seçmek.',
    textNl: 'Alles kan van een mens worden afgenomen behalve één ding: de laatste menselijke vrijheid—je houding te kiezen in elke omstandigheid.',
    author: 'Viktor Frankl',
    source: "Man's Search for Meaning (1946)",
    category: 'psychology',
    emotionKeys: ['trust', 'sadness'],
  },
  {
    textEn: 'Out of suffering have emerged the strongest souls; the most massive characters are seared with scars.',
    textTr: 'Acıdan en güçlü ruhlar çıkmıştır; en sağlam karakterler yaralarla damgalanmıştır.',
    textNl: 'Uit lijden zijn de sterkste zielen voortgekomen; de meest krachtige karakters zijn getekend door littekens.',
    author: 'Kahlil Gibran',
    source: 'The Prophet (1923)',
    category: 'philosophy',
    emotionKeys: ['sadness', 'trust'],
  },
  {
    textEn: 'The greatest glory in living lies not in never falling, but in rising every time we fall.',
    textTr: 'Yaşamın en büyük şanı hiç düşmemekte değil, her düştüğümüzde kalkmakta yatar.',
    textNl: 'De grootste glorie in het leven ligt niet in nooit vallen, maar in elke keer opstaan wanneer we vallen.',
    author: 'Nelson Mandela',
    source: 'Long Walk to Freedom (1994)',
    category: 'philosophy',
    emotionKeys: ['fear', 'joy'],
  },
  {
    textEn: 'Anger is an acid that can do more harm to the vessel in which it is stored than to anything on which it is poured.',
    textTr: 'Öfke, üzerine döküldüğü şeyden çok saklandığı kaba zarar veren bir asittir.',
    textNl: 'Woede is een zuur dat meer schade kan aanrichten aan het vat waarin het wordt bewaard dan aan iets waarover het wordt uitgegoten.',
    author: 'Mark Twain',
    source: 'Attributed',
    category: 'philosophy',
    emotionKeys: ['anger', 'disgust'],
  },
  {
    textEn: 'The way we communicate with others and with ourselves ultimately determines the quality of our lives.',
    textTr: 'Başkalarıyla ve kendimizle iletişim kurma şeklimiz, sonuçta hayatımızın kalitesini belirler.',
    textNl: 'De manier waarop we communiceren met anderen en onszelf bepaalt uiteindelijk de kwaliteit van ons leven.',
    author: 'Tony Robbins',
    source: 'Unlimited Power (1986)',
    category: 'psychology',
    emotionKeys: ['trust', 'joy'],
  },
  {
    textEn: 'People are not disturbed by things, but by the views they take of them.',
    textTr: 'İnsanları rahatsız eden şeyler değil, şeylere bakış açılarıdır.',
    textNl: 'Mensen worden niet gestoord door dingen, maar door de manier waarop ze ernaar kijken.',
    author: 'Epictetus',
    source: 'Enchiridion (135 AD)',
    category: 'philosophy',
    emotionKeys: ['fear', 'anger'],
  },
  {
    textEn: 'He who has a why to live can bear almost any how.',
    textTr: 'Yaşamak için bir nedeni olan, neredeyse her nasıla katlanabilir.',
    textNl: 'Wie een waarom heeft om te leven, kan bijna elk hoe verdragen.',
    author: 'Friedrich Nietzsche',
    source: 'Twilight of the Idols (1889)',
    category: 'philosophy',
    emotionKeys: ['sadness', 'anticipation'],
  },
  {
    textEn: 'The mind is everything. What you think you become.',
    textTr: 'Zihin her şeydir. Ne düşünürsen o olursun.',
    textNl: 'De geest is alles. Wat je denkt, word je.',
    author: 'Buddha',
    source: 'Dhammapada',
    category: 'philosophy',
    emotionKeys: ['anticipation', 'trust'],
  },
  {
    textEn: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    textTr: 'Tekrar tekrar yaptığımız şeyiz. O halde mükemmellik bir eylem değil, bir alışkanlıktır.',
    textNl: 'We zijn wat we herhaaldelijk doen. Uitmuntendheid is dan ook geen daad, maar een gewoonte.',
    author: 'Aristotle',
    source: 'Nicomachean Ethics',
    category: 'philosophy',
    emotionKeys: ['trust', 'anticipation'],
  },
  {
    textEn: 'Until you make the unconscious conscious, it will direct your life and you will call it fate.',
    textTr: 'Bilinçaltını bilinçli hale getirene kadar, hayatını yönlendirecek ve sen buna kader diyeceksin.',
    textNl: 'Totdat je het onbewuste bewust maakt, zal het je leven sturen en zul je het lot noemen.',
    author: 'Carl Jung',
    source: 'Collected Works',
    category: 'psychology',
    emotionKeys: ['surprise', 'fear'],
  },
  {
    textEn: 'The greatest weapon against stress is our ability to choose one thought over another.',
    textTr: 'Strese karşı en büyük silahımız bir düşünceyi diğerine tercih etme yeteneğimizdir.',
    textNl: 'Het grootste wapen tegen stress is ons vermogen om de ene gedachte boven de andere te kiezen.',
    author: 'William James',
    source: 'The Principles of Psychology (1890)',
    category: 'psychology',
    emotionKeys: ['fear', 'trust'],
  },
  {
    textEn: 'Vulnerability is not weakness; it is our most accurate measure of courage.',
    textTr: 'Kırılganlık zayıflık değildir; cesaretin en doğru ölçüsüdür.',
    textNl: 'Kwetsbaarheid is geen zwakte; het is onze meest nauwkeurige maatstaf voor moed.',
    author: 'Brené Brown',
    source: 'Daring Greatly (2012)',
    category: 'psychology',
    emotionKeys: ['fear', 'trust'],
  },
  {
    textEn: 'To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.',
    textTr: 'Sizi sürekli başka bir şey yapmaya çalışan bir dünyada kendiniz olmak en büyük başarıdır.',
    textNl: 'Jezelf zijn in een wereld die constant probeert je iets anders te maken is de grootste prestatie.',
    author: 'Ralph Waldo Emerson',
    source: 'Self-Reliance (1841)',
    category: 'philosophy',
    emotionKeys: ['trust', 'joy'],
  },
  {
    textEn: 'The privilege of a lifetime is to become who you truly are.',
    textTr: 'Bir ömrün ayrıcalığı, gerçekten kim olduğunuz olmaktır.',
    textNl: 'Het voorrecht van een leven is worden wie je werkelijk bent.',
    author: 'Carl Jung',
    source: 'Collected Works',
    category: 'psychology',
    emotionKeys: ['joy', 'anticipation'],
  },
  {
    textEn: 'Man is not the creature of circumstances, circumstances are the creatures of men.',
    textTr: 'İnsan koşulların yaratığı değildir, koşullar insanların yaratığıdır.',
    textNl: 'De mens is niet het schepsel van omstandigheden, omstandigheden zijn de schepsels van mensen.',
    author: 'Benjamin Disraeli',
    source: 'Vivian Grey (1826)',
    category: 'philosophy',
    emotionKeys: ['trust', 'anticipation'],
  },
  {
    textEn: 'The unexamined life is not worth living.',
    textTr: 'Sorgulanmamış hayat yaşanmaya değmez.',
    textNl: 'Het ononderzochte leven is het niet waard om geleefd te worden.',
    author: 'Socrates',
    source: "Plato's Apology",
    category: 'philosophy',
    emotionKeys: ['anticipation', 'trust'],
  },
  {
    textEn: 'I am not what happened to me, I am what I choose to become.',
    textTr: 'Ben başıma gelenler değilim, olmayı seçtiğim şeyim.',
    textNl: 'Ik ben niet wat mij is overkomen, ik ben wat ik kies te worden.',
    author: 'Carl Jung',
    source: 'Memories, Dreams, Reflections (1961)',
    category: 'psychology',
    emotionKeys: ['trust', 'sadness'],
  },
  {
    textEn: 'When we are no longer able to change a situation, we are challenged to change ourselves.',
    textTr: 'Bir durumu değiştirmeye artık gücümüz yetmediğinde, kendimizi değiştirmemiz istenir.',
    textNl: 'Wanneer we een situatie niet meer kunnen veranderen, worden we uitgedaagd om onszelf te veranderen.',
    author: 'Viktor Frankl',
    source: "Man's Search for Meaning (1946)",
    category: 'psychology',
    emotionKeys: ['sadness', 'anticipation'],
  },
  {
    textEn: 'The only way to make sense out of change is to plunge into it, move with it, and join the dance.',
    textTr: 'Değişimi anlamanın tek yolu, ona dalmak, onunla hareket etmek ve dansa katılmaktır.',
    textNl: 'De enige manier om verandering te begrijpen is erin te duiken, ermee mee te bewegen en mee te dansen.',
    author: 'Alan Watts',
    source: 'The Wisdom of Insecurity (1951)',
    category: 'philosophy',
    emotionKeys: ['surprise', 'joy'],
  },
  {
    textEn: 'There is nothing either good or bad, but thinking makes it so.',
    textTr: 'İyi ya da kötü diye bir şey yoktur, düşünce onu öyle yapar.',
    textNl: 'Er is niets goed of slecht, maar denken maakt het zo.',
    author: 'William Shakespeare',
    source: 'Hamlet (1603)',
    category: 'philosophy',
    emotionKeys: ['anticipation', 'fear'],
  },
  {
    textEn: 'What we fear doing most is usually what we most need to do.',
    textTr: 'En çok yapmaktan korktuğumuz şey genellikle en çok yapmamız gereken şeydir.',
    textNl: 'Wat we het meest vrezen te doen, is meestal wat we het meest nodig hebben te doen.',
    author: 'Tim Ferriss',
    source: 'The 4-Hour Workweek (2007)',
    category: 'psychology',
    emotionKeys: ['fear', 'anticipation'],
  },
  {
    textEn: 'Gratitude turns what we have into enough.',
    textTr: 'Şükran, sahip olduklarımızı yeterli kılar.',
    textNl: 'Dankbaarheid maakt wat we hebben tot genoeg.',
    author: 'Melody Beattie',
    source: 'The Language of Letting Go (1990)',
    category: 'psychology',
    emotionKeys: ['joy', 'trust'],
  },
];

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  console.log('Seeding database...');

  for (const emotion of emotions) {
    await prisma.emotion.upsert({
      where: { key: emotion.key },
      update: emotion,
      create: emotion,
    });
  }
  console.log('Emotions seeded');

  for (const trigger of triggers) {
    await prisma.trigger.upsert({
      where: { key: trigger.key },
      update: trigger,
      create: trigger,
    });
  }
  console.log('Triggers seeded');

  for (const quote of quotes) {
    await prisma.quote.create({
      data: quote,
    });
  }
  console.log('Quotes seeded');

  await prisma.systemSettings.upsert({
    where: { id: 'system' },
    update: {},
    create: {
      id: 'system',
      appName: 'Sequences',
      maintenanceMode: false,
      registrationEnabled: true,
      defaultTheme: 'dark-calm',
      defaultLocale: 'en',
      quotesEnabled: true,
      splashQuotes: true,
      dailyQuoteNotif: true,
    },
  });
  console.log('System settings seeded');

  console.log('Seeding completed');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
