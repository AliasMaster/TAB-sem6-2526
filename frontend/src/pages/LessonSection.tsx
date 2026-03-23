import React from 'react';
import '../assets/styles/lesson.css'; 

const LessonSection: React.FC = () => {
  const steps = [
    {
      id: '01',
      title: 'Wybierz ścieżkę',
      description: 'Przeglądaj dziesiątki kursów od AI po Web Development i znajdź swój cel.',
      icon: '🔍'
    },
    {
      id: '02',
      title: 'Ucz się w praktyce',
      description: 'Oglądaj materiały wideo i rozwiązuj zadania bezpośrednio w przeglądarce.',
      icon: '💻'
    },
    {
      id: '03',
      title: 'Zdobądź certyfikat',
      description: 'Ukończ kurs, zbuduj portfolio i odbierz certyfikat uznawany w branży.',
      icon: '🎓'
    }
  ];

  return (
    <section className="learning-section" id="nauka">
      <div className="container">
        <div className="learning-header">
          <span className="badge">Metodologia </span>
          <h2 className="section-title">Jak wygląda nauka u nas?ZALECANE ZMIENIC WSZYSTKO TYLKO PODGLAD</h2>
          <p className="section-subtitle">
            Nasze podejście opiera się na praktyce i projektach, które realnie rozwijają Twoje umiejętności.
          </p>
        </div>

        <div className="learning-steps">
          {steps.map((step) => (
            <div key={step.id} className="step-card">
              <div className="step-number">{step.id}</div>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <div className="step-line"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LessonSection;