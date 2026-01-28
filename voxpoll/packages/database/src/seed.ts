// ════════════════════════════════════════════════════════════════════════════
// VOXPOLL DATABASE - SEED SCRIPT
// Comprehensive seed data for development and testing
// ════════════════════════════════════════════════════════════════════════════

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { createId } from "@paralleldrive/cuid2"
import { randomBytes, scrypt } from "node:crypto"
import { promisify } from "node:util"
import * as schema from "./db/schema"

const scryptAsync = promisify(scrypt)

// ─────────────────────────────────────────────────────────────────────────────
// Connection
// ─────────────────────────────────────────────────────────────────────────────

const connectionString = process.env["DATABASE_URL"]

if (!connectionString) {
  console.error("DATABASE_URL environment variable is not set")
  process.exit(1)
}

const client = postgres(connectionString, { max: 1 })
const db = drizzle(client, { schema })

// ─────────────────────────────────────────────────────────────────────────────
// Seed Data IDs (Consistent for referencing)
// ─────────────────────────────────────────────────────────────────────────────

const IDS = {
  // Users
  admin: createId(),
  moderator: createId(),
  premiumUser: createId(),
  plusUser: createId(),
  freeUser: createId(),
  orgOwner: createId(),
  orgMember: createId(),

  // Organizations
  techOrg: createId(),
  eduOrg: createId(),

  // Categories
  catTechnology: createId(),
  catPolitics: createId(),
  catScience: createId(),
  catSports: createId(),
  catEntertainment: createId(),
  catBusiness: createId(),
  catHealth: createId(),
  catEducation: createId(),

  // Polls
  poll1: createId(),
  poll2: createId(),
  poll3: createId(),
  poll4: createId(),
  poll5: createId(),

  // Surveys
  survey1: createId(),
  survey2: createId(),

  // Tests
  test1: createId(),
  test2: createId(),

  // Badges
  badgeFirstVote: createId(),
  badgeVoter10: createId(),
  badgeVoter100: createId(),
  badgeCreator: createId(),
  badgeVerified: createId(),
  badgeInfluencer: createId(),
}

// ─────────────────────────────────────────────────────────────────────────────
// Password Hashing (scrypt - matches API implementation)
// ─────────────────────────────────────────────────────────────────────────────

const SALT_LENGTH = 32
const KEY_LENGTH = 64
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 }

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH)
  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH) as Buffer
  return `$scrypt$${SCRYPT_PARAMS.N}$${SCRYPT_PARAMS.r}$${SCRYPT_PARAMS.p}$${salt.toString('base64')}$${derivedKey.toString('base64')}`
}

let DEMO_PASSWORD_HASH: string

// ─────────────────────────────────────────────────────────────────────────────
// Seed Functions
// ─────────────────────────────────────────────────────────────────────────────

async function seedCategories() {
  console.log("Seeding categories...")

  await db.insert(schema.categories).values([
    {
      id: IDS.catTechnology,
      name: "Technology",
      slug: "technology",
      description: "Tech, software, and digital trends",
      iconName: "laptop",
      color: "#3B82F6",
      isActive: true,
    },
    {
      id: IDS.catPolitics,
      name: "Politics",
      slug: "politics",
      description: "Political discussions and opinions",
      iconName: "landmark",
      color: "#EF4444",
      isActive: true,
    },
    {
      id: IDS.catScience,
      name: "Science",
      slug: "science",
      description: "Scientific discoveries and research",
      iconName: "flask",
      color: "#10B981",
      isActive: true,
    },
    {
      id: IDS.catSports,
      name: "Sports",
      slug: "sports",
      description: "Sports events and discussions",
      iconName: "trophy",
      color: "#F59E0B",
      isActive: true,
    },
    {
      id: IDS.catEntertainment,
      name: "Entertainment",
      slug: "entertainment",
      description: "Movies, music, and pop culture",
      iconName: "film",
      color: "#8B5CF6",
      isActive: true,
    },
    {
      id: IDS.catBusiness,
      name: "Business",
      slug: "business",
      description: "Business and economics",
      iconName: "briefcase",
      color: "#06B6D4",
      isActive: true,
    },
    {
      id: IDS.catHealth,
      name: "Health",
      slug: "health",
      description: "Health and wellness topics",
      iconName: "heart-pulse",
      color: "#EC4899",
      isActive: true,
    },
    {
      id: IDS.catEducation,
      name: "Education",
      slug: "education",
      description: "Learning and educational content",
      iconName: "graduation-cap",
      color: "#14B8A6",
      isActive: true,
    },
  ]).onConflictDoNothing()
}

