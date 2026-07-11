const Quiz = require('../../models/fun/quizModel');
const ScratchCard = require('../../models/fun/scratchCardModel');
const BucketItem = require('../../models/fun/bucketItemModel');
const Memory = require('../../models/fun/memoryModel');
const Photo = require('../../models/gallery/photoModel');
const Coupon = require('../../models/fun/couponModel');
const LikelyQuestion = require('../../models/fun/likelyModel');

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
      likelyQuestions
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
      LikelyQuestion.find({ coupleId })
    ]);

    // Calcular sintonia do Likely
    const completedLikely = likelyQuestions.filter(q => q.votes.length === 2);
    const matchedLikely = completedLikely.filter(q => q.isMatched).length;

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
      }
    });
  } catch (error) {
    next(error);
  }
};
