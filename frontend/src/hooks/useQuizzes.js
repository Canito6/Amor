import { useEffect, useState } from 'react';
import { quizService } from '../services/fun/quizService';

export default function useQuizzes(t, language, meuNome) {
  const [quizzes, setQuizzes] = useState([]);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados de Criação de Quiz
  const [showCreator, setShowCreator] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', ''], creatorAnswer: '' }
  ]);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiNotice, setAiNotice] = useState(false);

  // Estados de Resposta a Quiz
  const [activeQuiz, setActiveQuiz] = useState(null); // Quiz a ser respondido
  const [currentGuesses, setCurrentGuesses] = useState([]); // Array de respostas dadas

  // Estado para ver detalhes de um Quiz Concluído
  const [selectedCompletedQuiz, setSelectedCompletedQuiz] = useState(null);

  useEffect(() => {
    carregarQuizzes();
  }, []);

  const carregarQuizzes = async () => {
    try {
      setLoading(true);
      const dados = await quizService.getQuizzes();
      setQuizzes(dados);
    } catch (err) {
      setErro(err.message || (language === 'pt' ? 'Erro ao carregar quizzes.' : 'Error loading quizzes.'));
    } finally {
      setLoading(false);
    }
  };

  // Funções de Criação
  const adicionarPergunta = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', ''], creatorAnswer: '' }]);
  };

  const removerPergunta = (index) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const atualizarPergunta = (index, campo, valor) => {
    const novasPerguntas = [...questions];
    novasPerguntas[index][campo] = valor;
    setQuestions(novasPerguntas);
  };

  const atualizarOpcao = (pIndex, oIndex, valor) => {
    const novasPerguntas = [...questions];
    novasPerguntas[pIndex].options[oIndex] = valor;
    // Se a resposta antiga corresponder à opção alterada, atualiza também
    novasPerguntas[pIndex].creatorAnswer = '';
    setQuestions(novasPerguntas);
  };

  const gerarQuizComIA = async (theme) => {
    try {
      setGeneratingAI(true);
      setErro('');
      setAiNotice(false);
      const data = await quizService.generateAIQuiz(theme, language);
      if (data.title && Array.isArray(data.questions)) {
        setQuizTitle(data.title);
        // Garante que o array de opções e a resposta correta são inseridos corretamente no form
        setQuestions(data.questions.map(q => ({
          questionText: q.questionText || '',
          options: Array.isArray(q.options) ? q.options : ['', '', ''],
          creatorAnswer: q.creatorAnswer || ''
        })));
        setShowCreator(true);
        if (data.aiUsed === false) {
          setAiNotice(true);
        }
      } else {
        throw new Error(language === 'pt' ? 'Estrutura de quiz gerada inválida.' : 'Invalid generated quiz structure.');
      }
    } catch (err) {
      setErro(err.message || (language === 'pt' ? 'Erro ao gerar quiz com IA.' : 'Error generating quiz with AI.'));
    } finally {
      setGeneratingAI(false);
    }
  };

  const submeterNovoQuiz = async (e) => {
    e.preventDefault();
    if (!quizTitle.trim()) return;

    // Validações básicas
    for (const [index, q] of questions.entries()) {
      if (!q.questionText.trim()) {
        alert(t.quizzes_alert_empty_question.replace('{num}', index + 1));
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        alert(t.quizzes_alert_empty_option.replace('{num}', index + 1));
        return;
      }
      if (!q.creatorAnswer) {
        alert(t.quizzes_alert_no_correct.replace('{num}', index + 1));
        return;
      }
    }

    try {
      setErro('');
      const novo = await quizService.createQuiz({ title: quizTitle, questions });
      setQuizzes([novo, ...quizzes]);
      setQuizTitle('');
      setQuestions([{ questionText: '', options: ['', '', ''], creatorAnswer: '' }]);
      setAiNotice(false);
      setShowCreator(false);
      alert(t.quizzes_alert_created_success);
    } catch (err) {
      setErro(err.message || (language === 'pt' ? 'Erro ao criar quiz.' : 'Error creating quiz.'));
    }
  };

  // Funções de Resposta
  const iniciarQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentGuesses(new Array(quiz.questions.length).fill(''));
  };

  const submeterRespostas = async (e) => {
    e.preventDefault();
    if (currentGuesses.some(g => g === '')) {
      alert(t.quizzes_alert_unanswered);
      return;
    }

    try {
      setErro('');
      const atualizado = await quizService.submitGuesses(activeQuiz._id, currentGuesses);

      // Let's update lists
      setQuizzes(quizzes.map(q => q._id === atualizado._id ? atualizado : q));
      setActiveQuiz(null);
      setSelectedCompletedQuiz(atualizado); // Abre o feedback
    } catch (err) {
      setErro(err.message || (language === 'pt' ? 'Erro ao submeter respostas.' : 'Error submitting answers.'));
    }
  };

  const apagarQuiz = async (id) => {
    if (!window.confirm(t.quizzes_confirm_delete)) return;
    try {
      setErro('');
      await quizService.deleteQuiz(id);
      setQuizzes(quizzes.filter(q => q._id !== id));
      if (selectedCompletedQuiz && selectedCompletedQuiz._id === id) {
        setSelectedCompletedQuiz(null);
      }
    } catch (err) {
      setErro(err.message || (language === 'pt' ? 'Erro ao apagar quiz.' : 'Error deleting quiz.'));
    }
  };

  // Categorização de quizzes
  const quizzesPendentesParaMim = quizzes.filter(q => q.createdBy !== meuNome && !q.completed);
  const meusQuizzesCriados = quizzes.filter(q => q.createdBy === meuNome);
  const historicoQuizzesCompletados = quizzes.filter(q => q.createdBy !== meuNome && q.completed);

  return {
    quizzes,
    erro,
    setErro,
    loading,
    showCreator,
    setShowCreator,
    quizTitle,
    setQuizTitle,
    questions,
    setQuestions,
    generatingAI,
    aiNotice,
    setAiNotice,
    gerarQuizComIA,
    adicionarPergunta,
    removerPergunta,
    atualizarPergunta,
    atualizarOpcao,
    submeterNovoQuiz,
    activeQuiz,
    setActiveQuiz,
    currentGuesses,
    setCurrentGuesses,
    selectedCompletedQuiz,
    setSelectedCompletedQuiz,
    iniciarQuiz,
    submeterRespostas,
    apagarQuiz,
    quizzesPendentesParaMim,
    meusQuizzesCriados,
    historicoQuizzesCompletados
  };
}
