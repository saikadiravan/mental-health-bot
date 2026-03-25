// 🎮 XP SYSTEM FOR TEEN AVATAR ONLY

// -----------------------------
// TYPES
// -----------------------------

export type RewardType = "aura1" | "aura2" | "aura3" | "crown";

export interface Reward {
  id: RewardType;
  name: string;
  unlockLevel: number;
  xpRequired: number;
}

// -----------------------------
// CONSTANTS
// -----------------------------

export const XP_RULES = {
  MOOD_ENTRY: 10,
  JOURNAL_ENTRY: 25,
};

export const XP_PER_LEVEL = 100;

// Reward definitions (central source of truth)
export const REWARDS: Reward[] = [
  {
    id: "aura1",
    name: "Aura Ring 1",
    unlockLevel: 2,
    xpRequired: 200,
  },
  {
    id: "aura2",
    name: "Aura Ring 2",
    unlockLevel: 3,
    xpRequired: 300,
  },
  {
    id: "aura3",
    name: "Aura Ring 3",
    unlockLevel: 4,
    xpRequired: 400,
  },
  {
    id: "crown",
    name: "Crown",
    unlockLevel: 5,
    xpRequired: 500,
  },
];

// -----------------------------
// CORE FUNCTIONS
// -----------------------------

// 🎯 Calculate level from XP
export function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / XP_PER_LEVEL) + 1;
}

// 📈 XP needed to reach next level
export function getNextLevelXP(level: number): number {
  return level * XP_PER_LEVEL;
}

// 📊 XP remaining to next level
export function getXPToNextLevel(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP);
  const nextLevelXP = getNextLevelXP(currentLevel);
  return Math.max(nextLevelXP - totalXP, 0);
}

// 🏆 Get unlocked rewards
export function getUnlockedRewards(level: number): Reward[] {
  return REWARDS.filter((reward) => level >= reward.unlockLevel);
}

// 🔒 Get locked rewards
export function getLockedRewards(level: number): Reward[] {
  return REWARDS.filter((reward) => level < reward.unlockLevel);
}

// ⭐ Get next upcoming reward
export function getNextReward(level: number): Reward | null {
  return REWARDS.find((reward) => reward.unlockLevel > level) || null;
}

// 📊 XP needed for a specific reward
export function getXPNeededForReward(totalXP: number, reward: Reward): number {
  return Math.max(reward.xpRequired - totalXP, 0);
}

// -----------------------------
// HELPER (FOR UI)
// -----------------------------

export function getProgressPercentage(totalXP: number): number {
  const level = calculateLevel(totalXP);
  const currentLevelXP = (level - 1) * XP_PER_LEVEL;
  const nextLevelXP = level * XP_PER_LEVEL;

  const progress =
    ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return Math.min(Math.max(progress, 0), 100);
}