async function seedUsers() {
  console.log("Seeding users...")

  const now = new Date()

  await db.insert(schema.users).values([
    // Admin User
    {
      id: IDS.admin,
      email: "admin@voxpoll.local",
      username: "admin",
      displayName: "System Admin",
      passwordHash: DEMO_PASSWORD_HASH,
      role: "ADMIN",
      status: "ACTIVE",
      subscriptionTier: "PREMIUM",
      emailVerified: true,
      verificationLevel: "FULLY_VERIFIED",
      onboardingCompleted: true,
      createdAt: now,
      updatedAt: now,
    },
    // Moderator User
    {
      id: IDS.moderator,
      email: "moderator@voxpoll.local",
      username: "moderator",
      displayName: "Content Moderator",
      passwordHash: DEMO_PASSWORD_HASH,
      role: "MODERATOR",
      status: "ACTIVE",
      subscriptionTier: "PREMIUM",
      emailVerified: true,
      verificationLevel: "VERIFIED",
      onboardingCompleted: true,
      createdAt: now,
      updatedAt: now,
    },
    // Premium User
    {
      id: IDS.premiumUser,
      email: "premium@voxpoll.local",
      username: "premiumuser",
      displayName: "Premium User",
      passwordHash: DEMO_PASSWORD_HASH,
      role: "USER",
      status: "ACTIVE",
      subscriptionTier: "PREMIUM",
      emailVerified: true,
      verificationLevel: "VERIFIED",
      onboardingCompleted: true,
      bio: "A premium subscriber who loves creating detailed polls!",
      createdAt: now,
      updatedAt: now,
    },
    // Plus User
    {
      id: IDS.plusUser,
      email: "plus@voxpoll.local",
      username: "plususer",
      displayName: "Plus User",
      passwordHash: DEMO_PASSWORD_HASH,
      role: "USER",
      status: "ACTIVE",
      subscriptionTier: "PLUS",
      emailVerified: true,
      verificationLevel: "BASIC",
      onboardingCompleted: true,
      createdAt: now,
      updatedAt: now,
    },
    // Free User
    {
      id: IDS.freeUser,
      email: "free@voxpoll.local",
      username: "freeuser",
      displayName: "Free User",
      passwordHash: DEMO_PASSWORD_HASH,
      role: "USER",
      status: "ACTIVE",
      subscriptionTier: "FREE",
      emailVerified: true,
      verificationLevel: "NONE",
      onboardingCompleted: true,
      createdAt: now,
      updatedAt: now,
    },
    // Organization Owner
    {
      id: IDS.orgOwner,
      email: "orgowner@voxpoll.local",
      username: "orgowner",
      displayName: "Organization Owner",
      passwordHash: DEMO_PASSWORD_HASH,
      role: "USER",
      status: "ACTIVE",
      subscriptionTier: "PREMIUM",
      emailVerified: true,
      verificationLevel: "VERIFIED",
      onboardingCompleted: true,
      createdAt: now,
      updatedAt: now,
    },
    // Organization Member
    {
      id: IDS.orgMember,
      email: "orgmember@voxpoll.local",
      username: "orgmember",
      displayName: "Organization Member",
      passwordHash: DEMO_PASSWORD_HASH,
      role: "USER",
      status: "ACTIVE",
      subscriptionTier: "FREE",
      emailVerified: true,
      verificationLevel: "BASIC",
      onboardingCompleted: true,
      createdAt: now,
      updatedAt: now,
    },
  ]).onConflictDoNothing()
}

