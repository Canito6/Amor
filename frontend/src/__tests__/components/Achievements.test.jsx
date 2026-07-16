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
    it('locks all achievements when stats are 0 (new couple)', () => {
      const zeroStats = {
        memoriesCount: 0,
        photosCount: 0,
        quizzes: { completed: 0 },
        bucketList: { completed: 0 },
        scratchCards: { scratched: 0 },
        messagesCount: 0,
        timeCapsulesCount: 0,
        decisionWheelsCount: 0
      };

      const list = getAchievementsList(zeroStats, 'pt');
      list.forEach(ach => {
        expect(ach.unlocked).toBe(false);
      });
    });

    it('unlocks "Primeira Raspadinha" correctly when scratched >= 1', () => {
      const statsLow = { scratchCards: { scratched: 0 } };
      const statsHigh = { scratchCards: { scratched: 1 } };
      
      expect(getAchievementsList(statsLow, 'pt').find(a => a.id === 'first_scratch').unlocked).toBe(false);
      expect(getAchievementsList(statsHigh, 'pt').find(a => a.id === 'first_scratch').unlocked).toBe(true);
    });

    it('unlocks "Contador de Histórias" correctly when memoriesCount >= 10', () => {
      const statsLow = { memoriesCount: 9 };
      const statsHigh = { memoriesCount: 10 };
      
      expect(getAchievementsList(statsLow, 'pt').find(a => a.id === 'storyteller').unlocked).toBe(false);
      expect(getAchievementsList(statsHigh, 'pt').find(a => a.id === 'storyteller').unlocked).toBe(true);
    });

    it('unlocks "100 Mensagens" correctly when messagesCount >= 100', () => {
      const statsLow = { messagesCount: 99 };
      const statsHigh = { messagesCount: 100 };
      
      expect(getAchievementsList(statsLow, 'pt').find(a => a.id === 'chatty_couple').unlocked).toBe(false);
      expect(getAchievementsList(statsHigh, 'pt').find(a => a.id === 'chatty_couple').unlocked).toBe(true);
    });

    it('unlocks "Primeira Cápsula do Tempo" correctly when timeCapsulesCount >= 1', () => {
      const statsLow = { timeCapsulesCount: 0 };
      const statsHigh = { timeCapsulesCount: 1 };
      
      expect(getAchievementsList(statsLow, 'pt').find(a => a.id === 'first_time_capsule').unlocked).toBe(false);
      expect(getAchievementsList(statsHigh, 'pt').find(a => a.id === 'first_time_capsule').unlocked).toBe(true);
    });

    it('unlocks "Roda da Sorte" correctly when decisionWheelsCount >= 1', () => {
      const statsLow = { decisionWheelsCount: 0 };
      const statsHigh = { decisionWheelsCount: 1 };
      
      expect(getAchievementsList(statsLow, 'pt').find(a => a.id === 'wheel_spinner').unlocked).toBe(false);
      expect(getAchievementsList(statsHigh, 'pt').find(a => a.id === 'wheel_spinner').unlocked).toBe(true);
    });
  });
});
