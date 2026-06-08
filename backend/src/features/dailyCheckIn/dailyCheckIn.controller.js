const DailyCheckIn = require('./dailyCheckIn.model');
const dailyQuestions = require('../../utils/dailyQuestions');
const ApiError = require('../../utils/apiError');
const eventBus = require('../../utils/eventBus');

// Função utilitária para hash determinístico
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Converter para inteiro de 32 bits
  }
  return hash;
}

class DailyCheckInController {
  getDailyCheckIn = async (req, res, next) => {
    try {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      let dateString = req.query.date;
      
      if (!dateString || !dateRegex.test(dateString)) {
        dateString = new Date().toISOString().split('T')[0];
      }

      // 1. Procurar check-in existente para o casal e dia
      let checkIn = await DailyCheckIn.findOne({ coupleId: req.coupleId, date: dateString });

      // 2. Se não existir, escolher pergunta determinística e criar
      if (!checkIn) {
        const hash = hashCode(req.coupleId + dateString);
        const questionIndex = Math.abs(hash) % dailyQuestions.length;
        const selectedQuestion = dailyQuestions[questionIndex];

        try {
          checkIn = new DailyCheckIn({
            coupleId: req.coupleId,
            date: dateString,
            question: selectedQuestion,
            answers: []
          });
          await checkIn.save();
        } catch (err) {
          // Lidar com concorrência (ambos a entrar ao mesmo tempo)
          if (err.code === 11000) {
            checkIn = await DailyCheckIn.findOne({ coupleId: req.coupleId, date: dateString });
          } else {
            throw err;
          }
        }
      }

      // 3. Filtrar e formatar a resposta por privacidade
      const currentUserId = req.user.id.toString();
      const totalAnswers = checkIn.answers.length;

      const responseObj = {
        _id: checkIn._id,
        coupleId: checkIn.coupleId,
        date: checkIn.date,
        question: checkIn.question,
        revealed: totalAnswers >= 2,
        answers: checkIn.answers.map(ans => {
          const isCurrentUser = ans.userId.toString() === currentUserId;
          return {
            userId: ans.userId,
            username: ans.username,
            answerText: (totalAnswers >= 2 || isCurrentUser) ? ans.answerText : null,
            hasAnswered: true,
            createdAt: ans.createdAt
          };
        })
      };

      res.json(responseObj);
    } catch (error) {
      next(error);
    }
  };

  submitAnswer = async (req, res, next) => {
    try {
      const { answerText, date } = req.body;
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      let dateString = date;

      if (!answerText || typeof answerText !== 'string' || answerText.trim() === '') {
        throw new ApiError(400, 'O texto da resposta é obrigatório.');
      }

      if (!dateString || !dateRegex.test(dateString)) {
        dateString = new Date().toISOString().split('T')[0];
      }

      // 1. Procurar o check-in do dia
      let checkIn = await DailyCheckIn.findOne({ coupleId: req.coupleId, date: dateString });

      // Se por algum motivo o check-in não existir, criar com a pergunta correta
      if (!checkIn) {
        const hash = hashCode(req.coupleId + dateString);
        const questionIndex = Math.abs(hash) % dailyQuestions.length;
        const selectedQuestion = dailyQuestions[questionIndex];

        checkIn = new DailyCheckIn({
          coupleId: req.coupleId,
          date: dateString,
          question: selectedQuestion,
          answers: []
        });
      }

      // 2. Verificar se o utilizador já respondeu hoje
      const alreadyAnsweredIndex = checkIn.answers.findIndex(
        ans => ans.userId.toString() === req.user.id.toString()
      );

      if (alreadyAnsweredIndex !== -1) {
        checkIn.answers[alreadyAnsweredIndex].answerText = answerText.trim();
        checkIn.answers[alreadyAnsweredIndex].createdAt = new Date();
      } else {
        checkIn.answers.push({
          userId: req.user.id,
          username: req.user.username,
          answerText: answerText.trim()
        });
      }

      await checkIn.save();

      // 3. Se ambos responderam agora, emitir evento Socket.io via eventBus
      if (checkIn.answers.length >= 2) {
        eventBus.emit('socket:emit', {
          room: req.coupleId,
          event: 'daily-checkin-completed',
          data: { date: dateString }
        });
      }

      // 4. Filtrar e formatar a resposta
      const currentUserId = req.user.id.toString();
      const totalAnswers = checkIn.answers.length;

      const responseObj = {
        _id: checkIn._id,
        coupleId: checkIn.coupleId,
        date: checkIn.date,
        question: checkIn.question,
        revealed: totalAnswers >= 2,
        answers: checkIn.answers.map(ans => {
          const isCurrentUser = ans.userId.toString() === currentUserId;
          return {
            userId: ans.userId,
            username: ans.username,
            answerText: (totalAnswers >= 2 || isCurrentUser) ? ans.answerText : null,
            hasAnswered: true,
            createdAt: ans.createdAt
          };
        })
      };

      res.json(responseObj);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new DailyCheckInController();
