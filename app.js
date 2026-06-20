/**
 * 대학 전공 추천 서비스 - 애플리케이션 로직 (app.js)
 */

import { majors, questions, categories } from './data.js';

// ==================== 1. 애플리케이션 상태 관리 ====================
const state = {
  currentScreen: 'home',
  userName: '',
  interestCategory: '',
  preferredSubjects: [],
  currentQuestionIndex: 0,
  testScores: {
    humanities: 0,
    social: 0,
    engineering: 0,
    science: 0,
    arts: 0
  },
  testAnswers: [], // 각 질문의 답변 기록: [{ score: { engineering: 2 }, optionIndex: 0 }]
  recommendedMajor: null,
  alternativeMajors: []
};

// Subject to category points map (for subject preference weights)
const subjectCategoryWeights = {
  '국어': { humanities: 2, social: 1 },
  '영어': { humanities: 2, social: 1 },
  '수학': { engineering: 2, science: 2, social: 1 },
  '사회': { social: 2, humanities: 1 },
  '과학': { science: 2, engineering: 2 },
  '음악': { arts: 2 },
  '체육': { arts: 2 }
};

// ==================== 2. DOM 요소 참조 ====================
const screens = {
  home: document.getElementById('screen-home'),
  info: document.getElementById('screen-info'),
  test: document.getElementById('screen-test'),
  results: document.getElementById('screen-results')
};

const btns = {
  start: document.getElementById('btn-start'),
  infoNext: document.getElementById('btn-info-next'),
  infoBack: document.getElementById('btn-info-back'),
  testBack: document.getElementById('btn-test-back'),
  restart: document.getElementById('btn-restart'),
  viewDetails: document.getElementById('btn-view-details'),
  modalClose: document.getElementById('btn-modal-close'),
  modalBack: document.getElementById('btn-modal-back')
};

const infoForm = {
  name: document.getElementById('input-name'),
  errorMsg: document.getElementById('info-error-msg')
};

const testView = {
  progressNum: document.getElementById('test-progress-num'),
  progressFill: document.getElementById('test-progress-fill'),
  questionTitle: document.getElementById('question-title'),
  optionsContainer: document.getElementById('options-container')
};

const resultsView = {
  userName: document.getElementById('result-user-name'),
  majorName: document.getElementById('result-major-name'),
  majorCategory: document.getElementById('result-major-category'),
  reason: document.getElementById('result-recommended-reason'),
  quickJobs: document.getElementById('result-quick-jobs'),
  quickSubjects: document.getElementById('result-quick-subjects'),
  altList: document.getElementById('alternative-majors-list')
};

const modal = {
  overlay: document.getElementById('major-modal'),
  categoryBadge: document.getElementById('modal-category-badge'),
  title: document.getElementById('modal-title'),
  desc: document.getElementById('modal-desc'),
  curriculumList: document.getElementById('modal-curriculum-list'),
  jobsTags: document.getElementById('modal-jobs-tags'),
  subjectsTags: document.getElementById('modal-subjects-tags')
};

// ==================== 3. 화면 전환 및 내비게이션 ====================
function showScreen(screenId) {
  // Hide all screens
  Object.values(screens).forEach(screen => {
    screen.classList.remove('active');
  });

  // Show active screen
  const targetScreen = screens[screenId];
  if (targetScreen) {
    targetScreen.classList.add('active');
    state.currentScreen = screenId;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Dynamic background glow shift depending on screen
    adjustBackgroundGlow(screenId);
  }
}

function adjustBackgroundGlow(screenId) {
  const glow1 = document.querySelector('.bg-glow-1');
  const glow2 = document.querySelector('.bg-glow-2');
  const glow3 = document.querySelector('.bg-glow-3');

  if (!glow1 || !glow2 || !glow3) return;

  switch (screenId) {
    case 'home':
      glow1.style.opacity = '0.22';
      glow2.style.opacity = '0.22';
      glow3.style.opacity = '0.12';
      break;
    case 'info':
      glow1.style.opacity = '0.12';
      glow2.style.opacity = '0.25';
      glow3.style.opacity = '0.22';
      break;
    case 'test':
      glow1.style.opacity = '0.25';
      glow2.style.opacity = '0.12';
      glow3.style.opacity = '0.25';
      break;
    case 'results':
      glow1.style.opacity = '0.3';
      glow2.style.opacity = '0.3';
      glow3.style.opacity = '0.2';
      break;
  }
}

// ==================== 4. 기본 정보 입력 핸들링 ====================
function validateInfoForm() {
  const name = infoForm.name.value.trim();
  const interestInput = document.querySelector('input[name="interest"]:checked');
  const checkedSubjects = document.querySelectorAll('input[name="subject"]:checked');

  if (!name || !interestInput || checkedSubjects.length === 0) {
    infoForm.errorMsg.classList.remove('hide');
    return false;
  }

  infoForm.errorMsg.classList.add('hide');
  state.userName = name;
  state.interestCategory = interestInput.value;
  state.preferredSubjects = Array.from(checkedSubjects).map(cb => cb.value);
  return true;
}