async function seedOrganizations() {
  console.log("Seeding organizations...")

  const now = new Date()

  await db.insert(schema.organizations).values([
    {
      id: IDS.techOrg,
      name: "TechCorp Research",
      slug: "techcorp-research",
      description: "Leading technology research organization",
      type: "COMPANY",
      plan: "ENTERPRISE",
      isVerified: true,
      maxMembers: 100,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: IDS.eduOrg,
      name: "University Research Lab",
      slug: "university-research-lab",
      description: "Academic research institution",
      type: "EDUCATIONAL",
      plan: "PROFESSIONAL",
      isVerified: true,
      maxMembers: 50,
      createdAt: now,
      updatedAt: now,
    },
  ]).onConflictDoNothing()

  // Add organization members
  await db.insert(schema.organizationMembers).values([
    {
      organizationId: IDS.techOrg,
      userId: IDS.orgOwner,
      role: "OWNER",
      joinedAt: now,
    },
    {
      organizationId: IDS.techOrg,
      userId: IDS.orgMember,
      role: "MEMBER",
      joinedAt: now,
    },
    {
      organizationId: IDS.eduOrg,
      userId: IDS.premiumUser,
      role: "OWNER",
      joinedAt: now,
    },
  ]).onConflictDoNothing()
}

async function seedBadges() {
  console.log("Seeding badges...")

  await db.insert(schema.badges).values([
    {
      id: IDS.badgeFirstVote,
      code: "first_vote",
      name: "First Vote",
      description: "Cast your first vote on VoxPoll",
      iconUrl: "/badges/first-vote.svg",
      category: "PARTICIPATION",
      rarity: "COMMON",
      xpReward: 10,
      criteria: { type: "votes", count: 1 },
      isActive: true,
    },
    {
      id: IDS.badgeVoter10,
      code: "voter_10",
      name: "Active Voter",
      description: "Voted on 10 different polls",
      iconUrl: "/badges/voter-10.svg",
      category: "PARTICIPATION",
      rarity: "UNCOMMON",
      xpReward: 50,
      criteria: { type: "votes", count: 10 },
      isActive: true,
    },
    {
      id: IDS.badgeVoter100,
      code: "voter_100",
      name: "Super Voter",
      description: "Voted on 100 different polls",
      iconUrl: "/badges/voter-100.svg",
      category: "PARTICIPATION",
      rarity: "RARE",
      xpReward: 200,
      criteria: { type: "votes", count: 100 },
      isActive: true,
    },
    {
      id: IDS.badgeCreator,
      code: "poll_creator",
      name: "Poll Creator",
      description: "Created your first poll",
      iconUrl: "/badges/creator.svg",
      category: "CREATION",
      rarity: "COMMON",
      xpReward: 25,
      criteria: { type: "polls_created", count: 1 },
      isActive: true,
    },
    {
      id: IDS.badgeVerified,
      code: "verified_user",
      name: "Verified User",
      description: "Completed identity verification",
      iconUrl: "/badges/verified.svg",
      category: "ACHIEVEMENT",
      rarity: "UNCOMMON",
      xpReward: 100,
      criteria: { type: "verification", status: "verified" },
      isActive: true,
    },
    {
      id: IDS.badgeInfluencer,
      code: "influencer",
      name: "Influencer",
      description: "Your polls reached 1000+ participants",
      iconUrl: "/badges/influencer.svg",
      category: "ACHIEVEMENT",
      rarity: "EPIC",
      xpReward: 500,
      criteria: { type: "poll_participants", count: 1000 },
      isActive: true,
    },
  ]).onConflictDoNothing()
}

