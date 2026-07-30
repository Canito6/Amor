const GameSession = require('../src/models/fun/gameSessionModel');

/**
 * Estes testes NÃO precisam de ligação real ao MongoDB.
 *
 * Usam a API interna do Mongoose (`$__delta()`) para inspecionar exatamente
 * a operação `$set` que seria enviada à base de dados num `.save()` — o que
 * permite apanhar um tipo de bug muito traiçoeiro: campos que são atribuídos
 * em memória com sucesso (ex.: `session.state.customizations = {...}`) mas
 * que o Mongoose descarta silenciosamente ao gravar, por não estarem
 * declarados no schema (modo `strict`, ligado por defeito).
 *
 * Este exato cenário foi a causa raiz do bug em que os dois jogadores do
 * "4 em Linha" viam a personalização (cor/emoji) um do outro a "desaparecer"
 * depois de um refresh — a validação de duplicados funcionava em memória
 * durante um pedido, mas nunca sobrevivia a um reload a partir da BD.
 */
describe('GameSession schema - persistência de campos do state', () => {
  const buildExistingSession = (overrides = {}) => {
    const session = new GameSession({
      coupleId: 'couple-test',
      gameType: 'connect-four',
      players: [
        { username: 'canito', symbol: 'X' },
        { username: 'lara', symbol: 'O' }
      ],
      ...overrides
    });
    // Simular um documento já existente na BD (como acontece sempre em
    // updateCustomization/makeMove/resetSession, que fazem load + save)
    session.isNew = false;
    return session;
  };

  const getSetPayload = (session) => {
    const delta = session.$__delta();
    return delta ? delta[1].$set : null;
  };

  it('declara "state.customizations" no schema (regressão do bug de personalização)', () => {
    const path = GameSession.schema.path('state.customizations');
    expect(path).toBeDefined();
  });

  it('persiste state.customizations num save() real (não fica só em memória)', () => {
    const session = buildExistingSession();

    session.state.customizations = {};
    session.state.customizations['lara'] = { emoji: '💙', color: 'blue' };
    session.markModified('state');

    const setPayload = getSetPayload(session);

    expect(setPayload).toBeTruthy();
    expect(setPayload.state).toBeDefined();
    expect(setPayload.state.customizations).toBeDefined();
    expect(setPayload.state.customizations.lara).toEqual({ emoji: '💙', color: 'blue' });
  });

  it('mantém as personalizações de AMBOS os jogadores após uma segunda gravação', () => {
    const session = buildExistingSession();

    session.state.customizations = { lara: { emoji: '💙', color: 'blue' } };
    session.markModified('state');
    let setPayload = getSetPayload(session);
    expect(setPayload.state.customizations).toEqual({ lara: { emoji: '💙', color: 'blue' } });

    // Segunda gravação (ex.: o Canito escolhe a personalização dele a seguir)
    session.state.customizations.canito = { emoji: '💖', color: 'pink' };
    session.markModified('state');
    setPayload = getSetPayload(session);

    expect(setPayload.state.customizations).toEqual({
      lara: { emoji: '💙', color: 'blue' },
      canito: { emoji: '💖', color: 'pink' }
    });
  });
});