// ==================== 5. 성향 검사 엔진 ====================
function startTest() {
  state.currentQuestionIndex = 0;
  state.testScores = { humanities: 0, social: 0, engineering: 0, science: 0, arts: 0 };
  state.testAnswers = [];
  renderQuestion();
  showScreen('test');
}

function renderQuestion() {
  const question = questions[state.currentQuestionIndex];
  if (!question) return;

  // Update progress
  const progressPercent = ((state.currentQuestionIndex + 1) / questions.length) * 100;
  testView.progressFill.style.width = `${progressPercent}%`;
  testView.progressNum.textContent = `질문 ${state.currentQuestionIndex + 1} / ${questions.length}`;

  // Update question title
  testView.questionTitle.textContent = question.text;

  // Clear options
  testView.optionsContainer.innerHTML = '';

  // Render options
  question.options.forEach((option, idx) => {
    const button = document.createElement('button');
    button.className = 'option-btn';
    
    // Checked state on back navigation
    const savedAnswer = state.testAnswers[state.currentQuestionIndex];
    if (savedAnswer && savedAnswer.optionIndex === idx) {
      button.classList.add('selected');
    }

    // Option alphabetical marker (A, B, C, D)
    const marker = document.createElement('div');
    marker.className = 'option-marker';
    marker.textContent = String.fromCharCode(65 + idx); // A, B, C, D...

    const textSpan = document.createElement('span');
    textSpan.textContent = option.text;

    button.appendChild(marker);
    button.appendChild(textSpan);

    button.addEventListener('click', () => handleOptionSelect(option, idx));
    testView.optionsContainer.appendChild(button);
  });

  // Toggle back button visibility
  if (state.currentQuestionIndex === 0) {
    btns.testBack.style.visibility = 'hidden';
  } else {
    btns.testBack.style.visibility = 'visible';
  }
}

function handleOptionSelect(option, optionIndex) {
  // Highlight selected button
  const buttons = testView.optionsContainer.querySelectorAll('.option-btn');
  buttons.forEach((btn, idx) => {
    if (idx === optionIndex) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });

  // If there's an existing answer for this question index, subtract its scores first
  const existingAnswer = state.testAnswers[state.currentQuestionIndex];
  if (existingAnswer) {
    const prevScore = existingAnswer.score;
    Object.keys(prevScore).forEach(cat => {
      state.testScores[cat] -= prevScore[cat];
    });
  }

  // Save new answer
  state.testAnswers[state.currentQuestionIndex] = {
    score: option.score,
    optionIndex: optionIndex
  };

  // Add new scores
  Object.keys(option.score).forEach(cat => {
    state.testScores[cat] = (state.testScores[cat] || 0) + option.score[cat];
  });

  // Move to next question with a slight, organic delay for micro-interaction satisfaction
  setTimeout(() => {
    if (state.currentQuestionIndex < questions.length - 1) {
      state.currentQuestionIndex++;
      renderQuestion();
    } else {
      processAndShowResults();
    }
  }, 220);
}

function handleTestBack() {
  if (state.currentQuestionIndex > 0) {
    // Subtract current score before going back
    const currentAnswer = state.testAnswers[state.currentQuestionIndex - 1];
    if (currentAnswer) {
      // We do not subtract yet, because renderQuestion will allow them to change.
      // But we just decrement index and render
      state.currentQuestionIndex--;
      renderQuestion();
    }
  }
}

// ==================== 6. 결과 계산 및 추천 알고리즘 ====================
function processAndShowResults() {
  // 1. Calculate overall category scores
  const finalCategoryScores = { ...state.testScores };

  // Interest category bonus (+5)
  if (finalCategoryScores[state.interestCategory] !== undefined) {
    finalCategoryScores[state.interestCategory] += 5;
  }

  // Subject preference bonus
  state.preferredSubjects.forEach(subject => {
    const weights = subjectCategoryWeights[subject];
    if (weights) {
      Object.keys(weights).forEach(cat => {
        if (finalCategoryScores[cat] !== undefined) {
          finalCategoryScores[cat] += weights[cat];
        }
      });
    }
  });

  // 2. Score individual majors based on:
  //    - Category score for the major's category
  //    - Subject match (+3 for each of the major's recommended subjects preferred by the user)
  const majorScores = majors.map(major => {
    let score = finalCategoryScores[major.category] || 0;

    // Subject matching
    let matchCount = 0;
    major.subjects.forEach(sub => {
      if (state.preferredSubjects.includes(sub)) {
        matchCount++;
      }
    });
    score += matchCount * 3; // +3 points for each subject match

    return {
      major: major,
      score: score
    };
  });

  // Sort majors by score descending
  majorScores.sort((a, b) => b.score - a.score);

  // Set top recommendation
  state.recommendedMajor = majorScores[0].major;

  // Set alternative recommendations (next 3 majors, excluding the first one)
  state.alternativeMajors = majorScores.slice(1, 4).map(item => item.major);

  // Render results viewport
  renderResults(finalCategoryScores);
  showScreen('results');
}

