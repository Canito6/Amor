const Quiz = require('../../models/fun/quizModel');
const ScratchCard = require('../../models/fun/scratchCardModel');
const BucketItem = require('../../models/fun/bucketItemModel');
const Memory = require('../../models/fun/memoryModel');
const Photo = require('../../models/gallery/photoModel');
const Coupon = require('../../models/fun/couponModel');
const LikelyQuestion = require('../../models/fun/likelyModel');
const Message = require('../../models/chat/messageModel');
const DecisionWheel = require('../../models/fun/decisionWheelModel');
const { calculateActivityStreak } = require('../../utils/streakCalculator');
const Couple = require('../../models/couple/coupleModel');
const User = require('../../models/auth/userModel');

exports.getCoupleStats = async (req, res, next) => {
  try {
    const coupleId = req.coupleId;

    const [
      quizzesTotal,
      quizzesCompleted,
      scratchTotal,
      scratchScratched,
      bucketTotal,
      bucketCompleted,
      memoriesTotal,
      photosTotal,
      couponsRedeemed,
      likelyQuestions,
      latestMessages,
      scratchedCards,
      memoriesDates,
      timeCapsulesCount,
      decisionWheelsCount,
      couple,
      partners
    ] = await Promise.all([
      Quiz.countDocuments({ coupleId }),
      Quiz.countDocuments({ coupleId, completed: true }),
      ScratchCard.countDocuments({ coupleId }),
      ScratchCard.countDocuments({ coupleId, isScratched: true }),
      BucketItem.countDocuments({ coupleId }),
      BucketItem.countDocuments({ coupleId, completed: true }),
      Memory.countDocuments({ coupleId }),
      Photo.countDocuments({ coupleId }),
      Coupon.countDocuments({ coupleId, status: 'redeemed' }),
      LikelyQuestion.find({ coupleId }),
      // Streak sources:
      Message.find({ coupleId }).sort({ createdAt: -1 }).limit(200).select('createdAt'),
      ScratchCard.find({ coupleId, isScratched: true }).select('scratchedAt'),
      Memory.find({ coupleId }).select('date'),
      // Counts for badges:
      Memory.countDocuments({ coupleId, isTimeCapsule: true }),
      DecisionWheel.countDocuments({ coupleId }),
      Couple.findById(coupleId),
      User.find({ coupleId })
    ]);

    // Calculate Likely match rate
    const completedLikely = likelyQuestions.filter(q => q.votes.length === 2);
    const matchedLikely = completedLikely.filter(q => q.isMatched).length;

    // Combine activity timestamps to compute daily UTC streak
    const activityDates = [
      ...latestMessages.map(m => m.createdAt),
      ...scratchedCards.map(s => s.scratchedAt),
      ...memoriesDates.map(m => m.date)
    ].filter(Boolean);

    const currentStreak = calculateActivityStreak(activityDates);

    // Duração da relação
    let relationshipDate = null;
    let totalDaysTogether = 0;
    if (couple && couple.relationshipDate) {
      relationshipDate = couple.relationshipDate;
      const diffMs = Date.now() - new Date(relationshipDate).getTime();
      totalDaysTogether = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }

    // Correção 3: Percentagem de dias com "mood match" positivo (humores idênticos)
    // - O cálculo é efetuado apenas para dias nos quais AMBOS os parceiros registaram humor.
    // - Se não houver dias comuns com registo mútuo nos últimos 30 dias, retorna-se null
    //   para que a interface apresente "ainda sem dados suficientes".
    let moodMatchPercentage = null;
    if (partners && partners.length === 2) {
      const [partner1, partner2] = partners;

      const getMoodsByDate = (history) => {
        const moods = {};
        (history || []).forEach(h => {
          if (h.updatedAt && h.emoji) {
            const dateStr = new Date(h.updatedAt).toISOString().split('T')[0];
            moods[dateStr] = h.emoji;
          }
        });
        return moods;
      };

      const p1Moods = getMoodsByDate(partner1.moodHistory);
      const p2Moods = getMoodsByDate(partner2.moodHistory);

      let matchDays = 0;
      let eligibleDays = 0;

      const now = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        const m1 = p1Moods[dateStr];
        const m2 = p2Moods[dateStr];

        if (m1 && m2) {
          eligibleDays++;
          if (m1 === m2) {
            matchDays++;
          }
        }
      }

      if (eligibleDays > 0) {
        moodMatchPercentage = Math.round((matchDays / eligibleDays) * 100);
      }
    }

    res.json({
      quizzes: {
        total: quizzesTotal,
        completed: quizzesCompleted
      },
      scratchCards: {
        total: scratchTotal,
        scratched: scratchScratched
      },
      bucketList: {
        total: bucketTotal,
        completed: bucketCompleted
      },
      memoriesCount: memoriesTotal,
      photosCount: photosTotal,
      couponsCount: couponsRedeemed,
      likely: {
        total: completedLikely.length,
        matched: matchedLikely
      },
      messagesCount: await Message.countDocuments({ coupleId }), // exact message count
      timeCapsulesCount,
      decisionWheelsCount,
      currentStreak,
      relationshipDate,
      totalDaysTogether,
      moodMatchPercentage
    });
  } catch (error) {
    next(error);
  }
};
