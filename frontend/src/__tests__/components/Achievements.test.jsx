import { describe, it, expect } from 'vitest';
import { calculateLevelAndXP, getAchievementsList } from '../../components/dashboard/widgets/achievementsData';

describe('achievementsData helper functions', () => {
  describe('calculateLevelAndXP', () => {
    it('calculates XP correctly with default, new weights', () => {
      const stats = {
        quizzes: { completed: 2 }, // 2 * 50 = 100
        scratchCards: { scratched: 1 }, // 1 * 40 = 40
        bucketList: { completed: 1 }, // 1 * 100 = 100
        memoriesCount: 5, // 5 * 30 = 150
        photosCount: 2, // 2 * 20 = 40
        couponsCount: 1, // 1 * 30 = 30
        likely: { matched: 2 }, // 2 * 25 = 50
        // New stats:
        messagesCount: 50, // 50 * 1 = 50
        timeCapsulesCount: 1, // 1 * 40 = 40
        decisionWheelsCount: 2 // 2 * 30 = 60
      };

      // Total XP = 100 + 40 + 100 + 150 + 40 + 30 + 50 + 50 + 40 + 60 = 660 XP
      // level = Math.floor(660 / 250) + 1 = 2 + 1 = 3
      // currentLevelXP = 660 % 250 = 160 XP
      // progressPercent = (160 / 250) * 100 = 64%
      const result = calculateLevelAndXP(stats);

      expect(result.xp).toBe(660);
      expect(result.level).toBe(3);
      expect(result.currentLevelXP).toBe(160);
      expect(result.progressPercent).toBe(64);
    });

    it('returns level 1 and 0 XP for empty stats', () => {
      const result = calculateLevelAndXP(null);
      expect(result.xp).toBe(0);
      expect(result.level).toBe(1);
    });
  });

  describe('getAchievementsList', () => {
    it('evaluates unlocked states correctly based on stats thresholds', () => {
      const stats = {
        memoriesCount: 10,
        photosCount: 5,
        quizzes: { completed: 3 },
        bucketList: { completed: 2 },
        scratchCards: { scratched: 3 },
        messagesCount: 120,
        timeCapsulesCount: 1,
        decisionWheelsCount: 1
      };

      const ptList = getAchievementsList(stats, 'pt');
      
      ptList.forEach(ach => {
        expect(ach.unlocked).toBe(true);
      });
      
      // Verify some locked items when counts are below threshold
      const lowStats = {
        memoriesCount: 9,
        photosCount: 4,
        quizzes: { completed: 2 },
        bucketList: { completed: 1 },
        scratchCards: { scratched: 0 },
        messagesCount: 99,
        timeCapsulesCount: 0,
        decisionWheelsCount: 0
      };

      const lockedList = getAchievementsList(lowStats, 'pt');
      
      // Storyteller (10 memories), chatty_couple (100 messages), first_time_capsule (1), wheel_spinner (1) should be locked
      const storytellingBadge = lockedList.find(a => a.id === 'storyteller');
      const chattyBadge = lockedList.find(a => a.id === 'chatty_couple');
      const timeCapsuleBadge = lockedList.find(a => a.id === 'first_time_capsule');
      const wheelBadge = lockedList.find(a => a.id === 'wheel_spinner');
      const firstScratchBadge = lockedList.find(a => a.id === 'first_scratch');

      expect(storytellingBadge.unlocked).toBe(false);
      expect(chattyBadge.unlocked).toBe(false);
      expect(timeCapsuleBadge.unlocked).toBe(false);
      expect(wheelBadge.unlocked).toBe(false);
      expect(firstScratchBadge.unlocked).toBe(false);
    });
  });
});
