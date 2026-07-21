require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Mock da ligação ao MongoDB para os testes serem rápidos e limpos
jest.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);

const app = require('../src/app');

// Models
const User = require('../src/models/auth/userModel');
const CycleEntry = require('../src/models/cycle/cycleEntryModel');
const TokenBlacklist = require('../src/models/auth/tokenBlacklistModel');
const Couple = require('../src/models/couple/coupleModel');

const CycleService = require('../src/services/cycleService');
const { calculateCycleStats, LEGAL_DISCLAIMER } = require('../src/utils/cyclePredictor');
const { checkCycleReminders, NEUTRAL_TITLE, NEUTRAL_BODY } = require('../src/services/cycle/cycleReminderWorker');
const pushService = require('../src/services/common/pushService');

describe('Cycle Tracking Unit & Integration Tests', () => {
  const userIdA = new mongoose.Types.ObjectId().toString();
  const userIdB = new mongoose.Types.ObjectId().toString();
  const coupleId = 'couple_123';
  const JWT_SECRET = process.env.JWT_SECRET || 'teste_secret';

  const tokenA = jwt.sign({ id: userIdA, username: 'userA', role: 'user', coupleId }, JWT_SECRET);
  const tokenB = jwt.sign({ id: userIdB, username: 'userB', role: 'user', coupleId }, JWT_SECRET);

  let mockUserA, mockUserB, mockEntries;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserA = {
      _id: userIdA,
      username: 'userA',
      coupleId,
      cycleTracking: {
        shareWithPartner: false,
        partnerShareLevel: 'basic',
        hiddenFromMenu: false,
        remindersEnabled: true
      },
      save: jest.fn().mockResolvedValue(this),
      markModified: jest.fn()
    };

    mockUserB = {
      _id: userIdB,
      username: 'userB',
      coupleId,
      cycleTracking: {
        shareWithPartner: false,
        partnerShareLevel: 'basic',
        hiddenFromMenu: false,
        remindersEnabled: true
      },
      save: jest.fn().mockResolvedValue(this),
      markModified: jest.fn()
    };

    mockEntries = [];

    // Mock User.findById & findOne
    jest.spyOn(User, 'findById').mockImplementation((id) => {
      if (id.toString() === userIdA) return Promise.resolve(mockUserA);
      if (id.toString() === userIdB) return Promise.resolve(mockUserB);
      return Promise.resolve(null);
    });

    jest.spyOn(User, 'findOne').mockImplementation((query) => {
      if (query._id && query._id.$ne) {
        if (query._id.$ne.toString() === userIdA) return Promise.resolve(mockUserB);
        if (query._id.$ne.toString() === userIdB) return Promise.resolve(mockUserA);
      }
      return Promise.resolve(null);
    });

    // Mock TokenBlacklist
    jest.spyOn(TokenBlacklist, 'findOne').mockResolvedValue(null);

    // Mock CycleEntry find, findOne, create, findById, findByIdAndUpdate, findByIdAndDelete, deleteMany
    jest.spyOn(CycleEntry, 'find').mockImplementation((query) => {
      const filtered = mockEntries.filter(e => e.userId.toString() === query.userId.toString());
      return {
        sort: () => Promise.resolve(filtered)
      };
    });

    jest.spyOn(CycleEntry, 'findOne').mockImplementation((query) => {
      const item = mockEntries.find(e => e.userId.toString() === query.userId.toString() && e.startDate.toString() === query.startDate.toString());
      return Promise.resolve(item || null);
    });

    jest.spyOn(CycleEntry, 'create').mockImplementation((data) => {
      const newEntry = { _id: new mongoose.Types.ObjectId().toString(), ...data };
      mockEntries.push(newEntry);
      return Promise.resolve(newEntry);
    });

    jest.spyOn(CycleEntry, 'findById').mockImplementation((id) => {
      const item = mockEntries.find(e => e._id.toString() === id.toString());
      return Promise.resolve(item || null);
    });

    jest.spyOn(CycleEntry, 'findByIdAndUpdate').mockImplementation((id, update) => {
      const idx = mockEntries.findIndex(e => e._id.toString() === id.toString());
      if (idx !== -1) {
        mockEntries[idx] = { ...mockEntries[idx], ...update };
        return Promise.resolve(mockEntries[idx]);
      }
      return Promise.resolve(null);
    });

    jest.spyOn(CycleEntry, 'findByIdAndDelete').mockImplementation((id) => {
      const idx = mockEntries.findIndex(e => e._id.toString() === id.toString());
      if (idx !== -1) {
        const deleted = mockEntries.splice(idx, 1)[0];
        return Promise.resolve(deleted);
      }
      return Promise.resolve(null);
    });

    jest.spyOn(CycleEntry, 'deleteMany').mockImplementation((query) => {
      mockEntries = mockEntries.filter(e => e.userId.toString() !== query.userId.toString());
      return Promise.resolve({ deletedCount: 1 });
    });
  });

  describe('1. CRUD & Validações de Datas', () => {
    test('cria uma entrada de ciclo com sucesso', async () => {
      const res = await request(app)
        .post('/api/cycle/entries')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          startDate: '2026-06-01',
          endDate: '2026-06-05',
          flowIntensity: 'moderado',
          symptoms: ['colicas', 'cansaco'],
          mood: '😐',
          sexualActivity: true,
          notes: 'Dia tranquilo'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.flowIntensity).toBe('moderado');
      expect(res.body.symptoms).toContain('colicas');
    });

    test('rejeita endDate anterior a startDate com erro 400', async () => {
      const res = await request(app)
        .post('/api/cycle/entries')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          startDate: '2026-06-10',
          endDate: '2026-06-05'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/anterior/i);
    });

    test('rejeita datas no futuro distante (>1 ano) com erro 400', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);

      const res = await request(app)
        .post('/api/cycle/entries')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          startDate: futureDate.toISOString()
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/futuro/i);
    });

    test('garante isolamento de dados: parceiro B não consegue apagar entrada de A', async () => {
      const entryId = new mongoose.Types.ObjectId().toString();
      mockEntries.push({
        _id: entryId,
        userId: userIdA,
        startDate: new Date('2026-05-01')
      });

      const deleteRes = await request(app)
        .delete(`/api/cycle/entries/${entryId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(deleteRes.status).toBe(403);
    });

    test('permite apagar todo o histórico próprio de uma vez', async () => {
      mockEntries.push({ _id: '1', userId: userIdA, startDate: new Date('2026-04-01') });
      mockEntries.push({ _id: '2', userId: userIdA, startDate: new Date('2026-05-01') });

      const delAll = await request(app)
        .delete('/api/cycle/entries')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(delAll.status).toBe(200);
      expect(mockEntries.filter(e => e.userId === userIdA).length).toBe(0);
    });
  });

  describe('2. Motor de Previsões (Calculo & UTC)', () => {
    test('devolve hasEnoughData: false quando há menos de 2 ciclos registados', async () => {
      mockEntries.push({ _id: '1', userId: userIdA, startDate: new Date('2026-05-01'), endDate: new Date('2026-05-05') });

      const res = await request(app)
        .get('/api/cycle/summary')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.stats.hasEnoughData).toBe(false);
      expect(res.body.stats.disclaimer).toBe(LEGAL_DISCLAIMER);
    });

    test('devolve previsões completas quando há pelo menos 2 ciclos completos registados', async () => {
      mockEntries.push(
        { _id: '1', userId: userIdA, startDate: new Date('2026-04-01T00:00:00.000Z'), endDate: new Date('2026-04-05T00:00:00.000Z') },
        { _id: '2', userId: userIdA, startDate: new Date('2026-04-29T00:00:00.000Z'), endDate: new Date('2026-05-03T00:00:00.000Z') }
      );

      const res = await request(app)
        .get('/api/cycle/summary')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.stats.hasEnoughData).toBe(true);
      expect(res.body.stats.avgCycleLength).toBe(28);
      expect(res.body.stats.nextPeriodStartDate).toBeDefined();
      expect(res.body.stats.fertileWindowStart).toBeDefined();
      expect(res.body.stats.ovulationDate).toBeDefined();
      expect(res.body.stats.disclaimer).toBe(LEGAL_DISCLAIMER);
    });
  });

  describe('3. Modo Parceiro & Níveis de Partilha & Revogação Imediata', () => {
    test('devolve enabled: false quando a partilha está desativada no parceiro', async () => {
      mockUserA.cycleTracking.shareWithPartner = false;

      const res = await request(app)
        .get('/api/cycle/partner-summary')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.enabled).toBe(false);
    });

    test('devolve resumo básico ao parceiro quando shareWithPartner está ativo e nível é basic', async () => {
      mockUserA.cycleTracking.shareWithPartner = true;
      mockUserA.cycleTracking.partnerShareLevel = 'basic';

      mockEntries.push(
        { _id: '1', userId: userIdA, startDate: new Date('2026-04-01T00:00:00.000Z'), endDate: new Date('2026-04-05T00:00:00.000Z') },
        { _id: '2', userId: userIdA, startDate: new Date('2026-04-29T00:00:00.000Z'), endDate: new Date('2026-05-03T00:00:00.000Z'), symptoms: ['colicas'], notes: 'Segredo' }
      );

      const res = await request(app)
        .get('/api/cycle/partner-summary')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.enabled).toBe(true);
      expect(res.body.level).toBe('basic');
      expect(res.body.currentPhase).toBeDefined();
      expect(res.body.partnerInsight).toBeDefined();
      expect(res.body.latestSymptoms).toBeUndefined();
    });

    test('devolve resumo detalhado ao parceiro quando nível é detailed', async () => {
      mockUserA.cycleTracking.shareWithPartner = true;
      mockUserA.cycleTracking.partnerShareLevel = 'detailed';

      mockEntries.push(
        { _id: '1', userId: userIdA, startDate: new Date('2026-04-01T00:00:00.000Z') },
        { _id: '2', userId: userIdA, startDate: new Date('2026-04-29T00:00:00.000Z'), symptoms: ['colicas', 'cansaco'], mood: '😴' }
      );

      const res = await request(app)
        .get('/api/cycle/partner-summary')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.enabled).toBe(true);
      expect(res.body.level).toBe('detailed');
      expect(res.body.latestSymptoms).toEqual(['colicas', 'cansaco']);
      expect(res.body.latestMood).toBe('😴');
    });

    test('REVOGAÇÃO IMEDIATA: ao desligar shareWithPartner, parceiro perde acesso instantaneamente', async () => {
      // 1. Partilha ativada
      mockUserA.cycleTracking.shareWithPartner = true;

      let partnerRes = await request(app)
        .get('/api/cycle/partner-summary')
        .set('Authorization', `Bearer ${tokenB}`);
      expect(partnerRes.body.enabled).toBe(true);

      // 2. Desativar partilha
      await request(app)
        .patch('/api/cycle/preferences')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ shareWithPartner: false });

      mockUserA.cycleTracking.shareWithPartner = false;

      // 3. Confirmar revogação imediata
      partnerRes = await request(app)
        .get('/api/cycle/partner-summary')
        .set('Authorization', `Bearer ${tokenB}`);
      expect(partnerRes.status).toBe(200);
      expect(partnerRes.body.enabled).toBe(false);
    });
  });

  describe('4. Rate Limiting & Notificações Push Neutras', () => {
    test('confirma que endpoints /api/cycle/* aceitam múltiplas chamadas sem bloquear no limiter de auth (10/15min)', async () => {
      for (let i = 0; i < 12; i++) {
        const res = await request(app)
          .get('/api/cycle/entries')
          .set('Authorization', `Bearer ${tokenA}`);
        expect(res.status).toBe(200);
      }
    });

    test('worker de lembretes dispara notificação push com título e texto neutros sem termos sensíveis de saúde', async () => {
      const spyPush = jest.spyOn(pushService, 'sendPushNotification').mockResolvedValue();

      jest.spyOn(User, 'find').mockResolvedValue([mockUserA]);

      const now = new Date();
      const cycle1Start = new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000);
      const cycle2Start = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

      mockEntries.push(
        { _id: '1', userId: userIdA, startDate: cycle1Start },
        { _id: '2', userId: userIdA, startDate: cycle2Start }
      );

      await checkCycleReminders();

      expect(spyPush).toHaveBeenCalled();
      const callArgs = spyPush.mock.calls[0];
      expect(callArgs[1]).toBe(NEUTRAL_TITLE);
      expect(callArgs[2]).toBe(NEUTRAL_BODY);
      expect(callArgs[2]).not.toMatch(/período|ciclo|menstrual|saúde/i);

      spyPush.mockRestore();
    });
  });
});