async function seedPolls() {
  console.log("Seeding polls...")

  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  await db.insert(schema.polls).values([
    // Active Public Poll
    {
      id: IDS.poll1,
      creatorId: IDS.premiumUser,
      title: "Best Programming Language in 2026?",
      description: "What do you think is the most versatile programming language for modern development?",
      slug: "best-programming-language-2026",
      type: "STANDARD",
      votingSystem: "SINGLE_CHOICE",
      status: "ACTIVE",
      visibility: "PUBLIC",
      categoryId: IDS.catTechnology,
      options: JSON.stringify([
        { id: createId(), text: "TypeScript", position: 0 },
        { id: createId(), text: "Python", position: 1 },
        { id: createId(), text: "Rust", position: 2 },
        { id: createId(), text: "Go", position: 3 },
        { id: createId(), text: "Kotlin", position: 4 },
      ]),
      allowDiscussion: true,
      participantCount: 1523,
      viewCount: 8547,
      hotScore: 85.5,
      publishedAt: now,
      endsAt: nextWeek,
      createdAt: now,
      updatedAt: now,
    },
    // Ranked Choice Poll
    {
      id: IDS.poll2,
      creatorId: IDS.plusUser,
      title: "Top 3 Features for Next Update",
      description: "Rank your most wanted features for our next release",
      slug: "top-features-next-update",
      type: "STANDARD",
      votingSystem: "RANKED_CHOICE",
      status: "ACTIVE",
      visibility: "PUBLIC",
      categoryId: IDS.catTechnology,
      options: JSON.stringify([
        { id: createId(), text: "Dark Mode", position: 0 },
        { id: createId(), text: "Offline Support", position: 1 },
        { id: createId(), text: "AI Suggestions", position: 2 },
        { id: createId(), text: "Better Analytics", position: 3 },
        { id: createId(), text: "Mobile App", position: 4 },
      ]),
      allowDiscussion: true,
      participantCount: 342,
      viewCount: 1876,
      hotScore: 62.3,
      publishedAt: now,
      endsAt: nextWeek,
      createdAt: now,
      updatedAt: now,
    },
    // Organization Poll
    {
      id: IDS.poll3,
      creatorId: IDS.orgOwner,
      organizationId: IDS.techOrg,
      title: "Q1 Team Building Activity",
      description: "Vote for your preferred team building activity",
      slug: "q1-team-building-techcorp",
      type: "STANDARD",
      votingSystem: "SINGLE_CHOICE",
      status: "ACTIVE",
      visibility: "ORGANIZATION_ONLY",
      options: JSON.stringify([
        { id: createId(), text: "Escape Room", position: 0 },
        { id: createId(), text: "Cooking Class", position: 1 },
        { id: createId(), text: "Paintball", position: 2 },
        { id: createId(), text: "Board Game Night", position: 3 },
      ]),
      requireAuth: true,
      participantCount: 45,
      viewCount: 120,
      hotScore: 35.2,
      publishedAt: now,
      endsAt: tomorrow,
      createdAt: now,
      updatedAt: now,
    },
    // Draft Poll
    {
      id: IDS.poll4,
      creatorId: IDS.freeUser,
      title: "Favorite Coffee Type",
      description: "What's your go-to coffee order?",
      slug: "favorite-coffee-type",
      type: "STANDARD",
      votingSystem: "SINGLE_CHOICE",
      status: "DRAFT",
      visibility: "PUBLIC",
      options: JSON.stringify([
        { id: createId(), text: "Espresso", position: 0 },
        { id: createId(), text: "Latte", position: 1 },
        { id: createId(), text: "Cappuccino", position: 2 },
        { id: createId(), text: "Americano", position: 3 },
      ]),
      createdAt: now,
      updatedAt: now,
    },
    // Approval Voting Poll
    {
      id: IDS.poll5,
      creatorId: IDS.premiumUser,
      title: "Which Technologies Should We Learn?",
      description: "Select all technologies you think are worth learning in 2026",
      slug: "technologies-to-learn-2026",
      type: "STANDARD",
      votingSystem: "APPROVAL",
      status: "ACTIVE",
      visibility: "PUBLIC",
      categoryId: IDS.catEducation,
      options: JSON.stringify([
        { id: createId(), text: "Machine Learning", position: 0 },
        { id: createId(), text: "Blockchain", position: 1 },
        { id: createId(), text: "WebAssembly", position: 2 },
        { id: createId(), text: "Quantum Computing", position: 3 },
        { id: createId(), text: "AR/VR Development", position: 4 },
        { id: createId(), text: "Edge Computing", position: 5 },
      ]),
      allowMultipleVotes: true,
      maxVotesPerUser: 6,
      allowDiscussion: true,
      participantCount: 892,
      viewCount: 4521,
      hotScore: 72.1,
      publishedAt: now,
      endsAt: nextWeek,
      createdAt: now,
      updatedAt: now,
    },
  ]).onConflictDoNothing()
}

