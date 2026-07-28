const User = require('../../models/auth/userModel');
const Couple = require('../../models/couple/coupleModel');
const ApiError = require('../../utils/apiError');
const Memory = require('../../models/fun/memoryModel');
const Message = require('../../models/chat/messageModel');
const BucketItem = require('../../models/fun/bucketItemModel');
const Event = require('../../models/couple/eventModel');
const Photo = require('../../models/gallery/photoModel');
const Quiz = require('../../models/fun/quizModel');
const ScratchCard = require('../../models/fun/scratchCardModel');
const Coupon = require('../../models/fun/couponModel');
const LikelyQuestion = require('../../models/fun/likelyModel');
const DecisionWheel = require('../../models/fun/decisionWheelModel');
const PDFDocument = require('pdfkit');

exports.getCoupleInfo = async (req, res, next) => {
  try {
    const coupleId = req.coupleId;
    let couple = await Couple.findById(coupleId);
    
    // Find all users belonging to this couple
    const users = await User.find({ coupleId });
    const partnerNames = users.map(u => u.username);

    if (!couple) {
      // Create Couple document if it was missing
      couple = new Couple({
        _id: coupleId,
        partner1: users[0]?._id,
        partner2: users[1]?._id
      });
      await couple.save();
    }

    res.json({
      coupleId,
      names: couple?.names || '',
      relationshipDate: couple?.relationshipDate || null,
      partnerNames,
      partners: users.map(u => ({
        username: u.username,
        moodEmoji: u.moodEmoji || '',
        moodUpdatedAt: u.moodUpdatedAt || null,
        avatarUrl: u.avatarUrl || '',
        moodHistory: u.moodHistory || []
      }))
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCoupleInfo = async (req, res, next) => {
  try {
    const coupleId = req.coupleId;
    const { names, relationshipDate } = req.body;

    let couple = await Couple.findById(coupleId);
    if (!couple) {
      couple = new Couple({ _id: coupleId, partner1: req.user.id });
    }

    if (names !== undefined) couple.names = names;
    if (relationshipDate !== undefined) couple.relationshipDate = relationshipDate ? new Date(relationshipDate) : null;

    await couple.save();

    const users = await User.find({ coupleId });
    const partnerNames = users.map(u => u.username);

    res.json({
      coupleId,
      names: couple.names,
      relationshipDate: couple.relationshipDate,
      partnerNames
    });
  } catch (error) {
    next(error);
  }
};

exports.linkCouple = async (req, res, next) => {
  try {
    const { inviteToken } = req.body;
    if (!inviteToken || inviteToken.trim() === '') {
      throw new ApiError(400, 'O token de convite é obrigatório.');
    }

    // Try to find a user that has this coupleId or whose username/email is inviteToken
    let targetUser = await User.findOne({
      $or: [
        { coupleId: inviteToken.trim() },
        { username: inviteToken.trim() },
        { email: inviteToken.trim() }
      ]
    });

    if (!targetUser) {
      throw new ApiError(404, 'Nenhum parceiro encontrado com o código/nome fornecido.');
    }

    if (targetUser._id.toString() === req.user.id.toString()) {
      throw new ApiError(400, 'Não te podes conectar a ti próprio!');
    }

    let targetCoupleId = targetUser.coupleId;

    if (!targetCoupleId) {
      // Create a new Couple document and link both
      const newCouple = new Couple({
        partner1: targetUser._id,
        partner2: req.user.id
      });
      await newCouple.save();
      targetCoupleId = newCouple._id;
      
      // Update partner
      targetUser.coupleId = targetCoupleId;
      await targetUser.save();
    } else {
      // Just update the Couple record to set us as partner2 if not set
      const couple = await Couple.findById(targetCoupleId);
      if (couple) {
        if (!couple.partner2) {
          couple.partner2 = req.user.id;
          await couple.save();
        } else if (couple.partner1.toString() !== req.user.id.toString() && couple.partner2.toString() !== req.user.id.toString()) {
          // [SEGURANÇA] Impedir a intromissão num casal já completo (overwriting partner2)
          throw new ApiError(400, 'Este casal já está completo e com ambos os parceiros vinculados.');
        }
      } else {
        const newCouple = new Couple({
          _id: targetCoupleId,
          partner1: targetUser._id,
          partner2: req.user.id
        });
        await newCouple.save();
      }
    }

    // Update current user's coupleId
    const currentUser = await User.findById(req.user.id);
    currentUser.coupleId = targetCoupleId;
    await currentUser.save();

    res.json({
      message: 'Casal conectado com sucesso! ❤️',
      coupleId: targetCoupleId
    });
  } catch (error) {
    next(error);
  }
};

exports.exportData = async (req, res, next) => {
  try {
    const coupleId = req.coupleId;
    const toLean = (q) => (q && typeof q.lean === 'function' ? q.lean() : q);

    // 1. Obter todos os dados do casal em paralelo (excluindo dados de segurança/sensíveis)
    const [
      couple,
      users,
      memories,
      messages,
      bucketList,
      events,
      photos
    ] = await Promise.all([
      toLean(Couple.findById(coupleId)),
      toLean(User.find({ coupleId }).select('-password -loginAttempts -lockUntil -resetPasswordToken -resetPasswordExpires -loginVerificationCode -loginVerificationExpires -loginVerificationAttempts -resetPasswordAttempts -trustedDevices -cycleTracking -__v')),
      toLean(Memory.find({ coupleId }).sort({ date: -1 }).select('-coupleId -__v')),
      toLean(Message.find({ coupleId }).sort({ createdAt: 1 }).select('-coupleId -__v')),
      toLean(BucketItem.find({ coupleId }).sort({ createdAt: -1 }).select('-coupleId -__v')),
      toLean(Event.find({ coupleId }).sort({ date: 1 }).select('-coupleId -__v')),
      toLean(Photo.find({ coupleId }).sort({ createdAt: -1 }).select('-coupleId -__v'))
    ]);

    // 2. Agregar estatísticas do casal (reutilizando a lógica do statsController.js)
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
      toLean(LikelyQuestion.find({ coupleId })),
      toLean(Message.find({ coupleId }).sort({ createdAt: -1 }).limit(200).select('createdAt')),
      toLean(ScratchCard.find({ coupleId, isScratched: true }).select('scratchedAt')),
      toLean(Memory.find({ coupleId }).select('date')),
      Memory.countDocuments({ coupleId, isTimeCapsule: true }),
      DecisionWheel.countDocuments({ coupleId })
    ]);

    const completedLikely = likelyQuestions.filter(q => q.votes.length === 2);
    const matchedLikely = completedLikely.filter(q => q.isMatched).length;

    const { calculateActivityStreak } = require('../../utils/streakCalculator');
    const activityDates = [
      ...latestMessages.map(m => m.createdAt),
      ...scratchedCards.map(s => s.scratchedAt),
      ...memoriesDates.map(m => m.date)
    ].filter(Boolean);

    const currentStreak = calculateActivityStreak(activityDates);

    let relationshipDate = null;
    let totalDaysTogether = 0;
    if (couple && couple.relationshipDate) {
      relationshipDate = couple.relationshipDate;
      const diffMs = Date.now() - new Date(relationshipDate).getTime();
      totalDaysTogether = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }

    let moodMatchPercentage = null;
    if (users && users.length === 2) {
      const [partner1, partner2] = users;
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

    const compiledStats = {
      quizzes: { total: quizzesTotal, completed: quizzesCompleted },
      scratchCards: { total: scratchTotal, scratched: scratchScratched },
      bucketList: { total: bucketTotal, completed: bucketCompleted },
      memoriesCount: memoriesTotal,
      photosCount: photosTotal,
      couponsCount: couponsRedeemed,
      likely: { total: completedLikely.length, matched: matchedLikely },
      messagesCount: messages.length,
      timeCapsulesCount,
      decisionWheelsCount,
      currentStreak,
      relationshipDate,
      totalDaysTogether,
      moodMatchPercentage
    };

    res.json({
      couple: {
        names: couple?.names || '',
        relationshipDate: couple?.relationshipDate || null,
        createdAt: couple?.createdAt || null
      },
      partners: users.map(u => ({
        username: u.username,
        email: u.email,
        role: u.role,
        avatarUrl: u.avatarUrl || '',
        moodEmoji: u.moodEmoji || '',
        moodUpdatedAt: u.moodUpdatedAt || null,
        moodHistory: u.moodHistory || []
      })),
      stats: compiledStats,
      memories,
      messages,
      bucketList,
      events,
      photos
    });
  } catch (error) {
    next(error);
  }
};

// Helper para descarregar imagem com limite de tempo e cancelamento (AbortController)
// Proteção de memória do servidor: ignora imagens que excedam 5MB
const fetchImageWithTimeout = async (url, timeoutMs = 4000) => {
  if (!url) return null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Proteção de memória do servidor: limite de 5MB por imagem individual
    if (buffer.length > 5 * 1024 * 1024) {
      console.warn(`[PDF EXPORT] Imagem ignorada por exceder o limite de 5MB: ${url}`);
      return null;
    }
    
    return buffer;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`[PDF EXPORT] Falha ao descarregar imagem ${url}: ${err.message}`);
    return null;
  }
};

// Helper para desenhar um placeholder estético na Polaroid se a foto falhar ou não existir
function drawPhotoPlaceholder(doc, x, y, w, h) {
  doc.rect(x, y, w, h).fill('#edf2f7');
  doc.lineWidth(1).strokeColor('#e2e8f0').rect(x, y, w, h).stroke();
  doc.fillColor('#a0aec0');
  doc.fontSize(16).text('❤️', x, y + h / 2 - 15, { align: 'center', width: w });
  doc.fontSize(10).text('Guardado no Coração', x, y + h / 2 + 10, { align: 'center', width: w });
}

exports.exportPDF = async (req, res, next) => {
  // Timeout geral de segurança de 45 segundos para evitar ligações pendentes
  const timeoutMs = 45000;
  
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('TIMEOUT_GERAL'));
    }, timeoutMs);
  });

  try {
    const coupleId = req.coupleId;

    const exportPromise = (async () => {
      // 1. Obter dados de casal e parceiros
      const couple = await Couple.findById(coupleId);
      const users = await User.find({ coupleId });
      const coupleNames = couple?.names || users.map(u => u.username).join(' & ') || 'Nós';

      // 2. Contar e obter as memórias do casal
      const totalMemoriesCount = await Memory.countDocuments({ coupleId });
      
      // Proteção de memória do servidor: limite máximo de 150 memórias mais recentes no PDF
      const maxMemoriesLimit = 150;
      const memories = await Memory.find({ coupleId })
        .sort({ date: -1 })
        .limit(maxMemoriesLimit);

      const hasMoreThanLimit = totalMemoriesCount > maxMemoriesLimit;

      // 3. Descarregar imagens de forma assíncrona e em paralelo usando lotes de 10
      const BATCH_SIZE = 10;
      const imageBuffers = {};

      for (let i = 0; i < memories.length; i += BATCH_SIZE) {
        const batch = memories.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (mem) => {
          if (mem.imageUrl) {
            const buffer = await fetchImageWithTimeout(mem.imageUrl);
            if (buffer) {
              imageBuffers[mem._id.toString()] = buffer;
            }
          }
        }));
      }

      // 4. Gerar o PDF na memória acumulando em buffers
      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const buffers = [];

        doc.on('data', chunks => buffers.push(chunks));
        doc.on('end', () => resolve({ buffer: Buffer.concat(buffers) }));
        doc.on('error', err => reject(err));

        try {
          // --- CAPA DO ÁLBUM ---
          doc.rect(0, 0, 595, 842).fill('#fff5f5');
          doc.fillColor('#e53e3e');
          
          doc.fontSize(32).text('Álbum de Memórias', 40, 240, { align: 'center', width: 515 });
          doc.fontSize(20).fillColor('#4a5568').text(`de ${coupleNames}`, 40, 285, { align: 'center', width: 515 });
          
          if (couple?.relationshipDate) {
            const relDateStr = new Date(couple.relationshipDate).toLocaleDateString('pt-PT', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });
            doc.fontSize(12).fillColor('#718096').text(`Juntos desde: ${relDateStr}`, 40, 330, { align: 'center', width: 515 });
          }

          const totalDaysStr = couple?.relationshipDate 
            ? Math.floor((Date.now() - new Date(couple.relationshipDate).getTime()) / (1000 * 60 * 60 * 24))
            : 0;
          if (totalDaysStr > 0) {
            doc.fontSize(14).fillColor('#e53e3e').text(`❤️ ${totalDaysStr} dias de amor e cumplicidade ❤️`, 40, 360, { align: 'center', width: 515 });
          }

          // Nota de segurança na capa se excedeu o limite das 150 memórias
          if (hasMoreThanLimit) {
            doc.rect(40, 680, 515, 75).fill('#fffaf0');
            doc.lineWidth(1).strokeColor('#feebc8').rect(40, 680, 515, 75).stroke();
            doc.fontSize(9).fillColor('#dd6b20').text(
              'Nota Importante: Este álbum em formato PDF inclui as 150 memórias mais recentes para salvaguardar a estabilidade e memória do servidor. Para descarregar o histórico completo e sem limites de todas as memórias do casal, utilize a exportação de dados em formato JSON nas Definições do site.',
              55, 692, { width: 485, align: 'center', lineGap: 3 }
            );
          }

          // --- PÁGINAS DE MEMÓRIA (Uma por página) ---
          memories.forEach((mem) => {
            doc.addPage();
            
            // Fundo leve e elegante
            doc.rect(0, 0, 595, 842).fill('#faf5ff');

            // Coordenadas da moldura Polaroid
            const polX = 137.5;
            const polY = 100;
            const polW = 320;
            const polH = 390;

            // Sombra subtil cinzenta
            doc.rect(polX + 3, polY + 3, polW, polH).fill('#e2e8f0');

            // Fundo Branco da Polaroid
            doc.rect(polX, polY, polW, polH).fill('#ffffff');
            doc.lineWidth(1).strokeColor('#cbd5e0').rect(polX, polY, polW, polH).stroke();

            // Dimensões do quadrado interior da foto
            const photoX = polX + 15;
            const photoY = polY + 15;
            const photoW = polW - 30;
            const photoH = polH - 110;

            const imgBuf = imageBuffers[mem._id.toString()];
            if (imgBuf) {
              try {
                doc.image(imgBuf, photoX, photoY, {
                  fit: [photoW, photoH],
                  align: 'center',
                  valign: 'center'
                });
              } catch (e) {
                drawPhotoPlaceholder(doc, photoX, photoY, photoW, photoH);
              }
            } else {
              drawPhotoPlaceholder(doc, photoX, photoY, photoW, photoH);
            }

            // Título na Polaroid
            doc.fillColor('#2d3748');
            doc.fontSize(14).text(mem.title, polX + 15, polY + 300, {
              align: 'center',
              width: polW - 30,
              ellipsis: true
            });

            // Data formatada
            const dateFormatted = new Date(mem.date).toLocaleDateString('pt-PT', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });
            doc.fontSize(10).fillColor('#718096').text(dateFormatted, polX + 15, polY + 325, {
              align: 'center',
              width: polW - 30
            });

            // Nome do criador
            if (mem.createdBy) {
              doc.fontSize(8).fillColor('#a0aec0').text(`Recordação de: ${mem.createdBy}`, polX + 15, polY + 355, {
                align: 'center',
                width: polW - 30
              });
            }

            // Descrição (fora/abaixo da Polaroid)
            if (mem.description) {
              doc.fillColor('#4a5568');
              doc.fontSize(11).text(
                mem.description,
                80,
                520,
                {
                  align: 'center',
                  width: 435,
                  lineGap: 4
                }
              );
            }
          });

          doc.end();
        } catch (e) {
          reject(e);
        }
      });
    })();

    // Competir com o timeout geral de 45 segundos
    const result = await Promise.race([exportPromise, timeoutPromise]);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="album_memorias_${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(result.buffer);

  } catch (error) {
    if (error.message === 'TIMEOUT_GERAL') {
      return res.status(504).json({ error: 'A geração do PDF excedeu o tempo limite do servidor (45 segundos). Por favor, utilize a exportação em formato JSON para um histórico muito grande.' });
    }
    next(error);
  }
};