function renderResults(categoryScores) {
  // Personalize titles
  resultsView.userName.textContent = state.userName;
  resultsView.majorName.textContent = state.recommendedMajor.name;
  resultsView.majorCategory.textContent = `${categories[state.recommendedMajor.category]} 계열`;
  
  // Update recommendation reason template
  let reason = state.recommendedMajor.recommendedReason;
  // Prepend personalized name
  resultsView.reason.textContent = `${state.userName}님은 ${reason}`;
  
  resultsView.quickJobs.textContent = state.recommendedMajor.jobs.join(', ');
  resultsView.quickSubjects.textContent = state.recommendedMajor.subjects.join(', ');

  // CSS Charts rendering
  // Find max category score to scale charts proportionately
  const maxScore = Math.max(...Object.values(categoryScores), 1);

  Object.keys(categories).forEach(cat => {
    const score = categoryScores[cat] || 0;
    const percentage = Math.max(10, Math.min(100, (score / maxScore) * 100)); // clamp between 10% and 100% for visual aesthetics
    
    const bar = document.getElementById(`chart-bar-${cat}`);
    const valText = document.getElementById(`chart-val-${cat}`);
    
    if (bar && valText) {
      bar.style.width = `${percentage}%`;
      valText.textContent = `${score}점`;
    }
  });

  // Alternatives listing
  resultsView.altList.innerHTML = '';
  state.alternativeMajors.forEach(major => {
    const item = document.createElement('div');
    item.className = 'alt-item';
    item.innerHTML = `
      <div class="alt-item-info">
        <span class="alt-item-name">${major.name}</span>
        <span class="alt-item-cat">${categories[major.category]} 계열</span>
      </div>
      <i class="fa-solid fa-arrow-right alt-item-arrow"></i>
    `;
    item.addEventListener('click', () => openModal(major.id));
    resultsView.altList.appendChild(item);
  });
}

// ==================== 7. 전공 상세 정보 팝업 모달 ====================
function openModal(majorId) {
  const major = majors.find(m => m.id === majorId);
  if (!major) return;

  // Populate data
  modal.categoryBadge.textContent = `${categories[major.category]} 계열`;
  modal.title.textContent = major.name;
  modal.desc.textContent = major.description;

  // Curriculum list
  modal.curriculumList.innerHTML = '';
  major.curriculum.forEach(course => {
    const li = document.createElement('li');
    li.textContent = course;
    modal.curriculumList.appendChild(li);
  });

  // Jobs tags
  modal.jobsTags.innerHTML = '';
  major.jobs.forEach(job => {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = job;
    modal.jobsTags.appendChild(span);
  });

  // High school subjects tags
  modal.subjectsTags.innerHTML = '';
  major.subjects.forEach(subject => {
    const span = document.createElement('span');
    span.className = 'tag subject-tag';
    span.textContent = subject;
    modal.subjectsTags.appendChild(span);
  });

  // Open modal
  modal.overlay.classList.add('active');
  document.body.style.overflow = 'hidden'; // Lock background scroll
}

function closeModal() {
  modal.overlay.classList.remove('active');
  document.body.style.overflow = ''; // Unlock scroll
}

// ==================== 8. 초기 이벤트 바인딩 ====================
function init() {
  // Start button
  btns.start.addEventListener('click', () => showScreen('info'));

  // Info navigation buttons
  btns.infoBack.addEventListener('click', () => showScreen('home'));
  btns.infoNext.addEventListener('click', () => {
    if (validateInfoForm()) {
      startTest();
    }
  });

  // Test back button
  btns.testBack.addEventListener('click', handleTestBack);

  // Result navigation
  btns.restart.addEventListener('click', () => {
    // Reset form elements
    infoForm.name.value = '';
    const checkedRadio = document.querySelector('input[name="interest"]:checked');
    if (checkedRadio) checkedRadio.checked = false;
    document.querySelectorAll('input[name="subject"]:checked').forEach(cb => cb.checked = false);
    infoForm.errorMsg.classList.add('hide');

    showScreen('home');
  });

  btns.viewDetails.addEventListener('click', () => {
    if (state.recommendedMajor) {
      openModal(state.recommendedMajor.id);
    }
  });

  // Modal close listeners
  btns.modalClose.addEventListener('click', closeModal);
  btns.modalBack.addEventListener('click', closeModal);
  
  // Close modal when clicking background overlay
  modal.overlay.addEventListener('click', (e) => {
    if (e.target === modal.overlay) {
      closeModal();
    }
  });

  // Esc key close support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.overlay.classList.contains('active')) {
      closeModal();
    }
  });
}

// Start app
document.addEventListener('DOMContentLoaded', init);