async function seedSurveys() {
  console.log("Seeding surveys...")

  const now = new Date()
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  // Create surveys
  await db.insert(schema.surveys).values([
    {
      id: IDS.survey1,
      creatorId: IDS.orgOwner,
      organizationId: IDS.techOrg,
      title: "Employee Satisfaction Survey Q1 2026",
      description: "Help us understand how we can improve your work experience",
      slug: "employee-satisfaction-q1-2026",
      status: "ACTIVE",
      visibility: "ORGANIZATION_ONLY",
      categoryId: IDS.catBusiness,
      estimatedDuration: 10,
      maxResponses: 500,
      requireAuth: true,
      allowAnonymous: true,
      startsAt: now,
      endsAt: nextMonth,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: IDS.survey2,
      creatorId: IDS.premiumUser,
      organizationId: IDS.eduOrg,
      title: "Developer Experience Survey",
      description: "Share your experience with modern development tools",
      slug: "developer-experience-survey",
      status: "ACTIVE",
      visibility: "PUBLIC",
      categoryId: IDS.catTechnology,
      estimatedDuration: 15,
      requireAuth: false,
      allowAnonymous: true,
      startsAt: now,
      endsAt: nextMonth,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    },
  ]).onConflictDoNothing()

  // Create survey sections
  const section1Id = createId()
  const section2Id = createId()

  await db.insert(schema.surveySections).values([
    {
      id: section1Id,
      surveyId: IDS.survey1,
      title: "Work Environment",
      description: "Questions about your daily work environment",
      orderIndex: 0,
    },
    {
      id: section2Id,
      surveyId: IDS.survey1,
      title: "Management & Communication",
      description: "Questions about leadership and team communication",
      orderIndex: 1,
    },
  ]).onConflictDoNothing()

  // Create survey questions
  await db.insert(schema.surveyQuestions).values([
    {
      sectionId: section1Id,
      type: "RATING_SCALE",
      text: "How satisfied are you with your current work-life balance?",
      isRequired: true,
      orderIndex: 0,
      settings: JSON.stringify({ min: 1, max: 5, labels: ["Very Unsatisfied", "Unsatisfied", "Neutral", "Satisfied", "Very Satisfied"] }),
    },
    {
      sectionId: section1Id,
      type: "MULTIPLE_CHOICE",
      text: "Which best describes your work setup?",
      isRequired: true,
      orderIndex: 1,
      options: JSON.stringify([
        { id: createId(), text: "Fully Remote" },
        { id: createId(), text: "Hybrid" },
        { id: createId(), text: "Fully On-site" },
      ]),
    },
    {
      sectionId: section2Id,
      type: "OPEN_TEXT",
      text: "What could management do to better support your work?",
      isRequired: false,
      orderIndex: 0,
      settings: JSON.stringify({ maxLength: 1000, multiline: true }),
    },
  ]).onConflictDoNothing()
}

