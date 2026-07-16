const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Mock mongoose connection
jest.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);

const app = require('../src/server');

// Mock all models used by statsController
const User = require('../src/models/auth/userModel');
const TokenBlacklist = require('../src/models/auth/tokenBlacklistModel');
const Couple = require('../src/models/couple/coupleModel');
const Quiz = require('../src/models/fun/quizModel');
const ScratchCard = require('../src/models/fun/scratchCardModel');
const BucketItem = require('../src/models/fun/bucketItemModel');
const Memory = require('../src/models/fun/memoryModel');
const Photo = require('../src/models/gallery/photoModel');
const Coupon = require('../src/models/fun/couponModel');
const LikelyQuestion = require('../src/models/fun/likelyModel');
const Message = require('../src/models/chat/messageModel');
const DecisionWheel = require('../src/models/fun/decisionWheelModel');

jest.mock('../src/models/auth/userModel');
jest.mock('../src/models/auth/tokenBlacklistModel');
jest.mock('../src/models/couple/coupleModel');
jest.mock('../src/models/fun/quizModel');
jest.mock('../src/models/fun/scratchCardModel');
jest.mock('../src/models/fun/bucketItemModel');
jest.mock('../src/models/fun/memoryModel');
jest.mock('../src/models/gallery/photoModel');
jest.mock('../src/models/fun/couponModel');
jest.mock('../src/models/fun/likelyModel');
jest.mock('../src/models/chat/messageModel');
jest.mock('../src/models/fun/decisionWheelModel');

describe('StatsController /api/auth/couple-stats', () => {
  const mockToken = 'mock_jwt_token';
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockCoupleId = 'couple_123';
  const relationDate = new Date();
  relationDate.setDate(relationDate.getDate() - 10); // 10 days ago

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'secreta_teste_jwt';

    TokenBlacklist.findOne.mockResolvedValue(null);
    jest.spyOn(jwt, 'verify').mockReturnValue({ id: mockUserId, username: 'maria', role: 'user' });
    User.findById.mockResolvedValue({ _id: mockUserId, username: 'maria', coupleId: mockCoupleId });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('deve retornar estatísticas básicas com data de início e dias juntos', async () => {
    Couple.findById.mockResolvedValue({
      _id: mockCoupleId,
      relationshipDate: relationDate.toISOString()
    });

    // We have 2 partners. Since they don't have moodHistory, moodMatchPercentage will be null
    User.find.mockResolvedValue([
      { username: 'maria', moodHistory: [] },
      { username: 'joao', moodHistory: [] }
    ]);

    Quiz.countDocuments.mockResolvedValue(0);
    ScratchCard.countDocuments.mockResolvedValue(0);
    BucketItem.countDocuments.mockResolvedValue(0);
    Memory.countDocuments.mockResolvedValue(0);
    Photo.countDocuments.mockResolvedValue(0);
    Coupon.countDocuments.mockResolvedValue(0);
    LikelyQuestion.find.mockResolvedValue([]);
    Message.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue([])
    });
    ScratchCard.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([])
    });
    Memory.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([])
    });
    Message.countDocuments.mockResolvedValue(100);

    const res = await request(app)
      .get('/api/auth/couple-stats')
      .set('Cookie', [`token=${mockToken}`]);

    expect(res.statusCode).toEqual(200);
    expect(res.body.messagesCount).toEqual(100);
    expect(res.body.totalDaysTogether).toEqual(10);
    expect(res.body.moodMatchPercentage).toBeNull();
  });

  it('deve calcular a percentagem de mood match corretamente (caso simétrico/normal)', async () => {
    Couple.findById.mockResolvedValue({
      _id: mockCoupleId,
      relationshipDate: relationDate.toISOString()
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Day 1: Match (😊 vs 😊)
    // Day 2: No Match (🥰 vs 😊)
    User.find.mockResolvedValue([
      { 
        username: 'maria', 
        moodHistory: [
          { emoji: '😊', updatedAt: new Date(todayStr + 'T10:00:00.000Z') },
          { emoji: '🥰', updatedAt: new Date(yesterdayStr + 'T10:00:00.000Z') }
        ] 
      },
      { 
        username: 'joao', 
        moodHistory: [
          { emoji: '😊', updatedAt: new Date(todayStr + 'T11:00:00.000Z') },
          { emoji: '😊', updatedAt: new Date(yesterdayStr + 'T11:00:00.000Z') }
        ] 
      }
    ]);

    Quiz.countDocuments.mockResolvedValue(0);
    ScratchCard.countDocuments.mockResolvedValue(0);
    BucketItem.countDocuments.mockResolvedValue(0);
    Memory.countDocuments.mockResolvedValue(0);
    Photo.countDocuments.mockResolvedValue(0);
    Coupon.countDocuments.mockResolvedValue(0);
    LikelyQuestion.find.mockResolvedValue([]);
    Message.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue([])
    });
    ScratchCard.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([])
    });
    Memory.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([])
    });
    Message.countDocuments.mockResolvedValue(0);

    const res = await request(app)
      .get('/api/auth/couple-stats')
      .set('Cookie', [`token=${mockToken}`]);

    expect(res.statusCode).toEqual(200);
    // 1 match day / 2 eligible days = 50%
    expect(res.body.moodMatchPercentage).toEqual(50);
  });

  it('deve ignorar dias assimétricos onde apenas um parceiro registou humor (Correção 3)', async () => {
    Couple.findById.mockResolvedValue({
      _id: mockCoupleId,
      relationshipDate: relationDate.toISOString()
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Day 1 (today): Match (😊 vs 😊)
    // Day 2 (yesterday): Only Maria registered (🥰), Joao didn't. Should be ignored!
    User.find.mockResolvedValue([
      { 
        username: 'maria', 
        moodHistory: [
          { emoji: '😊', updatedAt: new Date(todayStr + 'T10:00:00.000Z') },
          { emoji: '🥰', updatedAt: new Date(yesterdayStr + 'T10:00:00.000Z') }
        ] 
      },
      { 
        username: 'joao', 
        moodHistory: [
          { emoji: '😊', updatedAt: new Date(todayStr + 'T11:00:00.000Z') }
        ] 
      }
    ]);

    Quiz.countDocuments.mockResolvedValue(0);
    ScratchCard.countDocuments.mockResolvedValue(0);
    BucketItem.countDocuments.mockResolvedValue(0);
    Memory.countDocuments.mockResolvedValue(0);
    Photo.countDocuments.mockResolvedValue(0);
    Coupon.countDocuments.mockResolvedValue(0);
    LikelyQuestion.find.mockResolvedValue([]);
    Message.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue([])
    });
    ScratchCard.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([])
    });
    Memory.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([])
    });
    Message.countDocuments.mockResolvedValue(0);

    const res = await request(app)
      .get('/api/auth/couple-stats')
      .set('Cookie', [`token=${mockToken}`]);

    expect(res.statusCode).toEqual(200);
    // 1 match day / 1 eligible day (yesterday ignored) = 100%
    expect(res.body.moodMatchPercentage).toEqual(100);
  });
});
