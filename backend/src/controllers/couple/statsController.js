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
      decisionWheelsCount
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
      DecisionWheel.countDocuments({ coupleId })
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
      currentStreak
    });
  } catch (error) {
    next(error);
  }
};