async function seedTests() {
  console.log("Seeding tests...")

  const now = new Date()

  // Create personality test
  await db.insert(schema.tests).values([
    {
      id: IDS.test1,
      creatorId: IDS.premiumUser,
      title: "Developer Personality Test",
      description: "Discover what type of developer you are!",
      slug: "developer-personality-test",
      testCategory: "PERSONALITY",
      status: "ACTIVE",
      visibility: "PUBLIC",
      categoryId: IDS.catTechnology,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: IDS.test2,
      creatorId: IDS.orgOwner,
      organizationId: IDS.techOrg,
      title: "JavaScript Knowledge Quiz",
      description: "Test your JavaScript knowledge with this comprehensive quiz",
      slug: "javascript-knowledge-quiz",
      testCategory: "QUIZ",
      status: "ACTIVE",
      visibility: "PUBLIC",
      categoryId: IDS.catEducation,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    },
  ]).onConflictDoNothing()

  // Create personality test config
  await db.insert(schema.personalityTests).values([
    {
      testId: IDS.test1,
      testType: "AXIS",
      settings: { axes: 2, showPercentages: true },
    },
  ]).onConflictDoNothing()

  // Create quiz test config
  await db.insert(schema.quizTests).values([
    {
      testId: IDS.test2,
      quizType: "KNOWLEDGE",
      passingScore: 70,
      showCorrectAnswers: true,
      attemptsAllowed: 3,
    },
  ]).onConflictDoNothing()
}

async function seedGamification() {
  console.log("Seeding gamification data...")

  const now = new Date()

  // Create gamification records for users
  await db.insert(schema.userGamification).values([
    {
      userId: IDS.premiumUser,
      level: 15,
      totalXp: 4500,
      currentXp: 500,
      rank: 1,
      currentStreak: 12,
      longestStreak: 45,
      lastActivityDate: now,
    },
    {
      userId: IDS.plusUser,
      level: 8,
      totalXp: 1800,
      currentXp: 300,
      rank: 5,
      currentStreak: 5,
      longestStreak: 20,
      lastActivityDate: now,
    },
    {
      userId: IDS.freeUser,
      level: 3,
      totalXp: 350,
      currentXp: 50,
      rank: 25,
      currentStreak: 2,
      longestStreak: 7,
      lastActivityDate: now,
    },
  ]).onConflictDoNothing()
}

async function seedNotificationPreferences() {
  console.log("Seeding notification preferences...")

  const defaultPrefs = {
    globalEnabled: true,
    quietHoursEnabled: false,
    emailDigestEnabled: false,
    categoryPreferences: {},
    typeOverrides: {},
  }

  const userIds = [IDS.admin, IDS.moderator, IDS.premiumUser, IDS.plusUser, IDS.freeUser, IDS.orgOwner, IDS.orgMember]

  for (const userId of userIds) {
    await db.insert(schema.notificationPreferences).values({
      userId,
      ...defaultPrefs,
    }).onConflictDoNothing()
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Seed Function
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting database seed...")
  console.log("─".repeat(50))

  try {
    // Generate password hash for demo accounts
    DEMO_PASSWORD_HASH = await hashPassword("password123")

    await seedCategories()
    await seedUsers()
    await seedOrganizations()
    await seedBadges()
    await seedPolls()
    await seedSurveys()
    await seedTests()
    await seedGamification()
    await seedNotificationPreferences()

    console.log("─".repeat(50))
    console.log("✅ Database seeded successfully!")
    console.log("")
    console.log("📧 Demo Accounts (password: password123):")
    console.log("   Admin:     admin@voxpoll.local")
    console.log("   Moderator: moderator@voxpoll.local")
    console.log("   Premium:   premium@voxpoll.local")
    console.log("   Plus:      plus@voxpoll.local")
    console.log("   Free:      free@voxpoll.local")
    console.log("   Org Owner: orgowner@voxpoll.local")
    console.log("   Org Member: orgmember@voxpoll.local")
    console.log("")
  } catch (error) {
    console.error("❌ Seed failed:", error)
    process.exit(1)
  } finally {
    await client.end()
    process.exit(0)
  }
}

main()
